const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/gallery.controller");
const upload = require("../middleware/upload.middleware");

// GET all images
router.get("/", galleryController.getImages);

// POST upload new image (expects multipart/form-data with field name 'image')
router.post("/", upload.single("image"), galleryController.uploadImage);

// DELETE image by Firestore document ID
router.delete("/:id", galleryController.deleteImage);

module.exports = router;
