const express = require("express");
const User = require("../models/User");
const { hashPassword, verifyPassword, signToken } = require("../utils/auth");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    studentNumber: user.studentNumber,
    campus: user.campus,
    role: user.role,
  };
}

// POST /api/auth/register — public registration always creates a regular user.
router.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password;
  const studentNumber = String(req.body.studentNumber || "").trim();

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  }
  if (!/^[^\s@]+@cvsu\.edu\.ph$/.test(email)) {
    return res.status(400).json({ message: "Use a CvSU email address to register (for example, name@cvsu.edu.ph)." });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "Password must be 8 to 128 characters." });
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, studentNumber, passwordHash, role: "user" });
    return res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with that email already exists." });
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    return res.status(500).json({ message: "Could not create account." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password;
  if (!email || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || user.status !== "active" || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    return res.status(200).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    if (error.message?.includes("JWT_SECRET")) {
      return res.status(500).json({ message: "Authentication is not configured on the server." });
    }
    return res.status(500).json({ message: "Could not log in." });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
});

// PATCH /api/auth/me — update the signed-in user's name.
router.patch("/me", requireAuth, async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  }

  try {
    req.user.name = name;
    await req.user.save();
    return res.status(200).json({ user: publicUser(req.user) });
  } catch {
    return res.status(500).json({ message: "Could not update profile." });
  }
});

module.exports = router;
