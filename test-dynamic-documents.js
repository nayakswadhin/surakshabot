/**
 * Test script for Dynamic Document Collection Feature
 *
 * This script verifies that the document requirements mapping works correctly
 * for all fraud types.
 */

const SessionManager = require("./services/sessionManager");

console.log("=".repeat(80));
console.log("TESTING DYNAMIC DOCUMENT COLLECTION FEATURE");
console.log("=".repeat(80));
console.log();

// Test fraud types
const testFraudTypes = [
  "investment_fraud",
  "customer_care_fraud",
  "upi_fraud",
  "apk_fraud",
  "franchisee_fraud",
  "job_fraud",
  "debit_card_fraud",
  "credit_card_fraud",
  "ecommerce_fraud",
  "loan_app_fraud",
  "sextortion_fraud",
  "olx_fraud",
  "lottery_fraud",
  "hotel_booking_fraud",
  "gaming_app_fraud",
  "aeps_fraud",
  "tower_installation_fraud",
  "ewallet_fraud",
  "digital_arrest_fraud",
  "fake_website_fraud",
  "ticket_booking_fraud",
  "insurance_fraud",
  "other_financial_fraud",
  "unknown_fraud_type", // Test fallback
];

console.log("Testing Document Requirements for All Fraud Types:\n");
console.log("-".repeat(80));

let allPassed = true;

testFraudTypes.forEach((fraudType) => {
  const requiredDocs =
    SessionManager.getRequiredDocumentsForFraudType(fraudType);
  const docCount = requiredDocs.length;

  // Validate requirements exist
  const isValid = requiredDocs && requiredDocs.length > 0;
  const status = isValid ? "✅" : "❌";

  if (!isValid) allPassed = false;

  console.log(`${status} ${fraudType.padEnd(30)} => ${docCount} documents`);
  console.log(`   Documents: ${requiredDocs.join(", ")}`);
  console.log();
});

console.log("-".repeat(80));
console.log();

// Test document display names
console.log("Testing Document Display Names:\n");
console.log("-".repeat(80));

const documentTypes = [
  "aadhar_pan",
  "debit_credit_card",
  "bank_front_page",
  "bank_statement",
  "debit_messages",
  "upi_screenshots",
  "credit_card_statement",
  "beneficiary_details",
];

documentTypes.forEach((docType) => {
  const displayName = SessionManager.getDocumentDisplayName(docType);
  const isValid =
    displayName && displayName.length > 0 && displayName !== docType;
  const status = isValid ? "✅" : "❌";

  if (!isValid) allPassed = false;

  console.log(`${status} ${docType.padEnd(25)} => ${displayName}`);
});

console.log("-".repeat(80));
console.log();

// Test specific scenarios
console.log("Testing Specific Scenarios:\n");
console.log("-".repeat(80));

// Scenario 1: UPI Fraud should have 4 documents
const upiDocs = SessionManager.getRequiredDocumentsForFraudType("upi_fraud");
const upiTest =
  upiDocs.length === 4 &&
  upiDocs.includes("aadhar_pan") &&
  upiDocs.includes("upi_screenshots");
console.log(
  `${upiTest ? "✅" : "❌"} UPI Fraud has 4 documents including UPI screenshots`
);

// Scenario 2: Sextortion should have minimal documents (1)
const sextortionDocs =
  SessionManager.getRequiredDocumentsForFraudType("sextortion_fraud");
const sextortionTest =
  sextortionDocs.length === 1 && sextortionDocs.includes("aadhar_pan");
console.log(
  `${sextortionTest ? "✅" : "❌"} Sextortion Fraud has minimal documents (1)`
);

// Scenario 3: Credit Card Fraud should NOT require bank statement
const creditCardDocs =
  SessionManager.getRequiredDocumentsForFraudType("credit_card_fraud");
const creditCardTest =
  !creditCardDocs.includes("bank_statement") &&
  creditCardDocs.includes("credit_card_statement");
console.log(
  `${
    creditCardTest ? "✅" : "❌"
  } Credit Card Fraud uses credit card statement, not bank statement`
);

// Scenario 4: E-Commerce should have minimal documents (2)
const ecommerceDocs =
  SessionManager.getRequiredDocumentsForFraudType("ecommerce_fraud");
const ecommerceTest = ecommerceDocs.length === 2;
console.log(
  `${ecommerceTest ? "✅" : "❌"} E-Commerce Fraud has minimal documents (2)`
);

// Scenario 5: Unknown fraud type should fallback to default
const unknownDocs =
  SessionManager.getRequiredDocumentsForFraudType("unknown_fraud_type");
const unknownTest =
  unknownDocs.length >= 1 && unknownDocs.includes("aadhar_pan");
console.log(
  `${
    unknownTest ? "✅" : "❌"
  } Unknown fraud type falls back to default documents`
);

console.log("-".repeat(80));
console.log();

// Test document count distribution
console.log("Document Count Distribution:\n");
console.log("-".repeat(80));

const countDistribution = {};
testFraudTypes.slice(0, -1).forEach((fraudType) => {
  // Exclude unknown type
  const count =
    SessionManager.getRequiredDocumentsForFraudType(fraudType).length;
  countDistribution[count] = (countDistribution[count] || 0) + 1;
});

Object.keys(countDistribution)
  .sort()
  .forEach((count) => {
    const percentage = ((countDistribution[count] / 23) * 100).toFixed(1);
    const bar = "█".repeat(Math.floor(countDistribution[count] / 2));
    console.log(
      `${count} documents: ${countDistribution[count]
        .toString()
        .padStart(2)} fraud types (${percentage}%) ${bar}`
    );
  });

console.log("-".repeat(80));
console.log();

// Summary statistics
const allCounts = testFraudTypes
  .slice(0, -1)
  .map(
    (fraudType) =>
      SessionManager.getRequiredDocumentsForFraudType(fraudType).length
  );
const avgDocs = (
  allCounts.reduce((a, b) => a + b, 0) / allCounts.length
).toFixed(2);
const minDocs = Math.min(...allCounts);
const maxDocs = Math.max(...allCounts);

console.log("Summary Statistics:\n");
console.log("-".repeat(80));
console.log(`Total Fraud Types: ${testFraudTypes.length - 1}`);
console.log(`Average Documents Required: ${avgDocs}`);
console.log(`Minimum Documents: ${minDocs}`);
console.log(`Maximum Documents: ${maxDocs}`);
console.log(`Previous Fixed Count: 8`);
console.log(
  `Reduction: ${(((8 - avgDocs) / 8) * 100).toFixed(
    1
  )}% fewer documents on average`
);
console.log("-".repeat(80));
console.log();

// Final result
if (
  allPassed &&
  upiTest &&
  sextortionTest &&
  creditCardTest &&
  ecommerceTest &&
  unknownTest
) {
  console.log("✅ ALL TESTS PASSED!");
  console.log("The Dynamic Document Collection feature is working correctly.");
  console.log();
  process.exit(0);
} else {
  console.log("❌ SOME TESTS FAILED!");
  console.log("Please review the implementation.");
  console.log();
  process.exit(1);
}
