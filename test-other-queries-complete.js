/**
 * Comprehensive Test Cases for Other Queries Feature
 * Tests API integration, response formatting, and error handling
 */

const axios = require("axios");
const queryService = require("./services/queryService");

const QUERY_API_URL =
  process.env.QUERY_API_URL || "http://127.0.0.1:8000/query";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  bold: "\x1b[1m",
};

// Test data
const testCases = [
  {
    name: "Valid Query - Phishing Report",
    query: "How do I report a phishing attempt?",
    shouldSucceed: true,
    expectedContent: ["phishing", "report", "cybercrime"],
  },
  {
    name: "Valid Query - Cybercrime Definition",
    query: "What is cybercrime?",
    shouldSucceed: true,
    expectedContent: ["cyber", "crime"],
  },
  {
    name: "Valid Query - Filing Complaint",
    query: "How to file a complaint online?",
    shouldSucceed: true,
    expectedContent: ["complaint", "file", "online"],
  },
  {
    name: "Valid Query - Required Documents",
    query: "What documents are needed for reporting?",
    shouldSucceed: true,
    expectedContent: ["document", "report"],
  },
  {
    name: "Valid Query - Status Check",
    query: "How can I check complaint status?",
    shouldSucceed: true,
    expectedContent: ["status", "complaint"],
  },
  {
    name: "Short Query - Minimum Length",
    query: "UPI",
    shouldSucceed: true,
    expectedContent: [],
  },
  {
    name: "Invalid Query - Too Short",
    query: "Hi",
    shouldSucceed: false,
    expectedError: "Invalid query",
  },
  {
    name: "Invalid Query - Empty",
    query: "",
    shouldSucceed: false,
    expectedError: "Invalid query",
  },
];

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

/**
 * Test 1: API Connectivity
 */
async function testAPIConnectivity() {
  console.log(
    `\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bold}TEST 1: API Connectivity${colors.reset}`);
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  try {
    const response = await axios.get(QUERY_API_URL.replace("/query", "/"));
    console.log(`${colors.green}✓${colors.reset} API is reachable`);
    return true;
  } catch (error) {
    console.log(
      `${colors.red}✗${colors.reset} API is not reachable at ${QUERY_API_URL}`
    );
    console.log(
      `${colors.yellow}  Make sure the RAG API server is running${colors.reset}`
    );
    return false;
  }
}

/**
 * Test 2: Query Validation
 */
function testQueryValidation() {
  console.log(
    `\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bold}TEST 2: Query Validation${colors.reset}`);
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  const validationTests = [
    { query: "How to report?", expected: true, description: "Valid query" },
    { query: "Hi", expected: false, description: "Too short (< 3 chars)" },
    { query: "", expected: false, description: "Empty query" },
    { query: null, expected: false, description: "Null query" },
    {
      query: "a".repeat(500),
      expected: true,
      description: "Max length (500 chars)",
    },
    {
      query: "a".repeat(501),
      expected: false,
      description: "Too long (> 500 chars)",
    },
  ];

  let passed = 0;
  validationTests.forEach((test) => {
    const result = queryService.validateQuery(test.query);
    if (result === test.expected) {
      console.log(`${colors.green}✓${colors.reset} ${test.description}`);
      passed++;
    } else {
      console.log(
        `${colors.red}✗${colors.reset} ${test.description} - Expected: ${test.expected}, Got: ${result}`
      );
    }
  });

  console.log(
    `\n${colors.bold}Result:${colors.reset} ${passed}/${validationTests.length} validation tests passed`
  );
  return passed === validationTests.length;
}

/**
 * Test 3: API Response Formatting
 */
