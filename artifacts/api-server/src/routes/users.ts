import { Router } from "express";
import { User } from "../models/User.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === "admin") {
      res.status(403).json({ error: "Admin profile cannot be changed via this endpoint" });
      return;
    }
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { name },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
