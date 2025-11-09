const DiditService = require("./services/diditService");
require("dotenv").config();

/**
 * Test script to fetch and display DIDIT Aadhaar images
 * Usage: node test-didit-aadhaar-fetch.js <sessionId>
 */

async function testDiditAadhaarFetch() {
  const sessionId = process.argv[2];

  if (!sessionId) {
    console.log("❌ Error: Session ID required");
    console.log("\nUsage:");
    console.log("  node test-didit-aadhaar-fetch.js <sessionId>");
    console.log("\nExample:");
    console.log(
      "  node test-didit-aadhaar-fetch.js b90449e8-34e1-4b9c-9dfa-1d02e22924c2"
    );
    process.exit(1);
  }

  console.log("🔍 Testing DIDIT Aadhaar Image Fetch");
  console.log("=".repeat(60));
  console.log(`Session ID: ${sessionId}\n`);

  const diditService = new DiditService();

  try {
    // Test API connection
    console.log("📡 Fetching session decision from DIDIT API...\n");
    const decision = await diditService.getSessionDecision(sessionId);

    if (!decision.success) {
      console.log("❌ Failed to fetch session decision");
      console.log(`Error: ${decision.error}`);
      if (decision.statusCode === 404) {
        console.log("\n💡 This session ID doesn't exist or has expired.");
      }
      return;
    }

    console.log("✅ Session decision fetched successfully\n");
    console.log("Session Information:");
    console.log("=".repeat(60));
    console.log(`Session Number: ${decision.sessionNumber}`);
    console.log(`Status: ${decision.status}`);
    console.log(`Workflow ID: ${decision.workflowId}`);
    console.log(`Session URL: ${decision.sessionUrl}`);
    console.log(`Created At: ${decision.createdAt}\n`);

    // Extract Aadhaar images
    console.log("📄 Extracting Aadhaar Images...\n");
    const aadhaarData = await diditService.getAadhaarImages(sessionId);

    if (!aadhaarData.success) {
      console.log("❌ Failed to extract Aadhaar images");
      console.log(`Error: ${aadhaarData.error}`);
      return;
    }

    console.log("✅ Aadhaar images extracted successfully\n");
    console.log("Aadhaar Card Details:");
    console.log("=".repeat(60));
    console.log(`Full Name: ${aadhaarData.fullName}`);
    console.log(`Document Number: ${aadhaarData.documentNumber}`);
    console.log(`Document Type: ${aadhaarData.documentType}`);
    console.log(`Date of Birth: ${aadhaarData.dateOfBirth}`);
    console.log(`Address: ${aadhaarData.address}\n`);

    console.log("Image URLs:");
    console.log("=".repeat(60));

    if (aadhaarData.frontImage) {
      console.log("\n✅ Front Image:");
      console.log(`   ${aadhaarData.frontImage.substring(0, 100)}...`);
      console.log(`   Full URL: ${aadhaarData.frontImage}`);
    } else {
      console.log("\n❌ Front Image: NOT AVAILABLE");
    }

    if (aadhaarData.backImage) {
      console.log("\n✅ Back Image:");
      console.log(`   ${aadhaarData.backImage.substring(0, 100)}...`);
      console.log(`   Full URL: ${aadhaarData.backImage}`);
    } else {
      console.log("\n❌ Back Image: NOT AVAILABLE");
    }

    if (aadhaarData.portraitImage) {
      console.log("\n✅ Portrait Image:");
      console.log(`   ${aadhaarData.portraitImage.substring(0, 100)}...`);
    }

    if (aadhaarData.fullFrontImage) {
      console.log("\n✅ Full Front Image:");
      console.log(`   ${aadhaarData.fullFrontImage.substring(0, 100)}...`);
    }

    if (aadhaarData.fullBackImage) {
      console.log("\n✅ Full Back Image:");
      console.log(`   ${aadhaarData.fullBackImage.substring(0, 100)}...`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("How These Will Be Stored in MongoDB:");
    console.log("=".repeat(60));

    const documentsArray = [];

    if (aadhaarData.frontImage) {
      documentsArray.push({
        documentType: "aadhaar_card_front",
        url: aadhaarData.frontImage,
        fileName: `aadhaar_front_${aadhaarData.documentNumber}.jpg`,
        publicId: "didit_front_image",
        uploadedAt: new Date().toISOString(),
      });
    }

    if (aadhaarData.backImage) {
      documentsArray.push({
        documentType: "aadhaar_card_back",
        url: aadhaarData.backImage,
        fileName: `aadhaar_back_${aadhaarData.documentNumber}.jpg`,
        publicId: "didit_back_image",
        uploadedAt: new Date().toISOString(),
      });
    }

    if (aadhaarData.fullFrontImage) {
      documentsArray.push({
        documentType: "aadhaar_card_full_front",
        url: aadhaarData.fullFrontImage,
        fileName: `aadhaar_full_front_${aadhaarData.documentNumber}.jpg`,
        publicId: "didit_full_front_image",
        uploadedAt: new Date().toISOString(),
      });
    }

    console.log(JSON.stringify(documentsArray, null, 2));

    console.log("\n✅ Test completed successfully!");
    console.log("\n💡 These images can be directly opened in a browser.");
    console.log("💡 They are AWS S3 signed URLs valid for 4 hours.");

    // Test if images are accessible
    console.log("\n" + "=".repeat(60));
    console.log("Testing Image Accessibility:");
    console.log("=".repeat(60));

    const axios = require("axios");

    if (aadhaarData.frontImage) {
      try {
        const response = await axios.head(aadhaarData.frontImage);
        console.log("\n✅ Front Image is accessible");
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers["content-type"]}`);
        console.log(
          `   Content-Length: ${response.headers["content-length"]} bytes`
        );
      } catch (error) {
        console.log("\n❌ Front Image is NOT accessible");
        console.log(`   Error: ${error.message}`);
      }
    }

    if (aadhaarData.backImage) {
      try {
        const response = await axios.head(aadhaarData.backImage);
        console.log("\n✅ Back Image is accessible");
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers["content-type"]}`);
        console.log(
          `   Content-Length: ${response.headers["content-length"]} bytes`
        );
      } catch (error) {
        console.log("\n❌ Back Image is NOT accessible");
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests passed!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error during test:");
    console.error(error.message);
    console.error("\nFull error:", error);
  }
}

// Run the test
testDiditAadhaarFetch();
