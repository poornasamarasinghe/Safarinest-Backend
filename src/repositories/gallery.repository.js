const { db } = require("../config/firebase");

class GalleryRepository {
  constructor() {
    this.collection = db.collection("gallery");
  }

  /**
   * Get all gallery images sorted by creation time descending
   */
  async getAll() {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();
    const images = [];
    snapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return images;
  }

  /**
   * Get a single gallery image by id
   */
  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  /**
   * Save new gallery image metadata
   */
  async create(imageData) {
    const docRef = await this.collection.add({
      ...imageData,
      createdAt: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  /**
   * Delete gallery image metadata from Firestore
   */
  async delete(id) {
    await this.collection.doc(id).delete();
    return true;
  }
}

module.exports = new GalleryRepository();
