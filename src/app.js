const express = require("express");
const cors = require("cors");
const path = require("path");
const { db } = require("./config/firebase");
const galleryRoutes = require("./routes/gallery.routes");
const packageRoutes = require("./routes/package.routes");
const bookingRoutes = require("./routes/booking.routes");
const waitingListRoutes = require("./routes/waitingList.routes");
const aiRoutes = require("./routes/ai.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
  credentials: true,
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Test route
app.get("/", async (req, res) => {
  try {
    const collections = await db.listCollections();

    res.json({
      message: "Firebase Connected Successfully!",
      collections: collections.map((c) => c.id),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Mount Routes
app.use("/api/gallery", galleryRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/waiting-list", waitingListRoutes);
app.use("/api/ai", aiRoutes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
