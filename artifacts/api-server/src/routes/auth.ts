import { Router } from "express";
import { User } from "../models/User.js";
import { generateToken, authenticate, AuthRequest } from "../middleware/auth.js";
import { sendRegistrationEmail } from "../lib/mailer.js";

const router = Router();

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }
    if (email === ADMIN_EMAIL) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }
    const user = new User({ name, email, password, role: "student" });
    await user.save();
    const token = generateToken({ id: user._id.toString(), role: user.role, email: user.email });
    sendRegistrationEmail(user.email, user.name).catch(() => {});
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = generateToken({ id: "admin", role: "admin", email: ADMIN_EMAIL });
      res.json({
        token,
        user: { id: 0, name: "Administrator", email: ADMIN_EMAIL, role: "admin", createdAt: new Date() },
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const match = await user.comparePassword(password);
    if (!match) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = generateToken({ id: user._id.toString(), role: user.role, email: user.email });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role === "admin") {
      res.json({ id: 0, name: "Administrator", email: ADMIN_EMAIL, role: "admin", createdAt: new Date() });
      return;
    }
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch {
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
