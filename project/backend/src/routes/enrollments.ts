import { Router } from "express";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { sendPaymentEmail } from "../lib/mailer.js";
import { processPayment } from "../lib/paymentStrategy.js";
import mongoose from "mongoose";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const enrollments = await Enrollment.find({ userId }).populate("courseId").sort({ enrolledAt: -1 });
    res.json(
      enrollments.map((e) => {
        const course = e.courseId as any;
        return {
          id: e._id,
          courseId: course._id,
          paymentMethod: e.paymentMethod,
          paymentStatus: e.paymentStatus,
          amountPaid: e.amountPaid,
          transactionId: e.transactionId,
          enrolledAt: e.enrolledAt,
          course: {
            id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            content: course.content,
            thumbnailUrl: course.thumbnailUrl,
            createdAt: course.createdAt,
          },
        };
      })
    );
  } catch {
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

router.post("/pay", authenticate, async (req: AuthRequest, res) => {
  try {
    const { courseId, paymentMethod, paymentDetails } = req.body;
    const userId = req.user?.id;

    if (!courseId || !paymentMethod) {
      res.status(400).json({ error: "courseId and paymentMethod are required" });
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

    const paymentResult = await processPayment(paymentMethod, {
      amount: course.price,
      ...paymentDetails,
    });

    if (!paymentResult.success) {
      res.status(400).json({ error: paymentResult.message });
      return;
    }

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

    sendPaymentEmail(req.user?.email || "", course.title, paymentResult.transactionId).catch(() => {});

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

export default router;
