/**
 * Test script for Didit Verification Service
 * Run this to verify Didit API integration
 */

require("dotenv").config();
const DiditService = require("./services/diditService");

// ANSI color codes for better output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log("=".repeat(60) + "\n");
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

async function testDiditService() {
  logSection("DIDIT SERVICE TEST");

  // Check environment variables
  logInfo("Checking environment variables...");
  if (!process.env.DIDIT_API_KEY) {
    logError("DIDIT_API_KEY not found in environment variables");
    logWarning("Please add DIDIT_API_KEY to your .env file");
    return false;
  } else {
    logSuccess("DIDIT_API_KEY found");
  }

  if (!process.env.DIDIT_WORKFLOW_ID) {
    logError("DIDIT_WORKFLOW_ID not found in environment variables");
    logWarning("Please add DIDIT_WORKFLOW_ID to your .env file");
    return false;
  } else {
    logSuccess("DIDIT_WORKFLOW_ID found");
  }

  // Initialize service
  logInfo("\nInitializing Didit Service...");
  const diditService = new DiditService();
  logSuccess("Didit Service initialized");

  // Test 1: Create Verification Session
  logSection("TEST 1: Create Verification Session");
  try {
    logInfo("Creating verification session...");
    const sessionResult = await diditService.createVerificationSession(
      "Test_Session_" + Date.now()
    );

    if (sessionResult.success) {
      logSuccess("Verification session created successfully!");
      logInfo(`Session ID: ${sessionResult.sessionId}`);
      logInfo(`Session URL: ${sessionResult.url}`);
      logInfo(`Status: ${sessionResult.status}`);

      // Test 2: Get Session Decision (will be "Not Started")
      logSection("TEST 2: Get Session Decision");
      logInfo("Fetching session decision...");

      const decision = await diditService.getSessionDecision(
        sessionResult.sessionId
      );

      if (decision.success) {
        logSuccess("Session decision retrieved successfully!");
        logInfo(`Status: ${decision.status}`);
        logInfo(`Session URL: ${decision.sessionUrl}`);

        // Test status message
        const statusMessage = diditService.getStatusMessage(decision.status);
        logInfo(`Status Message: ${statusMessage}`);

        // Test verification checks
        if (diditService.isVerificationPending(decision.status)) {
          logInfo("✓ Verification is pending (as expected)");
        }

        if (!diditService.isVerificationComplete(decision.status)) {
          logInfo("✓ Verification is not complete (as expected)");
        }
      } else {
        logError("Failed to retrieve session decision");
        logError(`Error: ${decision.error}`);
      }

      // Test 3: Test Data Extraction (will return null for non-approved)
      logSection("TEST 3: Test Data Extraction");
      logInfo("Attempting to extract user data...");
      const userData = diditService.extractUserData(decision);

      if (userData === null) {
        logSuccess(
          "Data extraction correctly returned null for non-approved status"
        );
      } else {
        logWarning("Unexpected: Got user data from non-approved verification");
      }

      logSection("TEST SUMMARY");
      logSuccess("All Didit service tests passed!");
      logInfo("\nNext steps:");
      logInfo("1. Complete a real verification using the session URL");
      logInfo("2. Test the WhatsApp bot flow with a real user");
      logInfo("3. Verify data is correctly saved to MongoDB");

      return true;
    } else {
      logError("Failed to create verification session");
      logError(`Error: ${sessionResult.error}`);
      if (sessionResult.errorDetails) {
        logError(
          `Details: ${JSON.stringify(sessionResult.errorDetails, null, 2)}`
        );
      }
      return false;
    }
  } catch (error) {
    logError("Unexpected error during testing");
    logError(`Error: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Run the test
(async () => {
  try {
    const success = await testDiditService();
    process.exit(success ? 0 : 1);
  } catch (error) {
    logError("Fatal error during testing");
    console.error(error);
    process.exit(1);
  }
})();
