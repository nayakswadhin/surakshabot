const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  constructor() {
    // Validate email configuration
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.error(
        "⚠️  Email configuration missing! Please set SMTP_EMAIL and SMTP_PASSWORD in .env file"
      );
    }

    // Create transporter for sending emails
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD.replace(/\s+/g, ""), // Remove any spaces from password
        },
        // Add timeout and connection options
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      console.log("✓ Email service initialized successfully");
      console.log(`✓ Configured to send from: ${process.env.SMTP_EMAIL}`);
    } catch (error) {
      console.error("✗ Failed to initialize email service:", error.message);
    }

    // Store OTPs temporarily with expiration
    this.otpStore = new Map();

    // Clean up expired OTPs every 10 minutes
    setInterval(() => {
      this.cleanupExpiredOtps();
    }, 10 * 60 * 1000);
  }

  /**
   * Generate a 6-digit OTP
   * @returns {string} 6-digit OTP
   */
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to user's email
   * @param {string} email - User's email address
   * @param {string} phoneNumber - User's phone number (used as key)
   * @returns {Promise<Object>} Success status and message
   */
  async sendOtp(email, phoneNumber) {
    try {
      // Verify email configuration first
      if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.error(
          "Email service not configured properly. Please set SMTP_EMAIL and SMTP_PASSWORD in .env"
        );
        return {
          success: false,
          message:
            "Email service is not configured. Please contact administrator.",
          error: "EMAIL_NOT_CONFIGURED",
        };
      }

      // Verify transporter connection before sending
      try {
        await this.transporter.verify();
        console.log("✓ Email server connection verified");
      } catch (verifyError) {
        console.error("✗ Email server connection failed:", verifyError.message);
        console.error("✗ Full error:", verifyError);

        // Provide user-friendly error message
        let userMessage = "Unable to send OTP at the moment. ";

        if (
          verifyError.responseCode === 535 ||
          verifyError.message.includes("Username and Password not accepted")
        ) {
          userMessage +=
            "Email service authentication failed. Please contact administrator.";
        } else if (verifyError.code === "ECONNECTION") {
          userMessage +=
            "Cannot connect to email server. Please try again later.";
        } else {
          userMessage += "Please try again later or contact administrator.";
        }

        return {
          success: false,
          message: userMessage,
          error: verifyError.message,
        };
      }

      // Generate OTP
      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // Store OTP with expiration and retry count
      this.otpStore.set(phoneNumber, {
        otp,
        email,
        expiresAt,
        createdAt: new Date(),
        attempts: 0,
        maxAttempts: 3,
      });

      // Email content
      const mailOptions = {
        from: `"1930 Cyber Helpline" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "OTP Verification - 1930 Cyber Helpline",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #0066cc;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #0066cc;
                margin: 0;
                font-size: 24px;
              }
              .otp-box {
                background-color: #f8f9fa;
                border: 2px dashed #0066cc;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 30px 0;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #0066cc;
                letter-spacing: 8px;
                margin: 10px 0;
              }
              .content {
                color: #333333;
                line-height: 1.6;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dddddd;
                text-align: center;
                color: #666666;
                font-size: 12px;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                margin: 20px 0;
                color: #856404;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>1930 Cyber Helpline, India</h1>
              </div>
              
              <div class="content">
                <p>Dear User,</p>
                <p>Thank you for registering with 1930 Cyber Helpline. Please use the following One-Time Password (OTP) to verify your email address:</p>
              </div>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your OTP is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
              </div>
              
              <div class="content">
                <p>Please enter this OTP in your WhatsApp conversation to complete the verification process.</p>
              </div>
              
              <div class="warning">
                <strong>Important:</strong> Do not share this OTP with anyone. Government officials will never ask for your OTP.
              </div>
              
              <div class="footer">
                <p>This is an automated message from 1930 Cyber Helpline, Government of India.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
1930 Cyber Helpline, India

Dear User,

Thank you for registering with 1930 Cyber Helpline. 

Your OTP for email verification is: ${otp}

This OTP is valid for 10 minutes only.

Please enter this OTP in your WhatsApp conversation to complete the verification process.

IMPORTANT: Do not share this OTP with anyone. Government officials will never ask for your OTP.

If you did not request this OTP, please ignore this email.

---
This is an automated message from 1930 Cyber Helpline, Government of India.
        `,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      console.log(
        `✓ OTP sent successfully to ${email} for phone ${phoneNumber}`
      );
      console.log(`Message ID: ${info.messageId}`);

      return {
        success: true,
        message: "OTP sent successfully to your email.",
      };
    } catch (error) {
      console.error("✗ Error sending OTP email:", error);
      console.error("Error details:", {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      });

      // Provide user-friendly error messages
      let userMessage = "Failed to send OTP. Please try again later.";

      if (error.code === "EAUTH" || error.responseCode === 535) {
        userMessage =
          "Email authentication failed. Please contact administrator.";
      } else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
        userMessage =
          "Unable to connect to email server. Please check your internet connection and try again.";
      } else if (error.code === "EENVELOPE") {
        userMessage = "Invalid email address. Please enter a valid email ID.";
      }

      return {
        success: false,
        message: userMessage,
        error: error.message,
      };
    }
  }

  /**
   * Verify OTP entered by user
   * @param {string} phoneNumber - User's phone number (key)
   * @param {string} enteredOtp - OTP entered by user
   * @returns {Object} Verification result
   */
  verifyOtp(phoneNumber, enteredOtp) {
    const storedData = this.otpStore.get(phoneNumber);

    if (!storedData) {
      return {
        success: false,
        message: "No OTP found. Please request a new OTP.",
        code: "OTP_NOT_FOUND",
      };
    }

    // Check if OTP has expired
    if (new Date() > storedData.expiresAt) {
      this.otpStore.delete(phoneNumber);
      return {
        success: false,
        message: "OTP has expired. Please request a new OTP.",
        code: "OTP_EXPIRED",
      };
    }

    // Check max attempts
    if (storedData.attempts >= storedData.maxAttempts) {
      this.otpStore.delete(phoneNumber);
      return {
        success: false,
        message:
          "Maximum verification attempts exceeded. Please request a new OTP.",
        code: "MAX_ATTEMPTS_EXCEEDED",
      };
    }

    // Increment attempt count
    storedData.attempts += 1;
    this.otpStore.set(phoneNumber, storedData);

    // Verify OTP
    if (enteredOtp.trim() === storedData.otp) {
      // OTP is correct, remove from store
      this.otpStore.delete(phoneNumber);
      return {
        success: true,
        message: "Email verified successfully!",
        email: storedData.email,
      };
    } else {
      const attemptsLeft = storedData.maxAttempts - storedData.attempts;
      return {
        success: false,
        message: `Incorrect OTP. ${attemptsLeft} attempt(s) remaining.`,
        code: "INCORRECT_OTP",
        attemptsLeft,
      };
    }
  }

  /**
   * Check if OTP exists for a phone number
   * @param {string} phoneNumber - User's phone number
   * @returns {boolean} True if OTP exists and is valid
   */
  hasValidOtp(phoneNumber) {
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) return false;

    // Check if expired
    if (new Date() > storedData.expiresAt) {
      this.otpStore.delete(phoneNumber);
      return false;
    }

    return true;
  }

  /**
   * Clear OTP for a phone number
   * @param {string} phoneNumber - User's phone number
   */
  clearOtp(phoneNumber) {
    this.otpStore.delete(phoneNumber);
  }

  /**
   * Clean up expired OTPs
   */
  cleanupExpiredOtps() {
    const now = new Date();
    for (const [phoneNumber, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(phoneNumber);
        console.log(`Cleaned up expired OTP for ${phoneNumber}`);
      }
    }
  }

  /**
   * Get remaining attempts for a phone number
   * @param {string} phoneNumber - User's phone number
   * @returns {number} Remaining attempts or 0
   */
  getRemainingAttempts(phoneNumber) {
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) return 0;

    return Math.max(0, storedData.maxAttempts - storedData.attempts);
  }
}

module.exports = EmailService;
