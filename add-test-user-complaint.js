require("dotenv").config();
const mongoose = require("mongoose");
const { Users, Cases } = require("./models");

const MONGODB_URI = process.env.MONGODB_URI;

async function addTestUserAndComplaint() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test user data with pincode 769008
    const testUser = {
      aadharNumber: "123456789012", // 12 digit Aadhar
      name: "Test User Sundargarh",
      fatherSpouseGuardianName: "Guardian Name",
      gender: "Male",
      emailid: "testuser769008@example.com",
      dob: new Date("1990-01-01"),
      phoneNumber: "9876543210", // Valid Indian mobile number
      freeze: false,
      address: {
        pincode: "769008", // Sundargarh, Odisha
        area: "Main Road",
        village: "Sundargarh Town",
        district: "Sundargarh",
        postOffice: "Sundargarh",
        policeStation: "Sundargarh PS",
      },
      verifiedVia: "manual",
    };

    // Check if user already exists
    let user = await Users.findOne({ aadharNumber: testUser.aadharNumber });
    
    if (user) {
      console.log("ℹ️  User already exists:", user.name);
    } else {
      user = new Users(testUser);
      await user.save();
      console.log("✅ Created new user:", user.name);
    }

    // Generate a unique case ID
    const caseId = `CC${Date.now()}`;

    // Create a test complaint
    const testComplaint = {
      caseId: caseId,
      aadharNumber: testUser.aadharNumber,
      incidentDescription: "Test fraud case from Sundargarh district with pincode 769008. This is a sample case for heatmap visualization testing.",
      caseCategory: "Financial",
      typeOfFraud: "UPI Fraud (UPI/IMPS/INB/NEFT/RTGS)",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if case already exists
    const existingCase = await Cases.findOne({ caseId: testComplaint.caseId });
    
    if (existingCase) {
      console.log("ℹ️  Case already exists:", existingCase.caseId);
    } else {
      const newCase = new Cases(testComplaint);
      await newCase.save();
      console.log("✅ Created new case:", newCase.caseId);
    }

    // Verify the data
    console.log("\n📊 Verification:");
    console.log("User Details:");
    console.log("  - Name:", user.name);
    console.log("  - Aadhar:", user.aadharNumber);
    console.log("  - District:", user.address.district);
    console.log("  - Pincode:", user.address.pincode);
    
    const userCases = await Cases.find({ aadharNumber: user.aadharNumber });
    console.log("\nUser Cases:");
    console.log("  - Total Cases:", userCases.length);
    userCases.forEach(c => {
      console.log(`  - ${c.caseId}: ${c.typeOfFraud} [${c.status}]`);
    });

    // Test the heatmap data for this pincode
    console.log("\n🗺️  Testing Heatmap Coordinates:");
    const geocodingService = require("./services/geocodingService");
    const coords = await geocodingService.getCoordinatesFromPincode(user.address.pincode);
    console.log("  - Pincode:", user.address.pincode);
    console.log("  - Coordinates:", coords);
    
    if (coords && coords.lat && coords.lng) {
      console.log("  ✅ Coordinates available - will appear on heatmap!");
    } else {
      console.log("  ⚠️  No coordinates found - using district fallback");
      const districtCoords = geocodingService.getDistrictCoordinates(user.address.district);
      console.log("  - District Coordinates:", districtCoords);
    }

    console.log("\n✅ Test user and complaint added successfully!");
    console.log("\n📍 Location: Sundargarh, Odisha (Pincode: 769008)");
    console.log("🗺️  This case will now appear on the heatmap!");
    console.log("\n💡 Refresh the dashboard to see the updated heatmap");

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the script
addTestUserAndComplaint();
