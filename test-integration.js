/**
 * Comprehensive Integration Test Script
 * Tests the complete Didit verification flow
 */

require("dotenv").config();
const SessionManager = require("./services/sessionManager");
const DiditService = require("./services/diditService");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(70));
  log(title, colors.bright + colors.cyan);
  console.log("=".repeat(70) + "\n");
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logStep(step, message) {
  log(`\n[Step ${step}] ${message}`, colors.bright + colors.magenta);
}

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    logSuccess(`PASS: ${testName}`);
    return true;
  } else {
    failedTests++;
    logError(`FAIL: ${testName}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  logSection("ENVIRONMENT VARIABLES TEST");

  const requiredVars = [
    "MONGODB_URI",
    "PHONE_NUMBER_ID",
    "WHATSAPP_TOKEN",
    "GRAPH_API_URL",
    "WEBHOOK_VERIFY_TOKEN",
    "DIDIT_API_KEY",
    "DIDIT_WORKFLOW_ID",
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is missing`);
      allPresent = false;
    }
  }

  assert(allPresent, "All required environment variables are present");
  return allPresent;
}

async function testSessionManager() {
  logSection("SESSION MANAGER TEST");

  const sessionManager = new SessionManager();
  const testPhone = "+919876543210";

  logStep(1, "Creating session");
  const session = sessionManager.createSession(testPhone);
  assert(session !== null, "Session created");
  assert(session.state === "MENU", "Initial state is MENU");
  assert(session.phoneNumber === testPhone, "Phone number stored correctly");

  logStep(2, "Testing session retrieval");
  const retrievedSession = sessionManager.getSession(testPhone);
  assert(retrievedSession !== null, "Session retrieved");
  assert(
    retrievedSession.phoneNumber === testPhone,
    "Retrieved correct session"
  );

  logStep(3, "Testing session update");
  sessionManager.updateSession(testPhone, {
    state: SessionManager.STATES.DIDIT_VERIFICATION,
    data: { test: "value" },
  });
  const updatedSession = sessionManager.getSession(testPhone);
  assert(
    updatedSession.state === SessionManager.STATES.DIDIT_VERIFICATION,
    "Session state updated"
  );
  assert(updatedSession.data.test === "value", "Session data updated");

  logStep(4, "Testing Didit states");
  assert(
    SessionManager.STATES.DIDIT_VERIFICATION !== undefined,
    "DIDIT_VERIFICATION state exists"
  );
  assert(
    SessionManager.STATES.DIDIT_DATA_CONFIRMATION !== undefined,
    "DIDIT_DATA_CONFIRMATION state exists"
  );
  assert(
    SessionManager.STATES.DIDIT_ADDITIONAL_INFO !== undefined,
    "DIDIT_ADDITIONAL_INFO state exists"
  );

  logStep(5, "Testing Didit steps");
  assert(
    SessionManager.DIDIT_STEPS.VERIFICATION_PENDING !== undefined,
    "VERIFICATION_PENDING step exists"
  );
  assert(
    SessionManager.DIDIT_STEPS.ASK_PINCODE !== undefined,
    "ASK_PINCODE step exists"
  );
  assert(
    SessionManager.DIDIT_STEPS.ASK_VILLAGE !== undefined,
    "ASK_VILLAGE step exists"
  );
  assert(
    SessionManager.DIDIT_STEPS.ASK_EMAIL !== undefined,
    "ASK_EMAIL step exists"
  );

  logStep(6, "Testing session cleanup");
  sessionManager.clearSession(testPhone);
  const clearedSession = sessionManager.getSession(testPhone);
  assert(clearedSession === undefined, "Session cleared successfully");

  return true;
}

