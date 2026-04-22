import { Router } from "express";
import mongoose from "mongoose";
import { authenticate, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { AdminNotification } from "../models/AdminNotification.js";

const router = Router();

// Create a notification (students send feedback / course requests) - auth optional
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { message, email, name } = req.body;
    if (!message || !String(message).trim()) {
      res.status(400).json({ error: "message is required" });
      return;
    }
    const cleanName = name ? String(name).trim() : "";
    const cleanMessage = String(message).trim();
    const doc = await AdminNotification.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      email: req.user?.email || email,
      name: cleanName || undefined,
      message: cleanMessage,
    });
    res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to save notification" });
  }
});

// List notifications (admin only)
router.get("/", authenticate, requireAdmin, async (_req, res) => {
  try {
    const items = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Clear all notifications (admin only)
router.delete("/", authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await AdminNotification.deleteMany({});
    res.json({ success: true, deleted: result.deletedCount ?? 0 });
  } catch {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// Delete single notification (admin)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await AdminNotification.findByIdAndDelete(id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;
