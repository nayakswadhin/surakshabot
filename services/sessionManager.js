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
    COMPLAINT_FILING: "COMPLAINT_FILING",
    DOCUMENT_COLLECTION: "DOCUMENT_COLLECTION",
    SOCIAL_MEDIA_DOCUMENT_COLLECTION: "SOCIAL_MEDIA_DOCUMENT_COLLECTION",
  };

  // Registration steps
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

  // Status check steps
  static STATUS_CHECK_STEPS = {
    CASE_ID_INPUT: 0,
    DISPLAY_DETAILS: 1,
  };

  // Account unfreeze steps
  static ACCOUNT_UNFREEZE_STEPS = {
    ACCOUNT_INPUT: 0,
    DISPLAY_DETAILS: 1,
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
      aadhar_pan: "Aadhar Card / PAN Card",
      debit_credit_card: "Debit Card / Credit Card Photo",
      bank_front_page: "Bank Account Front Page",
      bank_statement: "Bank Statement (highlighting fraudulent transactions)",
      debit_messages: "Debit Message Screenshots (with transaction reference)",
      upi_screenshots: "UPI Transaction Screenshots (with UTR number)",
      credit_card_statement: "Credit Card Statement/Screenshots",
      beneficiary_details:
        "Beneficiary Account Details (with transaction reference)",
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
}

module.exports = SessionManager;
