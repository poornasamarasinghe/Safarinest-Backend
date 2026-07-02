const validate = require("../middleware/validate.middleware");

const createBookingSchema = {
  fullName: { required: true },
  email: { required: true, type: "email" },
  phone: { required: true },
  packageId: { required: true },
  date: { required: true },
  timeSlot: { required: true },
  selectedSlot: { required: true },
  adults: { required: true, type: "number" },
  childrenCount: { required: false, type: "number" }
};

module.exports = {
  validateCreateBooking: validate(createBookingSchema)
};
