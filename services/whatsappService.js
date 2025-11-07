const axios = require("axios");
const SessionManager = require("./sessionManager");
const PinCodeService = require("./pinCodeService");
const ComplaintService = require("./complaintService");
require("dotenv").config();

class WhatsAppService {
  constructor() {
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_TOKEN;
    this.graphApiUrl = process.env.GRAPH_API_URL;
    this.sessionManager = new SessionManager();
    this.pinCodeService = new PinCodeService();
    this.complaintService = new ComplaintService();

    // Clean up old sessions every 10 minutes
    setInterval(() => {
      this.sessionManager.cleanupOldSessions();
    }, 10 * 60 * 1000);
  }

  async sendMessage(to, message) {
    const url = `${this.graphApiUrl}/${this.phoneNumberId}/messages`;

    try {
      console.log(
        `Sending message to ${to}:`,
        JSON.stringify(message, null, 2)
      );

      const response = await axios.post(url, message, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`Message sent successfully to ${to}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
      console.error("Message that failed:", JSON.stringify(message, null, 2));
      console.error("URL used:", url);
      throw error;
    }
  }

  createWelcomeMessage(to) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "Welcome to 1930, Cyber Helpline, Odisha.\n\nHow can I help you?\n\nA- New Complaint\nB- Status Check\nC- Account Unfreeze\nD- Other Queries\n\nSelect an option below:",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "new_complaint",
                title: "New Complaint",
              },
            },
            {
              type: "reply",
              reply: {
                id: "status_check",
                title: "Status Check",
              },
            },
            {
              type: "reply",
              reply: {
                id: "more_options",
                title: "More Options",
              },
            },
          ],
        },
      },
    };
  }

  createMoreOptionsMessage(to) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "Additional Services:\n\nC- Account Unfreeze\nD- Other Queries\n\nSelect an option:",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "account_unfreeze",
                title: "Account Unfreeze",
              },
            },
            {
              type: "reply",
              reply: {
                id: "other_queries",
                title: "Other Queries",
              },
            },
            {
              type: "reply",
              reply: {
                id: "main_menu",
                title: "Main Menu",
              },
            },
          ],
        },
      },
    };
  }

  createTextMessage(to, text) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: text,
      },
    };
  }

  async handleGreeting(to) {
    try {
      console.log(`Handling greeting for ${to}`);

      // Clear any existing session and create new one
      this.sessionManager.clearSession(to);
      this.sessionManager.createSession(to);

      const welcomeMessage = this.createWelcomeMessage(to);
      await this.sendMessage(to, welcomeMessage);
    } catch (error) {
      console.error("Error handling greeting:", error);

      // Fallback: send a simple text message
      try {
        const fallbackMessage = this.createTextMessage(
          to,
          "Welcome to 1930, Cyber Helpline, Odisha. There was an issue with the menu. Please type 'menu' to try again."
        );
        await this.sendMessage(to, fallbackMessage);
      } catch (fallbackError) {
        console.error("Error sending fallback message:", fallbackError);
      }
    }
  }

  async handleButtonPress(to, buttonId) {
    const session =
      this.sessionManager.getSession(to) ||
      this.sessionManager.createSession(to);

    // Handle global navigation buttons
    if (buttonId === "exit_session") {
      return await this.handleExitSession(to);
    } else if (buttonId === "back_step") {
      return await this.handleBackStep(to);
    } else if (buttonId === "main_menu") {
      return await this.handleGreeting(to);
    }

    // Handle menu selection
    switch (buttonId) {
      case "new_complaint":
        this.sessionManager.updateSession(to, {
          state: SessionManager.STATES.NEW_COMPLAINT,
        });
        return await this.checkUserAndProceed(to);

      case "status_check":
        this.sessionManager.updateSession(to, {
          state: SessionManager.STATES.STATUS_CHECK,
        });
        return await this.handleStatusCheck(to);

      case "account_unfreeze":
        this.sessionManager.updateSession(to, {
          state: SessionManager.STATES.ACCOUNT_UNFREEZE,
        });
        return await this.handleAccountUnfreeze(to);

      case "other_queries":
        this.sessionManager.updateSession(to, {
          state: SessionManager.STATES.OTHER_QUERIES,
        });
        return await this.handleOtherQueries(to);

      case "more_options":
        const moreOptionsMessage = this.createMoreOptionsMessage(to);
        return await this.sendMessage(to, moreOptionsMessage);

      // Registration flow buttons
      case "start_registration":
        return await this.startRegistration(to);

      case "skip_registration":
        return await this.handleExistingUser(to);

      // Complaint flow buttons
      case "proceed_complaint":
        return await this.handleComplaintDetails(to);

      // Gender selection buttons
      case "gender_male":
        return await this.handleRegistrationInput(to, "Male");

      case "gender_female":
        return await this.handleRegistrationInput(to, "Female");

      case "gender_others":
        return await this.handleRegistrationInput(to, "Others");

      // Complaint flow buttons
      case "financial_fraud":
        return await this.handleFinancialFraudSelection(to);

      case "social_media_fraud":
        return await this.handleSocialMediaFraudSelection(to);

      case "confirm_complaint":
        return await this.handleComplaintConfirmation(to);

      // Voice/Text input selection buttons
      case "input_voice":
        return await this.handleVoiceInputSelected(to);

      case "input_text":
        return await this.handleTextInputSelected(to);

      default:
        const responseText =
          "Sorry, I didn't understand that. Please use the menu options provided.";
        const textMessage = this.createTextMessage(to, responseText);
        await this.sendMessage(to, textMessage);
    }
  }

  async handleNewComplaint(to) {
    const message = this.createNavigationMessage(
      to,
      "New Complaint Registration\n\n" +
        "I need to collect some information to register your complaint.\n\n" +
        "Let me check if you're already registered with us.\n\n" +
        "Please provide your phone number (the one you're messaging from):",
      [
        { id: "skip_registration", title: "Continue" },
        { id: "main_menu", title: "Main Menu" },
      ]
    );

    await this.sendMessage(to, message);
  }

  isGreeting(text) {
    const normalizedText = text.toLowerCase().trim();
    const greetings = [
      "hello",
      "hi",
      "hey",
      "help",
      "hii",
      "start",
      "menu",
      "namaste",
      "namaskar",
    ];

    // Check if the text is exactly a greeting or starts with a greeting word
    return greetings.some(
      (greeting) =>
        normalizedText === greeting ||
        normalizedText.startsWith(greeting + " ") ||
        normalizedText.startsWith(greeting + "!")
    );
  }

  // Navigation helper methods
  createNavigationMessage(to, text, buttons = []) {
    const navigationButtons = [
      ...buttons,
      { id: "back_step", title: "Back" },
      { id: "exit_session", title: "Exit" },
    ].slice(0, 3); // WhatsApp allows max 3 buttons

    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text },
        action: {
          buttons: navigationButtons.map((btn) => ({
            type: "reply",
            reply: { id: btn.id, title: btn.title },
          })),
        },
      },
    };
  }

  async handleExitSession(to) {
    this.sessionManager.clearSession(to);
    const message = this.createTextMessage(
      to,
      "Session ended. Thank you for using 1930 Cyber Helpline.\n\n" +
        "Type 'Hello' to start a new session."
    );
    await this.sendMessage(to, message);
  }

  async handleBackStep(to) {
    const session = this.sessionManager.getSession(to);
    console.log(
      `Handle back step for ${to}, session state: ${session?.state}, step: ${session?.step}`
    );

    if (!session) {
      return await this.handleGreeting(to);
    }

    // Special handling for registration flow
    if (session.state === SessionManager.STATES.REGISTRATION) {
      const currentStep = session.step;

      if (currentStep > 0) {
        // Go back one step in registration, skip PHONE step
        let previousStep = currentStep - 1;

        // Skip PHONE step when going back
        if (previousStep === SessionManager.REGISTRATION_STEPS.PHONE) {
          previousStep = SessionManager.REGISTRATION_STEPS.DOB; // Go to DOB instead
        }

        console.log(
          `Going back from step ${currentStep} to step ${previousStep} (skipping PHONE if needed)`
        );

        // Remove the last entered data for current step
        const stepNames = Object.keys(SessionManager.REGISTRATION_STEPS);
        const currentStepName = stepNames[currentStep];
        const previousStepName = stepNames[previousStep];

        if (currentStepName && session.data[currentStepName.toLowerCase()]) {
          delete session.data[currentStepName.toLowerCase()];
        }

        // Update session to previous step
        this.sessionManager.updateSession(to, { step: previousStep });

        // Continue registration from previous step
        await this.continueRegistration(to);
      } else {
        // If at step 0 (name), go back to new complaint menu
        console.log(
          `At first registration step, going back to new complaint menu`
        );
        this.sessionManager.updateSession(to, {
          state: SessionManager.STATES.NEW_COMPLAINT,
        });
        await this.checkUserAndProceed(to);
      }
    } else {
      // For other states, use the original goBack logic
      if (this.sessionManager.goBack(to)) {
        const updatedSession = this.sessionManager.getSession(to);

        if (updatedSession.state === SessionManager.STATES.REGISTRATION) {
          await this.continueRegistration(to);
        } else if (updatedSession.state === SessionManager.STATES.MENU) {
          await this.handleGreeting(to);
        } else {
          await this.handleGreeting(to);
        }
      } else {
        await this.handleGreeting(to);
      }
    }
  }

  // Registration flow methods
  async startRegistration(to) {
    console.log(`Starting registration for ${to}`);

    // Extract 10-digit phone number from WhatsApp format
    const cleanPhone = to.replace(/^\+?91/, "").replace(/\D/g, "");
    const phoneNumber =
      cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);

    console.log(
      `Auto-populating phone number: ${phoneNumber} from WhatsApp: ${to}`
    );

    this.sessionManager.updateSession(to, {
      state: SessionManager.STATES.REGISTRATION,
      step: SessionManager.REGISTRATION_STEPS.NAME,
      data: {
        phone: phoneNumber, // Pre-populate phone number from WhatsApp
      },
    });

    const stepIndicator = `Step 1 of 8`; // Updated to reflect that phone is auto-filled
    const message = this.createNavigationMessage(
      to,
      `${stepIndicator}\n\nUser Registration\n\n` +
        "Let's start with your details:\n\n" +
        `Phone Number: ${phoneNumber} (auto-detected)\n\n` +
        "Please enter your Full Name:"
    );

    console.log(`Sending registration start message to ${to}`);
    await this.sendMessage(to, message);
  }

  async handleRegistrationInput(to, input) {
    const session = this.sessionManager.getSession(to);
    console.log(`Registration input from ${to}: "${input}"`);
    console.log(
      `Session state:`,
      session ? `${session.state}, step: ${session.step}` : "No session"
    );

    if (!session || session.state !== SessionManager.STATES.REGISTRATION) {
      console.log(
        `Invalid session state for registration input, redirecting to greeting`
      );
      return await this.handleGreeting(to);
    }

    const step = session.step;
    const stepNames = Object.keys(SessionManager.REGISTRATION_STEPS);
    const currentStepName = stepNames[step];

    console.log(`Current registration step: ${currentStepName} (${step})`);

    // Validate and store input
    const validation = await this.validateRegistrationInput(
      currentStepName,
      input
    );
    if (!validation.isValid) {
      console.log(
        `Validation failed for ${currentStepName}: ${validation.message}`
      );
      const message = this.createNavigationMessage(
        to,
        `${validation.message}\n\nPlease try again:`
      );
      return await this.sendMessage(to, message);
    }

    console.log(`Validation passed for ${currentStepName}, storing data`);
    // Store the validated input
    if (!session.data) {
      session.data = {};
    }
    session.data[currentStepName.toLowerCase()] = validation.value || input;

    // Store location data if it's PIN code
    if (currentStepName === "PINCODE" && validation.locationData) {
      session.data.locationData = validation.locationData;
    }

    // Move to next step, skip PHONE step as it's auto-populated
    let nextStep = step + 1;
    if (nextStep === SessionManager.REGISTRATION_STEPS.PHONE) {
      nextStep = SessionManager.REGISTRATION_STEPS.EMAIL; // Skip phone step
    }
    console.log(`Moving to next step: ${nextStep}`);
    this.sessionManager.updateSession(to, {
      step: nextStep,
      data: session.data,
    });

    await this.continueRegistration(to);
  }

  async continueRegistration(to) {
    const session = this.sessionManager.getSession(to);
    let step = session.step;
    const stepNames = Object.keys(SessionManager.REGISTRATION_STEPS);

    // Skip PHONE step since it's auto-populated
    if (step === SessionManager.REGISTRATION_STEPS.PHONE) {
      step = SessionManager.REGISTRATION_STEPS.EMAIL;
      this.sessionManager.updateSession(to, { step: step });
    }

    console.log(
      `Continue registration for ${to}, step: ${step}/${stepNames.length - 1}`
    );

    if (step >= stepNames.length - 1) {
      return await this.completeRegistration(to);
    }

    const currentStepName = stepNames[step];
    const prompts = this.getRegistrationPrompts();

    // Calculate step number excluding PHONE step
    let displayStep = step + 1;
    if (step > SessionManager.REGISTRATION_STEPS.PHONE) {
      displayStep = step; // Adjust display step since we skipped PHONE
    }

    const stepIndicator = `Step ${displayStep} of 8`; // Updated to 8 steps since phone is auto-filled
    const promptText = `${stepIndicator}\n\n${prompts[currentStepName]}`;

    let message;
    if (currentStepName === "GENDER") {
      message = {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: promptText },
          action: {
            buttons: [
              { type: "reply", reply: { id: "gender_male", title: "Male" } },
              {
                type: "reply",
                reply: { id: "gender_female", title: "Female" },
              },
              {
                type: "reply",
                reply: { id: "gender_others", title: "Others" },
              },
            ],
          },
        },
      };
    } else {
      message = this.createNavigationMessage(to, promptText);
    }

    console.log(`Sending registration prompt for step ${currentStepName}`);
    await this.sendMessage(to, message);
  }

  getRegistrationPrompts() {
    return {
      NAME: "Please enter your Full Name:",
      FATHER_SPOUSE_GUARDIAN: "Please enter your Father/Spouse/Guardian Name:",
      DOB: "Please enter your Date of Birth (DD/MM/YYYY):",
      PHONE: "Please enter your Phone Number:",
      EMAIL: "Please enter your Email ID:",
      GENDER: "Please select your Gender:",
      VILLAGE: "Please enter your Village/Area:",
      PINCODE: "Please enter your Pin Code (6 digits):",
      AADHAR: "Please enter your Aadhar Number (12 digits):",
    };
  }

  async validateRegistrationInput(field, input) {
    const trimmedInput = input.trim();

    switch (field) {
      case "NAME":
      case "FATHER_SPOUSE_GUARDIAN":
      case "VILLAGE":
        if (trimmedInput.length < 2) {
          return {
            isValid: false,
            message: "Name must be at least 2 characters long.",
          };
        }
        return { isValid: true, value: trimmedInput };

      case "DOB":
        const dobPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if (!dobPattern.test(trimmedInput)) {
          return {
            isValid: false,
            message: "Please enter date in DD/MM/YYYY format.",
          };
        }
        const [, day, month, year] = trimmedInput.match(dobPattern);
        const date = new Date(year, month - 1, day);
        if (
          date.getDate() != day ||
          date.getMonth() != month - 1 ||
          date.getFullYear() != year
        ) {
          return { isValid: false, message: "Please enter a valid date." };
        }
        return { isValid: true, value: date };

      case "PHONE":
        const phonePattern = /^[6-9]\d{9}$/;
        const cleanPhone = trimmedInput.replace(/\D/g, "");
        if (!phonePattern.test(cleanPhone)) {
          return {
            isValid: false,
            message: "Please enter a valid 10-digit Indian phone number.",
          };
        }
        return { isValid: true, value: cleanPhone };

      case "EMAIL":
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedInput)) {
          return {
            isValid: false,
            message: "Please enter a valid email address.",
          };
        }
        return { isValid: true, value: trimmedInput.toLowerCase() };

      case "PINCODE":
        const pincodePattern = /^[0-9]{6}$/;
        const cleanPincode = trimmedInput.replace(/\D/g, "");
        if (!pincodePattern.test(cleanPincode)) {
          return {
            isValid: false,
            message: "Please enter a valid 6-digit pin code.",
          };
        }

        // Fetch location details using PIN code
        const locationDetails = await this.pinCodeService.getLocationDetails(
          cleanPincode
        );
        if (!locationDetails.success) {
          return {
            isValid: false,
            message: "Invalid PIN code. Please enter a valid PIN code.",
          };
        }

        return {
          isValid: true,
          value: cleanPincode,
          locationData: locationDetails.data,
        };

      case "AADHAR":
        const aadharPattern = /^[0-9]{12}$/;
        const cleanAadhar = trimmedInput.replace(/\D/g, "");
        if (!aadharPattern.test(cleanAadhar)) {
          return {
            isValid: false,
            message: "Please enter a valid 12-digit Aadhar number.",
          };
        }
        return { isValid: true, value: cleanAadhar };

      default:
        return { isValid: true, value: trimmedInput };
    }
  }

  async completeRegistration(to) {
    const session = this.sessionManager.getSession(to);
    const userData = session.data;
    const locationData = userData.locationData || {};

    console.log(
      `Showing confirmation for ${to}:`,
      JSON.stringify(userData, null, 2)
    );

    const confirmationText =
      "Registration Details Confirmation\n\n" +
      "Please verify all details are correct:\n\n" +
      `Name: ${userData.name}\n` +
      `Father/Spouse/Guardian: ${userData.father_spouse_guardian}\n` +
      `Date of Birth: ${userData.dob.toLocaleDateString()}\n` +
      `Phone: ${userData.phone}\n` +
      `Email: ${userData.email}\n` +
      `Gender: ${userData.gender}\n` +
      `Village: ${userData.village}\n` +
      `Pin Code: ${userData.pincode}\n` +
      `Post Office: ${locationData.postOffice || "TBD"}\n` +
      `Police Station: ${locationData.policeStation || "TBD"}\n` +
      `District: ${locationData.district || "TBD"}\n` +
      `Aadhar: ${userData.aadhar}\n\n` +
      "Confirm to save these details to database:";

    const message = {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: confirmationText },
        action: {
          buttons: [
            {
              type: "reply",
              reply: { id: "confirm_registration", title: "Confirm & Save" },
            },
            {
              type: "reply",
              reply: { id: "back_step", title: "Edit Details" },
            },
            { type: "reply", reply: { id: "exit_session", title: "Cancel" } },
          ],
        },
      },
    };

    await this.sendMessage(to, message);
  }

  async handleStatusCheck(to) {
    this.sessionManager.updateSession(to, {
      state: SessionManager.STATES.STATUS_CHECK,
      step: SessionManager.STATUS_CHECK_STEPS.CASE_ID_INPUT,
      data: {},
    });

    const message = this.createTextMessage(
      to,
      "🔍 **Complaint Status Check**\n\n" +
        "To check your complaint status, please provide your:\n\n" +
        "• Case Registration Number\n" +
        "• Acknowledgement Number\n\n" +
        "Please enter your Case ID or Acknowledgement Number:"
    );
    await this.sendMessage(to, message);
  }

  async handleAccountUnfreeze(to) {
    this.sessionManager.updateSession(to, {
      state: SessionManager.STATES.ACCOUNT_UNFREEZE,
      step: SessionManager.ACCOUNT_UNFREEZE_STEPS.ACCOUNT_INPUT,
      data: {},
    });

    const message = this.createTextMessage(
      to,
      "🔓 **Account Unfreeze Support**\n\n" +
        "To check your account freeze status, please provide:\n\n" +
        "• Your Account Number\n" +
        "• Your Phone Number\n\n" +
        "Please enter your Account Number or Phone Number:"
    );
    await this.sendMessage(to, message);
  }

  async handleOtherQueries(to) {
    const responseText =
      "❓ **Other Queries**\n\n" +
      "For other cyber crime related queries:\n\n" +
      "📞 Call our helpline: **1930**\n" +
      "🏛️ Visit nearest police station\n" +
      "📧 Email: cybercrime.odisha@gov.in\n\n" +
      "Or describe your query here and our team will assist you.";

    const message = this.createNavigationMessage(to, responseText);
    await this.sendMessage(to, message);
  }

  async handleExistingUser(to) {
    const message = this.createNavigationMessage(
      to,
      "Existing User\n\n" +
        "Great! Since you're already registered, please provide your Aadhar Number to proceed with your complaint:"
    );
    await this.sendMessage(to, message);
  }

  // New method to check user by phone number automatically
  async checkUserAndProceed(to) {
    // Extract 10-digit phone number from WhatsApp format
    const cleanPhone = to.replace(/^\+?91/, "").replace(/\D/g, "");
    const phoneNumber =
      cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);

    console.log(
      `Checking user for phone: ${to} -> converted to: ${phoneNumber}`
    );

    try {
      // Import Users model here to avoid circular dependency
      const { Users } = require("../models");
      const user = await Users.findOne({ phoneNumber: phoneNumber });

      if (user) {
        // User exists, show details and provide confirmation
        console.log(`Existing user found: ${user.name}`);
        const responseText =
          `Welcome back, ${user.name}!\n\n` +
          "Your details in our system:\n\n" +
          `Name: ${user.name}\n` +
          `Father/Spouse/Guardian: ${user.fatherSpouseGuardianName}\n` +
          `Phone: ${user.phoneNumber}\n` +
          `Email: ${user.emailid}\n` +
          `Village: ${user.address.village}\n` +
          `District: ${user.address.district}\n\n` +
          "Would you like to proceed with filing a complaint?";

        const message = {
          messaging_product: "whatsapp",
          to: to,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: responseText },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: { id: "proceed_complaint", title: "Next" },
                },
                { type: "reply", reply: { id: "main_menu", title: "Back" } },
                { type: "reply", reply: { id: "exit_session", title: "Exit" } },
              ],
            },
          },
        };

        await this.sendMessage(to, message);
      } else {
        // User doesn't exist, start registration
        console.log(`New user detected for phone: ${phoneNumber}`);
        const responseText =
          "New User Detected\n\n" +
          "I don't find your phone number in our records.\n\n" +
          "Let's register you first to proceed with the complaint.";

        const message = {
          messaging_product: "whatsapp",
          to: to,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: responseText },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "start_registration",
                    title: "Start Registration",
                  },
                },
                {
                  type: "reply",
                  reply: { id: "main_menu", title: "Main Menu" },
                },
                { type: "reply", reply: { id: "exit_session", title: "Exit" } },
              ],
            },
          },
        };

        await this.sendMessage(to, message);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      const errorMessage = this.createTextMessage(
        to,
        "Sorry, there was an error checking your details. Please try again."
      );
      await this.sendMessage(to, errorMessage);
    }
  }

  async handleComplaintDetails(to) {
    // Set session state for complaint filing
    this.sessionManager.updateSession(to, {
      state: SessionManager.STATES.COMPLAINT_FILING,
      step: "INCIDENT_DESCRIPTION",
    });

    // Ask user to choose between voice or text input with clickable buttons
    const choiceMessage = {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "📝 How would you like to provide the incident description?\n\nChoose your preferred method:",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "input_voice",
                title: "VOICE",
              },
            },
            {
              type: "reply",
              reply: {
                id: "input_text",
                title: "TEXT",
              },
            },
          ],
        },
      },
    };
    
    await this.sendMessage(to, choiceMessage);
  }

  async handleFinancialFraudSelection(to) {
    this.sessionManager.updateSession(to, {
      step: "FRAUD_TYPE_SELECTION",
      data: {
        ...this.sessionManager.getSession(to).data,
        category: "financial",
      },
    });

    const message = this.complaintService.createFinancialFraudTypesMessage(to);
    await this.sendMessage(to, message);
  }

  async handleSocialMediaFraudSelection(to) {
    this.sessionManager.updateSession(to, {
      step: "FRAUD_TYPE_SELECTION",
      data: {
        ...this.sessionManager.getSession(to).data,
        category: "social_media",
      },
    });

    const message =
      this.complaintService.createSocialMediaFraudTypesMessage(to);
    await this.sendMessage(to, message);
  }

  async handleComplaintConfirmation(to) {
    const session = this.sessionManager.getSession(to);
    const complaintData = session.data;

    try {
      // Here you would save the complaint to database
      // For now, we'll just show success message

      const message = this.complaintService.createComplaintSubmittedMessage(
        to,
        complaintData.caseId
      );
      await this.sendMessage(to, message);

      // Clear the session after successful submission
      this.sessionManager.clearSession(to);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      const errorMessage = this.createTextMessage(
        to,
        "Sorry, there was an error submitting your complaint. Please try again."
      );
      await this.sendMessage(to, errorMessage);
    }
  }

  // Handle VOICE button click
  async handleVoiceInputSelected(to) {
    const voiceInstructionMessage = this.createTextMessage(
      to,
      "🎤 Voice Input Selected\n\n" +
      "Please send a voice message describing the incident in English.\n\n" +
      "Speak clearly and include:\n" +
      "• What happened\n" +
      "• When it happened\n" +
      "• Amount lost (if any)\n" +
      "• Any other relevant details\n\n" +
      "⚠️ Important: Speak slowly and clearly in English for accurate transcription."
    );
    
    await this.sendMessage(to, voiceInstructionMessage);
    
    // Update session to expect voice input
    this.sessionManager.updateSession(to, {
      step: "AWAITING_VOICE_DESCRIPTION",
    });
  }

  // Handle TEXT button click
  async handleTextInputSelected(to) {
    const textInputMessage = this.createTextMessage(
      to,
      "✍️ Text Input Selected\n\n" +
      "Please type a detailed description of the incident:\n\n" +
      "Include:\n" +
      "• What happened\n" +
      "• When it happened\n" +
      "• Amount lost (if any)\n" +
      "• Any other relevant details"
    );
    
    await this.sendMessage(to, textInputMessage);
    
    // Update session to expect text description
    this.sessionManager.updateSession(to, {
      step: "AWAITING_TEXT_DESCRIPTION",
    });
  }
}

module.exports = WhatsAppService;
