class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(phoneNumber) {
    const session = {
      phoneNumber,
      state: "MENU",
      step: 0,
      data: {},
      history: [],
      language: "en", // Default language: English
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.sessions.set(phoneNumber, session);
    return session;
  }

  getSession(phoneNumber) {
    return this.sessions.get(phoneNumber);
  }

  updateSession(phoneNumber, updates) {
    const session = this.sessions.get(phoneNumber);
    if (session) {
      // Save current state to history before updating
      if (updates.state && updates.state !== session.state) {
        session.history.push({
          state: session.state,
          step: session.step,
          data: { ...session.data },
          timestamp: new Date(),
        });
      }

      Object.assign(session, updates);
      session.lastActivity = new Date();
      this.sessions.set(phoneNumber, session);
    }
    return session;
  }

  goBack(phoneNumber) {
    const session = this.sessions.get(phoneNumber);
    if (session && session.history.length > 0) {
      const previousState = session.history.pop();
      session.state = previousState.state;
      session.step = previousState.step;
      session.data = { ...previousState.data };
      session.lastActivity = new Date();
      this.sessions.set(phoneNumber, session);
      return true;
    }
    return false;
  }

  clearSession(phoneNumber) {
    this.sessions.delete(phoneNumber);
  }

  cleanupOldSessions() {
    const now = new Date();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (const [phoneNumber, session] of this.sessions.entries()) {
      if (now - session.lastActivity > timeout) {
        this.sessions.delete(phoneNumber);
      }
    }
  }

  // Registration flow states
  static STATES = {
    MENU: "MENU",
    NEW_COMPLAINT: "NEW_COMPLAINT",
    STATUS_CHECK: "STATUS_CHECK",
    ACCOUNT_UNFREEZE: "ACCOUNT_UNFREEZE",
    OTHER_QUERIES: "OTHER_QUERIES",
    REGISTRATION: "REGISTRATION",
    DIDIT_VERIFICATION: "DIDIT_VERIFICATION",
    DIDIT_DATA_CONFIRMATION: "DIDIT_DATA_CONFIRMATION",
    DIDIT_ADDITIONAL_INFO: "DIDIT_ADDITIONAL_INFO",
    COMPLAINT_FILING: "COMPLAINT_FILING",
    DOCUMENT_COLLECTION: "DOCUMENT_COLLECTION",
    SOCIAL_MEDIA_DOCUMENT_COLLECTION: "SOCIAL_MEDIA_DOCUMENT_COLLECTION",
    AUTO_CLASSIFICATION: "AUTO_CLASSIFICATION",
    CLASSIFICATION_CONFIRMATION: "CLASSIFICATION_CONFIRMATION",
  };

  // Registration steps (OLD - kept for backward compatibility)
  static REGISTRATION_STEPS = {
    NAME: 0,
    FATHER_SPOUSE_GUARDIAN: 1,
    DOB: 2,
    PHONE: 3,
    EMAIL: 4,
    GENDER: 5,
    VILLAGE: 6,
    PINCODE: 7,
    AADHAR: 8,
    CONFIRMATION: 9,
  };

  // Didit verification steps
  static DIDIT_STEPS = {
    VERIFICATION_PENDING: "VERIFICATION_PENDING",
    DATA_CONFIRMATION: "DATA_CONFIRMATION",
    ASK_PINCODE: "ASK_PINCODE",
    ASK_VILLAGE: "ASK_VILLAGE",
    ASK_FATHER_SPOUSE_GUARDIAN: "ASK_FATHER_SPOUSE_GUARDIAN",
    ASK_EMAIL: "ASK_EMAIL",
    EMAIL_OTP_SENT: "EMAIL_OTP_SENT",
    EMAIL_OTP_VERIFICATION: "EMAIL_OTP_VERIFICATION",
    FINAL_CONFIRMATION: "FINAL_CONFIRMATION",
  };

  // Status check steps
  static STATUS_CHECK_STEPS = {
    CASE_ID_INPUT: 0,
    DISPLAY_DETAILS: 1,
  };

  // Account unfreeze steps
  static ACCOUNT_UNFREEZE_STEPS = {
    BANK_NAME: "bank_name",
    ACCOUNT_NUMBER: "account_number",
    ACCOUNT_HOLDER_NAME: "account_holder_name",
    BANK_BRANCH_STATE: "bank_branch_state",
    FREEZE_DATE: "freeze_date",
    REASON: "reason",
    TRANSACTION_ID: "transaction_id",
    DISPLAY_CONTACTS: "display_contacts",
  };

  // Document collection steps for financial fraud
  static DOCUMENT_COLLECTION_STEPS = {
    AADHAR_PAN: "aadhar_pan",
    DEBIT_CREDIT_CARD: "debit_credit_card",
    BANK_FRONT_PAGE: "bank_front_page",
    BANK_STATEMENT: "bank_statement",
    DEBIT_MESSAGES: "debit_messages",
    UPI_SCREENSHOTS: "upi_screenshots",
    CREDIT_CARD_STATEMENT: "credit_card_statement",
    BENEFICIARY_DETAILS: "beneficiary_details",
    COMPLETION: "completion",
  };

