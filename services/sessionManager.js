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
}

module.exports = SessionManager;
