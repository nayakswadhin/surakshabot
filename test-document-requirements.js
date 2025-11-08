/**
 * Comprehensive Test Script for Financial Fraud Document Requirements
 * Tests the mapping between fraud type IDs and required documents
 */

const SessionManager = require("./services/sessionManager");

// Expected document mappings (from user requirements)
const EXPECTED_MAPPINGS = {
  1: {
    name: "Investment/Trading/IPO Fraud",
    docs: [
      "aadhar_pan",
      "bank_front_page",
      "bank_statement",
      "beneficiary_details",
    ],
    readable: ["a", "c", "d", "h"],
  },
  2: {
    name: "Customer Care Fraud",
    docs: [
      "aadhar_pan",
      "bank_front_page",
      "bank_statement",
      "upi_screenshots",
    ],
    readable: ["a", "c", "d/e", "f/h"],
  },
  3: {
    name: "UPI Fraud",
    docs: [
      "aadhar_pan",
      "bank_front_page",
      "upi_screenshots",
      "beneficiary_details",
    ],
    readable: ["a", "c", "f", "h"],
  },
  4: {
    name: "APK Fraud",
    docs: [
      "aadhar_pan",
      "bank_front_page",
      "bank_statement",
      "upi_screenshots",
    ],
    readable: ["a", "c", "d/e", "f"],
  },
  5: {
    name: "Fake Franchisee/Dealership Fraud",
    docs: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    readable: ["a", "d/e", "h"],
  },
  6: {
    name: "Online Job Fraud",
    docs: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    readable: ["a", "d/e", "h"],
  },
  7: {
    name: "Debit Card Fraud",
    docs: [
      "aadhar_pan",
      "debit_credit_card",
      "bank_front_page",
      "bank_statement",
    ],
    readable: ["a", "b", "c", "d/e"],
  },
  8: {
    name: "Credit Card Fraud",
    docs: ["aadhar_pan", "debit_credit_card", "credit_card_statement"],
    readable: ["a", "b", "g"],
  },
  9: {
    name: "E-Commerce Fraud",
    docs: ["aadhar_pan", "bank_statement"],
    readable: ["a", "d/e"],
  },
  10: {
    name: "Loan App Fraud",
    docs: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    readable: ["a", "d/e", "h"],
  },
  11: {
    name: "Sextortion Fraud",
    docs: ["aadhar_pan"],
    readable: ["a"],
  },
  12: {
    name: "OLX Fraud",
    docs: [
      "aadhar_pan",
      "bank_statement",
      "upi_screenshots",
      "beneficiary_details",
    ],
    readable: ["a", "d/e", "f", "h"],
  },
  13: {
    name: "Lottery Fraud",
    docs: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    readable: ["a", "d/e", "h"],
  },
  14: {
    name: "Hotel Booking Fraud",
    docs: ["aadhar_pan", "bank_statement"],
    readable: ["a", "d/e"],
  },
  15: {
    name: "Gaming App Fraud",
    docs: ["aadhar_pan", "bank_statement", "upi_screenshots"],
    readable: ["a", "d/e", "f"],
  },
  16: {
    name: "AEPS Fraud",
    docs: ["aadhar_pan", "bank_front_page", "bank_statement"],
    readable: ["a", "c", "d/e"],
  },
  17: {
    name: "Tower Installation Fraud",
    docs: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    readable: ["a", "d/e", "h"],
  },
  18: {
    name: "E-Wallet Fraud",
    docs: ["aadhar_pan", "upi_screenshots", "beneficiary_details"],
    readable: ["a", "f", "h"],
  },
  19: {
    name: "Digital Arrest Fraud",
    docs: ["aadhar_pan", "bank_statement", "upi_screenshots"],
    readable: ["a", "d/e", "f"],
  },
  20: {
    name: "Fake Website Scam Fraud",
    docs: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    readable: ["a", "d/e", "h"],
  },
  21: {
    name: "Ticket Booking Fraud",
    docs: ["aadhar_pan", "bank_statement"],
    readable: ["a", "d/e"],
  },
  22: {
    name: "Insurance Maturity Fraud",
    docs: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    readable: ["a", "d/e", "h"],
  },
  23: {
    name: "Others",
    docs: ["aadhar_pan", "bank_statement"],
    readable: ["a", "d/e"],
  },
};

