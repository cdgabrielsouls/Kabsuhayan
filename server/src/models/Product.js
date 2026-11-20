const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: 2,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    type: {
      type: String,
      enum: ["sale", "rent", "both"],
      default: "sale",
    },
    availableFor: {
      type: [String],
      enum: ["buy", "rent"],
      default: ["buy"],
    },
    salePrice: { type: Number, min: 0, default: null },
    rentalPricePerDay: { type: Number, min: 0, default: null },
    stock: { type: Number, min: 0, default: 1 },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["New", "Like new", "Good", "Fair"],
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    sellerName: {
      type: String,
      required: [true, "Seller name is required"],
      trim: true,
    },
    sellerId: {
      type: String,
      required: true,
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    moderationNote: { type: String, default: "", trim: true, maxlength: 500 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    meetupLocations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    status: {
      type: String,
      enum: ["available", "sold", "rented"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