async function testResponseFormatting() {
  console.log(
    `\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bold}TEST 3: Response Formatting${colors.reset}`);
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  // Sample API response
  const mockResponse = {
    query: "How do I report a phishing attempt?",
    answer:
      "📋 **National Cybercrime Reporting Portal**\n\n**1. Brief Overview**\nThis guidance explains how to report phishing attempts.\n\n**2. Detailed Steps/Tips**\n\n*   Visit [National Cybercrime Portal](https://cybercrime.gov.in)\n*   File a complaint\n\n**📚 Sources Used:**\n_Click section links below_\n\n**📖 Citizen Manual** — [View](https://cybercrime.gov.in/Webform/Citizen_Manual.aspx)\n  • MHA-CitizenManualReportOtherCyberCrime-v10.pdf (Page 18.0) — 37%\n\n**🔗 Explore:**\n[Citizen Manual](https://cybercrime.gov.in/Webform/Citizen_Manual.aspx)",
    sources: [],
  };

  const formatted = queryService.formatResponse(mockResponse);

  // Check formatting requirements
  const checks = [
    {
      name: "Remove asterisks",
      test: !formatted.includes("**") && !formatted.includes("*"),
      detail: "Bold markdown removed",
    },
    {
      name: "Remove sources section",
      test: !formatted.includes("📚 Sources Used:"),
      detail: "Sources section removed",
    },
    {
      name: "Remove page numbers",
      test: !formatted.includes("(Page 18.0)") && !formatted.includes("— 37%"),
      detail: "Page numbers and percentages removed",
    },
    {
      name: "Remove PDF filenames",
      test: !formatted.includes(".pdf"),
      detail: "PDF references removed",
    },
    {
      name: "Contains links section",
      test: formatted.includes("📎 For More Details:"),
      detail: "Links section added",
    },
    {
      name: "Contains friendly header",
      test: formatted.includes("✅ Here's What I Found:"),
      detail: "Friendly header present",
    },
  ];

  let passed = 0;
  checks.forEach((check) => {
    if (check.test) {
      console.log(
        `${colors.green}✓${colors.reset} ${check.name} - ${check.detail}`
      );
      passed++;
    } else {
      console.log(
        `${colors.red}✗${colors.reset} ${check.name} - ${check.detail}`
      );
    }
  });

  console.log(`\n${colors.bold}Formatted Output Preview:${colors.reset}`);
  console.log(`${colors.yellow}${"─".repeat(55)}${colors.reset}`);
  console.log(formatted.substring(0, 300) + "...");
  console.log(`${colors.yellow}${"─".repeat(55)}${colors.reset}`);

  console.log(
    `\n${colors.bold}Result:${colors.reset} ${passed}/${checks.length} formatting checks passed`
  );
  return passed === checks.length;
}

/**
 * Test 4: End-to-End Query Processing
 */
async function testE2EQueries() {
  console.log(
    `\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bold}TEST 4: End-to-End Query Processing${colors.reset}`
  );
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  for (const testCase of testCases) {
    console.log(`\n${colors.bold}Testing:${colors.reset} ${testCase.name}`);
    console.log(`${colors.bold}Query:${colors.reset} "${testCase.query}"`);

    const startTime = Date.now();
    const result = await queryService.processQuery(testCase.query);
    const duration = Date.now() - startTime;

    if (testCase.shouldSucceed) {
      if (result.success) {
        console.log(
          `${colors.green}✓${colors.reset} Query processed successfully (${duration}ms)`
        );

        const formatted = queryService.formatResponse(result.data);

        // Check expected content
        const hasExpectedContent =
          testCase.expectedContent.length === 0 ||
          testCase.expectedContent.some((word) =>
            formatted.toLowerCase().includes(word.toLowerCase())
          );

        if (hasExpectedContent) {
          console.log(
            `${colors.green}✓${colors.reset} Response contains expected content`
          );
          results.passed++;
        } else {
          console.log(
            `${colors.red}✗${colors.reset} Response missing expected content`
          );
          results.failed++;
        }

        // Show response preview
        console.log(`${colors.bold}Response Preview:${colors.reset}`);
        console.log(formatted.substring(0, 200) + "...");
      } else {
        console.log(
          `${colors.red}✗${colors.reset} Query failed: ${result.error}`
        );
        results.failed++;
      }
    } else {
      // Should fail
      if (!result.success) {
        console.log(`${colors.green}✓${colors.reset} Query correctly rejected`);
        results.passed++;
      } else {
        console.log(
          `${colors.red}✗${colors.reset} Query should have been rejected`
        );
        results.failed++;
      }
    }

    results.total++;
  }
}

/**
 * Test 5: Error Handling
 */
