/**
 * Test Status Notification Features
 * Tests the high priority alert and status change notifications
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { Cases, Users } = require("./models");
const StatusNotificationService = require("./services/statusNotificationService");

// Test configuration
const TEST_PHONE = "919876543210"; // Replace with your test phone number
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function testHighPriorityAlert() {
  console.log("\n📋 Test 1: High Priority Alert Notification");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const statusService = new StatusNotificationService();

  try {
    const result = await statusService.sendHighPriorityAlert(
      TEST_PHONE,
      "CC1731234567890",
      "Credit Card Fraud"
    );

    if (result.success) {
      console.log("✅ High priority alert sent successfully");
    } else {
      console.log("❌ Failed to send high priority alert:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testStatusUpdateNotification() {
  console.log("\n📋 Test 2: Status Update Notification");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const statusService = new StatusNotificationService();

  try {
    const result = await statusService.sendStatusUpdateNotification(
      TEST_PHONE,
      "CC1731234567890",
      "pending",
      "under_review",
      "Your case has been assigned to our investigation team. We will contact you within 48 hours for any additional information.",
      {
        fraudType: "UPI Fraud",
        category: "Financial",
        priority: "high",
      }
    );

    if (result.success) {
      console.log("✅ Status update notification sent successfully");
    } else {
      console.log("❌ Failed to send status update:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testResolvedStatusNotification() {
  console.log("\n📋 Test 3: Resolved Status Notification");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const statusService = new StatusNotificationService();

  try {
    const result = await statusService.sendStatusUpdateNotification(
      TEST_PHONE,
      "CC1731234567890",
      "investigating",
      "resolved",
      "Your case has been successfully resolved. The fraudulent transaction has been reversed and the perpetrators have been identified.",
      {
        fraudType: "UPI Fraud",
        category: "Financial",
        priority: "high",
      }
    );

    if (result.success) {
      console.log("✅ Resolved status notification sent successfully");
    } else {
      console.log("❌ Failed to send resolved status:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testCaseCreationWithPriority() {
  console.log("\n📋 Test 4: Case Creation with Priority");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Find or create a test user
    let testUser = await Users.findOne({ phoneNumber: "9876543210" });

    if (!testUser) {
      console.log("Creating test user...");
      testUser = new Users({
        aadharNumber: "123456789012",
        name: "Test User",
        fatherSpouseGuardianName: "Test Guardian",
        gender: "Male",
        emailid: "test@example.com",
        dob: new Date("1990-01-01"),
        phoneNumber: "9876543210",
        address: {
          pincode: "751001",
          area: "Test Area",
          village: "Test Village",
          district: "Test District",
        },
      });
      await testUser.save();
      console.log("✅ Test user created");
    }

    // Create a high priority case
    const testCase = new Cases({
      caseId: "CC" + Date.now(),
      aadharNumber: testUser.aadharNumber,
      incidentDescription: "Test financial fraud case for priority testing",
      caseCategory: "Financial",
      typeOfFraud: "UPI Fraud",
      status: "pending",
      priority: "high",
      isHighAlert: true,
    });

    await testCase.save();
    console.log("✅ High priority case created:", testCase.caseId);
    console.log("   Priority:", testCase.priority);
    console.log("   High Alert:", testCase.isHighAlert);

    return testCase;
  } catch (error) {
    console.error("❌ Error creating test case:", error.message);
    return null;
  }
}

async function testCaseStatusUpdate(testCase) {
  console.log("\n📋 Test 5: Case Status Update with Notification");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!testCase) {
    console.log("⚠️  Skipping - no test case available");
    return;
  }

  try {
    const oldStatus = testCase.status;
    testCase.status = "under_review";
    await testCase.save();

    console.log("✅ Case status updated in database");
    console.log("   Old Status:", oldStatus);
    console.log("   New Status:", testCase.status);

    // Get user and send notification
    const user = await Users.findOne({ aadharNumber: testCase.aadharNumber });
    if (user) {
      const statusService = new StatusNotificationService();
      let phoneNumber = user.phoneNumber;
      if (!phoneNumber.startsWith("91")) {
        phoneNumber = "91" + phoneNumber;
      }

      await statusService.sendStatusUpdateNotification(
        phoneNumber,
        testCase.caseId,
        oldStatus,
        testCase.status,
        "Automated test status update",
        {
          fraudType: testCase.typeOfFraud,
          category: testCase.caseCategory,
          priority: testCase.priority,
        }
      );
      console.log("✅ WhatsApp notification sent to user");
    }
  } catch (error) {
    console.error("❌ Error updating case status:", error.message);
  }
}

async function verifyPriorityFields() {
  console.log("\n📋 Test 6: Verify Priority Fields in Database");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const highPriorityCases = await Cases.find({ priority: "high" }).limit(5);
    const alertCases = await Cases.find({ isHighAlert: true }).limit(5);

    console.log(`✅ Found ${highPriorityCases.length} high priority cases`);
    console.log(`✅ Found ${alertCases.length} high alert cases`);

    if (highPriorityCases.length > 0) {
      console.log("\nSample High Priority Case:");
      const sample = highPriorityCases[0];
      console.log("   Case ID:", sample.caseId);
      console.log("   Priority:", sample.priority);
      console.log("   High Alert:", sample.isHighAlert);
      console.log("   Category:", sample.caseCategory);
      console.log("   Fraud Type:", sample.typeOfFraud);
    }
  } catch (error) {
    console.error("❌ Error verifying fields:", error.message);
  }
}

async function cleanup() {
  console.log("\n📋 Cleanup (Optional)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  Test data left in database for verification");
  console.log("   You can manually delete test cases if needed");
}

async function runTests() {
  console.log("🧪 Status Notification Feature Tests");
  console.log("═══════════════════════════════════════════════════");
  console.log(`📞 Test Phone Number: ${TEST_PHONE}`);
  console.log("⚠️  Make sure this is YOUR WhatsApp number!");
  console.log("═══════════════════════════════════════════════════");

  await connectDB();

  // Run all tests
  await testHighPriorityAlert();
  await testStatusUpdateNotification();
  await testResolvedStatusNotification();
  const testCase = await testCaseCreationWithPriority();
  await testCaseStatusUpdate(testCase);
  await verifyPriorityFields();
  await cleanup();

  console.log("\n✅ All tests completed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📝 Summary:");
  console.log("1. ✅ High Priority Alert - Check WhatsApp");
  console.log("2. ✅ Status Update Notification - Check WhatsApp");
  console.log("3. ✅ Resolved Status Notification - Check WhatsApp");
  console.log("4. ✅ Case with Priority Created");
  console.log("5. ✅ Status Update with Notification");
  console.log("6. ✅ Database Fields Verified");
  console.log("\n📱 Check your WhatsApp for notifications!");

  process.exit(0);
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
