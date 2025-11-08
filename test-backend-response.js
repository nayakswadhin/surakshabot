/**
 * Test script to check what the backend is actually returning
 */

const queryService = require("./services/queryService");

async function testBackendResponse() {
  console.log("=".repeat(60));
  console.log("TESTING BACKEND RESPONSE");
  console.log("=".repeat(60));

  const testQuery = "How do I report phishing?";
  console.log(`\nQuery: "${testQuery}"\n`);

  try {
    // 1. Call the API
    console.log("1. Calling API...");
    const result = await queryService.processQuery(testQuery);

    console.log("\n2. Raw API Response:");
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      // 2. Check what's in the data
      console.log("\n3. API Data Structure:");
      console.log("- Has answer:", !!result.data.answer);
      console.log("- Answer length:", result.data.answer?.length || 0);
      console.log("- Has sources:", !!result.data.sources);
      console.log("- Number of sources:", result.data.sources?.length || 0);

      // 3. Show raw answer
      console.log("\n4. Raw Answer (first 500 chars):");
      console.log("─".repeat(60));
      console.log(result.data.answer?.substring(0, 500));
      console.log("...");
      console.log("─".repeat(60));

      // 4. Format the response
      console.log("\n5. Formatting response...");
      const formattedAnswer = queryService.formatResponse(result.data);

      console.log("\n6. Formatted Answer:");
      console.log("─".repeat(60));
      console.log(formattedAnswer);
      console.log("─".repeat(60));

      // 5. Check message length
      console.log("\n7. Message Stats:");
      console.log("- Formatted length:", formattedAnswer.length);
      console.log(
        "- WhatsApp limit:",
        formattedAnswer.length <= 4096 ? "✓ OK" : "✗ TOO LONG"
      );

      // 6. Check for special characters that might break WhatsApp
      console.log("\n8. Special Characters Check:");
      console.log(
        "- Has asterisks:",
        formattedAnswer.includes("*") ? "✗" : "✓"
      );
      console.log(
        "- Has markdown bold:",
        formattedAnswer.includes("**") ? "✗" : "✓"
      );
      console.log(
        "- Has emojis:",
        /[\u{1F000}-\u{1F9FF}]/u.test(formattedAnswer) ? "✓" : "✗"
      );
    } else {
      console.log("\n❌ API call failed!");
      console.log("Error:", result.error);
      console.log("Message:", result.message);
    }
  } catch (error) {
    console.error("\n❌ Exception occurred:");
    console.error(error.message);
    console.error(error.stack);
  }

  console.log("\n" + "=".repeat(60));
}

// Run the test
testBackendResponse()
  .then(() => {
    console.log("\n✓ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Test failed:", error);
    process.exit(1);
  });