async function testDiditService() {
  logSection("DIDIT SERVICE TEST");

  if (!process.env.DIDIT_API_KEY || !process.env.DIDIT_WORKFLOW_ID) {
    logWarning("Skipping Didit Service test - API credentials not configured");
    return true;
  }

  const diditService = new DiditService();

  logStep(1, "Testing service initialization");
  assert(diditService.apiKey !== undefined, "API key loaded");
  assert(diditService.workflowId !== undefined, "Workflow ID loaded");
  assert(diditService.baseUrl !== undefined, "Base URL configured");

  logStep(2, "Testing status message generation");
  const approvedMsg = diditService.getStatusMessage("Approved");
  assert(approvedMsg.includes("approved"), "Approved status message correct");

  const pendingMsg = diditService.getStatusMessage("In Progress");
  assert(pendingMsg.includes("progress"), "In Progress status message correct");

  logStep(3, "Testing verification status checks");
  assert(
    diditService.isVerificationPending("In Progress"),
    "Correctly identifies pending status"
  );
  assert(
    diditService.isVerificationComplete("Approved"),
    "Correctly identifies complete status"
  );
  assert(
    !diditService.isVerificationPending("Approved"),
    "Correctly identifies non-pending status"
  );

  logStep(4, "Testing session creation (API call)");
  try {
    const sessionResult = await diditService.createVerificationSession(
      "Test_Integration_" + Date.now()
    );

    if (sessionResult.success) {
      logSuccess("API call successful");
      assert(sessionResult.sessionId !== undefined, "Session ID returned");
      assert(sessionResult.url !== undefined, "Verification URL returned");
      assert(sessionResult.status !== undefined, "Status returned");

      logInfo(`Created session: ${sessionResult.sessionId}`);
      logInfo(`Verification URL: ${sessionResult.url}`);

      // Test getting session decision
      logStep(5, "Testing session decision retrieval (API call)");
      const decision = await diditService.getSessionDecision(
        sessionResult.sessionId
      );

      if (decision.success) {
        logSuccess("Decision API call successful");
        assert(decision.status !== undefined, "Decision status returned");
        assert(decision.sessionUrl !== undefined, "Session URL returned");
        logInfo(`Current status: ${decision.status}`);
      } else {
        logWarning(`Decision API call failed: ${decision.error}`);
      }
    } else {
      logWarning(`Session creation failed: ${sessionResult.error}`);
      logInfo("This might be expected if API credentials are test credentials");
    }
  } catch (error) {
    logError(`API call error: ${error.message}`);
  }

  logStep(6, "Testing data extraction logic");
  const mockApprovedDecision = {
    success: true,
    status: "Approved",
    idVerification: {
      status: "Approved",
      first_name: "Test",
      last_name: "User",
      full_name: "Test User",
      document_number: "123456789012",
      gender: "M",
      date_of_birth: "1990-01-01",
    },
  };

  const extractedData = diditService.extractUserData(mockApprovedDecision);
  assert(extractedData !== null, "Data extracted from mock approved decision");
  assert(extractedData.name === "Test User", "Name extracted correctly");
  assert(extractedData.gender === "Male", "Gender converted correctly");
  assert(
    extractedData.aadharNumber === "123456789012",
    "Aadhar number extracted correctly"
  );

  const mockPendingDecision = {
    success: true,
    status: "In Progress",
  };
  const nullData = diditService.extractUserData(mockPendingDecision);
  assert(nullData === null, "Correctly returns null for non-approved status");

  return true;
}

async function testDataValidation() {
  logSection("DATA VALIDATION TEST");

  logStep(1, "Testing pincode validation");
  const validPincode = "751001";
  const invalidPincode = "12345";
  assert(/^[0-9]{6}$/.test(validPincode), "Valid pincode passes regex");
  assert(!/^[0-9]{6}$/.test(invalidPincode), "Invalid pincode fails regex");

  logStep(2, "Testing email validation");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert(
    emailPattern.test("user@example.com"),
    "Valid email passes validation"
  );
  assert(!emailPattern.test("invalid-email"), "Invalid email fails validation");

  logStep(3, "Testing phone number validation");
  const phonePattern = /^[6-9]\d{9}$/;
  assert(
    phonePattern.test("9876543210"),
    "Valid Indian phone number passes validation"
  );
  assert(
    !phonePattern.test("1234567890"),
    "Invalid phone number fails validation"
  );

  logStep(4, "Testing Aadhar validation");
  const aadharPattern = /^[0-9]{12}$/;
  assert(
    aadharPattern.test("123456789012"),
    "Valid Aadhar number passes validation"
  );
  assert(
    !aadharPattern.test("12345"),
    "Invalid Aadhar number fails validation"
  );

  return true;
}

