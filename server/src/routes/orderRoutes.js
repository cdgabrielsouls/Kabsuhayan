const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

function serialize(order) {
  const value = order.toObject ? order.toObject() : order;
  return { ...value, orderId: String(value._id) };
}

function getPrice(product, offerType) {
  if (offerType === "buy") {
    return product.salePrice ?? (product.type !== "rent" ? product.price : null);
  }
  return product.rentalPricePerDay ?? (product.type === "rent" ? product.price : null);
}

function canUseOffer(product, offerType) {
  const offers = Array.isArray(product.availableFor) && product.availableFor.length
    ? product.availableFor
    : product.type === "both" ? ["buy", "rent"] : [product.type === "rent" ? "rent" : "buy"];
  return offers.includes(offerType);
}

// GET /api/orders — orders where the signed-in user is buyer or seller.
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] })
      .sort({ createdAt: -1 })
      .limit(500);
    return res.status(200).json(orders.map(serialize));
  } catch {
    return res.status(500).json({ message: "Could not load orders." });
  }
});

// POST /api/orders — create cash-on-delivery orders and reserve available stock.
router.post("/", async (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ message: "Select at least one item to order." });
  }

  const created = [];
  const skipped = [];

  for (const item of items) {
    const { productId, offerType, quantity } = item || {};
    if (!mongoose.isValidObjectId(productId) || !["buy", "rent"].includes(offerType) || !Number.isInteger(quantity) || quantity < 1) {
      skipped.push({ productId, message: "Invalid cart item." });
      continue;
    }

    let reservedProduct;
    try {
      const product = await Product.findById(productId);
      if (!product || product.status !== "available") {
        skipped.push({ productId, message: "This listing is no longer available." });
        continue;
      }
      if (String(product.sellerId) === String(req.user._id)) {
        skipped.push({ productId, message: "You cannot order your own listing." });
        continue;
      }
      if (!mongoose.isValidObjectId(product.sellerId)) {
        skipped.push({ productId, message: "This listing is not linked to a seller account yet." });
        continue;
      }
      if (!canUseOffer(product, offerType)) {
        skipped.push({ productId, message: "This listing is not available for that option." });
        continue;
      }
      const price = getPrice(product, offerType);
      if (!Number.isFinite(price) || price < 0) {
        skipped.push({ productId, message: "This listing does not have a valid price." });
        continue;
      }

      reservedProduct = await Product.findOneAndUpdate(
        { _id: product._id, status: "available", stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!reservedProduct) {
        skipped.push({ productId, message: "There is not enough stock available." });
        continue;
      }

      const order = await Order.create({
        buyerId: req.user._id,
        buyerName: req.user.name,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        productId: product._id,
        title: product.title,
        imageUrl: product.imageUrl,
        category: product.category,
        condition: product.condition,
        type: product.type,
        offerType,
        transactionPrice: price,
        quantity,
        paymentMethod: "Cash on delivery",
        orderStatus: "To ship",
      });
      created.push(serialize(order));
    } catch (error) {
      if (reservedProduct) {
        await Product.updateOne({ _id: reservedProduct._id }, { $inc: { stock: quantity } }).catch(() => {});
      }
      if (error.name === "ValidationError") {
        skipped.push({ productId, message: error.message });
      } else {
        return res.status(500).json({ message: "Could not place the order.", orders: created, skipped });
      }
    }
  }

  if (!created.length) return res.status(409).json({ message: "No selected items could be ordered.", orders: [], skipped });
  return res.status(201).json({ orders: created, skipped });
});

// PATCH /api/orders/:id — buyer and seller have different status transitions.
router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order ID." });

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const isBuyer = String(order.buyerId) === String(req.user._id);
    const isSeller = String(order.sellerId) === String(req.user._id);
    if (!isBuyer && !isSeller) return res.status(403).json({ message: "You cannot access this order." });

    const { orderStatus, meetupLocation, meetupPin } = req.body;
    if (orderStatus !== undefined) {
      const allowed = (isSeller && order.orderStatus === "To ship" && orderStatus === "To receive")
        || (isBuyer && order.orderStatus === "To receive" && orderStatus === "To review")
        || (isBuyer && ["To receive", "To review"].includes(order.orderStatus) && orderStatus === "Returns")
        || (isBuyer && order.orderStatus === "Returns" && orderStatus === "To review")
        || (isSeller && order.orderStatus === "To review" && orderStatus === "Completed");
      if (!allowed) return res.status(409).json({ message: "That order status change is not allowed." });

      order.orderStatus = orderStatus;
      if (orderStatus === "To receive") order.shippedAt = new Date();
      if (orderStatus === "To review") order.receivedAt = new Date();
      if (orderStatus === "Completed") {
        order.paymentStatus = "Paid";
        order.completedAt = new Date();
      }
    }

    if (meetupLocation !== undefined) order.meetupLocation = String(meetupLocation).trim().slice(0, 200);
    if (meetupPin !== undefined) {
      const x = Number(meetupPin?.x);
      const y = Number(meetupPin?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) {
        return res.status(400).json({ message: "Meetup pin coordinates must be between 0 and 100." });
      }
      order.meetupPin = { x, y };
    }

    await order.save();
    return res.status(200).json({ order: serialize(order) });
  } catch {
    return res.status(500).json({ message: "Could not update order." });
  }
});

module.exports = router;
