/**
 * Test script for Aadhaar auto-fetch from Didit feature
 * This tests the new functionality that automatically fetches Aadhaar images
 * from Didit session when collecting documents for financial fraud complaints
 */

const DiditService = require("./services/diditService");
const SessionManager = require("./services/sessionManager");

async function testAadhaarAutoFetch() {
  console.log("=".repeat(60));
  console.log("Testing Aadhaar Auto-Fetch from Didit Feature");
  console.log("=".repeat(60));

  const diditService = new DiditService();

  // Test session ID (replace with a real approved session ID for testing)
  const testSessionId = "d0a9cc8c-f3ba-4856-8586-76e6dfcf185a";

  console.log("\n1️⃣ Testing getAadhaarImages method...\n");

  try {
    const result = await diditService.getAadhaarImages(testSessionId);

    if (result.success) {
      console.log("✅ Aadhaar images fetched successfully!");
      console.log("\nExtracted Data:");
      console.log("  - Full Name:", result.fullName);
      console.log("  - Document Number:", result.documentNumber);
      console.log("  - Document Type:", result.documentType);
      console.log("  - Date of Birth:", result.dateOfBirth);
      console.log("  - Address:", result.address);
      console.log("\nImage URLs:");
      console.log(
        "  - Front Image:",
        result.frontImage ? "Available ✓" : "Missing ✗"
      );
      console.log(
        "  - Back Image:",
        result.backImage ? "Available ✓" : "Missing ✗"
      );
      console.log(
        "  - Portrait Image:",
        result.portraitImage ? "Available ✓" : "Missing ✗"
      );
      console.log(
        "  - Full Front Image:",
        result.fullFrontImage ? "Available ✓" : "Missing ✗"
      );
      console.log(
        "  - Full Back Image:",
        result.fullBackImage ? "Available ✓" : "Missing ✗"
      );
    } else {
      console.log("❌ Failed to fetch Aadhaar images");
      console.log("Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Error during test:", error.message);
  }

  console.log("\n2️⃣ Testing document requirements mapping...\n");

  // Test different fraud types
  const fraudTypes = [
    "upi_fraud",
    "investment_fraud",
    "credit_card_fraud",
    "debit_card_fraud",
    "ecommerce_fraud",
  ];

  fraudTypes.forEach((fraudType) => {
    const requiredDocs =
      SessionManager.getRequiredDocumentsForFraudType(fraudType);
    console.log(`\n${fraudType}:`);
    console.log(`  Required documents: ${requiredDocs.length}`);
    console.log(`  Documents: ${requiredDocs.join(", ")}`);
    console.log(
      `  Includes AADHAR_PAN: ${
        requiredDocs.includes("AADHAR_PAN") ? "✓" : "✗"
      }`
    );
  });

  console.log("\n3️⃣ Feature Integration Summary...\n");

  console.log("✅ Features implemented:");
  console.log(
    "  1. DiditService.getAadhaarImages() - Fetches Aadhaar from Didit session"
  );
  console.log(
    "  2. WhatsAppService.autoFetchAadhaarFromDidit() - Auto-fetch during document collection"
  );
  console.log(
    "  3. WhatsAppService.requestNextDocument() - Detects AADHAR_PAN step and auto-fetches"
  );
  console.log(
    "  4. Button handlers for manual upload fallback (upload_manually, retry_fetch)"
  );
  console.log(
    "  5. SessionManager.getRequiredDocumentsForFraudType() - Dynamic document requirements"
  );

  console.log("\n✅ Workflow:");
  console.log(
    "  1. User completes Didit verification → diditSessionId stored in DB"
  );
  console.log("  2. User starts complaint → Classifier identifies fraud type");
  console.log(
    "  3. Document collection starts → Gets fraud-type-specific documents"
  );
  console.log("  4. When AADHAR_PAN step is reached → Auto-fetch from Didit");
  console.log("  5. System retrieves session_id from session/DB");
  console.log("  6. Calls Didit API → Gets front_image and back_image URLs");
  console.log("  7. Stores in session documents → Moves to next document");
  console.log("  8. If error → Offers manual upload or retry options");

  console.log("\n" + "=".repeat(60));
  console.log("Test Complete!");
  console.log("=".repeat(60));
}

// Run the test
testAadhaarAutoFetch().catch(console.error);
