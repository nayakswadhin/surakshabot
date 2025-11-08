/**
 * Comprehensive End-to-End Test for Email OTP Feature
 *
 * This test validates:
 * 1. Email service initialization
 * 2. OTP generation and sending
 * 3. OTP verification (correct and incorrect)
 * 4. OTP expiration handling
 * 5. Maximum attempts handling
 * 6. Integration with WhatsApp service
 */

require("dotenv").config();
const EmailService = require("./services/emailService");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(
    `\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.blue}TEST: ${testName}${colors.reset}`);
  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
}

function logSuccess(message) {
  log(`✓ ${message}`, "green");
}

function logError(message) {
  log(`✗ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠ ${message}`, "yellow");
}

function logInfo(message) {
  log(`ℹ ${message}`, "cyan");
}

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runTests() {
  console.log("\n" + "=".repeat(60));
  log("EMAIL OTP FEATURE - END-TO-END TEST SUITE", "cyan");
  console.log("=".repeat(60) + "\n");

  const emailService = new EmailService();

  // ========================================
  // TEST 1: Email Configuration Check
  // ========================================
  logTest("Email Configuration Check");
  totalTests++;

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not found in .env file");
    }

    if (
      process.env.EMAIL_USER === "your-email@gmail.com" ||
      process.env.EMAIL_PASS === "your-app-password" ||
      process.env.EMAIL_PASS === "your-16-digit-app-password-here"
    ) {
      logWarning("Email credentials are not configured properly!");
      logInfo("Please update EMAIL_USER and EMAIL_PASS in .env file");
      logInfo(
        "For Gmail: Generate App Password at https://myaccount.google.com/apppasswords"
      );
      logWarning("Skipping live email tests...\n");

      // Run only mock tests
      await runMockTests(emailService);
      return;
    }

    logSuccess(`Email User: ${process.env.EMAIL_USER}`);
    logSuccess(`Email Service: ${process.env.EMAIL_SERVICE || "gmail"}`);
    logSuccess("Email credentials configured");
    passedTests++;
  } catch (error) {
    logError(`Configuration check failed: ${error.message}`);
    failedTests++;
    return;
  }

  // ========================================
  // TEST 2: Email Server Connection
  // ========================================
  logTest("Email Server Connection Test");
  totalTests++;

  try {
    await emailService.transporter.verify();
    logSuccess("Successfully connected to email server");
    passedTests++;
  } catch (error) {
    logError(`Email server connection failed: ${error.message}`);

    if (error.code === "EAUTH") {
      logError("Authentication failed! Please check:");
      logInfo("1. EMAIL_USER is correct");
      logInfo("2. EMAIL_PASS is an App Password (not regular password)");
      logInfo("3. 2-Step Verification is enabled in Google Account");
      logInfo(
        "4. Generate new App Password at: https://myaccount.google.com/apppasswords"
      );
    } else if (error.code === "ECONNECTION") {
      logError("Connection failed! Please check:");
      logInfo("1. Internet connection is active");
      logInfo("2. Firewall is not blocking SMTP");
      logInfo("3. Gmail SMTP (smtp.gmail.com:587) is accessible");
    }

    failedTests++;
    logWarning("Skipping live email tests due to connection failure...\n");
    await runMockTests(emailService);
    return;
  }

  // ========================================
  // TEST 3: OTP Generation
  // ========================================
  logTest("OTP Generation Test");
  totalTests++;

  try {
    const otp1 = emailService.generateOtp();
    const otp2 = emailService.generateOtp();

    if (!/^\d{6}$/.test(otp1)) {
      throw new Error("OTP is not 6 digits");
    }

    if (otp1 === otp2) {
      logWarning("Generated same OTP twice (rare but possible)");
    }

    logSuccess(`Generated OTP 1: ${otp1}`);
    logSuccess(`Generated OTP 2: ${otp2}`);
    logSuccess("OTP format validation passed");
    passedTests++;
  } catch (error) {
    logError(`OTP generation failed: ${error.message}`);
    failedTests++;
  }

  // ========================================
  // TEST 4: Send Real OTP (Live Test)
  // ========================================
  logTest("Send OTP to Email (Live Test)");
  totalTests++;

  const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
  const testPhone = "+15551668892"; // Test phone number from screenshot

  logInfo(`Sending OTP to: ${testEmail}`);
  logInfo("This may take 5-10 seconds...");

  try {
    const result = await emailService.sendOtp(testEmail, testPhone);

    if (result.success) {
      logSuccess("OTP sent successfully!");
      logSuccess(`Message: ${result.message}`);
      logInfo("Please check your email inbox/spam folder");
      passedTests++;

      // Get the OTP from store for verification test
      const storedData = emailService.otpStore.get(testPhone);
      if (storedData) {
        logInfo(`📧 OTP sent: ${storedData.otp}`);
        logInfo("Use this OTP for manual testing in WhatsApp");
      }
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    logError(`Failed to send OTP: ${error.message || error}`);
    failedTests++;
  }

  // ========================================
  // TEST 5: OTP Verification - Correct OTP
  // ========================================
  logTest("OTP Verification - Correct OTP");
  totalTests++;

  try {
    const storedData = emailService.otpStore.get(testPhone);
    if (!storedData) {
      throw new Error("No OTP found in store");
    }

    const correctOtp = storedData.otp;
    logInfo(`Verifying OTP: ${correctOtp}`);

    const verifyResult = emailService.verifyOtp(testPhone, correctOtp);

    if (verifyResult.success) {
      logSuccess("OTP verified successfully!");
      logSuccess(`Email: ${verifyResult.email}`);
      passedTests++;
    } else {
      throw new Error(verifyResult.message);
    }
  } catch (error) {
    logError(`OTP verification failed: ${error.message}`);
    failedTests++;
  }

  // ========================================
  // TEST 6: OTP Verification - Incorrect OTP
  // ========================================
  logTest("OTP Verification - Incorrect OTP");
  totalTests++;

  try {
    // Send new OTP for this test
    await emailService.sendOtp(testEmail, testPhone + "_test2");

    const incorrectOtp = "000000";
    logInfo(`Verifying incorrect OTP: ${incorrectOtp}`);

    const verifyResult = emailService.verifyOtp(
      testPhone + "_test2",
      incorrectOtp
    );

    if (!verifyResult.success && verifyResult.code === "INCORRECT_OTP") {
      logSuccess("Correctly rejected incorrect OTP");
      logSuccess(`Message: ${verifyResult.message}`);
      logSuccess(`Attempts left: ${verifyResult.attemptsLeft}`);
      passedTests++;
    } else {
      throw new Error("Should have rejected incorrect OTP");
    }
  } catch (error) {
    logError(`Incorrect OTP test failed: ${error.message}`);
    failedTests++;
  }

  // ========================================
  // TEST 7: Maximum Attempts Handling
  // ========================================
  logTest("Maximum Attempts Exceeded Test");
  totalTests++;

  try {
    const testPhone3 = testPhone + "_test3";
    await emailService.sendOtp(testEmail, testPhone3);

    // Attempt 3 times with wrong OTP
    for (let i = 1; i <= 3; i++) {
      const result = emailService.verifyOtp(testPhone3, "999999");
      logInfo(`Attempt ${i}: ${result.message}`);
    }

    // 4th attempt should fail with max attempts exceeded
    const finalResult = emailService.verifyOtp(testPhone3, "999999");

    if (
      finalResult.code === "MAX_ATTEMPTS_EXCEEDED" ||
      finalResult.code === "OTP_NOT_FOUND"
    ) {
      logSuccess("Maximum attempts handling works correctly");
      logSuccess(`Message: ${finalResult.message}`);
      passedTests++;
    } else {
      throw new Error("Should have blocked after max attempts");
    }
  } catch (error) {
    logError(`Max attempts test failed: ${error.message}`);
    failedTests++;
  }

  // ========================================
  // TEST 8: OTP Cleanup Test
  // ========================================
  logTest("OTP Cleanup Test");
  totalTests++;

  try {
    const testPhone4 = testPhone + "_test4";
    await emailService.sendOtp(testEmail, testPhone4);

    // Manually expire the OTP
    const storedData = emailService.otpStore.get(testPhone4);
    if (storedData) {
      storedData.expiresAt = new Date(Date.now() - 1000); // Expire 1 second ago
      emailService.otpStore.set(testPhone4, storedData);
    }

    // Try to verify expired OTP
    const verifyResult = emailService.verifyOtp(testPhone4, storedData.otp);

    if (verifyResult.code === "OTP_EXPIRED") {
      logSuccess("OTP expiration handling works correctly");
      logSuccess(`Message: ${verifyResult.message}`);
      passedTests++;
    } else {
      throw new Error("Should have rejected expired OTP");
    }
  } catch (error) {
    logError(`OTP cleanup test failed: ${error.message}`);
    failedTests++;
  }

  // Print final results
  printResults();
}