// Document type legend
const DOCUMENT_LEGEND = {
  a: "Aadhaar Card / PAN Card (Identity proof)",
  b: "Debit Card / Credit Card photo (Front side only, hide CVV)",
  c: "Bank account front page (showing name and account number)",
  d: "Bank statement highlighting the fraudulent transaction",
  e: "Screenshot of debit messages showing transaction reference",
  f: "UPI transaction screenshot showing UTR number",
  g: "Credit card statement or screenshot of spent message",
  h: "Beneficiary account details",
};

function testDocumentRequirements() {
  console.log("=".repeat(80));
  console.log("FINANCIAL FRAUD DOCUMENT REQUIREMENTS TEST");
  console.log("=".repeat(80));

  let passed = 0;
  let failed = 0;
  const failures = [];

  console.log("\n🔍 Testing all fraud type IDs...\n");

  for (let id = 1; id <= 23; id++) {
    const expected = EXPECTED_MAPPINGS[id];
    const actual = SessionManager.getRequiredDocumentsForFraudType(id);

    console.log(`\n${"─".repeat(80)}`);
    console.log(`Test ${id}: ${expected.name}`);
    console.log(`${"─".repeat(80)}`);

    console.log(
      `Expected: ${expected.docs.join(", ")} (${expected.docs.length} docs)`
    );
    console.log(`Actual:   ${actual.join(", ")} (${actual.length} docs)`);
    console.log(`Readable: ${expected.readable.join(", ")}`);

    // Check if arrays match
    const isMatch =
      expected.docs.length === actual.length &&
      expected.docs.every((doc) => actual.includes(doc));

    if (isMatch) {
      console.log(`✅ PASS - Documents match correctly`);
      passed++;
    } else {
      console.log(`❌ FAIL - Documents DO NOT match`);
      console.log(
        `   Missing: ${
          expected.docs.filter((d) => !actual.includes(d)).join(", ") || "None"
        }`
      );
      console.log(
        `   Extra:   ${
          actual.filter((d) => !expected.docs.includes(d)).join(", ") || "None"
        }`
      );
      failed++;
      failures.push({ id, name: expected.name });
    }
  }

  // Test with string keys (backward compatibility)
  console.log(`\n\n${"=".repeat(80)}`);
  console.log("TESTING STRING KEY COMPATIBILITY");
  console.log(`${"=".repeat(80)}\n`);

  const stringKeyTests = [
    "investment_fraud",
    "upi_fraud",
    "credit_card_fraud",
    "debit_card_fraud",
  ];

  stringKeyTests.forEach((key) => {
    const result = SessionManager.getRequiredDocumentsForFraudType(key);
    console.log(`${key}: ${result.join(", ")} (${result.length} docs) ✅`);
  });

  // Summary
  console.log(`\n\n${"=".repeat(80)}`);
  console.log("TEST SUMMARY");
  console.log(`${"=".repeat(80)}`);
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log(`\n❌ Failed Test Cases:`);
    failures.forEach((f) => console.log(`   - ${f.id}. ${f.name}`));
  } else {
    console.log(`\n🎉 ALL TESTS PASSED!`);
  }

  // Document Legend
  console.log(`\n\n${"=".repeat(80)}`);
  console.log("DOCUMENT TYPE LEGEND");
  console.log(`${"=".repeat(80)}`);
  Object.entries(DOCUMENT_LEGEND).forEach(([key, desc]) => {
    console.log(`${key}. ${desc}`);
  });

  console.log(`\n${"=".repeat(80)}\n`);

  return { passed, failed, failures };
}

// Run the test
const results = testDocumentRequirements();

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
