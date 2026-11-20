const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Report = require("../models/Report");
const User = require("../models/User");
const { requireAuth } = require("../middleware/requireAuth");
const createNotification = require("../utils/createNotification");

const router = express.Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const { productId, reason } = req.body;
  const details = String(req.body.details || "").trim();
  const reasons = ["Prohibited item", "Misleading listing", "Incorrect information", "Suspicious activity", "Other"];
  if (!mongoose.isValidObjectId(productId) || !reasons.includes(reason)) {
    return res.status(400).json({ message: "Choose a valid listing and report reason." });
  }
  if (details.length > 1000) return res.status(400).json({ message: "Details must be 1,000 characters or fewer." });

  try {
    const product = await Product.findById(productId);
    if (!product || String(product.sellerId) === String(req.user._id)) {
      return res.status(404).json({ message: "Listing not found." });
    }
    const duplicate = await Report.exists({ reporterId: req.user._id, productId, status: "open" });
    if (duplicate) return res.status(409).json({ message: "You already have an open report for this listing." });

    const report = await Report.create({
      reporterId: req.user._id,
      reporterName: req.user.name,
      productId: product._id,
      productTitle: product.title,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      reason,
      details,
    });
    try {
      const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
      await Promise.all(admins.map((admin) => createNotification({
        userId: admin._id,
        type: "student_report",
        title: "New student report",
        message: `${req.user.name} reported ${product.title}: ${reason}.`,
        link: "/admin/reports",
      })));
    } catch {}
    return res.status(201).json({ report });
  } catch {
    return res.status(500).json({ message: "Could not submit this report." });
  }
});

module.exports = router;
