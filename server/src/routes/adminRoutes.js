const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { requireAuth, requireAdmin } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    studentNumber: user.studentNumber,
    campus: user.campus,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(500);
    res.status(200).json(users.map(publicUser));
  } catch {
    res.status(500).json({ message: "Could not load users." });
  }
});

// PATCH /api/admin/users/:id/role — promote or demote a user.
router.patch("/users/:id/role", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user ID." });
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Role must be user or admin." });
  if (String(req.user._id) === req.params.id && role !== "admin") {
    return res.status(400).json({ message: "You cannot remove your own admin access here." });
  }

  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found." });
    if (target.role === "admin" && role === "user") {
      const admins = await User.countDocuments({ role: "admin", status: "active" });
      if (admins <= 1) return res.status(409).json({ message: "Promote another active admin before demoting the last one." });
    }
    target.role = role;
    await target.save();
    return res.status(200).json({ user: publicUser(target) });
  } catch {
    return res.status(500).json({ message: "Could not update user role." });
  }
});

// DELETE /api/admin/users/:id — remove an account without allowing self-deletion or deleting the last admin.
router.delete("/users/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user ID." });
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own account while logged in." });

  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found." });
    if (target.role === "admin") {
      const admins = await User.countDocuments({ role: "admin", status: "active" });
      if (admins <= 1) return res.status(409).json({ message: "Promote another active admin before deleting the last one." });
    }
    await target.deleteOne();
    return res.status(200).json({ message: "Account deleted." });
  } catch {
    return res.status(500).json({ message: "Could not delete account." });
  }
});

module.exports = router;