  // Document collection flow order
  static DOCUMENT_FLOW = [
    "aadhar_pan",
    "debit_credit_card",
    "bank_front_page",
    "bank_statement",
    "debit_messages",
    "upi_screenshots",
    "credit_card_statement",
    "beneficiary_details",
  ];

  // Document requirements mapping for financial fraud types
  // Maps fraud type to required documents
  static FINANCIAL_FRAUD_DOCUMENT_REQUIREMENTS = {
    investment_fraud: [
      "aadhar_pan",
      "bank_front_page",
      "bank_statement",
      "beneficiary_details",
    ],
    customer_care_fraud: [
      "aadhar_pan",
      "bank_front_page",
      "bank_statement",
      "upi_screenshots",
    ],
    upi_fraud: [
      "aadhar_pan",
      "bank_front_page",
      "upi_screenshots",
      "beneficiary_details",
    ],
    apk_fraud: [
      "aadhar_pan",
      "bank_front_page",
      "bank_statement",
      "upi_screenshots",
    ],
    franchisee_fraud: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    job_fraud: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    debit_card_fraud: [
      "aadhar_pan",
      "debit_credit_card",
      "bank_front_page",
      "bank_statement",
    ],
    credit_card_fraud: [
      "aadhar_pan",
      "debit_credit_card",
      "credit_card_statement",
    ],
    ecommerce_fraud: ["aadhar_pan", "bank_statement"],
    loan_app_fraud: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    sextortion_fraud: ["aadhar_pan"], // Can add bank_statement if payment occurred
    olx_fraud: [
      "aadhar_pan",
      "bank_statement",
      "upi_screenshots",
      "beneficiary_details",
    ],
    lottery_fraud: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    hotel_booking_fraud: ["aadhar_pan", "bank_statement"],
    gaming_app_fraud: ["aadhar_pan", "bank_statement", "upi_screenshots"],
    aeps_fraud: ["aadhar_pan", "bank_front_page", "bank_statement"],
    tower_installation_fraud: [
      "aadhar_pan",
      "bank_statement",
      "beneficiary_details",
    ],
    ewallet_fraud: ["aadhar_pan", "upi_screenshots", "beneficiary_details"],
    digital_arrest_fraud: ["aadhar_pan", "bank_statement", "upi_screenshots"],
    fake_website_fraud: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    ticket_booking_fraud: ["aadhar_pan", "bank_statement"],
    insurance_fraud: ["aadhar_pan", "bank_statement", "beneficiary_details"],
    other_financial_fraud: ["aadhar_pan", "bank_statement"],
  };

  // Mapping from fraud type ID to key (for document requirements)
  static FRAUD_TYPE_ID_TO_KEY = {
    1: "investment_fraud", // Investment/Trading/IPO
    2: "customer_care_fraud", // Customer Care
    3: "upi_fraud", // UPI Fraud
    4: "apk_fraud", // APK Fraud
    5: "franchisee_fraud", // Fake Franchisee/Dealership
    6: "job_fraud", // Online Job
    7: "debit_card_fraud", // Debit Card
    8: "credit_card_fraud", // Credit Card
    9: "ecommerce_fraud", // E-Commerce
    10: "loan_app_fraud", // Loan App
    11: "sextortion_fraud", // Sextortion
    12: "olx_fraud", // OLX Fraud
    13: "lottery_fraud", // Lottery
    14: "hotel_booking_fraud", // Hotel Booking
    15: "gaming_app_fraud", // Gaming App
    16: "aeps_fraud", // AEPS Fraud
    17: "tower_installation_fraud", // Tower Installation
    18: "ewallet_fraud", // E-Wallet
    19: "digital_arrest_fraud", // Digital Arrest
    20: "fake_website_fraud", // Fake Website
    21: "ticket_booking_fraud", // Ticket Booking
    22: "insurance_fraud", // Insurance Maturity
    23: "other_financial_fraud", // Others
  };

  /**
   * Get required documents based on fraud type
   * @param {string|number} fraudType - Fraud type code or ID
   * @returns {Array<string>} Array of required document steps
   */
  static getRequiredDocumentsForFraudType(fraudType) {
    console.log(
      `Getting required documents for fraud type: ${fraudType} (type: ${typeof fraudType})`
    );

    // Convert ID to key if needed
    let fraudTypeKey = fraudType;
    if (typeof fraudType === "number" || !isNaN(parseInt(fraudType))) {
      const id =
        typeof fraudType === "number" ? fraudType : parseInt(fraudType);
      fraudTypeKey = this.FRAUD_TYPE_ID_TO_KEY[id];
      console.log(`Converted ID ${id} to key: ${fraudTypeKey}`);
    }

    const requirements =
      this.FINANCIAL_FRAUD_DOCUMENT_REQUIREMENTS[fraudTypeKey];

    if (!requirements) {
      console.log(
        `No specific requirements found for ${fraudTypeKey}, using default documents`
      );
      return ["aadhar_pan", "bank_statement"];
    }

    console.log(`Document requirements for ${fraudTypeKey}:`, requirements);
    return requirements;
  }

