const express = require("express");
const router = express.Router();
const waitingListController = require("../controllers/waitingList.controller");

// GET waiting list entry by ID (used by confirm-slot page)
router.get("/:id", waitingListController.getById);

// PATCH confirm slot from waiting list (called from email link)
router.patch("/:id/confirm", waitingListController.confirmSlot);

module.exports = router;
