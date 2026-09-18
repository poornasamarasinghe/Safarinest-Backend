const { db } = require("../config/firebase");

class WaitingListRepository {
  constructor() {
    this.collection = db.collection("waitingList");
  }

  /**
   * Add a new entry to the waiting list
   */
  async create(data) {
    const payload = {
      ...data,
      status: "waiting",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await this.collection.add(payload);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Get all waiting entries for a specific slot (FIFO order)
   * Only returns entries with status "waiting"
   */
  async getBySlot(packageId, date, time) {
    const snapshot = await this.collection
      .where("packageId", "==", packageId)
      .where("date", "==", date)
      .where("time", "==", time)
      .where("status", "==", "waiting")
      .orderBy("createdAt", "asc")
      .get();

    const entries = [];
    snapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  }

  /**
   * Get a single waiting list entry by document ID
   */
  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Update a waiting list entry
   */
  async update(id, data) {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return this.getById(id);
  }

  /**
   * Delete a waiting list entry
   */
  async delete(id) {
    await this.collection.doc(id).delete();
    return true;
  }
}

module.exports = new WaitingListRepository();
