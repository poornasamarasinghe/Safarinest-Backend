const waitingListRepository = require("../repositories/waitingList.repository");
const bookingRepository = require("../repositories/booking.repository");
const emailService = require("./email.service");

class WaitingListService {
  /**
   * Add a user to the waiting list for a specific slot.
   * Called when a booking attempt finds the slot is already taken.
   */
  async addToWaitingList(bookingData) {
    const payload = {
      packageId: bookingData.packageId,
      package: bookingData.package,
      zone: bookingData.zone,
      date: bookingData.date,
      time: bookingData.time,
      guest: bookingData.guest,
      email: bookingData.email,
      phone: bookingData.phone,
      guests: bookingData.guests,
      adults: bookingData.adults,
      childrenCount: bookingData.childrenCount,
      price: bookingData.price,
      priceNumeric: bookingData.priceNumeric,
      specialRequests: bookingData.specialRequests || "",
    };

    const entry = await waitingListRepository.create(payload);

    // Send "added to waiting list" email asynchronously
    emailService.sendWaitingListConfirmation(entry).catch((err) => {
      console.error("❌ Failed to send waiting list email:", err);
    });

    return entry;
  }

  /**
   * Get a single waiting list entry by ID.
   * Used by the frontend confirm-slot page to display entry details.
   */
  async getById(id) {
    const entry = await waitingListRepository.getById(id);
    if (!entry) {
      const error = new Error("Waiting list entry not found.");
      error.status = 404;
      throw error;
    }
    return entry;
  }

  /**
   * on the waiting list for that slot (FIFO).
   */
  async notifyFirstInQueue(packageId, date, time) {
    const queue = await waitingListRepository.getBySlot(packageId, date, time);

    if (queue.length === 0) {
      console.log(`ℹ️  No waiting list entries for slot: ${packageId} / ${date} / ${time}`);
      return null;
    }

    const first = queue[0];

    // Mark as notified so we don't notify them again
    await waitingListRepository.update(first.id, { status: "notified" });

    // Send "slot is now vacant" email asynchronously
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const confirmUrl = `${clientUrl}/confirm-slot?id=${first.id}`;

    emailService.sendSlotVacantNotification(first, confirmUrl).catch((err) => {
      console.error("❌ Failed to send slot vacant notification email:", err);
    });

    return first;
  }

  /**
   * User clicks "Confirm Slot" from email.
   * Upgrades the waiting list entry to a confirmed booking.
   */
  async confirmFromWaitingList(waitingListId) {
    const entry = await waitingListRepository.getById(waitingListId);

    if (!entry) {
      const error = new Error("Waiting list entry not found.");
      error.status = 404;
      throw error;
    }

    if (entry.status === "confirmed") {
      const error = new Error("This slot has already been confirmed.");
      error.status = 409;
      throw error;
    }

    if (entry.status === "expired") {
      const error = new Error("This slot offer has expired.");
      error.status = 410;
      throw error;
    }

    if (entry.status !== "notified") {
      const error = new Error("This slot is not currently available for confirmation.");
      error.status = 400;
      throw error;
    }

    // Double-check the slot is still free before promoting
    const existingBookings = await bookingRepository.getBySlot(
      entry.packageId,
      entry.date,
      entry.time
    );
    if (existingBookings.length > 0) {
      // Slot was taken again — mark this entry as expired
      await waitingListRepository.update(waitingListId, { status: "expired" });
      const error = new Error(
        "Unfortunately this slot was taken by someone else. Your waiting list position has expired."
      );
      error.status = 409;
      throw error;
    }

    // Generate a booking ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `BK-${randomCode}`;

    const bookingPayload = {
      bookingId,
      guest: entry.guest,
      email: entry.email,
      phone: entry.phone,
      packageId: entry.packageId,
      package: entry.package,
      zone: entry.zone,
      date: entry.date,
      time: entry.time,
      guests: entry.guests,
      adults: entry.adults,
      childrenCount: entry.childrenCount,
      price: entry.price,
      priceNumeric: entry.priceNumeric,
      status: "Confirmed",
      specialRequests: entry.specialRequests || "",
      promotedFromWaitingList: true,
    };

    const newBooking = await bookingRepository.create(bookingPayload);

    // Mark waiting list entry as confirmed
    await waitingListRepository.update(waitingListId, {
      status: "confirmed",
      promotedBookingId: newBooking.id,
    });

    // Send booking confirmation email
    emailService.sendBookingConfirmation(newBooking).catch((err) => {
      console.error("❌ Failed to send booking confirmation after promotion:", err);
    });

    return newBooking;
  }
}

module.exports = new WaitingListService();