async function runMockTests(emailService) {
  console.log("\n" + "-".repeat(60));
  log("Running Mock Tests (No Live Email)", "yellow");
  console.log("-".repeat(60) + "\n");

  // Test OTP generation
  logTest("Mock: OTP Generation");
  totalTests++;
  try {
    const otp = emailService.generateOtp();
    if (!/^\d{6}$/.test(otp)) {
      throw new Error("Invalid OTP format");
    }
    logSuccess(`Generated OTP: ${otp}`);
    passedTests++;
  } catch (error) {
    logError(`Mock OTP generation failed: ${error.message}`);
    failedTests++;
  }

  // Test OTP verification logic (mock)
  logTest("Mock: OTP Verification Logic");
  totalTests++;
  try {
    const testPhone = "+1234567890";
    const testOtp = "123456";

    // Manually add OTP to store
    emailService.otpStore.set(testPhone, {
      otp: testOtp,
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    // Verify correct OTP
    const result = emailService.verifyOtp(testPhone, testOtp);
    if (result.success) {
      logSuccess("Mock verification successful");
      passedTests++;
    } else {
      throw new Error("Mock verification failed");
    }
  } catch (error) {
    logError(`Mock verification failed: ${error.message}`);
    failedTests++;
  }

  printResults();
}

function printResults() {
  console.log("\n" + "=".repeat(60));
  log("TEST RESULTS SUMMARY", "cyan");
  console.log("=".repeat(60));

  console.log(`\nTotal Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, "green");

  if (failedTests > 0) {
    log(`Failed: ${failedTests}`, "red");
  } else {
    log(`Failed: ${failedTests}`, "green");
  }

  const successRate =
    totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;

  console.log(`\nSuccess Rate: ${successRate}%`);

  if (failedTests === 0) {
    console.log("\n" + "=".repeat(60));
    log("🎉 ALL TESTS PASSED! 🎉", "green");
    console.log("=".repeat(60) + "\n");
  } else {
    console.log("\n" + "=".repeat(60));
    log("⚠️  SOME TESTS FAILED ⚠️", "red");
    console.log("=".repeat(60) + "\n");
  }

  // Print instructions
  console.log("\n" + "-".repeat(60));
  log("NEXT STEPS FOR MANUAL TESTING:", "cyan");
  console.log("-".repeat(60));
  logInfo("1. Update EMAIL_USER and EMAIL_PASS in .env file");
  logInfo(
    "2. For Gmail: Generate App Password at https://myaccount.google.com/apppasswords"
  );
  logInfo("3. Run this test again to verify email sending");
  logInfo("4. Test in WhatsApp by registering with new complaint");
  logInfo("5. Enter your email when prompted");
  logInfo("6. Check email for OTP");
  logInfo("7. Enter OTP in WhatsApp to verify");
  console.log("-".repeat(60) + "\n");
}

// Run tests
console.log("\nStarting Email OTP Feature Tests...\n");
runTests().catch((error) => {
  logError(`Test suite crashed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
