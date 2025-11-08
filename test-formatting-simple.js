/**
 * Simple test to check formatting
 */

const queryService = require("./services/queryService");

// Mock API response similar to what the backend returns
const mockResponse = {
  answer: `🇮🇳 National Cybercrime Reporting Portal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phishing** is a cybercrime where attackers send fraudulent emails, messages, or websites designed to trick you into revealing personal information like passwords, bank details, or credit card numbers.

📞 EMERGENCY HELP

If you've been a victim of phishing:
1. Don't panic
2. Change your passwords immediately
3. Report to cybercrime.gov.in
4. Call helpline 1930

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REFERENCE DOCUMENTS

• CyberSafetyEng.pdf (Page 20 • 95% relevance)
• Basic Manual (Page 5 • 85% relevance)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  sources: [
    {
      filename: "CyberSafetyEng.pdf",
      page: 20,
      section: "Cyber Awareness",
    },
    {
      filename: "Final_English_Manual_Basic.pdf",
      page: 5,
      section: "Cyber Safety Tips",
    },
  ],
};

console.log("Testing formatResponse with mock data...\n");
console.log("=".repeat(60));

const formatted = queryService.formatResponse(mockResponse);

console.log("FORMATTED OUTPUT:");
console.log("=".repeat(60));
console.log(formatted);
console.log("=".repeat(60));

console.log("\nCHECKING:");
console.log("- Has 'Phishing':", formatted.includes("Phishing") ? "✓" : "✗");
console.log(
  "- Has main content:",
  formatted.includes("fraudulent emails") ? "✓" : "✗"
);
console.log(
  "- Has EMERGENCY HELP:",
  formatted.includes("EMERGENCY HELP") ? "✓" : "✗"
);
console.log(
  "- Has sources:",
  formatted.includes("Information Source") ? "✓" : "✗"
);
console.log("- Has helpline:", formatted.includes("1930") ? "✓" : "✗");
console.log(
  "- No asterisks:",
  !formatted.includes("**") && !formatted.match(/\*[^\s*]/) ? "✓" : "✗"
);
console.log(
  "- No REFERENCE DOCUMENTS:",
  !formatted.includes("REFERENCE DOCUMENTS") ? "✓" : "✗"
);

console.log("\nLength:", formatted.length, "characters");
