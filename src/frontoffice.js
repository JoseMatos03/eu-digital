require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const logger = require("./utils/logger");
const User = require("./models/User");

const viewRoutes = require("./routes/viewRoutes");
const authRoutes = require("./routes/authRoutes");

// THIS IS JUST A HELPER FUNCTION FOR DEVELOPMENT
// WILL BE REMOVED IN FINAL IMPLEMENTATION
async function seedAdmin() {
  const username = process.env.ADMIN_USER;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASS;
  if (!username || !email || !password) {
    console.warn("ADMIN_USER/EMAIL/PASS not set — skipping admin seed");
    return;
  }

  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    console.log(`Admin user already exists: ${existing.username}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.create({
    username,
    email,
    passwordHash,
    role: "admin",
  });
  console.log(`Seeded admin user: ${admin.username}`);
}

async function seedTestUser() {
  const username = process.env.TEST_USER;
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASS;
  if (!username || !email || !password) {
    console.warn("TEST_USER/EMAIL/PASS not set — skipping test user seed");
    return;
  }

  const existing = await User.findOne({ role: "user" });
  if (existing) {
    console.log(`Test user already exists: ${existing.username}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.create({
    username,
    email,
    passwordHash,
    role: "user",
  });
  console.log(`Seeded test user user: ${admin.username}`);
}

// Connect to the same MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/eu-digital", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    await seedAdmin();
    await seedTestUser();
    logger.info("FRONT -> Connectado ao MongoDB");
  })
  .catch((err) => {
    console.error("Front → MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();

// Pug for templates
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static assets (CSS/JS for modal, etc.)
app.use(express.static(path.join(__dirname, "public")));
// Serve uploaded files (images, PDFs, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method‐override (to support PUT/DELETE via forms)
app.use(methodOverride("_method"));

// Sessions & Passport (same as before)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "uma_chavesecreta",
    resave: false,
    saveUninitialized: false,
  })
);
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

// Mount view & auth routes
app.use("/", authRoutes);
app.use("/", viewRoutes);

// Error handler (render a simple error page or redirect)
app.use((err, req, res, next) => {
  console.error("Front Error:", err);
  res.status(400).render("error", { message: err.message });
});

// Start listening on port 3000
const PORT = process.env.FRONT_PORT || 3000;
app.listen(PORT, () => console.log(`Front service listening on port ${PORT}`));
