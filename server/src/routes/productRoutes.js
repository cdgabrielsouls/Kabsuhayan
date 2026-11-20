const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const { optionalAuth, requireAuth } = require("../middleware/requireAuth");
const createNotification = require("../utils/createNotification");

const router = express.Router();

function validId(id) {
  return mongoose.isValidObjectId(id);
}

// GET /api/products — lahat ng products
router.get("/", optionalAuth, async (req, res) => {
  try {
    const filter = req.user?.role === "admin"
      ? {}
      : req.user
        ? { $or: [{ moderationStatus: "approved" }, { sellerId: String(req.user._id) }] }
        : { moderationStatus: "approved" };
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch {
    res.status(500).json({ message: "Failed to get products" });
  }
});

// GET /api/products/:id — isang product
router.get("/:id", optionalAuth, async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product || (product.moderationStatus !== "approved" && String(product.sellerId) !== String(req.user?._id) && req.user?.role !== "admin")) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch {
    res.status(500).json({ message: "Failed to get product" });
  }
});

// POST /api/products — gumawa ng product
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      type,
      availableFor,
      salePrice,
      rentalPricePerDay,
      stock,
      category,
      condition,
      imageUrl,
      meetupLocations,
    } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      type,
      availableFor,
      salePrice,
      rentalPricePerDay,
      stock,
      category,
      condition,
      imageUrl,
      sellerName: req.user.name,
      sellerId: String(req.user._id),
      moderationStatus: "pending",
      meetupLocations,
    });

    try {
      const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
      await Promise.all([
        createNotification({ userId: req.user._id, type: "listing_pending", title: "Listing submitted", message: `${product.title} is waiting for admin approval.`, link: "/app/profile/listings" }),
        ...admins.map((admin) => createNotification({ userId: admin._id, type: "listing_submitted", title: "Listing needs review", message: `${product.title} was submitted by ${req.user.name}.`, link: "/admin/listings" })),
      ]);
    } catch {}

    res.status(201).json(product);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to create product" });
  }
});

// PATCH /api/products/:id — mag-update ng product
router.patch("/:id", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (String(product.sellerId) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot edit someone else’s listing." });
    }

    const allowedFields = [
      "title",
      "description",
      "price",
      "type",
      "availableFor",
      "salePrice",
      "rentalPricePerDay",
      "stock",
      "category",
      "condition",
      "imageUrl",
      "meetupLocations",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const sellerEditedListing = req.user.role !== "admin" && Object.keys(updates).some((field) => field !== "status");
    if (sellerEditedListing) {
      product.moderationStatus = "pending";
      product.moderationNote = "";
      product.reviewedBy = null;
      product.reviewedAt = null;
    }

    product.set(updates);
    await product.save();

    if (sellerEditedListing) {
      try {
        const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
        await Promise.all([
          createNotification({ userId: req.user._id, type: "listing_pending", title: "Listing resubmitted", message: `${product.title} is waiting for admin approval.`, link: "/app/profile/listings" }),
          ...admins.map((admin) => createNotification({ userId: admin._id, type: "listing_submitted", title: "Listing needs review", message: `${product.title} was updated by ${req.user.name}.`, link: "/admin/listings" })),
        ]);
      } catch {}
    }

    res.status(200).json(product);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id — mag-delete ng product
router.delete("/:id", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (String(product.sellerId) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot delete someone else’s listing." });
    }
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
