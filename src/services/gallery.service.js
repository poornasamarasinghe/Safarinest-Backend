const fs = require("fs");
const galleryRepository = require("../repositories/gallery.repository");

class GalleryService {
  /**
   * Format dates to "DD MMM YYYY" (e.g. "24 Jun 2026")
   */
  _formatDate(isoString) {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const day = date.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return "";
    }
  }

  /**
   * Get all gallery images formatted for frontend
   */
  async getAllImages() {
    const images = await galleryRepository.getAll();
    return images.map((img) => ({
      id: img.id,
      title: img.title || "Safari Image",
      category: img.category || "Wildlife",
      image: img.image,
      uploaded: this._formatDate(img.createdAt),
      status: img.status || "Approved",
    }));
  }

  /**
   * Add a new image to gallery (both on disk and in database)
   */
  async addGalleryImage(file, body, baseUrl) {
    if (!file) {
      throw new Error("No image file provided.");
    }

    const title = body.title || file.originalname.split(".")[0];
    const category = body.category || "Wildlife";
    
    // Construct file URL
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;

    const newImage = await galleryRepository.create({
      title,
      category,
      image: imageUrl,
      filePath: file.path,
      status: "Approved", // Autocure status as approved
    });

    return {
      ...newImage,
      uploaded: this._formatDate(newImage.createdAt),
    };
  }

  /**
   * Delete gallery image (both from disk and database)
   */
  async deleteGalleryImage(id) {
    const image = await galleryRepository.getById(id);
    if (!image) {
      const error = new Error("Image not found");
      error.status = 404;
      throw error;
    }

    // Delete file from disk
    if (image.filePath && fs.existsSync(image.filePath)) {
      try {
        fs.unlinkSync(image.filePath);
      } catch (err) {
        console.error(`Failed to delete physical file at ${image.filePath}:`, err);
      }
    }

    // Delete document from Firestore
    await galleryRepository.delete(id);
    return true;
  }
}

module.exports = new GalleryService();
