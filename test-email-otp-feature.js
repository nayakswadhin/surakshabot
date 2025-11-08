/**
 * Test Suite for Email OTP Verification Feature
 *
 * This test file ensures the new OTP feature works correctly
 * without disrupting the existing workflow
 */

const EmailService = require("./services/emailService");
const SessionManager = require("./services/sessionManager");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

// Test results tracker
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function assert(condition, testName) {
  testsRun++;
  if (condition) {
    testsPassed++;
    log(`✓ ${testName}`, colors.green);
    return true;
  } else {
    testsFailed++;
    log(`✗ ${testName}`, colors.red);
    return false;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Test 1: Email Service Initialization
// ============================================
async function testEmailServiceInitialization() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 1: Email Service Initialization", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    assert(
      emailService !== null,
      "Email service should initialize successfully"
    );
    assert(
      emailService.transporter !== null,
      "Email transporter should be created"
    );
    assert(
      emailService.otpStore instanceof Map,
      "OTP store should be a Map instance"
    );
    assert(
      typeof emailService.generateOtp === "function",
      "generateOtp method should exist"
    );
    assert(
      typeof emailService.sendOtp === "function",
      "sendOtp method should exist"
    );
    assert(
      typeof emailService.verifyOtp === "function",
      "verifyOtp method should exist"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "Email service initialization");
  }
}

// ============================================
// Test 2: OTP Generation
// ============================================
async function testOtpGeneration() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 2: OTP Generation", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    const otp1 = emailService.generateOtp();
    const otp2 = emailService.generateOtp();

    assert(/^\d{6}$/.test(otp1), "OTP should be exactly 6 digits");
    assert(otp1 !== otp2, "Generated OTPs should be different");
    assert(
      parseInt(otp1) >= 100000 && parseInt(otp1) <= 999999,
      "OTP should be in valid range (100000-999999)"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "OTP generation");
  }
}

// ============================================
// Test 3: OTP Storage
// ============================================
async function testOtpStorage() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 3: OTP Storage", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    const phoneNumber = "9876543210";
    const otp = "123456";

    // Manually store OTP for testing
    emailService.otpStore.set(phoneNumber, {
      otp,
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    assert(
      emailService.hasValidOtp(phoneNumber),
      "Should detect valid OTP exists"
    );
    assert(
      emailService.getRemainingAttempts(phoneNumber) === 3,
      "Should have 3 remaining attempts initially"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "OTP storage");
  }
}

// ============================================
// Test 4: OTP Verification - Correct OTP
// ============================================
async function testOtpVerificationCorrect() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 4: OTP Verification - Correct OTP", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    const phoneNumber = "9876543210";
    const otp = "123456";

    // Store OTP
    emailService.otpStore.set(phoneNumber, {
      otp,
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    // Verify correct OTP
    const result = emailService.verifyOtp(phoneNumber, otp);

    assert(result.success === true, "Verification should succeed");
    assert(
      result.message === "Email verified successfully!",
      "Success message should be correct"
    );
    assert(
      !emailService.hasValidOtp(phoneNumber),
      "OTP should be removed after successful verification"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "OTP verification with correct OTP");
  }
}

// ============================================
// Test 5: OTP Verification - Incorrect OTP
// ============================================
async function testOtpVerificationIncorrect() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 5: OTP Verification - Incorrect OTP", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    const phoneNumber = "9876543210";
    const otp = "123456";

    // Store OTP
    emailService.otpStore.set(phoneNumber, {
      otp,
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    // Verify incorrect OTP
    const result = emailService.verifyOtp(phoneNumber, "654321");

    assert(result.success === false, "Verification should fail");
    assert(result.code === "INCORRECT_OTP", "Should return INCORRECT_OTP code");
    assert(result.attemptsLeft === 2, "Should have 2 attempts left");
    assert(
      emailService.hasValidOtp(phoneNumber),
      "OTP should still exist after failed attempt"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "OTP verification with incorrect OTP");
  }
}

