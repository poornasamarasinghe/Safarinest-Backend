const galleryService = require("../services/gallery.service");

class GalleryController {
  /**
   * Get all images
   */
  async getImages(req, res, next) {
    try {
      const images = await galleryService.getAllImages();
      return res.status(200).json(images);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload an image
   */
  async uploadImage(req, res, next) {
    try {
      const protocol = req.protocol;
      const host = req.get("host");
      const baseUrl = `${protocol}://${host}`;

      const newImage = await galleryService.addGalleryImage(req.file, req.body, baseUrl);
      return res.status(201).json({
        success: true,
        message: "Image uploaded successfully!",
        data: newImage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(req, res, next) {
    try {
      const { id } = req.params;
      await galleryService.deleteGalleryImage(id);
      return res.status(200).json({
        success: true,
        message: "Image deleted successfully!",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GalleryController();
