const { db } = require("../config/firebase");

class BookingRepository {
  constructor() {
    this.collection = db.collection("bookings");
  }

  /**
   * Get all bookings ordered by creation date descending
   */
  async getAll() {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();
    const bookings = [];
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return bookings;
  }

  /**
   * Get booking by document ID
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
   * Create a booking document
   */
  async create(data, id = null) {
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
   * Update booking fields
   */
  async update(id, data) {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return this.getById(id);
  }

  /**
   * Delete a booking document
   */
  async delete(id) {
    await this.collection.doc(id).delete();
    return true;
  }

  /**
   * Get booking summary: counts by status, total revenue, and 5 most recent bookings
   */
  async getSummary() {
    const snapshot = await this.collection.orderBy("createdAt", "desc").get();

    let total = 0;
    let confirmed = 0;
    let pending = 0;
    let cancelled = 0;
    let totalRevenue = 0;
    const recent = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      total++;

      if (data.status === "Confirmed") confirmed++;
      else if (data.status === "Pending") pending++;
      else if (data.status === "Cancelled") cancelled++;

      if (typeof data.priceNumeric === "number") {
        totalRevenue += data.priceNumeric;
      }

      if (recent.length < 5) {
        recent.push({ id: doc.id, ...data });
      }
    });

    return { total, confirmed, pending, cancelled, totalRevenue, recent };
  }
}

module.exports = new BookingRepository();
