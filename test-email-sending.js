require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmailSending() {
  console.log("=== Email Configuration Test ===\n");

  // Check environment variables
  console.log("Environment Variables:");
  console.log("SMTP_EMAIL:", process.env.SMTP_EMAIL);
  console.log(
    "SMTP_PASSWORD:",
    process.env.SMTP_PASSWORD ? "***SET***" : "NOT SET"
  );
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log();

  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.error("❌ Email credentials not configured!");
    return;
  }

  // Remove spaces from password
  const password = process.env.SMTP_PASSWORD.replace(/\s+/g, "");
  console.log("Password length after removing spaces:", password.length);
  console.log();

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: password,
    },
  });

  console.log("=== Testing Connection ===");
  try {
    await transporter.verify();
    console.log("✅ Connection successful!");
    console.log();
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Error:", error.message);
    console.error("\nPossible issues:");
    console.error("1. App password is incorrect");
    console.error("2. 2-Step Verification not enabled on Gmail");
    console.error("3. App password has spaces (should be removed)");
    console.error("4. Less secure app access is disabled");
    return;
  }

  // Test sending email
  console.log("=== Testing Email Send ===");
  const testEmail = process.env.SMTP_EMAIL; // Send to yourself for testing

  try {
    const info = await transporter.sendMail({
      from: `"1930 Cyber Helpline Test" <${process.env.SMTP_EMAIL}>`,
      to: testEmail,
      subject: "Test Email - OTP System",
      text: "This is a test email from the OTP system. If you received this, email is working!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email - OTP System</h2>
          <p>This is a test email from the OTP verification system.</p>
          <p>If you received this, <strong>email is working correctly!</strong></p>
          <hr>
          <p style="color: #666; font-size: 12px;">1930 Cyber Helpline, India</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("\n✅ All tests passed! Email system is working.");
  } catch (error) {
    console.error("❌ Failed to send email!");
    console.error("Error:", error.message);
    console.error("\nFull error:", error);
  }
}

testEmailSending();
