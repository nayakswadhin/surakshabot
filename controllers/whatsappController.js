const WhatsAppService = require("../services/whatsappService");
const SessionManager = require("../services/sessionManager");
const { Users, Cases, CaseDetails } = require("../models");

class WhatsAppController {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  async verifyWebhook(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log("Webhook verified successfully!");
      res.status(200).send(challenge);
    } else {
      console.error("Webhook verification failed");
      res.status(403).send("Forbidden");
    }
  }

  async handleWebhook(req, res) {
    try {
      const body = req.body;
      console.log("Received webhook:", JSON.stringify(body, null, 2));

      if (body.object === "whatsapp_business_account") {
        body.entry?.forEach(async (entry) => {
          const changes = entry.changes;

          changes?.forEach(async (change) => {
            if (change.field === "messages") {
              const messages = change.value.messages;

              if (messages && messages.length > 0) {
                console.log(`Processing ${messages.length} messages`);
                for (const message of messages) {
                  try {
                    await this.processMessage(message, change.value);
                    console.log(
                      `Successfully processed message from ${message.from}`
                    );
                  } catch (error) {
                    console.error(
                      `Error processing message from ${message.from}:`,
                      error
                    );
                  }
                }
              }
            }
          });
        });

        res.status(200).send("OK");
      } else {
        console.log("Received non-WhatsApp webhook:", body);
        res.status(404).send("Not Found");
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async processMessage(message, value) {
    try {
      const from = message.from;
      const messageType = message.type;

      console.log(`Received ${messageType} message from ${from}`);

      if (messageType === "text") {
        const text = message.text.body;

        // Check if user has an active session first
        const session = this.whatsappService.sessionManager.getSession(from);

        if (session && session.state !== "MENU") {
          // User has an active session, handle based on session state
          await this.handleTextMessage(from, text);
        } else if (this.whatsappService.isGreeting(text)) {
          // No active session and it's a greeting
          console.log(`Handling greeting for ${from}`);
          await this.whatsappService.handleGreeting(from);
        } else {
          // No active session and not a greeting
          await this.handleTextMessage(from, text);
        }
      } else if (messageType === "interactive") {
        const interactive = message.interactive;

        if (interactive.type === "button_reply") {
          const buttonId = interactive.button_reply.id;
          await this.handleButtonClick(from, buttonId);
        }
      } else if (messageType === "image") {
        // Handle image messages for document collection
        await this.handleImageMessage(from, message.image);
      } else {
        console.log(`Unhandled message type: ${messageType}`);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  async handleTextMessage(from, text) {
    try {
      const session = this.whatsappService.sessionManager.getSession(from);
      console.log(`Handling text message from ${from}: "${text}"`);
      console.log(
        `Current session state:`,
        session ? `${session.state}, step: ${session.step}` : "No session"
      );

      if (!session) {
        // No active session, treat as general query
        const responseText =
          "I didn't quite understand that. Please say 'Hello' to start.";
        const textMessage = this.whatsappService.createTextMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, textMessage);
        return;
      }

      // Handle text input based on current session state
      if (session.state === SessionManager.STATES.REGISTRATION) {
        console.log(`Processing registration input for step ${session.step}`);
        await this.whatsappService.handleRegistrationInput(from, text);
      } else if (session.state === SessionManager.STATES.NEW_COMPLAINT) {
        await this.handleNewComplaintInput(from, text);
      } else if (session.state === SessionManager.STATES.STATUS_CHECK) {
        await this.handleStatusCheckInput(from, text);
      } else if (session.state === SessionManager.STATES.ACCOUNT_UNFREEZE) {
        await this.handleAccountUnfreezeInput(from, text);
      } else if (session.state === SessionManager.STATES.COMPLAINT_FILING) {
        await this.handleComplaintFilingInput(from, text, session);
      } else if (session.state === SessionManager.STATES.DOCUMENT_COLLECTION) {
        // User sent text during document collection - remind them to send images
        const currentStep = session.step;
        const documentDisplayName =
          SessionManager.getDocumentDisplayName(currentStep);

        const reminderMessage = this.whatsappService.createTextMessage(
          from,
          `📷 Please send an image\n\n` +
            `I'm waiting for: ${documentDisplayName}\n\n` +
            `Text messages are not accepted during document collection.\n\n` +
            `Please send an image file (JPG, PNG, GIF, WebP) under 10MB.`
        );
        await this.whatsappService.sendMessage(from, reminderMessage);
      } else if (
        session.state === SessionManager.STATES.SOCIAL_MEDIA_DOCUMENT_COLLECTION
      ) {
        // Handle Social Media document collection text input
        const currentStep = session.step;

        if (
          currentStep ===
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL ||
          currentStep ===
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL
        ) {
          // Accept URLs as text for alleged content or original ID
          await this.handleSocialMediaUrlInput(from, text, session);
        } else {
          // For other steps, remind to send images
          const documentDisplayName =
            SessionManager.getSocialMediaDisplayName(currentStep);

          const reminderMessage = this.whatsappService.createTextMessage(
            from,
            `📷 Please send an image\n\n` +
              `I'm waiting for: ${documentDisplayName}\n\n` +
              `Text messages are not accepted for this document type.\n\n` +
              `Please send an image file (JPG, PNG, GIF, WebP) under 10MB.`
          );
          await this.whatsappService.sendMessage(from, reminderMessage);
        }
      } else {
        // Default response for unrecognized state
        const responseText =
          "I didn't quite understand that. Please use the menu options or say 'Hello' to start over.";
        const textMessage = this.whatsappService.createTextMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, textMessage);
      }
    } catch (error) {
      console.error("Error handling text message:", error);
    }
  }

  async handleButtonClick(from, buttonId) {
    try {
      // Handle confirmation button for registration
      if (buttonId === "confirm_registration") {
        await this.saveUserRegistration(from);
        return;
      }

      // Handle other buttons through WhatsApp service
      await this.whatsappService.handleButtonPress(from, buttonId);
    } catch (error) {
      console.error("Error handling button click:", error);
    }
  }

  async handleImageMessage(from, imageMessage) {
    try {
      console.log(`Handling image message from ${from}`);

      const session = this.whatsappService.sessionManager.getSession(from);
      if (!session) {
        const errorMessage = this.whatsappService.createTextMessage(
          from,
          "❌ No active session found. Please start a new complaint by saying 'Hello'."
        );
        await this.whatsappService.sendMessage(from, errorMessage);
        return;
      }

      if (session.state === SessionManager.STATES.DOCUMENT_COLLECTION) {
        try {
          // Process the image upload
          const uploadResult = await this.whatsappService.handleImageMessage(
            from,
            imageMessage
          );

          if (uploadResult) {
            // Image uploaded successfully, process next step
            await this.whatsappService.processDocumentUpload(
              from,
              uploadResult
            );
          }
        } catch (error) {
          console.error("Error processing document image:", error);

          const errorMessage = this.whatsappService.createTextMessage(
            from,
            "Sorry, there was an error processing your image. Please try uploading again.\n\nMake sure:\n• Image is under 10MB\n• File format is JPG, PNG, GIF, or WebP\n• Image is clear and readable"
          );
          await this.whatsappService.sendMessage(from, errorMessage);
        }
      } else if (
        session.state === SessionManager.STATES.SOCIAL_MEDIA_DOCUMENT_COLLECTION
      ) {
        const currentStep = session.step;

        // Check if user is sending image during URL steps
        if (
          currentStep ===
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL ||
          currentStep ===
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL
        ) {
          // User sent image when URL was expected
          const errorMessage = this.whatsappService.createTextMessage(
            from,
            "❌ Please send URL as text, not image!\n\n" +
              `I'm waiting for: ${SessionManager.getSocialMediaDisplayName(
                currentStep
              )}\n\n` +
              "✅ Send the URL as a text message\n" +
              "❌ Do not send screenshots of URLs\n\n" +
              "Example: https://facebook.com/fake.profile\n\n" +
              "Please send the URL as text:"
          );
          await this.whatsappService.sendMessage(from, errorMessage);
          return;
        }

        try {
          // Process Social Media document image upload
          const uploadResult = await this.whatsappService.handleImageMessage(
            from,
            imageMessage
          );

          if (uploadResult) {
            // Image uploaded successfully, process next step
            await this.whatsappService.processSocialMediaDocument(
              from,
              uploadResult,
              "image"
            );
          }
        } catch (error) {
          console.error("Error processing Social Media document image:", error);

          const errorMessage = this.whatsappService.createTextMessage(
            from,
            "Sorry, there was an error processing your Social Media document image. Please try uploading again.\n\nMake sure:\n• Image is under 10MB\n• File format is JPG, PNG, GIF, or WebP\n• Image is clear and readable"
          );
          await this.whatsappService.sendMessage(from, errorMessage);
        }
      } else {
        // User sent image but not in document collection mode
        const errorMessage = this.whatsappService.createTextMessage(
          from,
          "I can only accept images during document collection for complaints. Please use the menu options or start a new complaint."
        );
        await this.whatsappService.sendMessage(from, errorMessage);
      }
    } catch (error) {
      console.error("Error handling image message:", error);

      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, there was an error processing your image. Please try again later."
      );
      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }

  async handleNewComplaintInput(from, text) {
    try {
      // For new complaint, we should check the phone number from the message itself
      const userPhoneNumber = from; // This is the WhatsApp number from which the message came

      // Check if user exists with this phone number
      const user = await Users.findOne({ phoneNumber: userPhoneNumber });

      if (user) {
        // User exists, skip registration
        const responseText =
          `Welcome back, ${user.name}!\n\n` +
          "Your details are already in our system.\n\n" +
          "Let's proceed with your complaint registration.\n\n" +
          "Please provide a brief description of the incident:";

        const message = this.whatsappService.createNavigationMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, message);
      } else {
        // User doesn't exist, start registration
        const responseText =
          "New User Detected\n\n" +
          "I don't find your phone number in our records.\n\n" +
          "Let's register you first to proceed with the complaint.";

        const message = {
          messaging_product: "whatsapp",
          to: from,
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

        await this.whatsappService.sendMessage(from, message);
      }
    } catch (error) {
      console.error("Error handling new complaint input:", error);
    }
  }

  async handleStatusCheckInput(from, text) {
    try {
      const caseId = text.trim();

      console.log(`Searching for case with ID: ${caseId}`);

      // Search for case by caseId field first
      let case_ = await Cases.findOne({ caseId: caseId }).populate(
        "caseDetailsId"
      );

      // If not found, try searching by MongoDB _id if it looks like one
      if (!case_ && caseId.match(/^[0-9a-fA-F]{24}$/)) {
        case_ = await Cases.findById(caseId).populate("caseDetailsId");
      }

      if (case_) {
        const statusText =
          `📋 **Case Details Found**\n\n` +
          `🆔 **Case ID:** ${case_.caseId}\n` +
          `📝 **Fraud Type:** ${case_.typeOfFraud}\n` +
          `📂 **Category:** ${case_.caseCategory}\n` +
          `📊 **Status:** ${
            case_.status === "pending" ? "🟡 Pending" : "✅ Solved"
          }\n` +
          `📅 **Registered:** ${case_.createdAt.toLocaleDateString()}\n` +
          `📅 **Last Updated:** ${case_.updatedAt.toLocaleDateString()}\n\n` +
          `📋 **Incident Description:**\n${case_.incidentDescription}\n\n` +
          `📞 **Our caller Agent will call or message you shortly & solve your issue.**`;

        const message = this.whatsappService.createNavigationMessage(
          from,
          statusText
        );
        await this.whatsappService.sendMessage(from, message);
      } else {
        const responseText =
          "❌ **Case Not Found**\n\n" +
          "No case found with the provided Case ID or Acknowledgement Number.\n\n" +
          "Please check your Case ID and try again.\n\n" +
          "📞 For assistance, call 1930 or contact our support team.";

        const message = this.whatsappService.createNavigationMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, message);
      }

      // Clear session after showing results
      this.whatsappService.sessionManager.clearSession(from);
    } catch (error) {
      console.error("Error handling status check:", error);

      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, there was an error checking the case status. Please try again later."
      );
      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }

  async handleAccountUnfreezeInput(from, text) {
    try {
      const inputText = text.trim();
      console.log(`Searching for account with: ${inputText}`);

      let user = null;

      // Check if input looks like a phone number (10 digits)
      if (inputText.match(/^[6-9]\d{9}$/)) {
        user = await Users.findOne({ phoneNumber: inputText });
      }
      // Check if input looks like account number (could be various formats)
      // For now, let's also try searching by phone number with different patterns
      else if (inputText.match(/^\d{10,15}$/)) {
        // Try both as phone number and as account number
        user = await Users.findOne({
          $or: [
            { phoneNumber: inputText.slice(-10) }, // Last 10 digits as phone
            { phoneNumber: inputText },
          ],
        });
      }
      // If still not found, try finding by any numeric field
      else if (inputText.match(/^\d+$/)) {
        user = await Users.findOne({
          $or: [
            { phoneNumber: inputText },
            { aadharNumber: inputText.length === 12 ? inputText : null },
          ].filter(Boolean),
        });
      }

      if (user) {
        const freezeStatus = user.freeze ? "🔒 Frozen" : "🔓 Active";
        const statusText =
          `🔓 **Account Status Check**\n\n` +
          `👤 **Name:** ${user.name}\n` +
          `📱 **Phone:** ${user.phoneNumber}\n` +
          `📧 **Email:** ${user.emailid}\n` +
          `🏠 **Area:** ${user.address.area}, ${user.address.district}\n` +
          `📊 **Account Status:** ${freezeStatus}\n\n`;

        let finalMessage;
        if (user.freeze) {
          finalMessage =
            statusText +
            `❄️ **Your account is currently frozen.**\n\n` +
            `📞 **Our caller Agent will call or message you shortly & solve your issue.**\n\n` +
            `For immediate assistance:\n` +
            `• Call: 1930\n` +
            `• Email: cybercrime.odisha@gov.in`;
        } else {
          finalMessage =
            statusText +
            `✅ **Your account is active and not frozen.**\n\n` +
            `📞 **Our caller Agent will call or message you shortly & solve your issue.**\n\n` +
            `If you're facing any issues:\n` +
            `• Call: 1930\n` +
            `• Email: cybercrime.odisha@gov.in`;
        }

        const message = this.whatsappService.createNavigationMessage(
          from,
          finalMessage
        );
        await this.whatsappService.sendMessage(from, message);
      } else {
        const responseText =
          "❌ **Account Not Found**\n\n" +
          "No account found with the provided Account Number or Phone Number.\n\n" +
          "Please check your details and try again.\n\n" +
          "📞 For assistance, call 1930 or register first if you're a new user.";

        const message = this.whatsappService.createNavigationMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, message);
      }

      // Clear session after showing results
      this.whatsappService.sessionManager.clearSession(from);
    } catch (error) {
      console.error("Error handling account unfreeze:", error);

      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, there was an error checking the account status. Please try again later."
      );
      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }

  async saveUserRegistration(from) {
    try {
      console.log(`Saving user registration for ${from}`);
      const session = this.whatsappService.sessionManager.getSession(from);
      if (!session || !session.data) {
        throw new Error("Session data not found");
      }

      const userData = session.data;
      const locationData = userData.locationData || {};

      console.log("User data to be saved:", JSON.stringify(userData, null, 2));
      console.log("Location data:", JSON.stringify(locationData, null, 2));

      // Validate required fields
      const requiredFields = [
        "name",
        "father_spouse_guardian",
        "gender",
        "email",
        "dob",
        "phone",
        "village",
        "pincode",
        "aadhar",
      ];
      const missingFields = requiredFields.filter((field) => !userData[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Create new user with empty caseIds array and location details
      const newUser = new Users({
        aadharNumber: userData.aadhar,
        name: userData.name,
        fatherSpouseGuardianName: userData.father_spouse_guardian,
        gender: userData.gender,
        emailid: userData.email,
        dob: new Date(userData.dob), // Ensure date is properly parsed
        phoneNumber: userData.phone,
        caseIds: [], // Empty as requested
        address: {
          pincode: userData.pincode,
          area: userData.village,
          village: userData.village,
          district: locationData.district || "TBD",
          postOffice: locationData.postOffice || "TBD",
          policeStation: locationData.policeStation || "TBD",
        },
      });

      console.log("Attempting to save user to database...");
      const savedUser = await newUser.save();
      console.log("User saved successfully:", savedUser._id);

      const successText =
        "Registration Successful!\n\n" +
        `Welcome ${userData.name}!\n\n` +
        "Your details have been saved securely.\n\n" +
        `Registration ID: ${savedUser._id}\n\n` +
        "Now let's proceed with filing your complaint.\n\n" +
        "Please provide a brief description of the incident:";

      // Send success message
      const message = this.whatsappService.createTextMessage(from, successText);
      await this.whatsappService.sendMessage(from, message);

      // Set session for complaint filing
      this.whatsappService.sessionManager.updateSession(from, {
        state: "COMPLAINT_FILING",
        step: "INCIDENT_DESCRIPTION",
        data: {
          userId: savedUser._id,
          caseId: this.whatsappService.complaintService.generateCaseId(),
        },
      });

      console.log(
        `Registration completed for ${from}, now ready for complaint filing`
      );
    } catch (error) {
      console.error("Error saving user registration:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // More specific error messages
      let errorText = "Sorry, there was an error saving your registration.";
      if (error.code === 11000) {
        if (error.keyPattern?.aadharNumber) {
          errorText =
            "This Aadhar number is already registered. Please contact 1930 if you need assistance.";
        } else if (error.keyPattern?.phoneNumber) {
          errorText =
            "This phone number is already registered. Please contact 1930 if you need assistance.";
        }
      } else if (error.name === "ValidationError") {
        console.error("Validation errors:", error.errors);
        errorText = `Validation error: ${error.message}`;
      } else if (error.message.includes("Missing required fields")) {
        errorText = error.message;
      }

      const errorMessage = this.whatsappService.createTextMessage(
        from,
        `${errorText}\n\nPlease try again later or contact 1930 for assistance.`
      );
      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }

  async getCases(req, res) {
    try {
      const { aadharNumber } = req.params;

      const cases = await Cases.find({ aadharNumber })
        .populate("caseDetailsId")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: cases,
      });
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching cases",
      });
    }
  }

  async createCase(req, res) {
    try {
      const caseData = req.body;
      const newCase = new Cases(caseData);
      const savedCase = await newCase.save();

      res.status(201).json({
        success: true,
        data: savedCase,
      });
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({
        success: false,
        message: "Error creating case",
      });
    }
  }

  async handleComplaintFilingInput(from, text, session) {
    try {
      const step = session.step;

      if (step === "INCIDENT_DESCRIPTION") {
        // Store incident description and move to fraud category selection
        this.whatsappService.sessionManager.updateSession(from, {
          step: "FRAUD_CATEGORY_SELECTION",
          data: { ...session.data, incident: text },
        });

        const message =
          this.whatsappService.complaintService.createFraudCategoryMessage(
            from
          );
        await this.whatsappService.sendMessage(from, message);
      } else if (step === "FRAUD_TYPE_SELECTION") {
        // Handle fraud type selection by number
        const category = session.data.category;
        const fraudType =
          this.whatsappService.complaintService.validateFraudTypeSelection(
            category,
            text.trim()
          );

        if (fraudType) {
          // Generate case ID and prepare complaint data
          const caseId = this.whatsappService.complaintService.generateCaseId();
          const complaintData = {
            ...session.data,
            fraudType: fraudType.description,
            caseId: caseId,
          };

          // Check if it's financial fraud - start document collection
          if (category === "financial") {
            this.whatsappService.sessionManager.updateSession(from, {
              data: complaintData,
            });

            // Start document collection directly without confirmation
            setTimeout(async () => {
              try {
                await this.whatsappService.startDocumentCollection(from);
              } catch (error) {
                console.error("Error starting document collection:", error);
              }
            }, 1000);
          } else if (category === "social_media") {
            // For social media fraud, start Social Media document collection
            this.whatsappService.sessionManager.updateSession(from, {
              data: complaintData,
            });

            // Start Social Media document collection
            setTimeout(async () => {
              try {
                await this.whatsappService.startSocialMediaDocumentCollection(
                  from
                );
              } catch (error) {
                console.error(
                  "Error starting Social Media document collection:",
                  error
                );
              }
            }, 1000);
          } else {
            // For other fraud types, proceed with old confirmation flow
            this.whatsappService.sessionManager.updateSession(from, {
              step: "COMPLAINT_CONFIRMATION",
              data: complaintData,
            });

            const message =
              this.whatsappService.complaintService.createComplaintConfirmationMessage(
                from,
                complaintData
              );
            await this.whatsappService.sendMessage(from, message);
          }
        } else {
          // Invalid selection
          const categoryText =
            category === "financial"
              ? "Financial Fraud (1-23)"
              : "Social Media Fraud (1-7)";
          const errorMessage = this.whatsappService.createTextMessage(
            from,
            `Invalid selection. Please type a valid number for ${categoryText}.`
          );
          await this.whatsappService.sendMessage(from, errorMessage);
        }
      } else {
        // Handle other text inputs during complaint filing
        const responseText =
          "Please use the buttons provided to proceed with your complaint.";
        const textMessage = this.whatsappService.createTextMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, textMessage);
      }
    } catch (error) {
      console.error("Error handling complaint filing input:", error);
    }
  }

  /**
   * Handle Social Media URL input during disputed URLs collection
   * @param {string} from - User phone number
   * @param {string} text - URL text from user
   * @param {Object} session - Current session
   */
  async handleSocialMediaUrlInput(from, text, session) {
    try {
      await this.whatsappService.handleSocialMediaUrlInput(from, text, session);
    } catch (error) {
      console.error("Error handling Social Media URL input:", error);
      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, there was an error processing your URL. Please try again."
      );
      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }

  /**
   * Handle Social Media URL input
   * @param {string} from - User phone number
   * @param {string} text - URL text
   * @param {Object} session - Current session
   */
  async handleSocialMediaUrlInput(from, text, session) {
    try {
      await this.whatsappService.handleSocialMediaUrlInput(from, text);
    } catch (error) {
      console.error("Error handling Social Media URL input:", error);
      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, there was an error processing your URL. Please try again."
      );
      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }
}

module.exports = WhatsAppController;
