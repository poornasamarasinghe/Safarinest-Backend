const bookingService = require("../services/booking.service");

class BookingController {
  /**
   * Get all bookings
   */
  async getBookings(req, res, next) {
    try {
      const bookings = await bookingService.getAllBookings();
      return res.status(200).json(bookings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking by document ID
   */
  async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      return res.status(200).json(booking);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(req, res, next) {
    try {
      const newBooking = await bookingService.createBooking(req.body);
      return res.status(201).json({
        success: true,
        message: "Booking created successfully!",
        data: newBooking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a booking's status
   */
  async updateBookingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedBooking = await bookingService.updateBookingStatus(id, status);
      return res.status(200).json({
        success: true,
        message: "Booking status updated successfully!",
        data: updatedBooking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a booking
   */
  async deleteBooking(req, res, next) {
    try {
      const { id } = req.params;
      await bookingService.deleteBooking(id);
      return res.status(200).json({
        success: true,
        message: "Booking deleted successfully!",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking summary (counts by status, revenue, recent bookings)
   */
  async getSummary(req, res, next) {
    try {
      const summary = await bookingService.getBookingSummary();
      return res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
