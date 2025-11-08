/**
 * Test script for Other Queries feature
 * Tests the RAG API integration
 */

const axios = require("axios");

const QUERY_API_URL =
  process.env.QUERY_API_URL || "http://127.0.0.1:8000/query";

// Test queries
const testQueries = [
  "How do I report a phishing attempt?",
  "What is cybercrime?",
  "How to file a complaint online?",
  "What documents are needed for reporting?",
  "How can I check complaint status?",
];

async function testQueryAPI(query) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing Query: "${query}"`);
  console.log("=".repeat(60));

  try {
    const startTime = Date.now();

    const response = await axios.post(
      QUERY_API_URL,
      {
        query: query,
        top_k: 5,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ SUCCESS (${duration}ms)`);
    console.log(`\nQuery: ${response.data.query}`);
    console.log(`\nAnswer Preview (first 200 chars):`);
    console.log(response.data.answer.substring(0, 200) + "...");

    if (response.data.sources && response.data.sources.length > 0) {
      console.log(`\nSources: ${response.data.sources.length} documents`);
      console.log("Top source:", response.data.sources[0].filename);
    }

    return { success: true, duration };
  } catch (error) {
    console.log("❌ FAILED");

    if (error.response) {
      console.log(`API Error: ${error.response.status}`);
      console.log("Error details:", error.response.data);
    } else if (error.request) {
      console.log("Connection Error: No response from API");
      console.log("Make sure the API server is running at:", QUERY_API_URL);
    } else {
      console.log("Request Error:", error.message);
    }

    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log("\n🧪 Testing Other Queries Feature - RAG API Integration");
  console.log("API URL:", QUERY_API_URL);
  console.log("\n");

  const results = [];

  for (const query of testQueries) {
    const result = await testQueryAPI(query);
    results.push({ query, ...result });

    // Wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  console.log("\n\n" + "=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60));

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);

  if (successCount > 0) {
    const avgDuration =
      results.filter((r) => r.success).reduce((sum, r) => sum + r.duration, 0) /
      successCount;
    console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  }

  // Detailed results
  console.log("\n📊 Detailed Results:");
  results.forEach((result, index) => {
    const status = result.success ? "✅" : "❌";
    const time = result.success ? `(${result.duration}ms)` : "";
    console.log(`${index + 1}. ${status} "${result.query}" ${time}`);
  });

  if (failCount === 0) {
    console.log(
      "\n🎉 All tests passed! The Other Queries feature is working correctly."
    );
  } else {
    console.log("\n⚠️  Some tests failed. Please check:");
    console.log("   1. Is the RAG API server running?");
    console.log("   2. Is the API URL correct in .env?");
    console.log("   3. Check API server logs for errors");
  }

  console.log("\n");
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
