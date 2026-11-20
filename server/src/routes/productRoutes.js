const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

function validId(id) {
  return mongoose.isValidObjectId(id);
}

// GET /api/products — lahat ng products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch {
    res.status(500).json({ message: "Failed to get products" });
  }
});

// GET /api/products/:id — isang product
router.get("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
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
      meetupLocations,
    });

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

    product.set(updates);
    await product.save();

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
