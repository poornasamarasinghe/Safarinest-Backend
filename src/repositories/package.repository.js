const { db } = require("../config/firebase");

class PackageRepository {
  constructor() {
    this.collection = db.collection("packages");
  }

  /**
   * Get all packages ordered by name or creation date
   */
  async getAll() {
    const snapshot = await this.collection.get();
    const packages = [];
    snapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return packages;
  }

  /**
   * Get a single package by ID
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
   * Update package metadata
   */
  async update(id, data) {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return this.getById(id);
  }

  /**
   * Create a package (with optional predefined document ID)
   */
  async create(data, id = null) {
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
    };

    if (id) {
      await this.collection.doc(id).set(payload);
      return { id, ...payload };
    } else {
      const docRef = await this.collection.add(payload);
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    }
  }

  /**
   * Delete a package
   */
  async delete(id) {
    await this.collection.doc(id).delete();
    return true;
  }
}

module.exports = new PackageRepository();
