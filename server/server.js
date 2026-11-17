require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const productRoutes = require("./src/routes/productRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Kabsuhayan API is running" });
});

mongoose
.connect(process.env.MONGODB_URI, {
  dbName: "kabsuhayan",
})
  .then(() => {
    console.log("Connected to MongoDB   Atlas");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });