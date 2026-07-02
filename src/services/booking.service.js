const bookingRepository = require("../repositories/booking.repository");
const packageRepository = require("../repositories/package.repository");
const emailService = require("./email.service");


class BookingService {
  /**
   * Helper to format guests count as a string
   */
  _formatGuestsString(adults, childrenCount) {
    const adultStr = adults === 1 ? "1 Adult" : `${adults} Adults`;
    const childStr = childrenCount > 0 
      ? `, ${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}` 
      : "";
    return `${adultStr}${childStr}`;
  }

  /**
   * Get all bookings and self-seed defaults if database is empty
   */
  async getAllBookings() {
    let bookings = await bookingRepository.getAll();

    if (bookings.length === 0) {
      console.log("Seeding initial mock bookings...");
      const seedData = [
        {
          bookingId: "BK-8821",
          guest: "Sarah Jenkins",
          email: "sarah.j@example.com",
          phone: "+94 77 111 2222",
          packageId: "leopard-tracker-elite",
          package: "Leopard Tracker Elite",
          zone: "Yala Block 1",
          date: "Oct 24, 2023",
          time: "05:30 AM",
          guests: "2 Adults, 1 Child",
          adults: 2,
          childrenCount: 1,
          price: "$450",
          priceNumeric: 450,
          status: "Confirmed",
          specialRequests: "",
        },
        {
          bookingId: "BK-9042",
          guest: "David Miller",
          email: "david.m@example.com",
          phone: "+94 77 333 4444",
          packageId: "gentle-giants-expedition",
          package: "Gentle Giants Expedition",
          zone: "Kumana",
          date: "Oct 25, 2023",
          time: "03:00 PM",
          guests: "4 Adults",
          adults: 4,
          childrenCount: 0,
          price: "$680",
          priceNumeric: 680,
          status: "Pending",
          specialRequests: "",
        },
        {
          bookingId: "BK-7719",
          guest: "Elena Rodriguez",
          email: "elena.r@example.com",
          phone: "+94 77 555 6666",
          packageId: "block-5-wilderness",
          package: "Birding Paradise Tour",
          zone: "Bundala",
          date: "Oct 26, 2023",
          time: "06:00 AM",
          guests: "1 Adult",
          adults: 1,
          childrenCount: 0,
          price: "$210",
          priceNumeric: 210,
          status: "Cancelled",
          specialRequests: "",
        }
      ];

      for (const booking of seedData) {
        await bookingRepository.create(booking);
      }
      bookings = await bookingRepository.getAll();
    }

    return bookings;
  }

  /**
   * Get single booking by document ID
   */
  async getBookingById(id) {
    const booking = await bookingRepository.getById(id);
    if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      throw error;
    }
    return booking;
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    let pkgId = bookingData.packageId;
    
    // Map frontend legacy/display IDs to database IDs
    if (pkgId === "dawn-predator") pkgId = "leopard-tracker-elite";
    if (pkgId === "elephant-corridor") pkgId = "gentle-giants-expedition";
    if (pkgId === "night-ranger") pkgId = "block-5-wilderness";

    let packageName = "Safari Tour";
    let zone = "Yala National Park";
    let basePrice = 120; // fallback

    try {
      const pkg = await packageRepository.getById(pkgId);
      if (pkg) {
        packageName = pkg.name;
        zone = pkg.zone;
        basePrice = pkg.price;
      }
    } catch (err) {
      console.warn(`Could not fetch package details for ID: ${pkgId}, using fallbacks.`, err);
    }

    // Pricing Calculation (matching frontend calculation)
    const adults = Number(bookingData.adults);
    const childrenCount = Number(bookingData.childrenCount || 0);
    const guestCount = adults + childrenCount;
    const conservationFeeRate = 25.00;
    const conservationFees = guestCount * conservationFeeRate;
    const subtotal = basePrice + conservationFees;
    const taxRate = 0.10;
    const taxesAndService = subtotal * taxRate;
    const totalAmount = subtotal + taxesAndService;

    // Generate readable random booking ID: BK-XXXX
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `BK-${randomCode}`;

    // Format date if it's in YYYY-MM-DD
    let formattedDate = bookingData.date;
    try {
      if (bookingData.date.includes("-")) {
        const dateObj = new Date(bookingData.date);
        const options = { month: "short", day: "numeric", year: "numeric" };
        formattedDate = dateObj.toLocaleDateString("en-US", options);
      }
    } catch (err) {
      // Keep original string if parsing fails
    }

    // Format time: e.g. "06:30 AM" or "03:00 PM"
    let formattedTime = bookingData.selectedSlot || "06:00";
    if (!formattedTime.toLowerCase().includes("am") && !formattedTime.toLowerCase().includes("pm")) {
      const hour = parseInt(formattedTime.split(":")[0]);
      if (hour < 12) {
        formattedTime = `${formattedTime} AM`;
      } else {
        const displayHour = hour === 12 ? 12 : hour - 12;
        const minutes = formattedTime.split(":")[1] || "00";
        const paddedHour = displayHour < 10 ? `0${displayHour}` : displayHour;
        formattedTime = `${paddedHour}:${minutes} PM`;
      }
    }

    const payload = {
      bookingId,
      guest: bookingData.fullName,
      email: bookingData.email,
      phone: bookingData.phone,
      packageId: pkgId,
      package: packageName,
      zone,
      date: formattedDate,
      time: formattedTime,
      guests: this._formatGuestsString(adults, childrenCount),
      adults,
      childrenCount,
      price: `$${Math.round(totalAmount)}`,
      priceNumeric: totalAmount,
      status: "Pending",
      specialRequests: bookingData.specialRequests || "",
    };

    const createdBooking = await bookingRepository.create(payload);
    
    // Asynchronously send confirmation email so the API call remains fast
    emailService.sendBookingConfirmation(createdBooking).catch((err) => {
      console.error("❌ Background email notification failed:", err);
    });

    return createdBooking;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id, status) {
    const validStatuses = ["Confirmed", "Pending", "Cancelled"];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      error.status = 400;
      throw error;
    }

    const booking = await this.getBookingById(id);
    return await bookingRepository.update(id, { status });
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id) {
    await this.getBookingById(id);
    return await bookingRepository.delete(id);
  }

  /**
   * Get summary: total/confirmed/pending/cancelled counts, revenue, and 5 most recent bookings
   */
  async getBookingSummary() {
    return await bookingRepository.getSummary();
  }
}

module.exports = new BookingService();
