import { Router } from "express";
import { Course } from "../models/Course.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const msg = message.toLowerCase().trim();
    let reply = "";

    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      reply =
        "Hello! Welcome to SkillElevate .";
    } else if (
      msg.includes("enroll") ||
      msg.includes("how to join") ||
      msg.includes("sign up for course")
    ) {
      reply =
        "To enroll in a course:\n1. Register or login to your account\n2. Browse our courses\n3. Click on any course you like\n4. Click 'Enroll Now' and choose your payment method (UPI, Credit Card, or Net Banking)\n5. Complete the payment\n6. Access your course from the dashboard!";
    } else if (
      msg.includes("payment") ||
      msg.includes("pay") ||
      msg.includes("methods")
    ) {
      reply =
        "We support three payment methods:\n• UPI - Enter your UPI ID (e.g. name@upi)\n• Credit Card - Enter card number, expiry, and CVV\n• Net Banking - Select your bank\n\nAll payments are securely processed and you get instant access after payment!";
    } else if (
      msg.includes("price") ||
      msg.includes("cost") ||
      msg.includes("fee") ||
      msg.includes("₹") ||
      msg.includes("rupee")
    ) {
      const courses = await Course.find().select("title price").limit(5);
      if (courses.length === 0) {
        reply =
          "All our courses are priced under ₹500! Check the Courses page to see current offerings.";
      } else {
        const list = courses.map((c) => `• ${c.title}: ₹${c.price}`).join("\n");
        reply = `Our courses are very affordable, all under ₹500!\n\nCurrent courses:\n${list}\n\nCheck the Courses page for more details!`;
      }
    } else if (
      msg.includes("course") ||
      msg.includes("learn") ||
      msg.includes("what courses") ||
      msg.includes("available")
    ) {
      const courses = await Course.find().select("title description").limit(5);
      if (courses.length === 0) {
        reply =
          "We're adding courses soon! Check back shortly on the Courses page.";
      } else {
        const list = courses.map((c) => `• ${c.title}`).join("\n");
        reply = `Here are our available courses:\n${list}\n\nVisit the Courses page to see full details and pricing!`;
      }
    } else if (
      msg.includes("dashboard") ||
      msg.includes("my courses") ||
      msg.includes("access")
    ) {
      reply =
        "After enrolling, go to your Dashboard to access your purchased courses. You can find course content, view payment history, and edit your profile from there!";
    } else if (msg.includes("admin") || msg.includes("instructor")) {
      reply =
        "Our admin team manages all course content. If you have course-related questions, feel free to ask me!";
    } else if (msg.includes("refund") || msg.includes("cancel")) {
      reply =
        "For refund or cancellation queries, please contact our support team. Once enrolled, you get lifetime access to the course content!";
    } else if (msg.includes("certificate") || msg.includes("completion")) {
      reply =
        "We're working on certificates of completion! For now, you get full lifetime access to all course materials once enrolled.";
    } else if (
      msg.includes("thanks") ||
      msg.includes("thank you") ||
      msg.includes("bye")
    ) {
      reply =
        "You're welcome! Happy learning! Feel free to ask if you have more questions.";
    } else {
      reply =
        "I can help you with:\n• Course information\n• Pricing details\n• How to enroll\n• Payment methods\n• Dashboard access\n\nWhat would you like to know?";
    }

    res.json({ reply });
  } catch {
    res.status(500).json({ error: "Chatbot error" });
  }
});

export default router;
