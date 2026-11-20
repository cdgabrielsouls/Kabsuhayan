const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const User = require("../models/User");
const { requireAuth } = require("../middleware/requireAuth");
const createNotification = require("../utils/createNotification");

const router = express.Router();
router.use(requireAuth);

function serialize(message) {
  const value = message.toObject ? message.toObject() : message;
  return { ...value, messageId: String(value._id) };
}

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ senderId: req.user._id }, { recipientId: req.user._id }] })
      .sort({ createdAt: -1 })
      .limit(500);
    return res.status(200).json(messages.map(serialize));
  } catch {
    return res.status(500).json({ message: "Could not load messages." });
  }
});

router.get("/thread", async (req, res) => {
  const { with: otherUserId, product: productId } = req.query;
  if (!mongoose.isValidObjectId(otherUserId) || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "A valid user and listing are required." });
  }

  try {
    const product = await Product.findById(productId);
    const otherUser = await User.findById(otherUserId);
    if (!product || !otherUser) return res.status(404).json({ message: "Conversation not found." });
    const participants = [String(req.user._id), String(otherUserId)];
    const isSellerThread = String(product.sellerId) === String(req.user._id) || String(product.sellerId) === String(otherUserId);
    const priorMessage = await Message.exists({ productId, senderId: { $in: participants }, recipientId: { $in: participants } });
    if (product.moderationStatus !== "approved" || (!isSellerThread && !priorMessage) || String(req.user._id) === String(otherUserId)) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const threadFilter = {
      productId,
      $or: [
        { senderId: req.user._id, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: req.user._id },
      ],
    };
    const messages = await Message.find(threadFilter).sort({ createdAt: 1 }).limit(500);
    const readAt = new Date();
    await Promise.all([
      Message.updateMany({ ...threadFilter, recipientId: req.user._id, readAt: null }, { $set: { readAt } }),
      Notification.updateMany({
        userId: req.user._id,
        type: "new_message",
        link: `/app/messages?with=${otherUserId}&product=${productId}`,
        readAt: null,
      }, { $set: { readAt } }),
    ]);
    return res.status(200).json({
      product: { id: String(product._id), title: product.title },
      otherUser: { id: String(otherUser._id), name: otherUser.name },
      messages: messages.map(serialize),
    });
  } catch {
    return res.status(500).json({ message: "Could not load this conversation." });
  }
});

router.post("/", async (req, res) => {
  const recipientId = req.body.recipientId;
  const productId = req.body.productId;
  const body = String(req.body.body || "").trim();
  if (!mongoose.isValidObjectId(recipientId) || !mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "A valid recipient and listing are required." });
  }
  if (!body || body.length > 2000) return res.status(400).json({ message: "Message must be 1 to 2,000 characters." });
  if (String(req.user._id) === String(recipientId)) return res.status(400).json({ message: "You cannot message yourself." });

  try {
    const [product, recipient] = await Promise.all([Product.findById(productId), User.findById(recipientId)]);
    if (!product || product.moderationStatus !== "approved" || !recipient) {
      return res.status(404).json({ message: "Listing or recipient not found." });
    }
    const isBuyerStartingThread = String(product.sellerId) === String(recipientId);
    const hasThread = await Message.exists({
      productId,
      $or: [
        { senderId: req.user._id, recipientId },
        { senderId: recipientId, recipientId: req.user._id },
      ],
    });
    if (!isBuyerStartingThread && !hasThread) {
      return res.status(403).json({ message: "Messages must be about a listing you own or contacted its seller about." });
    }

    const message = await Message.create({
      senderId: req.user._id,
      senderName: req.user.name,
      recipientId,
      recipientName: recipient.name,
      productId: product._id,
      productTitle: product.title,
      body,
    });
    await createNotification({
      userId: recipientId,
      type: "new_message",
      title: "New message",
      message: `${req.user.name} sent you a message about ${product.title}.`,
      link: `/app/messages?with=${req.user._id}&product=${product._id}`,
    }).catch(() => {});
    return res.status(201).json({ message: serialize(message) });
  } catch {
    return res.status(500).json({ message: "Could not send message." });
  }
});

module.exports = router;
