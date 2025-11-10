/**
 * Test script to verify RAG API connectivity and response
 */

const axios = require("axios");

const QUERY_API_URL =
  process.env.QUERY_API_URL || "http://127.0.0.1:8000/query";

async function testRagApi() {
  console.log("=".repeat(60));
  console.log("RAG API TEST");
  console.log("=".repeat(60));
  console.log(`\nTesting API at: ${QUERY_API_URL}\n`);

  try {
    // Test 1: Health check (try to connect)
    console.log("1️⃣ Testing API connectivity...");
    const startTime = Date.now();

    const response = await axios.post(
      QUERY_API_URL,
      {
        query: "How to report cyber crime?",
        top_k: 5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("✅ API is responding!");
    console.log(`   Response time: ${duration}ms`);
    console.log(`   Status: ${response.status}`);
    console.log(`\n2️⃣ Response structure:`);
    console.log(`   - Has 'query': ${!!response.data.query}`);
    console.log(`   - Has 'answer': ${!!response.data.answer}`);
    console.log(`   - Has 'sources': ${!!response.data.sources}`);
    console.log(
      `   - Number of sources: ${response.data.sources?.length || 0}`
    );

    console.log(`\n3️⃣ Sample answer (first 200 chars):`);
    const answer = response.data.answer || "No answer";
    console.log(`   "${answer.substring(0, 200)}..."`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ RAG API TEST PASSED!");
    console.log("=".repeat(60));
    console.log("\n✨ Your query service is ready to use!\n");
  } catch (error) {
    console.log("❌ API test failed!");
    console.log("\nError details:");

    if (error.code === "ECONNREFUSED") {
      console.log(`   ❌ Connection refused`);
      console.log(`   💡 The RAG API server is not running`);
      console.log(`\n   To fix this:`);
      console.log(`   1. Make sure you have Python installed`);
      console.log(`   2. Navigate to your RAG API directory`);
      console.log(
        `   3. Install dependencies: pip install -r requirements.txt`
      );
      console.log(`   4. Start the server: python app.py`);
      console.log(`   5. The server should run on http://localhost:8000\n`);
    } else if (error.code === "ETIMEDOUT") {
      console.log(`   ❌ Request timeout`);
      console.log(`   💡 The API is taking too long to respond`);
      console.log(`   Check if the server is processing requests properly\n`);
    } else if (error.response) {
      console.log(`   ❌ API returned error ${error.response.status}`);
      console.log(
        `   Message: ${error.response.data?.detail || "Unknown error"}`
      );
    } else {
      console.log(`   ❌ ${error.message}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("❌ RAG API TEST FAILED");
    console.log("=".repeat(60));
    console.log("\n⚠️  Please start the RAG API server before using queries\n");

    process.exit(1);
  }
}

// Run the test
testRagApi();
