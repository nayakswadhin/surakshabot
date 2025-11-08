/**
 * Test script to demonstrate fetching user data from Didit using stored session ID
 * This shows how to retrieve verification data after a user has registered
 */

require("dotenv").config();
const DiditService = require("./services/diditService");
const { Users } = require("./models");
const mongoose = require("mongoose");

console.log("=".repeat(70));
console.log("FETCH USER DATA FROM DIDIT - TEST");
console.log("=".repeat(70));
console.log();

async function testFetchUserData() {
  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected\n");

    // Initialize Didit Service
    const diditService = new DiditService();
    console.log("✅ Didit Service initialized\n");

    // Example 1: Find a user who was verified via Didit
    console.log("=".repeat(70));
    console.log("TEST 1: Find users verified via Didit");
    console.log("=".repeat(70));
    console.log();

    const diditUsers = await Users.find({ verifiedVia: "didit" }).limit(5);

    if (diditUsers.length === 0) {
      console.log("ℹ️  No users found who were verified via Didit");
      console.log("ℹ️  Register a user through WhatsApp bot first\n");
    } else {
      console.log(
        `✅ Found ${diditUsers.length} user(s) verified via Didit:\n`
      );

      for (const user of diditUsers) {
        console.log(`📝 User: ${user.name}`);
        console.log(`   Phone: ${user.phoneNumber}`);
        console.log(`   Aadhar: ${user.aadharNumber}`);
        console.log(`   Didit Session ID: ${user.diditSessionId}`);
        console.log(`   Registered: ${user.createdAt}\n`);
      }
    }

    // Example 2: Fetch verification data using session ID
    if (diditUsers.length > 0) {
      const testUser = diditUsers[0];

      console.log("=".repeat(70));
      console.log("TEST 2: Fetch complete verification data from Didit");
      console.log("=".repeat(70));
      console.log();

      console.log(`📋 Fetching data for: ${testUser.name}`);
      console.log(`🔑 Session ID: ${testUser.diditSessionId}\n`);

      const verificationData = await diditService.fetchUserVerificationData(
        testUser.diditSessionId
      );

      if (verificationData.success) {
        console.log("✅ Verification data retrieved successfully!\n");

        console.log("📊 Verification Details:");
        console.log(`   Status: ${verificationData.status}`);
        console.log(`   Session ID: ${verificationData.sessionId}`);
        console.log(`   Workflow ID: ${verificationData.workflowId}`);
        console.log(
          `   Created At: ${verificationData.createdAt || "Not available"}\n`
        );

        if (verificationData.idVerification) {
          const idVerif = verificationData.idVerification;
          console.log("🪪  ID Verification:");
          console.log(`   Status: ${idVerif.status}`);
          console.log(`   Document Type: ${idVerif.documentType}`);
          console.log(`   Document Number: ${idVerif.documentNumber}`);
          console.log(`   Full Name: ${idVerif.fullName}`);
          console.log(`   Date of Birth: ${idVerif.dateOfBirth}`);
          console.log(`   Gender: ${idVerif.gender}`);
          console.log(`   Nationality: ${idVerif.nationality}`);
          console.log(`   Issuing State: ${idVerif.issuingStateName}`);
          console.log(`   Address: ${idVerif.address || "N/A"}`);
          console.log(
            `   Warnings: ${
              idVerif.warnings.length > 0 ? idVerif.warnings.length : "None"
            }\n`
          );
        }

        if (verificationData.phone) {
          console.log("📱 Phone Verification:");
          console.log(`   Status: ${verificationData.phone.status}`);
          console.log(`   Number: ${verificationData.phone.fullNumber}`);
          console.log(
            `   Verified At: ${verificationData.phone.verifiedAt || "N/A"}\n`
          );
        }

        if (verificationData.email) {
          console.log("📧 Email Verification:");
          console.log(`   Status: ${verificationData.email.status}`);
          console.log(`   Email: ${verificationData.email.email}`);
          console.log(
            `   Verified At: ${verificationData.email.verifiedAt || "N/A"}\n`
          );
        }

        if (verificationData.liveness) {
          console.log("🤳 Liveness Check:");
          console.log(`   Status: ${verificationData.liveness.status}`);
          console.log(`   Score: ${verificationData.liveness.score}`);
          console.log(`   Method: ${verificationData.liveness.method}\n`);
        }

        if (verificationData.faceMatch) {
          console.log("👤 Face Match:");
          console.log(`   Status: ${verificationData.faceMatch.status}`);
          console.log(`   Score: ${verificationData.faceMatch.score}\n`);
        }
      } else {
        console.log(`❌ Failed to fetch verification data:`);
        console.log(`   Error: ${verificationData.error}\n`);
      }

      // Example 3: Get simplified user info
      console.log("=".repeat(70));
      console.log("TEST 3: Get simplified user info");
      console.log("=".repeat(70));
      console.log();

      const userInfo = await diditService.getUserInfoFromSession(
        testUser.diditSessionId
      );

      if (userInfo.success) {
        console.log("✅ User info retrieved:\n");
        console.log(`   Name: ${userInfo.name}`);
        console.log(`   Document Number: ${userInfo.documentNumber}`);
        console.log(`   Document Type: ${userInfo.documentType}`);
        console.log(`   Date of Birth: ${userInfo.dateOfBirth}`);
        console.log(`   Gender: ${userInfo.gender}`);
        console.log(`   Nationality: ${userInfo.nationality}`);
        console.log(`   Address: ${userInfo.address || "N/A"}`);
        console.log(`   Verification Status: ${userInfo.verificationStatus}`);
        console.log(`   Verified At: ${userInfo.verifiedAt || "N/A"}\n`);
      } else {
        console.log(`❌ Failed to get user info: ${userInfo.error}\n`);
      }
    }

    // Summary
    console.log("=".repeat(70));
    console.log("USAGE EXAMPLE");
    console.log("=".repeat(70));
    console.log();
    console.log("To fetch user verification data in your code:\n");
    console.log("```javascript");
    console.log("const diditService = new DiditService();");
    console.log(
      "const user = await Users.findOne({ phoneNumber: '9876543210' });"
    );
    console.log();
    console.log("if (user.diditSessionId) {");
    console.log("  // Get complete verification data");
    console.log("  const data = await diditService.fetchUserVerificationData(");
    console.log("    user.diditSessionId");
    console.log("  );");
    console.log();
    console.log("  // Or get simplified user info");
    console.log("  const info = await diditService.getUserInfoFromSession(");
    console.log("    user.diditSessionId");
    console.log("  );");
    console.log("}");
    console.log("```\n");

    console.log("=".repeat(70));
    console.log("✅ TEST COMPLETE");
    console.log("=".repeat(70));
  } catch (error) {
    console.error("\n❌ Error during test:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n📡 MongoDB connection closed");
  }
}

// Run the test
testFetchUserData();