async function testErrorHandling() {
  console.log(
    `\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bold}TEST 5: Error Handling${colors.reset}`);
  console.log(
    `${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`
  );

  const errorMessage = queryService.getErrorMessage();

  const checks = [
    {
      name: "Contains error indicator",
      test: errorMessage.includes("❌"),
      detail: "Error emoji present",
    },
    {
      name: "Contains helpline number",
      test: errorMessage.includes("1930"),
      detail: "Helpline 1930 mentioned",
    },
    {
      name: "Contains website link",
      test: errorMessage.includes("https://cybercrime.gov.in"),
      detail: "Official website link present",
    },
    {
      name: "No asterisks",
      test: !errorMessage.includes("*"),
      detail: "Clean formatting without asterisks",
    },
  ];

  let passed = 0;
  checks.forEach((check) => {
    if (check.test) {
      console.log(
        `${colors.green}✓${colors.reset} ${check.name} - ${check.detail}`
      );
      passed++;
    } else {
      console.log(
        `${colors.red}✗${colors.reset} ${check.name} - ${check.detail}`
      );
    }
  });

  console.log(`\n${colors.bold}Error Message:${colors.reset}`);
  console.log(`${colors.yellow}${"─".repeat(55)}${colors.reset}`);
  console.log(errorMessage);
  console.log(`${colors.yellow}${"─".repeat(55)}${colors.reset}`);

  console.log(
    `\n${colors.bold}Result:${colors.reset} ${passed}/${checks.length} error handling checks passed`
  );
  return passed === checks.length;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`\n${colors.bold}${colors.blue}${"═".repeat(55)}${colors.reset}`);
  console.log(
    `${colors.bold}  OTHER QUERIES FEATURE - COMPREHENSIVE TEST SUITE${colors.reset}`
  );
  console.log(`${colors.bold}${colors.blue}${"═".repeat(55)}${colors.reset}\n`);
  console.log(`${colors.bold}API URL:${colors.reset} ${QUERY_API_URL}`);
  console.log(
    `${colors.bold}Date:${colors.reset} ${new Date().toLocaleString()}\n`
  );

  const testResults = {
    connectivity: false,
    validation: false,
    formatting: false,
    e2e: false,
    errorHandling: false,
  };

  // Run tests sequentially
  testResults.connectivity = await testAPIConnectivity();

  if (testResults.connectivity) {
    testResults.validation = testQueryValidation();
    testResults.formatting = await testResponseFormatting();
    await testE2EQueries();
    testResults.errorHandling = await testErrorHandling();
  } else {
    console.log(
      `\n${colors.red}${colors.bold}⚠ Skipping remaining tests - API not available${colors.reset}`
    );
  }

  // Final Summary
  console.log(`\n${colors.bold}${colors.blue}${"═".repeat(55)}${colors.reset}`);
  console.log(`${colors.bold}  FINAL TEST SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${"═".repeat(55)}${colors.reset}\n`);

  const allPassed = Object.values(testResults).every((r) => r === true);

  console.log(`${colors.bold}Test Categories:${colors.reset}`);
  console.log(
    `  API Connectivity:     ${
      testResults.connectivity ? colors.green + "✓ PASS" : colors.red + "✗ FAIL"
    }${colors.reset}`
  );
  console.log(
    `  Query Validation:     ${
      testResults.validation ? colors.green + "✓ PASS" : colors.red + "✗ FAIL"
    }${colors.reset}`
  );
  console.log(
    `  Response Formatting:  ${
      testResults.formatting ? colors.green + "✓ PASS" : colors.red + "✗ FAIL"
    }${colors.reset}`
  );
  console.log(
    `  Error Handling:       ${
      testResults.errorHandling
        ? colors.green + "✓ PASS"
        : colors.red + "✗ FAIL"
    }${colors.reset}`
  );

  console.log(`\n${colors.bold}E2E Query Tests:${colors.reset}`);
  console.log(`  Total Tests:  ${results.total}`);
  console.log(
    `  Passed:       ${colors.green}${results.passed}${colors.reset}`
  );
  console.log(
    `  Failed:       ${results.failed > 0 ? colors.red : colors.green}${
      results.failed
    }${colors.reset}`
  );

  if (allPassed && results.failed === 0) {
    console.log(
      `\n${colors.green}${colors.bold}🎉 ALL TESTS PASSED! Feature is ready for production.${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.red}${colors.bold}⚠ SOME TESTS FAILED. Please review the issues above.${colors.reset}`
    );
  }

  console.log(
    `\n${colors.bold}${colors.blue}${"═".repeat(55)}${colors.reset}\n`
  );

  process.exit(allPassed && results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  console.error(
    `${colors.red}${colors.bold}Fatal error running tests:${colors.reset}`,
    error
  );
  process.exit(1);
});
