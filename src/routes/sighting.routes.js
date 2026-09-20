const express = require("express");
const { postSighting, listSightings, listAllSightings, removeSighting } = require("../controllers/sighting.controller");

const router = express.Router();

router.post("/", postSighting);            // POST   /api/sightings
router.get("/", listSightings);            // GET    /api/sightings        (active only)
router.get("/history", listAllSightings);  // GET    /api/sightings/history (all, no cutoff)
router.delete("/:id", removeSighting);     // DELETE /api/sightings/:id

module.exports = router;
