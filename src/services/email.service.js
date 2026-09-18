const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class EmailService {
  constructor() {
    this.transporter = null;
    // Initialize immediately on module load
    this._initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter eagerly on startup.
   * Uses Gmail SMTP if GMAIL_USER and GMAIL_APP_PASSWORD are set in .env,
   * otherwise falls back to Ethereal for local development testing.
   */
  async _initializeTransporter() {
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        // --- Real Gmail SMTP ---
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        // Verify connection at startup
        await this.transporter.verify();
        console.log(`✅ Email service using Gmail SMTP (${process.env.GMAIL_USER}).`);
      } else {
        // --- Ethereal fallback for local dev ---
        console.log("⚠️  GMAIL_USER / GMAIL_APP_PASSWORD not set.");
        console.log("   Emails will use Ethereal (preview only, not real delivery).");
        console.log("   Add GMAIL_USER and GMAIL_APP_PASSWORD to .env for real emails.");

        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log(`🧪 Ethereal SMTP ready (${testAccount.user}).`);
      }
    } catch (error) {
      console.error("❌ Email transporter init failed:", error.message);
      this.transporter = null;
    }
  }

  /**
   * Send booking confirmation email to the guest.
   */
  async sendBookingConfirmation(booking) {
    try {
      // If transporter failed to init, retry once
      if (!this.transporter) {
        console.log("🔄 Retrying email transporter initialization...");
        await this._initializeTransporter();
      }

      if (!this.transporter) {
        console.warn("⚠️ Email transporter not available. Skipping email.");
        return;
      }

      // Load HTML template
      const templatePath = path.join(__dirname, "../templates/bookingConfirmation.html");
      if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template not found: ${templatePath}`);
        return;
      }

      let htmlContent = fs.readFileSync(templatePath, "utf8");

      // Build cancel URL
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const cancelUrl = `${clientUrl}/cancel-booking?id=${booking.id}`;

      // Inject booking data into template
      htmlContent = htmlContent
        .replace(/{{guest}}/g, booking.guest || "Valued Traveler")
        .replace(/{{bookingId}}/g, booking.bookingId || booking.id)
        .replace(/{{package}}/g, booking.package || "Safari Package")
        .replace(/{{date}}/g, booking.date || "")
        .replace(/{{time}}/g, booking.time || "")
        .replace(/{{guests}}/g, booking.guests || "")
        .replace(/{{price}}/g, booking.price || "")
        .replace(/{{cancelUrl}}/g, cancelUrl);

      const fromName = process.env.EMAIL_FROM_NAME || "SafariNest Reservations";
      const fromAddress = process.env.GMAIL_USER || "reservations@safarinest.com";

      const mailOptions = {
        from: `"${fromName}" <${fromAddress}>`,
        to: booking.email,
        subject: `🌿 Safari Reservation Confirmed — ${booking.bookingId || booking.id}`,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✉️  Confirmation email sent → ${booking.email}`);

      // Print Ethereal preview link if using test account
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal preview (test only): ${previewUrl}`);
      }
    } catch (error) {
      console.error("❌ Error sending booking confirmation email:", error.message);
    }
  }
  /**
   * Send "You've been added to the waiting list" email.
   */
  async sendWaitingListConfirmation(entry) {
    try {
      if (!this.transporter) {
        await this._initializeTransporter();
      }
      if (!this.transporter) {
        console.warn("⚠️ Email transporter not available. Skipping waiting list email.");
        return;
      }

      const templatePath = require("path").join(__dirname, "../templates/waitingList.html");
      const fs = require("fs");
      if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template not found: ${templatePath}`);
        return;
      }

      let htmlContent = fs.readFileSync(templatePath, "utf8");

      htmlContent = htmlContent
        .replace(/{{guest}}/g, entry.guest || "Valued Traveler")
        .replace(/{{package}}/g, entry.package || "Safari Package")
        .replace(/{{date}}/g, entry.date || "")
        .replace(/{{time}}/g, entry.time || "")
        .replace(/{{guests}}/g, entry.guests || "");

      const fromName = process.env.EMAIL_FROM_NAME || "SafariNest Reservations";
      const fromAddress = process.env.GMAIL_USER || "reservations@safarinest.com";

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: entry.email,
        subject: `🌿 You're on the Waiting List — SafariNest`,
        html: htmlContent,
      });

      console.log(`📋 Waiting list email sent → ${entry.email}`);

      const previewUrl = require("nodemailer").getTestMessageUrl(info);
      if (previewUrl) console.log(`🔗 Ethereal preview: ${previewUrl}`);
    } catch (error) {
      console.error("❌ Error sending waiting list email:", error.message);
    }
  }

  /**
   * Send "Your slot is now vacant — confirm to claim it" email.
   */
  async sendSlotVacantNotification(entry, confirmUrl) {
    try {
      if (!this.transporter) {
        await this._initializeTransporter();
      }
      if (!this.transporter) {
        console.warn("⚠️ Email transporter not available. Skipping slot vacant email.");
        return;
      }

      const templatePath = require("path").join(__dirname, "../templates/promotedBooking.html");
      const fs = require("fs");
      if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template not found: ${templatePath}`);
        return;
      }

      let htmlContent = fs.readFileSync(templatePath, "utf8");

      htmlContent = htmlContent
        .replace(/{{guest}}/g, entry.guest || "Valued Traveler")
        .replace(/{{package}}/g, entry.package || "Safari Package")
        .replace(/{{date}}/g, entry.date || "")
        .replace(/{{time}}/g, entry.time || "")
        .replace(/{{guests}}/g, entry.guests || "")
        .replace(/{{confirmUrl}}/g, confirmUrl);

      const fromName = process.env.EMAIL_FROM_NAME || "SafariNest Reservations";
      const fromAddress = process.env.GMAIL_USER || "reservations@safarinest.com";

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: entry.email,
        subject: `🎉 Great News! Your Safari Slot is Now Available — SafariNest`,
        html: htmlContent,
      });

      console.log(`🎉 Slot vacant email sent → ${entry.email}`);

      const previewUrl = require("nodemailer").getTestMessageUrl(info);
      if (previewUrl) console.log(`🔗 Ethereal preview: ${previewUrl}`);
    } catch (error) {
      console.error("❌ Error sending slot vacant email:", error.message);
    }
  }
}

module.exports = new EmailService();
