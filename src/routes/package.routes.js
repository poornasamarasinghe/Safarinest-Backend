const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller");
const upload = require("../middleware/upload.middleware");

// GET all packages
router.get("/", packageController.getPackages);

// GET package by ID
router.get("/:id", packageController.getPackageById);

// PUT update package details (optional file field 'image')
router.put("/:id", upload.single("image"), packageController.updatePackage);

module.exports = router;
