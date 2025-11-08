const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Users = require("./models/Users");
const Cases = require("./models/Cases");
const CaseDetails = require("./models/CaseDetails");

// Phone number to delete
const PHONE_NUMBER = "7205703494";

async function deleteUser() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");

    // Step 1: Find the user by phone number
    console.log(`\nSearching for user with phone number: ${PHONE_NUMBER}`);
    const user = await Users.findOne({ phoneNumber: PHONE_NUMBER });

    if (!user) {
      console.log(`No user found with phone number: ${PHONE_NUMBER}`);
      await mongoose.connection.close();
      return;
    }

    console.log(`Found user: ${user.name} (Aadhar: ${user.aadharNumber})`);
    console.log(`User has ${user.caseIds.length} case(s) associated`);

    // Step 2: Get all case IDs associated with the user
    const caseIds = user.caseIds;

    if (caseIds.length > 0) {
      // Step 3: Find all cases for this user
      console.log("\nFetching associated cases...");
      const cases = await Cases.find({ _id: { $in: caseIds } });
      console.log(`Found ${cases.length} case(s)`);

      // Step 4: Get all caseDetailsIds from the cases
      const caseDetailsIds = cases
        .filter((c) => c.caseDetailsId)
        .map((c) => c.caseDetailsId);

      if (caseDetailsIds.length > 0) {
        // Step 5: Delete all case details
        console.log("\nDeleting case details...");
        const caseDetailsResult = await CaseDetails.deleteMany({
          _id: { $in: caseDetailsIds },
        });
        console.log(`Deleted ${caseDetailsResult.deletedCount} case detail(s)`);
      }

      // Step 6: Delete all cases
      console.log("\nDeleting cases...");
      const casesResult = await Cases.deleteMany({ _id: { $in: caseIds } });
      console.log(`Deleted ${casesResult.deletedCount} case(s)`);
    }

    // Step 7: Delete the user
    console.log("\nDeleting user...");
    await Users.deleteOne({ _id: user._id });
    console.log(`User deleted successfully!`);

    console.log("\n✅ Deletion completed successfully!");
    console.log("Summary:");
    console.log(`- User: ${user.name} (${PHONE_NUMBER})`);
    console.log(`- Aadhar Number: ${user.aadharNumber}`);
    console.log(`- Total cases deleted: ${caseIds.length}`);

    // Close the connection
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed.");
  } catch (error) {
    console.error("Error during deletion:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the deletion
deleteUser();
