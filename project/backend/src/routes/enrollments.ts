import { Router } from "express";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { sendPaymentEmail } from "../lib/mailer.js";
import { processPayment } from "../lib/paymentStrategy.js";
import qrcode from "qrcode";
import crypto from "crypto";
import mongoose from "mongoose";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const enrollments = await Enrollment.find({ userId })
      .populate("courseId")
      .sort({ enrolledAt: -1 });
    res.json(
      enrollments.map((e) => {
        const course = e.courseId as any;
        return {
          id: e._id,
          courseId: course?._id ?? null,
          paymentMethod: e.paymentMethod,
          paymentStatus: e.paymentStatus,
          amountPaid: e.amountPaid,
          transactionId: e.transactionId,
          enrolledAt: e.enrolledAt,
          course: course
            ? {
                id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                content: course.content,
                thumbnailUrl: course.thumbnailUrl,
                createdAt: course.createdAt,
              }
            : null,
        };
      }),
    );
  } catch (err) {
    console.error("fetch enrollments error:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

router.post("/pay", authenticate, async (req: AuthRequest, res) => {
  try {
    const { courseId, paymentMethod, paymentDetails } = req.body;
    const userId = req.user?.id;

    if (!courseId || !paymentMethod) {
      res
        .status(400)
        .json({ error: "courseId and paymentMethod are required" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const existing = await Enrollment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
    });
    if (existing && existing.paymentStatus === "completed") {
      res.status(400).json({ error: "Already enrolled in this course" });
      return;
    }

    const normalizedMethod = String(paymentMethod).toLowerCase();

    // Handle QR code directly here to avoid any ngrok config dependency
    if (normalizedMethod === "qr_code") {
      console.log("[pay] generating QR (local handler)");
      const transactionId = `QR${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
      const baseUrl =
        (process.env["BACKEND_PUBLIC_URL"] ||
          process.env["NGROK_URL"] || // optional tunnel
          "http://localhost:3001").replace(/\/$/, "");

      // Include userId for demo enrollment completion on mobile (no auth)
      const paymentUrl = `${baseUrl}/api/payments/payment/${transactionId}?amount=${course.price}&courseId=${courseId}&userId=${userId}`;
      const qrCodeDataUrl = await qrcode.toDataURL(paymentUrl);

      res.status(200).json({
        success: true,
        transactionId,
        message: "QR code generated",
        paymentUrl,
        qrCodeDataUrl,
        enrollment: null, // QR code payments don't create enrollment until completed
      });
      return;
    }

    console.log("[pay] delegating to processPayment", { normalizedMethod });

    const paymentResult = await processPayment(normalizedMethod, {
      amount: course.price,
      courseId,
      ...paymentDetails,
    });

    if (!paymentResult.success) {
      res.status(400).json({ error: paymentResult.message });
      return;
    }

    // For other payment methods, enroll immediately
    const enrollment = new Enrollment({
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      paymentMethod,
      paymentStatus: "completed",
      amountPaid: course.price,
      transactionId: paymentResult.transactionId,
      enrolledAt: new Date(),
    });
    await enrollment.save();

    sendPaymentEmail(
      req.user?.email || "",
      course.title,
      paymentResult.transactionId,
    ).catch(() => {});

    res.status(201).json({
      success: true,
      transactionId: paymentResult.transactionId,
      message: "Payment successful! You are now enrolled.",
      enrollment: {
        id: enrollment._id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        paymentMethod: enrollment.paymentMethod,
        paymentStatus: enrollment.paymentStatus,
        amountPaid: enrollment.amountPaid,
        transactionId: enrollment.transactionId,
        enrolledAt: enrollment.enrolledAt,
      },
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Already enrolled in this course" });
      return;
    }
    res.status(500).json({ error: "Payment processing failed" });
  }
});

router.post(
  "/complete/:transactionId",
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const { transactionId } = req.params;
      const { courseId } = req.body;
      const userId = req.user?.id;

      if (!courseId) {
        res.status(400).json({ error: "courseId is required" });
        return;
      }

      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      const existing = await Enrollment.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        courseId: new mongoose.Types.ObjectId(courseId),
      });
      if (existing && existing.paymentStatus === "completed") {
        res.status(400).json({ error: "Already enrolled in this course" });
        return;
      }

      // Create enrollment
      const enrollment = new Enrollment({
        userId: new mongoose.Types.ObjectId(userId),
        courseId: new mongoose.Types.ObjectId(courseId),
        paymentMethod: "qr_code",
        paymentStatus: "completed",
        amountPaid: course.price,
        transactionId,
        enrolledAt: new Date(),
      });
      await enrollment.save();

      sendPaymentEmail(
        req.user?.email || "",
        course.title,
        String(transactionId),
      ).catch(() => {});

      res.status(201).json({
        success: true,
        message: "Payment completed! You are now enrolled.",
        enrollment: {
          id: enrollment._id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          paymentMethod: enrollment.paymentMethod,
          paymentStatus: enrollment.paymentStatus,
          amountPaid: enrollment.amountPaid,
          transactionId: enrollment.transactionId,
          enrolledAt: enrollment.enrolledAt,
        },
      });
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(400).json({ error: "Already enrolled in this course" });
        return;
      }
      res.status(500).json({ error: "Payment completion failed" });
    }
  },
);

export default router;
