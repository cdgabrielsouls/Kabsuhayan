const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerName: { type: String, required: true, trim: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerName: { type: String, required: true, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    category: { type: String, default: "" },
    condition: { type: String, default: "" },
    type: { type: String, enum: ["sale", "rent", "both"], default: "sale" },
    offerType: { type: String, enum: ["buy", "rent"], required: true },
    transactionPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, enum: ["Cash on delivery"], default: "Cash on delivery" },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    orderStatus: { type: String, enum: ["To ship", "To receive", "To review", "Returns", "Completed"], default: "To ship", index: true },
    meetupLocation: { type: String, default: "CvSU Indang Main Campus" },
    meetupPin: {
      x: { type: Number, min: 0, max: 100 },
      y: { type: Number, min: 0, max: 100 },
    },
    shippedAt: Date,
    receivedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
