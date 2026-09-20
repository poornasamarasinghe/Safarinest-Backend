/**
 * Sighting model helpers — Firestore collection: "sightings"
 *
 * Document shape:
 *   id        : string  (Firestore auto-id)
 *   animal    : string  e.g. "Leopard"
 *   emoji     : string  e.g. "🐆"
 *   color     : string  hex e.g. "#c0392b"
 *   latitude  : number  GPS latitude
 *   longitude : number  GPS longitude
 *   block     : string  e.g. "Block 1"
 *   location  : string  human-readable e.g. "6.3811°N 81.4883°E"
 *   createdAt : Firestore Timestamp (server-set)
 */

const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

const COLLECTION = "sightings";
// Sightings older than this are treated as expired
const EXPIRE_MS = 25 * 60 * 1000;

/**
 * Write a new sighting document.
 * @param {object} data  - { animal, emoji, color, latitude, longitude, block, location }
 * @returns {Promise<{id: string, ...data, createdAt: Date}>}
 */
async function createSighting(data) {
  const ref = await db.collection(COLLECTION).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data(), createdAt: snap.data().createdAt.toDate() };
}

/**
 * Fetch all sightings created within the last EXPIRE_MS milliseconds,
 * ordered newest-first.
 * @returns {Promise<Array>}
 */
async function getActiveSightings() {
  const cutoff = new Date(Date.now() - EXPIRE_MS);
  const snap = await db
    .collection(COLLECTION)
    .where("createdAt", ">=", cutoff)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));
}

/**
 * Fetch ALL sightings (no expiry cutoff), newest-first, up to `limit`.
 * Used by the history / "View All" page.
 * @param {number} [limit=200]
 * @returns {Promise<Array>}
 */
async function getAllSightings(limit = 200) {
  const snap = await db
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));
}

/**
 * Delete a sighting document by Firestore id.
 * @param {string} id
 * @returns {Promise<void>}
 */
async function deleteSighting(id) {
  await db.collection(COLLECTION).doc(id).delete();
}

module.exports = { createSighting, getActiveSightings, getAllSightings, deleteSighting };
