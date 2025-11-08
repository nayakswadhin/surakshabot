/**
 * Test file to verify Gemini AI integration
 * Run: node test-gemini.js
 */

require("dotenv").config();
const geminiService = require("./services/geminiService");

async function testGemini() {
  console.log("🧪 Testing Gemini AI Integration...\n");

  try {
    // Test 1: Simple prompt
    console.log("📝 Test 1: Simple Content Generation");
    console.log("Prompt: Tell me about cybercrime in India in one sentence.");
    const response1 = await geminiService.generateContent(
      "Tell me about cybercrime in India in one sentence."
    );
    console.log("Response:", response1);
    console.log("\n✅ Test 1 Passed!\n");

    // Test 2: Fraud prevention tips
    console.log("📝 Test 2: Generate Prevention Tips");
    const response2 = await geminiService.generatePreventionTips(
      "E-Wallet Fraud"
    );
    console.log("Response:", response2);
    console.log("\n✅ Test 2 Passed!\n");

    // Test 3: Answer a question
    console.log("📝 Test 3: Answer Question");
    const response3 = await geminiService.answerQuestion(
      "What is phishing and how can I protect myself?"
    );
    console.log("Response:", response3);
    console.log("\n✅ Test 3 Passed!\n");

    // Test 4: Analyze mock complaint data
    console.log("📝 Test 4: Analyze Complaint Data");
    const mockData = {
      totalComplaints: 110,
      financialComplaints: 85,
      socialComplaints: 25,
      pendingCases: 68,
      solvedCases: 42,
      topFraudTypes: [
        { type: "E-Wallet Fraud", count: 20 },
        { type: "Credit Card Fraud", count: 15 },
        { type: "WhatsApp Fraud", count: 12 },
      ],
      topDistricts: [
        { name: "Hyderabad", count: 25 },
        { name: "Kolkata", count: 18 },
        { name: "Chennai", count: 15 },
      ],
    };
    const response4 = await geminiService.analyzeComplaintData(mockData);
    console.log("Response:", response4);
    console.log("\n✅ Test 4 Passed!\n");

    console.log("🎉 All Gemini AI tests passed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
testGemini();
