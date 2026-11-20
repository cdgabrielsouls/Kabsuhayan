const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, required: true, trim: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientName: { type: String, required: true, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productTitle: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

messageSchema.index({ productId: 1, senderId: 1, recipientId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