  // Social Media document collection steps
  static SOCIAL_MEDIA_COLLECTION_STEPS = {
    META_LINK: "meta_link",
    META_CONFIRMATION: "meta_confirmation",
    REQUEST_LETTER: "request_letter",
    GOVT_ID: "govt_id",
    DISPUTED_SCREENSHOTS: "disputed_screenshots",
    ALLEGED_URL: "alleged_url",
    IMPERSONATION_CHECK: "impersonation_check",
    ORIGINAL_ID_SCREENSHOT: "original_id_screenshot",
    ORIGINAL_ID_URL: "original_id_url",
    FINAL_CONFIRMATION: "final_confirmation",
    COMPLETION: "completion",
  };

  // Social Media document collection flow order (simplified)
  static SOCIAL_MEDIA_FLOW = [
    "meta_link",
    "meta_confirmation",
    "request_letter",
    "govt_id",
    "disputed_screenshots",
    "alleged_url",
    "impersonation_check",
  ];

  /**
   * Get next document step in the collection flow
   * @param {string} currentStep - Current document step
   * @returns {string|null} Next step or null if completed
   */
  static getNextDocumentStep(currentStep) {
    const currentIndex = this.DOCUMENT_FLOW.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex === this.DOCUMENT_FLOW.length - 1) {
      return null; // Completed or invalid step
    }
    return this.DOCUMENT_FLOW[currentIndex + 1];
  }

  /**
   * Get document step display name for user
   * @param {string} step - Document step
   * @returns {string} Human readable name
   */
  static getDocumentDisplayName(step) {
    const displayNames = {
      aadhar_pan: "Aadhaar Card / PAN Card (Identity proof)",
      debit_credit_card:
        "Debit Card / Credit Card Photo (Front side only, hide CVV)",
      bank_front_page:
        "Bank Account Front Page (showing name and account number)",
      bank_statement:
        "Bank Statement (highlighting fraudulent transaction with transaction reference number)",
      debit_messages:
        "Debit Message Screenshots (showing transaction reference number with date and time)",
      upi_screenshots:
        "UPI Transaction Screenshot (showing UTR number, date and time)",
      credit_card_statement:
        "Credit Card Statement or Screenshot (spent message reference number with date and time)",
      beneficiary_details:
        "Beneficiary Account Details (account number, name, transaction reference number, date, and amount)",
    };
    return displayNames[step] || step;
  }

  /**
   * Get next social media document step in the collection flow
   * @param {string} currentStep - Current document step
   * @returns {string|null} Next step or null if needs impersonation check
   */
  static getNextSocialMediaStep(currentStep) {
    const currentIndex = this.SOCIAL_MEDIA_FLOW.indexOf(currentStep);
    if (currentIndex === -1) {
      return null; // Invalid step
    }

    // Special handling for impersonation check
    if (currentStep === "impersonation_check") {
      return null; // Will be handled by the bot logic
    }

    if (currentIndex === this.SOCIAL_MEDIA_FLOW.length - 1) {
      return null; // Completed basic flow
    }

    return this.SOCIAL_MEDIA_FLOW[currentIndex + 1];
  }

  /**
   * Get social media document step display name for user
   * @param {string} step - Document step
   * @returns {string} Human readable name
   */
  static getSocialMediaDisplayName(step) {
    const displayNames = {
      meta_link: "Meta India Registration Link",
      meta_confirmation: "Meta Registration Confirmation",
      request_letter: "Request Letter (Acknowledgement Screenshot)",
      govt_id: "Aadhar Card / Any Govt. Issue ID",
      disputed_screenshots: "Disputed Screenshots",
      alleged_url: "Alleged URL (Uniform Resource Locator)",
      impersonation_check: "Fake/Impersonation ID Check",
      original_id_screenshot: "Original ID Screenshot",
      original_id_url: "Original ID URL",
    };
    return displayNames[step] || step;
  }

  // Language Management Methods
  getUserLanguage(phoneNumber) {
    const session = this.sessions.get(phoneNumber);
    return session?.language || "en";
  }

  setUserLanguage(phoneNumber, langCode) {
    const session = this.sessions.get(phoneNumber);
    if (session) {
      session.language = langCode;
      session.lastActivity = new Date();
      this.sessions.set(phoneNumber, session);
      return true;
    }
    return false;
  }

  getAllUserLanguages() {
    const languages = {};
    for (const [phoneNumber, session] of this.sessions.entries()) {
      languages[phoneNumber] = session.language || "en";
    }
    return languages;
  }
}

module.exports = SessionManager;
