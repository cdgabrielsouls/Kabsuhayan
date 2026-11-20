const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json(notifications);
  } catch {
    return res.status(500).json({ message: "Could not load notifications." });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
    return res.status(200).json({ message: "Notifications marked as read." });
  } catch {
    return res.status(500).json({ message: "Could not update notifications." });
  }
});

router.patch("/:id/read", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid notification ID." });
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    return res.status(200).json({ notification });
  } catch {
    return res.status(500).json({ message: "Could not update notification." });
  }
});

module.exports = router;
