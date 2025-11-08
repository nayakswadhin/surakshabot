/**
 * Test script to verify phone number lookup in MongoDB
 * This tests the fix for "Didit session ID not found" error
 */

const mongoose = require("mongoose");
require("dotenv").config();

async function testPhoneNumberLookup() {
  try {
    console.log("=".repeat(60));
    console.log("Testing Phone Number Lookup for Didit Session ID");
    console.log("=".repeat(60));

    // Connect to MongoDB
    console.log("\n📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Users = require("./models/Users");

    // Test different phone number formats
    const testFormats = [
      "917205703494", // With country code (WhatsApp format)
      "7205703494", // Without country code (10 digits)
    ];

    console.log("\n🔍 Testing phone number lookup with different formats:\n");

    for (const phoneFormat of testFormats) {
      console.log(`\nTesting format: ${phoneFormat}`);
      console.log("-".repeat(40));

      // Remove country code if present
      let phoneNumber = phoneFormat;
      if (phoneFormat.startsWith("91") && phoneFormat.length > 10) {
        phoneNumber = phoneFormat.substring(2);
        console.log(`  Cleaned number: ${phoneNumber}`);
      }

      // Try to find user
      let user = await Users.findOne({ phoneNumber: phoneNumber });

      if (!user && phoneFormat !== phoneNumber) {
        console.log(
          `  Not found with ${phoneNumber}, trying original: ${phoneFormat}`
        );
        user = await Users.findOne({ phoneNumber: phoneFormat });
      }

      if (user) {
        console.log("  ✅ User found!");
        console.log(`     Name: ${user.name}`);
        console.log(`     Phone: ${user.phoneNumber}`);
        console.log(`     Aadhaar: ${user.aadharNumber}`);
        console.log(
          `     Didit Session ID: ${user.diditSessionId || "NOT SET"}`
        );

        if (user.diditSessionId) {
          console.log("  ✅ Didit Session ID exists - Auto-fetch will work!");
        } else {
          console.log(
            "  ❌ Didit Session ID missing - User needs to complete verification"
          );
        }
      } else {
        console.log("  ❌ User not found");
      }
    }

    // List all users with Didit Session IDs
    console.log("\n\n📋 Users with Didit Session ID:");
    console.log("=".repeat(60));

    const usersWithDidit = await Users.find({ diditSessionId: { $ne: null } });

    if (usersWithDidit.length === 0) {
      console.log("No users found with Didit Session ID");
    } else {
      usersWithDidit.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Phone: ${user.phoneNumber}`);
        console.log(`   Didit Session: ${user.diditSessionId}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test Complete!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error during test:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n📡 Disconnected from MongoDB");
  }
}

// Run the test
testPhoneNumberLookup();