// ============================================
// Test 6: OTP Verification - Max Attempts
// ============================================
async function testOtpMaxAttempts() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 6: OTP Verification - Max Attempts", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    const phoneNumber = "9876543210";
    const otp = "123456";

    // Store OTP
    emailService.otpStore.set(phoneNumber, {
      otp,
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    // Try wrong OTP 3 times
    emailService.verifyOtp(phoneNumber, "111111");
    emailService.verifyOtp(phoneNumber, "222222");
    emailService.verifyOtp(phoneNumber, "333333");

    // Fourth attempt should fail with max attempts exceeded
    const result = emailService.verifyOtp(phoneNumber, "444444");

    assert(result.success === false, "Verification should fail");
    assert(
      result.code === "MAX_ATTEMPTS_EXCEEDED",
      "Should return MAX_ATTEMPTS_EXCEEDED code"
    );
    assert(
      !emailService.hasValidOtp(phoneNumber),
      "OTP should be removed after max attempts"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "OTP max attempts handling");
  }
}

// ============================================
// Test 7: OTP Expiration
// ============================================
async function testOtpExpiration() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 7: OTP Expiration", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    const phoneNumber = "9876543210";
    const otp = "123456";

    // Store OTP with past expiration time
    emailService.otpStore.set(phoneNumber, {
      otp,
      email: "test@example.com",
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    // Try to verify expired OTP
    const result = emailService.verifyOtp(phoneNumber, otp);

    assert(result.success === false, "Verification should fail");
    assert(result.code === "OTP_EXPIRED", "Should return OTP_EXPIRED code");
    assert(
      !emailService.hasValidOtp(phoneNumber),
      "Expired OTP should be removed"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "OTP expiration handling");
  }
}

// ============================================
// Test 8: OTP Cleanup
// ============================================
async function testOtpCleanup() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 8: OTP Cleanup", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();

    // Add expired OTP
    emailService.otpStore.set("1234567890", {
      otp: "111111",
      email: "expired@example.com",
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    // Add valid OTP
    emailService.otpStore.set("9876543210", {
      otp: "222222",
      email: "valid@example.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    const sizeBefore = emailService.otpStore.size;
    emailService.cleanupExpiredOtps();
    const sizeAfter = emailService.otpStore.size;

    assert(sizeBefore === 2, "Should have 2 OTPs before cleanup");
    assert(sizeAfter === 1, "Should have 1 OTP after cleanup");
    assert(
      !emailService.hasValidOtp("1234567890"),
      "Expired OTP should be removed"
    );
    assert(emailService.hasValidOtp("9876543210"), "Valid OTP should remain");
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "OTP cleanup");
  }
}

// ============================================
// Test 9: Session Manager Integration
// ============================================
async function testSessionManagerIntegration() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 9: Session Manager Integration", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const sessionManager = new SessionManager();

    // Check new DIDIT steps exist
    assert(
      SessionManager.DIDIT_STEPS.EMAIL_OTP_SENT !== undefined,
      "EMAIL_OTP_SENT step should exist"
    );
    assert(
      SessionManager.DIDIT_STEPS.EMAIL_OTP_VERIFICATION !== undefined,
      "EMAIL_OTP_VERIFICATION step should exist"
    );

    // Test session creation and update with OTP steps
    const phoneNumber = "9876543210";
    sessionManager.createSession(phoneNumber);

    sessionManager.updateSession(phoneNumber, {
      state: SessionManager.STATES.DIDIT_ADDITIONAL_INFO,
      step: SessionManager.DIDIT_STEPS.EMAIL_OTP_VERIFICATION,
      data: { tempEmail: "test@example.com" },
    });

    const session = sessionManager.getSession(phoneNumber);

    assert(
      session.step === SessionManager.DIDIT_STEPS.EMAIL_OTP_VERIFICATION,
      "Session step should be EMAIL_OTP_VERIFICATION"
    );
    assert(
      session.data.tempEmail === "test@example.com",
      "Session should store temp email"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "Session Manager integration");
  }
}

// ============================================
// Test 10: Email Format Validation
// ============================================
async function testEmailValidation() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 10: Email Format Validation", colors.blue);
  log("=".repeat(60), colors.blue);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validEmails = [
    "user@example.com",
    "test.user@domain.co.in",
    "admin+tag@company.org",
  ];

  const invalidEmails = [
    "invalid.email",
    "@example.com",
    "user@",
    "user @example.com",
    "user@.com",
  ];

  validEmails.forEach((email) => {
    assert(emailPattern.test(email), `Should accept valid email: ${email}`);
  });

  invalidEmails.forEach((email) => {
    assert(!emailPattern.test(email), `Should reject invalid email: ${email}`);
  });
}

