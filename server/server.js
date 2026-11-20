require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const productRoutes = require("./src/routes/productRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "5mb" }));
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Kabsuhayan API is running" });
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing. Add it to server/.env before starting the API.");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, { dbName: "kabsuhayan" })
  .then(() => {
    console.log("Connected to the Kabsuhayan database");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Kabsuhayan API running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
