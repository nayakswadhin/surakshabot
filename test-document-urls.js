const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const { Cases, CaseDetails, Users } = require("./models");

async function checkDocumentURLs() {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find the most recent case
    const recentCase = await Cases.findOne()
      .sort({ createdAt: -1 })
      .populate("caseDetailsId")
      .lean();

    if (!recentCase) {
      console.log("❌ No cases found in database");
      return;
    }

    console.log("📋 Most Recent Case:");
    console.log("==================");
    console.log(`Case ID: ${recentCase.caseId}`);
    console.log(`Fraud Type: ${recentCase.typeOfFraud}`);
    console.log(`Status: ${recentCase.status}`);
    console.log(`Category: ${recentCase.caseCategory}`);
    console.log(`Aadhar: ${recentCase.aadharNumber}`);
    console.log(`Created: ${recentCase.createdAt}\n`);

    // Check case details and photos
    if (recentCase.caseDetailsId) {
      console.log("📸 Document/Photo Details:");
      console.log("==========================");

      const photos = recentCase.caseDetailsId.photos || [];

      if (photos.length === 0) {
        console.log("⚠️  No photos/documents found!");
      } else {
        console.log(`Total Documents: ${photos.length}\n`);

        photos.forEach((photo, index) => {
          console.log(`Document ${index + 1}:`);
          console.log(`  Type: ${photo.documentType || "N/A"}`);
          console.log(`  URL: ${photo.url || "❌ MISSING URL"}`);
          console.log(`  File Name: ${photo.fileName || "N/A"}`);
          console.log(`  Public ID: ${photo.publicId || "N/A"}`);
          console.log(`  Uploaded: ${photo.uploadedAt || "N/A"}`);

          // Check URL validity
          if (photo.url) {
            if (photo.url.startsWith("https://res.cloudinary.com/")) {
              console.log(`  ✅ Valid Cloudinary URL`);
            } else {
              console.log(`  ⚠️  URL doesn't look like Cloudinary`);
            }
          } else {
            console.log(`  ❌ URL is missing!`);
          }
          console.log("");
        });
      }
    } else {
      console.log("❌ No case details found for this case!");
    }

    // Get user info
    const user = await Users.findOne({
      aadharNumber: recentCase.aadharNumber,
    }).lean();
    if (user) {
      console.log("\n👤 User Information:");
      console.log("====================");
      console.log(`Name: ${user.name}`);
      console.log(`Phone: ${user.phoneNumber}`);
      console.log(`State: ${user.state}`);
      console.log(`Email: ${user.email || "N/A"}`);
      console.log(`Total Cases: ${user.caseIds?.length || 0}`);
    }

    // Additional checks
    console.log("\n\n🔧 Diagnostic Information:");
    console.log("===========================");

    // Count total cases
    const totalCases = await Cases.countDocuments();
    console.log(`Total Cases in Database: ${totalCases}`);

    // Count cases with documents
    const casesWithDocs = await CaseDetails.countDocuments({
      photos: { $exists: true, $ne: [] },
    });
    console.log(`Cases with Documents: ${casesWithDocs}`);

    // Count total documents
    const allCaseDetails = await CaseDetails.find({}).lean();
    const totalDocs = allCaseDetails.reduce(
      (sum, cd) => sum + (cd.photos?.length || 0),
      0
    );
    console.log(`Total Documents Uploaded: ${totalDocs}`);

    // Check for missing URLs
    const docsWithoutURL = allCaseDetails.reduce((count, cd) => {
      const missing = (cd.photos || []).filter((p) => !p.url).length;
      return count + missing;
    }, 0);

    if (docsWithoutURL > 0) {
      console.log(`⚠️  Documents with Missing URLs: ${docsWithoutURL}`);
    } else {
      console.log(`✅ All documents have URLs`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
}

// Run the check
checkDocumentURLs();
