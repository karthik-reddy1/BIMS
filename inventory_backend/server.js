const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Inventory Backend is running");
});

// database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/InventoryDB")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
