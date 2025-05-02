require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const path = require("path");

const logger = require("./utils/logger");
const User = require("./models/User");

const apiRoutes = require("./routes/apiRoutes");
const viewRoutes = require("./routes/viewRoutes");
const authRoutes = require("./routes/authRoutes");

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

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "chavesecreta",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user)
        return done(null, false, { message: "Utilizador não encontrado" });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return done(null, false, { message: "Password incorreta" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize / deserialize
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use("/api", apiRoutes);
app.use("/", viewRoutes);
app.use("/", authRoutes);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

app.use((err, req, res, next) => {
  logger.error(`Erro inesperado em ${req.method} ${req.url}: ${err.message}`);
  res.status(400).json({ error: err.message });
});

module.exports = app;
