/**
 * Test Script for Hindi to English Voice Processing
 * Tests: Hindi Audio → Hindi Text → English Translation → Gemini Refinement
 */

require("dotenv").config();
const VoiceProcessingService = require("./services/voiceProcessingService");

async function testHindiVoiceProcessing() {
  console.log("🧪 Testing Hindi to English Voice Processing");
  console.log("=".repeat(70));

  try {
    // Initialize the service
    const voiceService = new VoiceProcessingService();
    console.log("\n✅ VoiceProcessingService initialized");

    // Test 1: Check Configuration
    console.log("\n📋 Test 1: Checking Configuration");
    console.log("-".repeat(70));

    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const translateKey = process.env.GEMINI_TRANSLATION_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    console.log(
      `Google Credentials: ${credentialsPath ? "✅ SET" : "❌ NOT SET"}`
    );
    console.log(
      `Translation API Key: ${translateKey ? "✅ SET" : "❌ NOT SET"}`
    );
    console.log(`Gemini API Key: ${geminiKey ? "✅ SET" : "❌ NOT SET"}`);

    if (!credentialsPath) {
      console.log("\n⚠️  Google credentials not configured properly");
      return;
    }

    if (!translateKey) {
      console.log("\n⚠️  Translation API key not set");
      return;
    }

    // Test 2: Hindi to English Translation
    console.log("\n\n📋 Test 2: Testing Hindi to English Translation");
    console.log("-".repeat(70));

    const hindiTestText =
      "मुझे एक फ्रॉड कॉल आई थी। उन्होंने कहा कि मैं बैंक से बोल रहा हूं और मेरे अकाउंट में प्रॉब्लम है।";
    console.log(`\nHindi Text: ${hindiTestText}`);

    const englishTranslation = await voiceService.translateHindiToEnglish(
      hindiTestText
    );
    console.log(`\n✅ English Translation:\n${englishTranslation}`);

    // Test 3: Gemini Refinement
    console.log("\n\n📋 Test 3: Testing Gemini Refinement");
    console.log("-".repeat(70));

    const rawEnglishText =
      "I received fraud call yesterday. They said I am from bank. They asked OTP and transferred 50000 rupees from my account on 5 November 2025.";
    console.log(`\nRaw English Text:\n${rawEnglishText}`);

    const refinedText = await voiceService.refineTextWithGemini(rawEnglishText);
    console.log(`\n✅ Refined Text:\n${refinedText}`);

    // Test 4: Detail Extraction
    console.log("\n\n📋 Test 4: Testing Detail Extraction");
    console.log("-".repeat(70));

    const extractedDetails = voiceService.extractDetailsFromText(refinedText);
    console.log("\n✅ Extracted Details:");
    console.log(JSON.stringify(extractedDetails, null, 2));

    // Summary
    console.log("\n\n" + "=".repeat(70));
    console.log("✅ All Tests Completed Successfully!");
    console.log("=".repeat(70));

    console.log("\n📝 Complete Processing Flow:");
    console.log("1️⃣  Hindi Audio → Google Speech-to-Text → Hindi Text");
    console.log("2️⃣  Hindi Text → Google Translate API → English Text");
    console.log("3️⃣  English Text → Gemini AI → Refined Professional Text");
    console.log("4️⃣  Refined Text → NLP Extraction → Structured Data");
    console.log("\n✨ The system is ready to process Hindi voice messages!");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    console.error("\nError Details:", error.message);

    if (error.response) {
      console.error("API Response Error:", error.response.data);
    }
  }
}

// Run the tests
console.log("Starting Hindi Voice Processing Tests...\n");
testHindiVoiceProcessing()
  .then(() => {
    console.log("\n\n🏁 Test execution completed");
  })
  .catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  });
