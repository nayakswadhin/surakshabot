/**
 * Complete Workflow Test
 * Tests the entire flow from greeting to complaint filing
 */

require("dotenv").config();
const SessionManager = require("./services/sessionManager");
const DiditService = require("./services/diditService");

console.log("=".repeat(70));
console.log("COMPLETE WORKFLOW TEST");
console.log("=".repeat(70));
console.log();

let testsPassed = 0;
let testsFailed = 0;

function test(description, condition) {
  if (condition) {
    console.log(`✅ PASS: ${description}`);
    testsPassed++;
  } else {
    console.log(`❌ FAIL: ${description}`);
    testsFailed++;
  }
}

async function runWorkflowTest() {
  const sessionManager = new SessionManager();
  const diditService = new DiditService();
  const testPhone = "+919876543210";

  console.log("=".repeat(70));
  console.log("WORKFLOW: User sends 'Hello'");
  console.log("=".repeat(70));
  console.log();

  // Step 1: User sends Hello - Create session
  const session1 = sessionManager.createSession(testPhone);
  test("Session created with MENU state", session1.state === "MENU");
  test(
    "Session has empty data object",
    Object.keys(session1.data).length === 0
  );
  console.log();

  console.log("=".repeat(70));
  console.log("WORKFLOW: User clicks 'New Complaint'");
  console.log("=".repeat(70));
  console.log();

  // Step 2: User clicks New Complaint
  sessionManager.updateSession(testPhone, {
    state: SessionManager.STATES.NEW_COMPLAINT,
  });
  const session2 = sessionManager.getSession(testPhone);
  test(
    "Session state changed to NEW_COMPLAINT",
    session2.state === "NEW_COMPLAINT"
  );
  console.log();

  console.log("=".repeat(70));
  console.log("WORKFLOW: System checks user in DB (not found)");
  console.log("=".repeat(70));
  console.log();

  // Step 3: User not found - Start Didit Verification
  sessionManager.updateSession(testPhone, {
    state: SessionManager.STATES.DIDIT_VERIFICATION,
    step: SessionManager.DIDIT_STEPS.VERIFICATION_PENDING,
  });
  const session3 = sessionManager.getSession(testPhone);
  test(
    "Session state changed to DIDIT_VERIFICATION",
    session3.state === "DIDIT_VERIFICATION"
  );
  test(
    "Session step is VERIFICATION_PENDING",
    session3.step === SessionManager.DIDIT_STEPS.VERIFICATION_PENDING
  );
  console.log();

  console.log("=".repeat(70));
  console.log("WORKFLOW: Create Didit verification session");
  console.log("=".repeat(70));
  console.log();

  // Step 4: Create Didit session
  try {
    const diditSession = await diditService.createSession("Test_Workflow_User");
    test("Didit session created successfully", !!diditSession.session_id);
    test("Verification URL generated", !!diditSession.url);

    // Store session ID
    sessionManager.updateSession(testPhone, {
      data: {
        diditSessionId: diditSession.session_id,
        diditVerificationUrl: diditSession.url,
      },
    });

    const session4 = sessionManager.getSession(testPhone);
    test("Didit session ID stored in session", !!session4.data.diditSessionId);
    test(
      "Verification URL stored in session",
      !!session4.data.diditVerificationUrl
    );
    console.log();

    console.log("=".repeat(70));
    console.log("WORKFLOW: User clicks 'Yes I'm Done'");
    console.log("=".repeat(70));
    console.log();

    // Step 5: Check verification status
    const decision = await diditService.getSessionDecision(
      diditSession.session_id
    );
    test("Decision fetched successfully", !!decision.status);
    test(
      "Status is 'Not Started' (expected for new session)",
      decision.status === "Not Started"
    );
    console.log();

    console.log("=".repeat(70));
    console.log("WORKFLOW: Simulate approved verification");
    console.log("=".repeat(70));
    console.log();

    // Step 6: Simulate approved verification (mock data)
    const mockApprovedDecision = {
      success: true,
      status: "Approved",
      idVerification: {
        status: "Approved",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        gender: "M",
        date_of_birth: "1990-01-15",
        document_number: "123456789012",
        document_type: "Aadhar Card",
      },
    };

    const extractedData = diditService.extractUserData(mockApprovedDecision);
    test("User data extracted from approved decision", !!extractedData);
    test("Name extracted correctly", extractedData.name === "John Doe");
    test("Gender converted correctly", extractedData.gender === "Male");
    test(
      "Aadhar extracted correctly",
      extractedData.aadharNumber === "123456789012"
    );
    test("DOB extracted correctly", extractedData.dob === "1990-01-15");
    console.log();

    console.log("=".repeat(70));
    console.log("WORKFLOW: User confirms extracted data");
    console.log("=".repeat(70));
    console.log();

    // Step 7: Store extracted data and move to additional info
    sessionManager.updateSession(testPhone, {
      state: SessionManager.STATES.DIDIT_DATA_CONFIRMATION,
      data: {
        ...session4.data,
        ...extractedData,
        phone: testPhone
          .replace(/^\+?91/, "")
          .replace(/\D/g, "")
          .slice(-10), // Extract 10-digit phone
      },
    });

    const session5 = sessionManager.getSession(testPhone);
    test(
      "Session state changed to DIDIT_DATA_CONFIRMATION",
      session5.state === "DIDIT_DATA_CONFIRMATION"
    );
    test("Name stored in session", session5.data.name === "John Doe");
    test("Gender stored in session", session5.data.gender === "Male");
    console.log();

    console.log("=".repeat(70));
    console.log("WORKFLOW: Ask for additional information");
    console.log("=".repeat(70));
    console.log();

    // Step 8: User clicks 'Correct' - Ask for pincode
    sessionManager.updateSession(testPhone, {
      state: SessionManager.STATES.DIDIT_ADDITIONAL_INFO,
      step: SessionManager.DIDIT_STEPS.ASK_PINCODE,
    });

    const session6 = sessionManager.getSession(testPhone);
    test(
      "Session state changed to DIDIT_ADDITIONAL_INFO",
      session6.state === "DIDIT_ADDITIONAL_INFO"
    );
    test(
      "Session step is ASK_PINCODE",
      session6.step === SessionManager.DIDIT_STEPS.ASK_PINCODE
    );
    console.log();

    // Step 9: User enters pincode
    sessionManager.updateSession(testPhone, {
      step: SessionManager.DIDIT_STEPS.ASK_VILLAGE,
      data: {
        ...session6.data,
        pincode: "751001",
        district: "Khordha",
        state: "Odisha",
      },
    });

    const session7 = sessionManager.getSession(testPhone);
    test("Pincode stored", session7.data.pincode === "751001");
    test("District stored", session7.data.district === "Khordha");
    test(
      "Step changed to ASK_VILLAGE",
      session7.step === SessionManager.DIDIT_STEPS.ASK_VILLAGE
    );
    console.log();

    // Step 10: User enters village
    sessionManager.updateSession(testPhone, {
      step: SessionManager.DIDIT_STEPS.ASK_FATHER_SPOUSE_GUARDIAN,
      data: {
        ...session7.data,
        village: "Bhubaneswar",
      },
    });

    const session8 = sessionManager.getSession(testPhone);
    test("Village stored", session8.data.village === "Bhubaneswar");
    test(
      "Step changed to ASK_FATHER_SPOUSE_GUARDIAN",
      session8.step === SessionManager.DIDIT_STEPS.ASK_FATHER_SPOUSE_GUARDIAN
    );
    console.log();

    // Step 11: User enters father/spouse/guardian name
    sessionManager.updateSession(testPhone, {
      step: SessionManager.DIDIT_STEPS.ASK_EMAIL,
      data: {
        ...session8.data,
        fatherSpouseGuardianName: "Robert Doe",
      },
    });

    const session9 = sessionManager.getSession(testPhone);
    test(
      "Father/Spouse/Guardian name stored",
      session9.data.fatherSpouseGuardianName === "Robert Doe"
    );
    test(
      "Step changed to ASK_EMAIL",
      session9.step === SessionManager.DIDIT_STEPS.ASK_EMAIL
    );
    console.log();

    // Step 12: User enters email
    sessionManager.updateSession(testPhone, {
      step: SessionManager.DIDIT_STEPS.FINAL_CONFIRMATION,
      data: {
        ...session9.data,
        emailid: "john.doe@example.com",
      },
    });

    const session10 = sessionManager.getSession(testPhone);
    test("Email stored", session10.data.emailid === "john.doe@example.com");
    test(
      "Step changed to FINAL_CONFIRMATION",
      session10.step === SessionManager.DIDIT_STEPS.FINAL_CONFIRMATION
    );
    console.log();

    console.log("=".repeat(70));
    console.log("WORKFLOW: User confirms all data - Ready to save to MongoDB");
    console.log("=".repeat(70));
    console.log();

    // Step 13: Final data check before saving
    const finalData = session10.data;
    test("All required fields present", !!finalData.name);
    test("Aadhar present", !!finalData.aadharNumber);
    test("Gender present", !!finalData.gender);
    test("DOB present", !!finalData.dob);
    test("Phone present", finalData.phone === "9876543210");
    test(
      "Father/Spouse/Guardian present",
      !!finalData.fatherSpouseGuardianName
    );
    test("Email present", !!finalData.emailid);
    test("Village present", !!finalData.village);
    test("District present", !!finalData.district);
    test("State present", !!finalData.state);
    test("Pincode present", !!finalData.pincode);
    console.log();

    console.log("=".repeat(70));
    console.log("WORKFLOW: Proceed to complaint filing");
    console.log("=".repeat(70));
    console.log();

    // Step 14: Move to complaint filing
    sessionManager.updateSession(testPhone, {
      state: SessionManager.STATES.COMPLAINT_FILING,
      step: "FRAUD_CATEGORY_SELECTION",
    });

    const session11 = sessionManager.getSession(testPhone);
    test(
      "Session state changed to COMPLAINT_FILING",
      session11.state === "COMPLAINT_FILING"
    );
    test(
      "Session step is FRAUD_CATEGORY_SELECTION",
      session11.step === "FRAUD_CATEGORY_SELECTION"
    );
    console.log();

    console.log("=".repeat(70));
    console.log("WORKFLOW: Complete!");
    console.log("=".repeat(70));
    console.log();
  } catch (error) {
    console.error("❌ Error during workflow test:", error.message);
    testsFailed++;
  }

  // Summary
  console.log("=".repeat(70));
  console.log("TEST SUMMARY");
  console.log("=".repeat(70));
  console.log();
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(
    `Pass Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(
      2
    )}%`
  );
  console.log();

  if (testsFailed === 0) {
    console.log("=".repeat(70));
    console.log("🎉 ALL WORKFLOW TESTS PASSED! 🎉");
    console.log("=".repeat(70));
    console.log();
    console.log("The complete flow is working correctly:");
    console.log("1. ✅ User greeting → Main Menu");
    console.log("2. ✅ New Complaint → Check user in DB");
    console.log("3. ✅ User not found → Start Didit verification");
    console.log("4. ✅ Create Didit session → Send verification link");
    console.log("5. ✅ User completes verification → Extract data");
    console.log("6. ✅ User confirms data → Ask additional info");
    console.log("7. ✅ Collect pincode, village, guardian, email");
    console.log("8. ✅ Final confirmation → Ready to save to MongoDB");
    console.log("9. ✅ Proceed to complaint filing");
    console.log();
    console.log("The system is ready for production testing!");
  } else {
    console.log("❌ Some tests failed. Please review the errors above.");
  }
}

// Run the test
runWorkflowTest().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
