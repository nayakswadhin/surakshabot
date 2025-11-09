const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const { Cases, CaseDetails } = require("./models");

async function checkLatestComplaint() {
  try {
    console.log("🔍 Checking latest complaint...\n");
    await mongoose.connect(process.env.MONGODB_URI);

    // Find the case with the ID from your screenshot: CC1762654560509884
    const caseId = "CC1762654560509884";

    const complaint = await Cases.findOne({ caseId })
      .populate("caseDetailsId")
      .lean();

    if (!complaint) {
      console.log(`❌ Case ${caseId} not found!`);
      console.log("\nSearching for most recent case instead...\n");

      const recentCase = await Cases.findOne()
        .sort({ createdAt: -1 })
        .populate("caseDetailsId")
        .lean();

      if (!recentCase) {
        console.log("No cases found in database");
        return;
      }

      console.log(`Found most recent case: ${recentCase.caseId}\n`);
      printCaseDetails(recentCase);
    } else {
      console.log(`✅ Found case: ${caseId}\n`);
      printCaseDetails(complaint);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

function printCaseDetails(complaint) {
  console.log("=".repeat(60));
  console.log("CASE DETAILS");
  console.log("=".repeat(60));
  console.log(`Case ID: ${complaint.caseId}`);
  console.log(`Fraud Type: ${complaint.typeOfFraud}`);
  console.log(`Category: ${complaint.caseCategory}`);
  console.log(`Status: ${complaint.status}`);
  console.log(
    `Incident: ${complaint.incidentDescription?.substring(0, 100)}...`
  );
  console.log(`Created: ${complaint.createdAt}`);
  console.log("");

  if (complaint.caseDetailsId) {
    const photos = complaint.caseDetailsId.photos || [];
    console.log("=".repeat(60));
    console.log(`DOCUMENTS (${photos.length} total)`);
    console.log("=".repeat(60));

    if (photos.length === 0) {
      console.log("❌ No documents found!");
      console.log("\nPossible reasons:");
      console.log("1. Documents were not uploaded during the complaint flow");
      console.log("2. Document upload failed but complaint was still saved");
      console.log("3. Documents are in session but not saved to DB");
    } else {
      photos.forEach((photo, index) => {
        console.log(`\n📄 Document ${index + 1}:`);
        console.log("-".repeat(60));
        console.log(`Document Type: ${photo.documentType || "N/A"}`);
        console.log(`File Name: ${photo.fileName || "N/A"}`);
        console.log(`Uploaded At: ${photo.uploadedAt || "N/A"}`);
        console.log(`Public ID: ${photo.publicId || "N/A"}`);
        console.log(`URL: ${photo.url || "❌ MISSING"}`);

        if (photo.url) {
          // Test URL format
          if (photo.url.startsWith("https://res.cloudinary.com/")) {
            console.log(`Status: ✅ Valid Cloudinary URL`);
            console.log(`\nTest this URL in your browser:`);
            console.log(photo.url);
          } else if (photo.url.startsWith("http")) {
            console.log(`Status: ⚠️  URL exists but not from Cloudinary`);
          } else {
            console.log(`Status: ❌ Invalid URL format`);
          }
        } else {
          console.log(`Status: ❌ URL is MISSING`);
          console.log(
            `\n⚠️  This is the problem! Document uploaded but URL not saved.`
          );
        }
      });
    }
  } else {
    console.log("=".repeat(60));
    console.log("❌ NO CASE DETAILS FOUND!");
    console.log("=".repeat(60));
    console.log("\nThis means:");
    console.log("- CaseDetails document was not created");
    console.log("- Check completeComplaint function in whatsappService.js");
    console.log("- Look for errors in backend logs during complaint creation");
  }

  console.log("\n" + "=".repeat(60));
  console.log("RAW DATA (for debugging)");
  console.log("=".repeat(60));
  console.log(JSON.stringify(complaint, null, 2));
}

checkLatestComplaint();
