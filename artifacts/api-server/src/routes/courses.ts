import { Router } from "express";
import { Course } from "../models/Course.js";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(
      courses.map((c) => ({
        id: c._id,
        title: c.title,
        description: c.description,
        price: c.price,
        content: c.content,
        thumbnailUrl: c.thumbnailUrl,
        createdAt: c.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params["id"]);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      content: course.content,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt,
    });
  } catch {
    res.status(404).json({ error: "Course not found" });
  }
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description, price, content, thumbnailUrl } = req.body;
    if (!title || !description || price === undefined || !content) {
      res.status(400).json({ error: "Title, description, price, and content are required" });
      return;
    }
    if (price > 500) {
      res.status(400).json({ error: "Price must be under ₹500" });
      return;
    }
    const course = new Course({ title, description, price, content, thumbnailUrl });
    await course.save();
    res.status(201).json({
      id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      content: course.content,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt,
    });
  } catch {
    res.status(500).json({ error: "Failed to create course" });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description, price, content, thumbnailUrl } = req.body;
    if (price !== undefined && price > 500) {
      res.status(400).json({ error: "Price must be under ₹500" });
      return;
    }
    const course = await Course.findByIdAndUpdate(
      req.params["id"],
      { title, description, price, content, thumbnailUrl },
      { new: true, runValidators: true }
    );
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json({
      id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      content: course.content,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt,
    });
  } catch {
    res.status(500).json({ error: "Failed to update course" });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params["id"]);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.json({ message: "Course deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

export default router;
