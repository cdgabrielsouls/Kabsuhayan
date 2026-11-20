const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    studentNumber: { type: String, trim: true, default: "" },
    campus: { type: String, trim: true, default: "Indang Main Campus" },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    status: { type: String, enum: ["active", "disabled"], default: "active", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
