const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { validateCreateBooking } = require("../validators/booking.validator");

// GET all bookings
router.get("/", bookingController.getBookings);

// GET booking by ID
router.get("/:id", bookingController.getBookingById);

// POST new booking
router.post("/", validateCreateBooking, bookingController.createBooking);

// PATCH update booking status
router.patch("/:id/status", bookingController.updateBookingStatus);

// DELETE booking
router.delete("/:id", bookingController.deleteBooking);

module.exports = router;
