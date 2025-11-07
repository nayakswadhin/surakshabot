const axios = require("axios");
const SessionManager = require("./sessionManager");
const PinCodeService = require("./pinCodeService");
const ComplaintService = require("./complaintService");
const CloudinaryService = require("./cloudinaryService");
require("dotenv").config();

class WhatsAppService {
  constructor() {
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_TOKEN;
    this.graphApiUrl = process.env.GRAPH_API_URL;
    this.sessionManager = new SessionManager();
    this.pinCodeService = new PinCodeService();
    this.complaintService = new ComplaintService();
    this.cloudinaryService = new CloudinaryService();

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

      // Registration flow - DiDiT Integration
      case "start_registration":
        // Start DiDiT verification flow instead of manual registration
        const VerificationRegistrationController = require("../controllers/verificationRegistrationController");
        await VerificationRegistrationController.startVerificationProcess(to);
        return;

      // Complaint flow buttons
      case "proceed_complaint":
        return await this.handleComplaintDetails(to);

      // Note: Gender selection buttons removed - now using DiDiT verification flow
      // Gender is auto-extracted from DiDiT Aadhar verification

      // Complaint flow buttons
      case "financial_fraud":
        return await this.handleFinancialFraudSelection(to);

      case "social_media_fraud":
        return await this.handleSocialMediaFraudSelection(to);

      case "confirm_complaint":
        return await this.handleComplaintConfirmation(to);

      // Location confirmation buttons
      case "location_yes":
        return await this.handleLocationConfirmation(to, true);

      case "location_no":
        return await this.handleLocationConfirmation(to, false);

      // Social Media specific buttons
      case "meta_done":
        return await this.handleMetaRegistrationDone(to);

      case "impersonation_yes":
        return await this.handleImpersonationResponse(to, true);

      case "impersonation_no":
        return await this.handleImpersonationResponse(to, false);

      // Final confirmation button
      case "yes_everything_correct":
        return await this.completeSocialMediaComplaint(to);

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
    } else if (session.state === SessionManager.STATES.DOCUMENT_COLLECTION) {
      // Handle back step in document collection
      const currentStep = session.step;
      const currentIndex = session.data.currentDocumentIndex || 0;

      if (currentIndex > 0) {
        // Go back to previous document
        const previousIndex = currentIndex - 1;
        const previousStep = SessionManager.DOCUMENT_FLOW[previousIndex];

        console.log(
          `Going back from document ${currentIndex + 1} to ${previousIndex + 1}`
        );

        // Delete the current document from Cloudinary if it exists
        if (session.data.documents && session.data.documents[currentStep]) {
          try {
            const docToDelete = session.data.documents[currentStep];
            await this.cloudinaryService.deleteImage(docToDelete.publicId);
            console.log(
              `Deleted image from Cloudinary: ${docToDelete.publicId}`
            );

            // Remove from session data
            delete session.data.documents[currentStep];
          } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
          }
        }

        // Update session to previous document
        this.sessionManager.updateSession(to, {
          step: previousStep,
          data: {
            ...session.data,
            currentDocumentIndex: previousIndex,
          },
        });

        // Show message and request previous document again
        const backMessage = this.createTextMessage(
          to,
          `⬅️ Going back to previous document.\n\nYou can now re-upload the document.`
        );
        await this.sendMessage(to, backMessage);

        setTimeout(async () => {
          await this.requestNextDocument(to);
        }, 1000);
      } else {
        // At first document, go back to fraud type selection
        console.log(`At first document, going back to complaint filing`);

        // Delete any uploaded documents from Cloudinary
        if (session.data.documents) {
          try {
            const publicIds = Object.values(session.data.documents)
              .filter((doc) => doc.publicId)
              .map((doc) => doc.publicId);

            if (publicIds.length > 0) {
              await this.cloudinaryService.deleteMultipleImages(publicIds);
              console.log(`Deleted ${publicIds.length} images from Cloudinary`);
            }
          } catch (error) {
            console.error("Error deleting images from Cloudinary:", error);
          }
        }

        this.sessionManager.updateSession(to, {
          state: SessionManager.STATES.COMPLAINT_FILING,
          step: "FRAUD_TYPE_SELECTION",
          data: {
            ...session.data,
            documents: undefined, // Clear documents
          },
        });

        // Show fraud type selection again
        const category = session.data.category;
        if (category === "financial") {
          const message =
            this.complaintService.createFinancialFraudTypesMessage(to);
          await this.sendMessage(to, message);
        } else {
          const message =
            this.complaintService.createSocialMediaFraudTypesMessage(to);
          await this.sendMessage(to, message);
        }
      }
    } else if (
      session.state === SessionManager.STATES.SOCIAL_MEDIA_DOCUMENT_COLLECTION
    ) {
      // Handle back step in Social Media document collection
      await this.handleSocialMediaBackStep(to, session);
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

  /**
   * Handle back step for Social Media document collection
   * @param {string} to - User phone number
   * @param {Object} session - Current session
   */
  async handleSocialMediaBackStep(to, session) {
    const currentStep = session.step;
    let previousStep = null;

    switch (currentStep) {
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.META_CONFIRMATION:
        // Go back to Meta link
        previousStep = SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.META_LINK;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.REQUEST_LETTER:
        // Go back to Meta confirmation
        previousStep =
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.META_CONFIRMATION;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.GOVT_ID:
        // Go back to request letter
        previousStep =
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.REQUEST_LETTER;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.DISPUTED_SCREENSHOTS:
        // Go back to govt ID
        previousStep = SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.GOVT_ID;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL:
        // Go back to disputed screenshots
        previousStep =
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.DISPUTED_SCREENSHOTS;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.IMPERSONATION_CHECK:
        // Go back to alleged URL
        previousStep = SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_SCREENSHOT:
        // Go back to impersonation check
        previousStep =
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.IMPERSONATION_CHECK;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL:
        // Go back to original ID screenshot
        previousStep =
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_SCREENSHOT;
        break;
      case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.FINAL_CONFIRMATION:
        // Go back based on whether this is an impersonation case
        if (session.data.isImpersonationCase) {
          previousStep =
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL;
        } else {
          previousStep =
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.IMPERSONATION_CHECK;
        }
        break;
      default:
        // Go back to fraud type selection if at first step
        this.sessionManager.updateSession(to, {
          state: SessionManager.STATES.COMPLAINT_FILING,
          step: "FRAUD_TYPE_SELECTION",
        });

        const message =
          this.complaintService.createSocialMediaFraudTypesMessage(to);
        await this.sendMessage(to, message);
        return;
    }

    if (previousStep) {
      // Delete current document if it exists
      if (
        session.data.socialMediaDocuments &&
        session.data.socialMediaDocuments[currentStep]
      ) {
        try {
          const docToDelete = session.data.socialMediaDocuments[currentStep];
          if (docToDelete.publicId) {
            await this.cloudinaryService.deleteImage(docToDelete.publicId);
            console.log(`Deleted Social Media image: ${docToDelete.publicId}`);
          }
          delete session.data.socialMediaDocuments[currentStep];
        } catch (error) {
          console.error("Error deleting Social Media image:", error);
        }
      }

      // Clear URLs if going back from URL steps
      if (
        currentStep ===
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL &&
        session.data.allegedUrls
      ) {
        session.data.allegedUrls = [];
      }
      if (
        currentStep ===
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL &&
        session.data.originalIdUrls
      ) {
        session.data.originalIdUrls = [];
      }

      // Update session to previous step
      this.sessionManager.updateSession(to, {
        step: previousStep,
        data: session.data,
      });

      const backMessage = this.createTextMessage(
        to,
        `⬅️ Going back to previous step.\n\nYou can now provide the required information again.`
      );
      await this.sendMessage(to, backMessage);

      // Show the previous step based on type
      setTimeout(async () => {
        if (
          previousStep ===
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.META_LINK
        ) {
          await this.sendMetaRegistrationLink(to);
        } else if (
          previousStep ===
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.IMPERSONATION_CHECK
        ) {
          await this.askImpersonationQuestion(to);
        } else {
          await this.requestSocialMediaDocument(to);
        }
      }, 1000);
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

    const message = this.complaintService.createIncidentDescriptionMessage(to);
    await this.sendMessage(to, message);
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

  async handleLocationConfirmation(to, isConfirmed) {
    const session = this.sessionManager.getSession(to);

    if (isConfirmed) {
      // Location confirmed, ask for fraud date
      this.sessionManager.updateSession(to, {
        step: "FRAUD_DATE",
      });

      const message = this.createTextMessage(
        to,
        `📅 *Fraud Date*\n\nPlease enter the date when the fraud occurred:\n\n*Format:* DD-MM-YYYY\n*Example:* 07-11-2024\n\n_Enter the date when you first noticed the fraud or when it happened._`
      );
      await this.sendMessage(to, message);
    } else {
      // Location not confirmed, ask for pincode again
      this.sessionManager.updateSession(to, {
        step: "FRAUD_PINCODE",
        data: {
          ...session.data,
          fraudLocation: undefined, // Clear previous location data
        },
      });

      const message = this.createTextMessage(
        to,
        `📍 *Fraud Location*\n\nPlease enter the correct 6-digit pincode where the fraud occurred:\n\n*Example:* 110001`
      );
      await this.sendMessage(to, message);
    }
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

  /**
   * Download image from WhatsApp media URL
   * @param {string} mediaId - WhatsApp media ID
   * @returns {Promise<Buffer>} Image buffer
   */
  async downloadImageFromWhatsApp(mediaId) {
    try {
      console.log(`Downloading image from WhatsApp with media ID: ${mediaId}`);

      // Step 1: Get media URL from WhatsApp
      const mediaResponse = await axios.get(`${this.graphApiUrl}/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      const mediaUrl = mediaResponse.data.url;
      console.log(`Media URL retrieved: ${mediaUrl}`);

      // Step 2: Download the actual image file
      const imageResponse = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        responseType: "arraybuffer", // Important for binary data
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      console.log(
        `Image downloaded successfully, size: ${imageBuffer.length} bytes`
      );

      return {
        buffer: imageBuffer,
        mimeType: imageResponse.headers["content-type"] || "image/jpeg",
        size: imageBuffer.length,
      };
    } catch (error) {
      console.error("Error downloading image from WhatsApp:", error);
      throw new Error("Failed to download image from WhatsApp");
    }
  }

  /**
   * Handle image message and upload to Cloudinary
   * @param {string} from - User phone number
   * @param {Object} imageMessage - WhatsApp image message object
   * @returns {Promise<Object>} Upload result
   */
  async handleImageMessage(from, imageMessage) {
    try {
      console.log(`Processing image message from ${from}`);

      const session = this.sessionManager.getSession(from);
      if (
        !session ||
        (session.state !== SessionManager.STATES.DOCUMENT_COLLECTION &&
          session.state !==
            SessionManager.STATES.SOCIAL_MEDIA_DOCUMENT_COLLECTION)
      ) {
        throw new Error("Invalid session state for image upload");
      }

      // Validate image format and size
      const validation = this.cloudinaryService.validateImage(
        imageMessage.mime_type,
        parseInt(imageMessage.file_size || "0")
      );

      if (!validation.isValid) {
        const errorMessage = `❌ **Invalid Image**\n\n${Object.values(
          validation.errors
        ).join(
          "\n"
        )}\n\nPlease send a valid image file (JPG, PNG, GIF, WebP) under 10MB.`;
        await this.sendMessage(
          from,
          this.createTextMessage(from, errorMessage)
        );
        return null;
      }

      // Download image from WhatsApp
      const { buffer, mimeType } = await this.downloadImageFromWhatsApp(
        imageMessage.id
      );

      // Get current document type from session
      const currentDocumentType = session.step;
      const fileName = `${currentDocumentType}_${Date.now()}.jpg`;
      const folderPath =
        this.cloudinaryService.getFolderPath(currentDocumentType);

      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(
        buffer,
        fileName,
        folderPath
      );

      console.log(
        `Image uploaded successfully for ${from}: ${uploadResult.url}`
      );

      // Store in session data based on document collection type
      const isFinancialFraud =
        session.state === SessionManager.STATES.DOCUMENT_COLLECTION;
      const documentsKey = isFinancialFraud
        ? "documents"
        : "socialMediaDocuments";

      if (!session.data[documentsKey]) {
        session.data[documentsKey] = {};
      }

      session.data[documentsKey][currentDocumentType] = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        fileName: uploadResult.fileName,
        documentType: currentDocumentType,
        uploadedAt: uploadResult.uploadedAt,
      };

      this.sessionManager.updateSession(from, {
        data: session.data,
      });

      return uploadResult;
    } catch (error) {
      console.error("Error handling image message:", error);
      throw error;
    }
  }

  /**
   * Start document collection flow for financial fraud
   * @param {string} from - User phone number
   */
  async startDocumentCollection(from) {
    try {
      console.log(`Starting document collection for ${from}`);

      const session = this.sessionManager.getSession(from);
      if (!session) {
        throw new Error("No active session found");
      }

      // Send initial message about document collection
      const introMessage = this.createTextMessage(
        from,
        `Fraud Type Selected: ${session.data.fraudType}\n\n` +
          `📋 Document Collection Required\n\n` +
          `For financial fraud cases, we need you to upload 8 supporting documents.\n\n` +
          `Let's start with the first document:`
      );
      await this.sendMessage(from, introMessage);

      // Update session to document collection state
      this.sessionManager.updateSession(from, {
        state: SessionManager.STATES.DOCUMENT_COLLECTION,
        step: SessionManager.DOCUMENT_COLLECTION_STEPS.AADHAR_PAN,
        data: {
          ...session.data,
          documents: {},
          currentDocumentIndex: 0,
        },
      });

      // Small delay then request first document
      setTimeout(async () => {
        await this.requestNextDocument(from);
      }, 1500);
    } catch (error) {
      console.error("Error starting document collection:", error);
      const errorMessage = this.createTextMessage(
        from,
        "Sorry, there was an error starting document collection. Please try again."
      );
      await this.sendMessage(from, errorMessage);
    }
  }

  /**
   * Request next document from user
   * @param {string} from - User phone number
   */
  async requestNextDocument(from) {
    try {
      const session = this.sessionManager.getSession(from);
      const currentStep = session.step;
      const documentDisplayName =
        SessionManager.getDocumentDisplayName(currentStep);
      const currentIndex = (session.data.currentDocumentIndex || 0) + 1;
      const totalDocuments = SessionManager.DOCUMENT_FLOW.length;

      const messageText =
        `📷 Document Upload (${currentIndex}/${totalDocuments})\n\n` +
        `Please upload: ${documentDisplayName}\n\n` +
        `📋 Important:\n` +
        `• Send image only (JPG, PNG, GIF, WebP)\n` +
        `• Maximum file size: 10MB\n` +
        `• Ensure document is clear and readable\n` +
        `• Include all relevant details\n\n` +
        `Send your image now:`;

      const message = {
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: messageText },
          action: {
            buttons: [
              { type: "reply", reply: { id: "back_step", title: "Back" } },
              { type: "reply", reply: { id: "main_menu", title: "Main Menu" } },
              { type: "reply", reply: { id: "exit_session", title: "Exit" } },
            ],
          },
        },
      };

      await this.sendMessage(from, message);
    } catch (error) {
      console.error("Error requesting next document:", error);
      throw error;
    }
  }

  /**
   * Process document upload and move to next step
   * @param {string} from - User phone number
   * @param {Object} uploadResult - Cloudinary upload result
   */
  async processDocumentUpload(from, uploadResult) {
    try {
      console.log(`Processing document upload for ${from}`);
      console.log(`Upload result:`, uploadResult);

      const session = this.sessionManager.getSession(from);
      if (!session) {
        throw new Error("No active session found");
      }

      const currentStep = session.step;
      console.log(`Current step: ${currentStep}`);

      const nextStep = SessionManager.getNextDocumentStep(currentStep);
      console.log(`Next step: ${nextStep}`);

      // Send confirmation message
      const confirmationText =
        `Document Uploaded Successfully\n\n` +
        `${SessionManager.getDocumentDisplayName(
          currentStep
        )} has been saved.\n\n`;

      if (nextStep) {
        // More documents to collect
        const updatedSession = this.sessionManager.updateSession(from, {
          step: nextStep,
          data: {
            ...session.data,
            currentDocumentIndex: (session.data.currentDocumentIndex || 0) + 1,
          },
        });

        await this.sendMessage(
          from,
          this.createTextMessage(
            from,
            confirmationText + "Preparing next document request..."
          )
        );

        // Small delay before requesting next document
        setTimeout(async () => {
          try {
            await this.requestNextDocument(from);
          } catch (error) {
            console.error("Error requesting next document:", error);
          }
        }, 1000);
      } else {
        // All documents collected, complete the complaint
        await this.sendMessage(
          from,
          this.createTextMessage(
            from,
            confirmationText +
              "All documents collected. Creating your complaint..."
          )
        );

        setTimeout(async () => {
          try {
            await this.completeComplaint(from);
          } catch (error) {
            console.error("Error completing complaint:", error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error processing document upload:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);

      const errorMessage = this.createTextMessage(
        from,
        "Sorry, there was an error processing your document. Please try uploading again."
      );
      await this.sendMessage(from, errorMessage);
    }
  }

  /**
   * Complete complaint creation with all documents
   * @param {string} from - User phone number
   */
  async completeComplaint(from) {
    try {
      console.log(`Completing complaint for ${from}`);

      const session = this.sessionManager.getSession(from);
      const complaintData = session.data;

      // Get user information
      const cleanPhone = from.replace(/^\+?91/, "").replace(/\D/g, "");
      const phoneNumber =
        cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);

      const user = await require("../models").Users.findOne({
        phoneNumber: phoneNumber,
      });
      if (!user) {
        throw new Error("User not found for complaint creation");
      }

      // Prepare documents array for CaseDetails
      const documentsArray = Object.values(complaintData.documents || {}).map(
        (doc) => ({
          documentType: doc.documentType,
          url: doc.url,
          fileName: doc.fileName,
          publicId: doc.publicId,
          uploadedAt: doc.uploadedAt,
        })
      );

      console.log(`Creating case with ${documentsArray.length} documents`);

      // Combine fraud date and time into timestamp
      let fraudTimestamp = null;
      if (complaintData.fraudDateObj && complaintData.fraudTime) {
        const [hours, minutes] = complaintData.fraudTime.split(":");
        fraudTimestamp = new Date(complaintData.fraudDateObj);
        fraudTimestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      // Create new Case
      const newCase = new (require("../models").Cases)({
        caseId: complaintData.caseId,
        aadharNumber: user.aadharNumber,
        incidentDescription:
          complaintData.incident || "Financial fraud incident",
        fraudLocation: complaintData.fraudLocation || {},
        fraudDateTime: {
          date: complaintData.fraudDate,
          time: complaintData.fraudTime,
          timestamp: fraudTimestamp,
        },
        caseCategory:
          complaintData.category === "financial" ? "Financial" : "Social",
        typeOfFraud: complaintData.fraudType,
        status: "pending",
      });

      const savedCase = await newCase.save();
      console.log(`Case saved with ID: ${savedCase._id}`);

      // Create CaseDetails with documents
      const newCaseDetails = new (require("../models").CaseDetails)({
        caseId: savedCase._id,
        photos: documentsArray,
      });

      const savedCaseDetails = await newCaseDetails.save();
      console.log(`CaseDetails saved with ID: ${savedCaseDetails._id}`);

      // Update Case with CaseDetails reference
      savedCase.caseDetailsId = savedCaseDetails._id;
      await savedCase.save();

      // Update User's caseIds array
      user.caseIds.push(savedCase._id);
      await user.save();

      console.log(`Complaint completed successfully for ${from}`);

      const successText =
        `🎉 Complaint Filed Successfully!\n\n` +
        `📋 Case ID: ${complaintData.caseId}\n\n` +
        `✅ Summary:\n` +
        `• Incident: ${
          complaintData.incident || "Financial fraud incident"
        }\n` +
        (complaintData.fraudLocation
          ? `• Location: ${complaintData.fraudLocation.area || "N/A"}, ${
              complaintData.fraudLocation.district || "N/A"
            } (${complaintData.fraudLocation.pincode})\n`
          : "") +
        (complaintData.fraudDate
          ? `• Date & Time: ${complaintData.fraudDate} at ${
              complaintData.fraudTime || "N/A"
            }\n`
          : "") +
        `• Category: ${
          complaintData.category === "financial"
            ? "Financial Fraud"
            : "Social Media Fraud"
        }\n` +
        `• Fraud Type: ${complaintData.fraudType}\n` +
        `• Documents Uploaded: ${documentsArray.length}/8\n\n` +
        `📞 Our team will contact you within 24 hours.\n\n` +
        `Keep your Case ID for future reference.\n\n` +
        `You can check status anytime using "Status Check" option.`;

      const message = this.createNavigationMessage(from, successText);
      await this.sendMessage(from, message);

      // Clear session
      this.sessionManager.clearSession(from);
    } catch (error) {
      console.error("Error completing complaint:", error);

      // Send error message to user
      const errorMessage = this.createTextMessage(
        from,
        "❌ Sorry, there was an error completing your complaint. Your documents have been uploaded but there was an issue saving to our system.\n\nPlease contact 1930 for assistance and mention your uploaded documents."
      );
      await this.sendMessage(from, errorMessage);

      // Don't clear session in case of error so user can retry
    }
  }

  /**
   * Start Social Media document collection flow
   * @param {string} from - User phone number
   */
  async startSocialMediaDocumentCollection(from) {
    try {
      console.log(`Starting Social Media document collection for ${from}`);

      const session = this.sessionManager.getSession(from);
      if (!session) {
        throw new Error("No active session found");
      }

      // Update session to social media document collection state
      this.sessionManager.updateSession(from, {
        state: SessionManager.STATES.SOCIAL_MEDIA_DOCUMENT_COLLECTION,
        step: SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.META_LINK,
        data: {
          ...session.data,
          socialMediaDocuments: {},
          allegedUrls: [],
          originalIdUrls: [],
          isImpersonationCase: false,
          metaRegistrationDone: false,
        },
      });

      // Send Meta registration link immediately
      await this.sendMetaRegistrationLink(from);
    } catch (error) {
      console.error("Error starting Social Media document collection:", error);
      const errorMessage = this.createTextMessage(
        from,
        "Sorry, there was an error starting Social Media document collection. Please try again."
      );
      await this.sendMessage(from, errorMessage);
    }
  }

  /**
   * Send Meta India registration link
   * @param {string} from - User phone number
   */
  async sendMetaRegistrationLink(from) {
    try {
      const session = this.sessionManager.getSession(from);
      const fraudType = session?.data?.fraudType;

      // Get platform-specific link and platform name
      let registrationLink = "";
      let platformName = "";

      switch (fraudType) {
        case "twitter_fraud":
          registrationLink = "https://help.x.com/en/forms/account-access";
          platformName = "X (Twitter)";
          break;
        case "whatsapp_fraud":
          registrationLink =
            "https://www.whatsapp.com/contact/forms/1534459096974129";
          platformName = "WhatsApp";
          break;
        case "telegram_fraud":
          registrationLink = "https://telegram.org/support";
          platformName = "Telegram";
          break;
        case "facebook_fraud":
        case "instagram_fraud":
        default:
          registrationLink = "https://help.meta.com/requests/1371776380779082/";
          platformName = "Meta (Facebook/Instagram)";
          break;
      }

      const messageText =
        `� Social Media Fraud Process\n\n` +
        `Register on the ${platformName} link given below:\n\n` +
        `${registrationLink}\n\n` +
        `📋 Steps to follow:\n` +
        `1. Click the link above\n` +
        `2. Fill out the complaint form\n` +
        `3. Submit your complaint to ${platformName}\n` +
        `4. Come back and click "Yes I'm Done"\n\n` +
        `This registration is mandatory for Social Media fraud cases.`;

      const message = {
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: messageText },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "meta_done", title: "Yes I'm Done" },
              },
              { type: "reply", reply: { id: "back_step", title: "Back" } },
              { type: "reply", reply: { id: "exit_session", title: "Exit" } },
            ],
          },
        },
      };

      await this.sendMessage(from, message);
    } catch (error) {
      console.error("Error sending Meta registration link:", error);
      throw error;
    }
  }

  /**
   * Handle Meta registration completion
   * @param {string} from - User phone number
   */
  async handleMetaRegistrationDone(from) {
    try {
      const session = this.sessionManager.getSession(from);

      // Update session with Meta registration completed
      this.sessionManager.updateSession(from, {
        step: SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.REQUEST_LETTER,
        data: {
          ...session.data,
          metaRegistrationDone: true,
        },
      });

      const confirmationText =
        `✅ Meta Registration Completed!\n\n` +
        `Now let's collect the required documents for your case.\n\n` +
        `We need these documents:\n` +
        `1. Request Letter (Acknowledgement Screenshot)\n` +
        `2. Aadhar Card / Any Govt. Issue ID\n` +
        `3. Disputed Screenshots\n` +
        `4. Alleged URL\n\n` +
        `Let's start with the first document:`;

      await this.sendMessage(
        from,
        this.createTextMessage(from, confirmationText)
      );

      // Small delay before requesting first document
      setTimeout(async () => {
        await this.requestSocialMediaDocument(from);
      }, 1500);
    } catch (error) {
      console.error("Error handling Meta registration completion:", error);
      const errorMessage = this.createTextMessage(
        from,
        "❌ Sorry, there was an error. Please try again."
      );
      await this.sendMessage(from, errorMessage);
    }
  }

  /**
   * Request specific social media document from user
   * @param {string} from - User phone number
   */
  async requestSocialMediaDocument(from) {
    try {
      const session = this.sessionManager.getSession(from);
      const currentStep = session.step;
      const documentDisplayName =
        SessionManager.getSocialMediaDisplayName(currentStep);

      if (
        currentStep === SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL
      ) {
        // Special handling for URL input
        const messageText =
          `� Document Required\n\n` +
          `Please provide: ${documentDisplayName}\n\n` +
          `📝 Instructions:\n` +
          `• Send the URL as a text message (not image)\n` +
          `• Copy and paste the full URL\n` +
          `• Must be a valid web address\n` +
          `• Example: https://facebook.com/fake.profile\n\n` +
          `Send the URL now:`;

        const message = {
          messaging_product: "whatsapp",
          to: from,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: messageText },
            action: {
              buttons: [
                { type: "reply", reply: { id: "back_step", title: "Back" } },
                {
                  type: "reply",
                  reply: { id: "main_menu", title: "Main Menu" },
                },
                { type: "reply", reply: { id: "exit_session", title: "Exit" } },
              ],
            },
          },
        };

        await this.sendMessage(from, message);
      } else {
        // Regular image document request
        let specificInstructions = "";

        switch (currentStep) {
          case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.REQUEST_LETTER:
            specificInstructions = `📋 Instructions:\n• Screenshot of Meta registration acknowledgement\n• Must show submission confirmation\n• Include reference number if available\n\n`;
            break;
          case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.GOVT_ID:
            specificInstructions = `📋 Instructions:\n• Clear photo of Aadhar/PAN/Voter ID/Passport\n• Ensure all details are readable\n• Front side of the document\n\n`;
            break;
          case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS
            .DISPUTED_SCREENSHOTS:
            specificInstructions = `📋 Instructions:\n• Screenshots of fake/fraudulent posts\n• Include multiple screenshots if needed\n• Show timestamp and platform details\n\n`;
            break;
        }

        const messageText =
          `� Document Upload Required\n\n` +
          `Please upload: ${documentDisplayName}\n\n` +
          specificInstructions +
          `📷 Image Requirements:\n` +
          `• Send image only (JPG, PNG, GIF, WebP)\n` +
          `• Maximum file size: 10MB\n` +
          `• Ensure content is clear and readable\n\n` +
          `Send your image now:`;

        const message = {
          messaging_product: "whatsapp",
          to: from,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: messageText },
            action: {
              buttons: [
                { type: "reply", reply: { id: "back_step", title: "Back" } },
                {
                  type: "reply",
                  reply: { id: "main_menu", title: "Main Menu" },
                },
                { type: "reply", reply: { id: "exit_session", title: "Exit" } },
              ],
            },
          },
        };

        await this.sendMessage(from, message);
      }
    } catch (error) {
      console.error("Error requesting social media document:", error);
      throw error;
    }
  }

  /**
   * Process social media document upload
   * @param {string} from - User phone number
   * @param {Object} uploadResult - Cloudinary upload result or URL text
   * @param {string} inputType - 'image' or 'text'
   */
  async processSocialMediaDocument(from, uploadResult, inputType = "image") {
    try {
      console.log(
        `Processing Social Media document for ${from}, type: ${inputType}`
      );
      console.log(`Upload result:`, uploadResult);

      const session = this.sessionManager.getSession(from);
      if (!session) {
        throw new Error("No active session found");
      }

      const currentStep = session.step;
      console.log(`Current step: ${currentStep}`);

      // Store the document/URL
      if (inputType === "image") {
        if (!session.data.socialMediaDocuments) {
          session.data.socialMediaDocuments = {};
        }
        session.data.socialMediaDocuments[currentStep] = uploadResult;
      } else if (
        inputType === "text" &&
        currentStep === SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL
      ) {
        if (!session.data.allegedUrls) {
          session.data.allegedUrls = [];
        }
        session.data.allegedUrls.push(uploadResult);
      }

      // Send confirmation
      const confirmationText =
        `${
          inputType === "image" ? "Document" : "URL"
        } Received Successfully\n\n` +
        `${SessionManager.getSocialMediaDisplayName(
          currentStep
        )} has been saved.\n\n`;

      await this.sendMessage(
        from,
        this.createTextMessage(
          from,
          confirmationText + "Moving to next step..."
        )
      );

      // Move to next step
      setTimeout(async () => {
        try {
          await this.moveToNextSocialMediaStep(from);
        } catch (error) {
          console.error("Error moving to next step:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error processing social media document:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);

      const errorMessage = this.createTextMessage(
        from,
        "Sorry, there was an error processing your submission. Please try again."
      );
      await this.sendMessage(from, errorMessage);
    }
  }

  /**
   * Move to next step in social media flow
   * @param {string} from - User phone number
   */
  async moveToNextSocialMediaStep(from) {
    try {
      const session = this.sessionManager.getSession(from);
      const currentStep = session.step;

      let nextStep = null;

      switch (currentStep) {
        case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.REQUEST_LETTER:
          nextStep = SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.GOVT_ID;
          break;
        case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.GOVT_ID:
          nextStep =
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.DISPUTED_SCREENSHOTS;
          break;
        case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.DISPUTED_SCREENSHOTS:
          nextStep = SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL;
          break;
        case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL:
          nextStep =
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.IMPERSONATION_CHECK;
          break;
        case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS
          .ORIGINAL_ID_SCREENSHOT:
          nextStep =
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL;
          break;
        case SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL:
          // Go to final confirmation
          nextStep =
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.FINAL_CONFIRMATION;
          break;
      }

      if (nextStep) {
        this.sessionManager.updateSession(from, { step: nextStep });

        if (
          nextStep ===
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.IMPERSONATION_CHECK
        ) {
          await this.askImpersonationQuestion(from);
        } else if (
          nextStep ===
          SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.FINAL_CONFIRMATION
        ) {
          await this.askFinalConfirmation(from);
        } else {
          await this.requestSocialMediaDocument(from);
        }
      }
    } catch (error) {
      console.error("Error moving to next social media step:", error);
      throw error;
    }
  }

  /**
   * Ask user if this is an impersonation case
   * @param {string} from - User phone number
   */
  async askImpersonationQuestion(from) {
    try {
      const messageText =
        `❓ Final Question\n\n` +
        `Is this case about Fake/Impersonation IDs?\n\n` +
        `This includes:\n` +
        `• Someone creating fake profiles using your identity\n` +
        `• Someone pretending to be you\n` +
        `• Identity theft on social media\n\n` +
        `Please select:`;

      const message = {
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: messageText },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "impersonation_yes", title: "Yes" },
              },
              { type: "reply", reply: { id: "impersonation_no", title: "No" } },
              { type: "reply", reply: { id: "back_step", title: "Back" } },
            ],
          },
        },
      };

      await this.sendMessage(from, message);
    } catch (error) {
      console.error("Error asking impersonation question:", error);
      throw error;
    }
  }

  /**
   * Handle impersonation case response
   * @param {string} from - User phone number
   * @param {boolean} isImpersonation - Whether this is an impersonation case
   */
  async handleImpersonationResponse(from, isImpersonation) {
    try {
      const session = this.sessionManager.getSession(from);

      if (isImpersonation) {
        // Update session for impersonation case
        this.sessionManager.updateSession(from, {
          step: SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS
            .ORIGINAL_ID_SCREENSHOT,
          data: {
            ...session.data,
            isImpersonationCase: true,
          },
        });

        const messageText =
          `✅ Impersonation Case Confirmed\n\n` +
          `We need 2 additional items:\n\n` +
          `• Original ID Screenshot (your real profile)\n` +
          `• Original ID URL (your real profile link)\n\n` +
          `Let's collect these now:`;

        await this.sendMessage(from, this.createTextMessage(from, messageText));

        setTimeout(async () => {
          await this.requestSocialMediaDocument(from);
        }, 1500);
      } else {
        // Not an impersonation case, go to final confirmation
        this.sessionManager.updateSession(from, {
          step: SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.FINAL_CONFIRMATION,
          data: {
            ...session.data,
            isImpersonationCase: false,
          },
        });

        const messageText =
          `✅ Document Collection Complete!\n\n` +
          `All required information has been collected.\n\n` +
          `Please confirm your information before submission...`;

        await this.sendMessage(from, this.createTextMessage(from, messageText));

        setTimeout(async () => {
          await this.askFinalConfirmation(from);
        }, 1000);
      }
    } catch (error) {
      console.error("Error handling impersonation response:", error);
      const errorMessage = this.createTextMessage(
        from,
        "❌ Sorry, there was an error. Please try again."
      );
      await this.sendMessage(from, errorMessage);
    }
  }

  /**
   * Get display name for fraud type
   * @param {string} fraudType - Fraud type code
   * @returns {string} Display name
   */
  getFraudTypeDisplay(fraudType) {
    const fraudTypes = {
      facebook_fraud: "Facebook Fraud",
      instagram_fraud: "Instagram Fraud",
      twitter_fraud: "X (Twitter) Fraud",
      linkedin_fraud: "LinkedIn Fraud",
      youtube_fraud: "YouTube Fraud",
      tiktok_fraud: "TikTok Fraud",
      snapchat_fraud: "Snapchat Fraud",
      whatsapp_fraud: "WhatsApp Fraud",
      telegram_fraud: "Telegram Fraud",
      other_social_media: "Other Social Media Fraud",
    };
    return fraudTypes[fraudType] || fraudType || "Social Media Fraud";
  }

  /**
   * Ask user for final confirmation before saving to database
   * @param {string} from - User phone number
   */
  async askFinalConfirmation(from) {
    try {
      const session = this.sessionManager.getSession(from);
      const data = session.data;

      // Count documents
      let docCount = 0;
      if (data.photos) {
        docCount = data.photos.length;
      }

      // Get fraud type details
      const fraudTypeDisplay = this.getFraudTypeDisplay(data.selectedFraudType);

      // Build summary message
      const summaryText =
        `📋 Please Review Your Information\n\n` +
        `✅ Summary:\n` +
        `• Incident: ${data.incident || "N/A"}\n` +
        `• Category: Social Media Fraud\n` +
        `• Fraud Type: ${fraudTypeDisplay}\n` +
        `• Meta Registration: ${
          data.metaRegistrationDone ? "Completed" : "Not Done"
        }\n` +
        `• Impersonation Case: ${data.isImpersonationCase ? "Yes" : "No"}\n` +
        `• Documents Uploaded: ${docCount}\n` +
        `• URLs Collected: ${
          data.allegedUrls ? data.allegedUrls.length : 0
        }\n\n` +
        `❓ All information provided by you is true as per your knowledge?\n\n` +
        `Select an option:`;

      const message = {
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: summaryText },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "yes_everything_correct", title: "Yes, Confirm" },
              },
              { type: "reply", reply: { id: "back_step", title: "Back" } },
              { type: "reply", reply: { id: "exit_session", title: "Exit" } },
            ],
          },
        },
      };

      await this.sendMessage(from, message);
    } catch (error) {
      console.error("Error asking final confirmation:", error);
      throw error;
    }
  }

  /**
   * Handle URL input for Social Media documents
   * @param {string} from - User phone number
   * @param {string} url - URL text
   */
  async handleSocialMediaUrlInput(from, url) {
    try {
      const session = this.sessionManager.getSession(from);
      const currentStep = session.step;

      // More strict URL validation
      const urlPattern =
        /^(https?:\/\/)?(www\.)?(facebook\.com|instagram\.com|twitter\.com|linkedin\.com|youtube\.com|tiktok\.com|snapchat\.com|whatsapp\.com|telegram\.org|[\da-z\.-]+\.[a-z]{2,6})(\/[\w\.-]*)*\/?(\?[\w&=\.-]*)?$/i;

      const trimmedUrl = url.trim();

      // Check if URL is too short or doesn't contain basic URL structure
      if (trimmedUrl.length < 4 || !trimmedUrl.includes(".")) {
        const errorMessage = this.createTextMessage(
          from,
          "❌ Invalid URL format. Please send a valid web address.\n\n📝 Examples:\n• https://facebook.com/fake.profile\n• https://instagram.com/suspicious.account\n• www.example.com/fake-page\n\n⚠️ Please send URLs only, not images or random text.\n\nTry again:"
        );
        await this.sendMessage(from, errorMessage);
        return;
      }

      // Validate URL format
      if (!urlPattern.test(trimmedUrl)) {
        const errorMessage = this.createTextMessage(
          from,
          "❌ Invalid URL format detected.\n\n✅ Valid URL examples:\n• https://facebook.com/fake.profile\n• instagram.com/suspicious.account\n• twitter.com/fake.user\n• linkedin.com/in/fake-profile\n\n❌ Please do not send:\n• Images or screenshots\n• Random text\n• Incomplete URLs\n\nSend a valid URL:"
        );
        await this.sendMessage(from, errorMessage);
        return;
      }

      // Add protocol if missing
      let processedUrl = trimmedUrl;
      if (
        !processedUrl.startsWith("http://") &&
        !processedUrl.startsWith("https://")
      ) {
        processedUrl = "https://" + processedUrl;
      }

      // Process the URL
      if (
        currentStep === SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL
      ) {
        await this.processSocialMediaDocument(from, processedUrl, "text");
      } else if (
        currentStep ===
        SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL
      ) {
        // Store original ID URL
        if (!session.data.originalIdUrls) {
          session.data.originalIdUrls = [];
        }
        session.data.originalIdUrls.push(processedUrl);
        await this.processSocialMediaDocument(from, processedUrl, "text");
      }
    } catch (error) {
      console.error("Error handling social media URL input:", error);
      const errorMessage = this.createTextMessage(
        from,
        "❌ Sorry, there was an error processing your URL. Please send a valid web address and try again."
      );
      await this.sendMessage(from, errorMessage);
    }
  }

  /**
   * Complete Social Media complaint creation with all documents
   * @param {string} from - User phone number
   */
  async completeSocialMediaComplaint(from) {
    try {
      console.log(`Completing Social Media complaint for ${from}`);

      const session = this.sessionManager.getSession(from);
      const complaintData = session.data;

      // Get user information
      const cleanPhone = from.replace(/^\+?91/, "").replace(/\D/g, "");
      const phoneNumber =
        cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);

      const user = await require("../models").Users.findOne({
        phoneNumber: phoneNumber,
      });
      if (!user) {
        throw new Error("User not found for complaint creation");
      }

      // Prepare documents array for CaseDetails
      const documentsArray = Object.values(
        complaintData.socialMediaDocuments || {}
      ).map((doc) => ({
        documentType: doc.documentType,
        url: doc.url,
        fileName: doc.fileName,
        publicId: doc.publicId,
        uploadedAt: doc.uploadedAt,
      }));

      console.log(
        `Creating Social Media case with ${documentsArray.length} documents`
      );

      // Combine fraud date and time into timestamp
      let fraudTimestamp = null;
      if (complaintData.fraudDateObj && complaintData.fraudTime) {
        const [hours, minutes] = complaintData.fraudTime.split(":");
        fraudTimestamp = new Date(complaintData.fraudDateObj);
        fraudTimestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      // Create new Case
      const newCase = new (require("../models").Cases)({
        caseId: complaintData.caseId,
        aadharNumber: user.aadharNumber,
        incidentDescription:
          complaintData.incident || "Social Media fraud incident",
        fraudLocation: complaintData.fraudLocation || {},
        fraudDateTime: {
          date: complaintData.fraudDate,
          time: complaintData.fraudTime,
          timestamp: fraudTimestamp,
        },
        caseCategory: "Social",
        typeOfFraud: complaintData.fraudType,
        status: "pending",
      });

      const savedCase = await newCase.save();
      console.log(`Case saved with ID: ${savedCase._id}`);

      // Create CaseDetails with Social Media specific fields
      const newCaseDetails = new (require("../models").CaseDetails)({
        caseId: savedCase._id,
        photos: documentsArray,
        metaRegistrationDone: complaintData.metaRegistrationDone || false,
        isImpersonationCase: complaintData.isImpersonationCase || false,
        allegedUrls: complaintData.allegedUrls || [],
        originalIdUrls: complaintData.originalIdUrls || [],
      });

      const savedCaseDetails = await newCaseDetails.save();
      console.log(`CaseDetails saved with ID: ${savedCaseDetails._id}`);

      // Update Case with CaseDetails reference
      savedCase.caseDetailsId = savedCaseDetails._id;
      await savedCase.save();

      // Update User's caseIds array
      user.caseIds.push(savedCase._id);
      await user.save();

      console.log(`Social Media complaint completed successfully for ${from}`);

      const totalDocs = complaintData.isImpersonationCase ? 6 : 4;
      const successText =
        `🎉 Social Media Complaint Filed Successfully!\n\n` +
        `📋 Case ID: ${complaintData.caseId}\n\n` +
        `✅ Summary:\n` +
        `• Incident: ${
          complaintData.incident || "Social Media fraud incident"
        }\n` +
        (complaintData.fraudLocation
          ? `• Location: ${complaintData.fraudLocation.area || "N/A"}, ${
              complaintData.fraudLocation.district || "N/A"
            } (${complaintData.fraudLocation.pincode})\n`
          : "") +
        (complaintData.fraudDate
          ? `• Date & Time: ${complaintData.fraudDate} at ${
              complaintData.fraudTime || "N/A"
            }\n`
          : "") +
        `• Category: Social Media Fraud\n` +
        `• Fraud Type: ${complaintData.fraudType}\n` +
        `• Meta Registration: ${
          complaintData.metaRegistrationDone ? "Completed" : "Pending"
        }\n` +
        `• Impersonation Case: ${
          complaintData.isImpersonationCase ? "Yes" : "No"
        }\n` +
        `• Documents Uploaded: ${documentsArray.length}/${totalDocs}\n\n` +
        `📞 Our team will coordinate with Meta India and contact you within 24-48 hours.\n\n` +
        `Keep your Case ID for future reference.\n\n` +
        `You can check status anytime using "Status Check" option.`;

      const message = {
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: successText },
          action: {
            buttons: [
              { type: "reply", reply: { id: "main_menu", title: "Main Menu" } },
              { type: "reply", reply: { id: "exit_session", title: "Exit" } },
            ],
          },
        },
      };
      await this.sendMessage(from, message);

      // Clear session
      this.sessionManager.clearSession(from);
    } catch (error) {
      console.error("Error completing Social Media complaint:", error);

      // Send error message to user
      const errorMessage = this.createTextMessage(
        from,
        "❌ Sorry, there was an error completing your Social Media complaint. Your documents have been uploaded but there was an issue saving to our system.\n\nPlease contact 1930 for assistance and mention your uploaded documents."
      );
      await this.sendMessage(from, errorMessage);

      // Don't clear session in case of error so user can retry
    }
  }

  /**
   * ========================================
   * VERIFICATION REGISTRATION METHODS
   * ========================================
   */

  /**
   * Send verification link with button
   * @param {string} to - User's WhatsApp number
   * @param {string} verificationUrl - DiDiT verification URL
   */
  async sendVerificationLink(to, verificationUrl) {
    try {
      const message = {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body:
            `🔐 *Identity Verification Required*\n\n` +
            `To register with Suraksha Bot, please verify your identity using your Aadhar Card.\n\n` +
            `*Steps to verify:*\n` +
            `1. Click the link below\n` +
            `2. Follow the instructions\n` +
            `3. Scan your Aadhar Card\n` +
            `4. Complete face verification\n\n` +
            `*Verification Link:*\n${verificationUrl}\n\n` +
            `After completing verification, return here and tap "I'm Done" button.`,
        },
      };

      await this.sendMessage(to, message);

      // Send confirmation buttons after a short delay
      setTimeout(async () => {
        await this.sendVerificationConfirmation(to);
      }, 2000);
    } catch (error) {
      console.error("Error sending verification link:", error.message);
      throw error;
    }
  }

  /**
   * Send verification confirmation buttons
   * @param {string} to - User's WhatsApp number
   */
  async sendVerificationConfirmation(to) {
    try {
      const message = {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Have you completed the verification process?",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "verify_done",
                  title: "✅ Yes, I'm Done",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "verify_retry",
                  title: "� Retry Again",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "exit",
                  title: "❌ Exit",
                },
              },
            ],
          },
        },
      };

      await this.sendMessage(to, message);
    } catch (error) {
      console.error("Error sending verification confirmation:", error.message);
      throw error;
    }
  }

  /**
   * Send verification retry message with button
   * @param {string} to - User's WhatsApp number
   * @param {string} errorMessage - Error message to display
   */
  async sendVerificationRetry(to, errorMessage) {
    try {
      const message = {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: `⏳ Verification Status\n\n${errorMessage}\n\n` +
                  "Please choose an option:",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "verify_check_status",
                  title: "🔍 Check Status",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "verify_retry",
                  title: "🔄 Retry Verification",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "exit",
                  title: "❌ Exit",
                },
              },
            ],
          },
        },
      };

      await this.sendMessage(to, message);
    } catch (error) {
      console.error("Error sending verification retry:", error.message);
      throw error;
    }
  }

  /**
   * Send location confirmation buttons
   * @param {string} to - User's WhatsApp number
   * @param {string} locationMessage - Formatted location message
   */
  async sendLocationConfirmation(to, locationMessage) {
    try {
      const message = {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: locationMessage,
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "location_yes",
                  title: "Yes, Correct",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "location_no",
                  title: "No, Retry",
                },
              },
            ],
          },
        },
      };

      await this.sendMessage(to, message);
    } catch (error) {
      console.error("Error sending location confirmation:", error.message);
      throw error;
    }
  }

  /**
   * Send registration success message
   * @param {string} to - User's WhatsApp number
   * @param {string} summaryMessage - Formatted registration summary
   */
  async sendRegistrationSuccess(to, summaryMessage) {
    try {
      const textMessage = {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: summaryMessage,
        },
      };

      await this.sendMessage(to, textMessage);

      // Send next steps message
      setTimeout(async () => {
        const nextStepsMessage = {
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: {
            body:
              `You can now proceed to:\n\n` +
              `• File a new complaint\n` +
              `• Check complaint status\n` +
              `• Request account unfreeze\n\n` +
              `Type "Hi" or "Menu" to see options.`,
          },
        };
        await this.sendMessage(to, nextStepsMessage);
      }, 2000);
    } catch (error) {
      console.error("Error sending registration success:", error.message);
      throw error;
    }
  }

  /**
   * Create text message helper
   * @param {string} to - User's WhatsApp number
   * @param {string} text - Message text
   * @returns {Object} Message object
   */
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
}

module.exports = WhatsAppService;
