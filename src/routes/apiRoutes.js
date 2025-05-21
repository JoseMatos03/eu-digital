const express = require("express");
const multer = require("multer");
const router = express.Router();

const oaisController = require("../controllers/oaisController");
const apiController = require("../controllers/apiController");

const { ensureAdmin } = require("../utils/auth");

const upload = multer({ dest: "tmp_sips/" });

// OAIS protocol
router.post("/ingest", upload.single("sip"), oaisController.handleIngest);
router.post("/disseminate", oaisController.handleDisseminate);

// User administrative API calls
router.get("/admin/users", apiController.listUsers);
router.post("/admin/users", apiController.createUser);
router.put("/admin/users/:id", apiController.updateUser);
router.delete("/admin/users/:id", apiController.deleteUser);

// Resources administrative API calls
router.get("/admin/resources", apiController.listResources);
router.post(
  "/admin/resources",
  upload.single("sip"),
  apiController.createResource
);
router.put("/admin/resources/:id", apiController.updateResource);
router.delete("/admin/resources/:id", apiController.deleteResource);
router.patch("/admin/resources/:id/public", apiController.toggleResourcePublic);
router.post("/admin/resources/:id/export", apiController.exportResource);

// News administrative API calls
router.get("/admin/news", apiController.listNews);
router.post("/admin/news", apiController.createNews);
router.put("/admin/news/:id", apiController.updateNews);
router.delete("/admin/news/:id", apiController.deleteNews);
router.patch("/admin/news/:id/visibility", apiController.toggleNewsVisibility);

// Statistics calls
router.get("/admin/stats", apiController.getStats);

router.use("/admin", ensureAdmin);
module.exports = router;