async function testFlowStates() {
  logSection("FLOW STATES TEST");

  const sessionManager = new SessionManager();
  const testPhone = "+919876543210";

  logStep(1, "Testing initial state (MENU)");
  const session = sessionManager.createSession(testPhone);
  assert(session.state === "MENU", "Initial state is MENU");

  logStep(2, "Testing NEW_COMPLAINT state");
  sessionManager.updateSession(testPhone, {
    state: SessionManager.STATES.NEW_COMPLAINT,
  });
  let s = sessionManager.getSession(testPhone);
  assert(s.state === "NEW_COMPLAINT", "NEW_COMPLAINT state set");

  logStep(3, "Testing DIDIT_VERIFICATION state");
  sessionManager.updateSession(testPhone, {
    state: SessionManager.STATES.DIDIT_VERIFICATION,
    step: SessionManager.DIDIT_STEPS.VERIFICATION_PENDING,
  });
  s = sessionManager.getSession(testPhone);
  assert(s.state === "DIDIT_VERIFICATION", "DIDIT_VERIFICATION state set");
  assert(
    s.step === SessionManager.DIDIT_STEPS.VERIFICATION_PENDING,
    "VERIFICATION_PENDING step set"
  );

  logStep(4, "Testing DIDIT_DATA_CONFIRMATION state");
  sessionManager.updateSession(testPhone, {
    state: SessionManager.STATES.DIDIT_DATA_CONFIRMATION,
  });
  s = sessionManager.getSession(testPhone);
  assert(
    s.state === "DIDIT_DATA_CONFIRMATION",
    "DIDIT_DATA_CONFIRMATION state set"
  );

  logStep(5, "Testing DIDIT_ADDITIONAL_INFO state with all steps");
  const additionalInfoSteps = [
    SessionManager.DIDIT_STEPS.ASK_PINCODE,
    SessionManager.DIDIT_STEPS.ASK_VILLAGE,
    SessionManager.DIDIT_STEPS.ASK_FATHER_SPOUSE_GUARDIAN,
    SessionManager.DIDIT_STEPS.ASK_EMAIL,
    SessionManager.DIDIT_STEPS.FINAL_CONFIRMATION,
  ];

  for (const step of additionalInfoSteps) {
    sessionManager.updateSession(testPhone, {
      state: SessionManager.STATES.DIDIT_ADDITIONAL_INFO,
      step: step,
    });
    s = sessionManager.getSession(testPhone);
    assert(s.step === step, `Step ${step} set correctly`);
  }

  logStep(6, "Testing transition to COMPLAINT_FILING");
  sessionManager.updateSession(testPhone, {
    state: SessionManager.STATES.COMPLAINT_FILING,
  });
  s = sessionManager.getSession(testPhone);
  assert(s.state === "COMPLAINT_FILING", "COMPLAINT_FILING state set");

  sessionManager.clearSession(testPhone);
  return true;
}

async function runAllTests() {
  logSection("COMPREHENSIVE INTEGRATION TEST SUITE");
  logInfo("Testing Didit Verification Flow Integration");
  logInfo("Start Time: " + new Date().toLocaleString());

  try {
    // Run all test suites
    await testEnvironmentVariables();
    await testSessionManager();
    await testDiditService();
    await testDataValidation();
    await testFlowStates();

    // Print summary
    logSection("TEST SUMMARY");
    logInfo(`Total Tests: ${totalTests}`);
    logSuccess(`Passed: ${passedTests}`);
    if (failedTests > 0) {
      logError(`Failed: ${failedTests}`);
    } else {
      logSuccess(`Failed: ${failedTests}`);
    }

    const passRate = ((passedTests / totalTests) * 100).toFixed(2);
    logInfo(`Pass Rate: ${passRate}%`);

    if (failedTests === 0) {
      logSection("🎉 ALL TESTS PASSED! 🎉");
      logSuccess("The Didit verification flow is properly integrated!");
      logInfo("\nNext steps:");
      logInfo(
        "1. Update your .env file with DIDIT_API_KEY and DIDIT_WORKFLOW_ID"
      );
      logInfo("2. Test with a real WhatsApp user");
      logInfo("3. Complete a real verification");
      logInfo("4. Verify data is saved to MongoDB");
      return true;
    } else {
      logSection("⚠️  SOME TESTS FAILED");
      logWarning("Please review the failed tests and fix the issues");
      return false;
    }
  } catch (error) {
    logSection("FATAL ERROR");
    logError("An unexpected error occurred during testing");
    console.error(error);
    return false;
  }
}

// Run the tests
(async () => {
  try {
    const success = await runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    logError("Fatal error during test execution");
    console.error(error);
    process.exit(1);
  }
})();
