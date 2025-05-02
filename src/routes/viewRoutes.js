const express = require("express");
const router = express.Router();

const { ensureAdmin } = require("../utils/auth");
const viewController = require("../controllers/viewController");

router.get("/", viewController.renderHome);
router.get("/admin", ensureAdmin, viewController.renderAdmin);

module.exports = router;
