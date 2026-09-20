const {
  createSighting,
  getActiveSightings,
  getAllSightings,
  deleteSighting,
} = require("../models/sighting.model");

// POST /api/sightings
async function postSighting(req, res) {
  const { animal, emoji, color, latitude, longitude, block, location } = req.body;

  if (!animal || typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({
      error: "Required fields: animal (string), latitude (number), longitude (number)",
    });
  }

  try {
    const sighting = await createSighting({
      animal,
      emoji: emoji ?? "",
      color: color ?? "#27ae60",
      latitude,
      longitude,
      block: block ?? "Block 1",
      location: location ?? `${latitude.toFixed(4)}°N ${longitude.toFixed(4)}°E`,
    });

    return res.status(201).json(sighting);
  } catch (err) {
    console.error("[sighting] createSighting error:", err);
    return res.status(500).json({ error: "Failed to save sighting" });
  }
}

// GET /api/sightings
async function listSightings(req, res) {
  try {
    const sightings = await getActiveSightings();
    return res.status(200).json(sightings);
  } catch (err) {
    console.error("[sighting] getActiveSightings error:", err);
    return res.status(500).json({ error: "Failed to fetch sightings" });
  }
}

// DELETE /api/sightings/:id
async function removeSighting(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing sighting id" });

  try {
    await deleteSighting(id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[sighting] deleteSighting error:", err);
    return res.status(500).json({ error: "Failed to delete sighting" });
  }
}

// GET /api/sightings/history — returns all sightings (no expiry cutoff)
async function listAllSightings(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "200", 10) || 200, 500);
    const sightings = await getAllSightings(limit);
    return res.status(200).json(sightings);
  } catch (err) {
    console.error("[sighting] getAllSightings error:", err);
    return res.status(500).json({ error: "Failed to fetch sighting history" });
  }
}

module.exports = { postSighting, listSightings, listAllSightings, removeSighting };
