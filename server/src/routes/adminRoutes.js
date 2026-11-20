const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const { requireAuth, requireAdmin } = require("../middleware/requireAuth");
const createNotification = require("../utils/createNotification");

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

// GET /api/admin/listings?status=pending
router.get("/listings", async (req, res) => {
  const status = ["pending", "approved", "rejected"].includes(req.query.status) ? req.query.status : "pending";
  try {
    const filter = status === "pending"
      ? { $or: [{ moderationStatus: "pending" }, { moderationStatus: { $exists: false } }] }
      : { moderationStatus: status };
    const listings = await Product.find(filter).sort({ createdAt: -1 }).limit(500);
    return res.status(200).json(listings);
  } catch {
    return res.status(500).json({ message: "Could not load listings for review." });
  }
});

// PATCH /api/admin/listings/:id/review
router.patch("/listings/:id/review", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid listing ID." });
  const { moderationStatus, moderationNote = "" } = req.body;
  if (!["approved", "rejected"].includes(moderationStatus)) {
    return res.status(400).json({ message: "Choose approved or rejected." });
  }
  if (typeof moderationNote !== "string" || moderationNote.length > 500) {
    return res.status(400).json({ message: "Review note must be 500 characters or fewer." });
  }

  try {
    const listing = await Product.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found." });
    listing.moderationStatus = moderationStatus;
    listing.moderationNote = moderationStatus === "rejected" ? moderationNote.trim() : "";
    listing.reviewedBy = req.user._id;
    listing.reviewedAt = new Date();
    await listing.save();
    if (mongoose.isValidObjectId(listing.sellerId)) {
      await createNotification({
        userId: listing.sellerId,
        type: moderationStatus === "approved" ? "listing_approved" : "listing_rejected",
        title: moderationStatus === "approved" ? "Listing approved" : "Listing needs changes",
        message: moderationStatus === "approved"
          ? `${listing.title} is now visible in the marketplace.`
          : `${listing.title} was not approved.${listing.moderationNote ? ` ${listing.moderationNote}` : " Edit the listing and submit it again for review."}`,
        link: "/app/profile/listings",
      }).catch(() => {});
    }
    return res.status(200).json({ listing });
  } catch {
    return res.status(500).json({ message: "Could not update listing review status." });
  }
});

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