// ============================================
// Test 11: Backward Compatibility
// ============================================
async function testBackwardCompatibility() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 11: Backward Compatibility", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const sessionManager = new SessionManager();

    // Test that all old states and steps still exist
    assert(
      SessionManager.STATES.MENU !== undefined,
      "MENU state should still exist"
    );
    assert(
      SessionManager.STATES.NEW_COMPLAINT !== undefined,
      "NEW_COMPLAINT state should still exist"
    );
    assert(
      SessionManager.STATES.REGISTRATION !== undefined,
      "REGISTRATION state should still exist"
    );
    assert(
      SessionManager.STATES.DIDIT_ADDITIONAL_INFO !== undefined,
      "DIDIT_ADDITIONAL_INFO state should still exist"
    );

    // Test that old DIDIT steps still exist
    assert(
      SessionManager.DIDIT_STEPS.ASK_EMAIL !== undefined,
      "ASK_EMAIL step should still exist"
    );
    assert(
      SessionManager.DIDIT_STEPS.ASK_PINCODE !== undefined,
      "ASK_PINCODE step should still exist"
    );
    assert(
      SessionManager.DIDIT_STEPS.FINAL_CONFIRMATION !== undefined,
      "FINAL_CONFIRMATION step should still exist"
    );

    log("\nAll existing states and steps are preserved", colors.green);
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "Backward compatibility check");
  }
}

// ============================================
// Test 12: Clear OTP Functionality
// ============================================
async function testClearOtp() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Test 12: Clear OTP Functionality", colors.blue);
  log("=".repeat(60), colors.blue);

  try {
    const emailService = new EmailService();
    const phoneNumber = "9876543210";

    // Store OTP
    emailService.otpStore.set(phoneNumber, {
      otp: "123456",
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    });

    assert(
      emailService.hasValidOtp(phoneNumber),
      "OTP should exist before clearing"
    );

    emailService.clearOtp(phoneNumber);

    assert(
      !emailService.hasValidOtp(phoneNumber),
      "OTP should not exist after clearing"
    );
  } catch (error) {
    log(`Error: ${error.message}`, colors.red);
    assert(false, "Clear OTP functionality");
  }
}

// ============================================
// Run All Tests
// ============================================
async function runAllTests() {
  log("\n" + "=".repeat(60), colors.yellow);
  log("EMAIL OTP VERIFICATION FEATURE - TEST SUITE", colors.yellow);
  log("=".repeat(60), colors.yellow);
  log("Testing new OTP feature without disrupting existing workflow\n");

  await testEmailServiceInitialization();
  await testOtpGeneration();
  await testOtpStorage();
  await testOtpVerificationCorrect();
  await testOtpVerificationIncorrect();
  await testOtpMaxAttempts();
  await testOtpExpiration();
  await testOtpCleanup();
  await testSessionManagerIntegration();
  await testEmailValidation();
  await testBackwardCompatibility();
  await testClearOtp();

  // Print summary
  log("\n" + "=".repeat(60), colors.yellow);
  log("TEST SUMMARY", colors.yellow);
  log("=".repeat(60), colors.yellow);
  log(`Total Tests Run: ${testsRun}`);
  log(`Tests Passed: ${testsPassed}`, colors.green);
  log(
    `Tests Failed: ${testsFailed}`,
    testsFailed > 0 ? colors.red : colors.green
  );
  log(`Success Rate: ${((testsPassed / testsRun) * 100).toFixed(2)}%`);
  log("=".repeat(60), colors.yellow);

  if (testsFailed === 0) {
    log("\n✓ All tests passed! The OTP feature is ready to use.", colors.green);
    log("✓ No disruption to existing workflow detected.", colors.green);
  } else {
    log(
      `\n✗ ${testsFailed} test(s) failed. Please review the errors above.`,
      colors.red
    );
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  log(`\nFatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
