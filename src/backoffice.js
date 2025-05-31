require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

// Enable CORS so front‐office (on another port) can call /api
app.use(
  cors({
    origin: process.env.FRONT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/eu-digital", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("API → Connected to MongoDB"))
  .catch((err) => {
    console.error("API → MongoDB connection error:", err);
    process.exit(1);
  });

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes under /api
app.use("/api", apiRoutes);

// Error handler (return JSON)
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(400).json({ error: err.message });
});

// Start listening on port 3001 (or from env)
const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`API service listening on port ${PORT}`));
