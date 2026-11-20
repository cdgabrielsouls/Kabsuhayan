const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  reporterName: { type: String, required: true, trim: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  productTitle: { type: String, required: true, trim: true },
  sellerId: { type: String, required: true, index: true },
  sellerName: { type: String, required: true, trim: true },
  reason: { type: String, enum: ["Prohibited item", "Misleading listing", "Incorrect information", "Suspicious activity", "Other"], required: true },
  details: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["open", "resolved", "dismissed"], default: "open", index: true },
  adminNote: { type: String, trim: true, maxlength: 500, default: "" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

reportSchema.index({ reporterId: 1, productId: 1, status: 1 });

module.exports = mongoose.model("Report", reportSchema);
