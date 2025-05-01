require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const logger = require("./utils/logger");
const apiRoutes = require("./routes/apiRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/eu-digital")
  .then(() => logger.info("Connectado ao MongoDB"))
  .catch((err) => logger.error("Erro de conexão do MongoDB:", err));

// Config
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);
app.use("/", viewRoutes);

app.use((req, res, next) => {
  logger.info(`➡️ ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

app.use((err, req, res, next) => {
  logger.error(`Erro inesperado em ${req.method} ${req.url}: ${err.message}`);
  res.status(400).json({ error: err.message });
});

module.exports = app;
