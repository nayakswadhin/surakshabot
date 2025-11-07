const WhatsAppService = require("../services/whatsappService");
const SessionManager = require("../services/sessionManager");
const VerificationRegistrationController = require("./verificationRegistrationController");
const { Users, Cases, CaseDetails } = require("../models");

class WhatsAppController {
  constructor() {
    this.whatsappService = new WhatsAppService();
    this.verificationController = VerificationRegistrationController;
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

      // Handle interactive button messages FIRST
      if (messageType === "interactive") {
        const interactive = message.interactive;
        const session = this.whatsappService.sessionManager.getSession(from);

        if (interactive.type === "button_reply") {
          const buttonId = interactive.button_reply.id;
          console.log(`Button clicked: ${buttonId} by ${from}`);

          // Handle verification flow buttons
          if (buttonId === "verify_done") {
            await this.verificationController.handleVerificationDone(from);
            return;
          }

          if (buttonId === "verify_check_status") {
            await this.verificationController.handleVerificationCheckStatus(
              from
            );
            return;
          }

          if (buttonId === "verify_retry") {
            await this.verificationController.startVerificationProcess(from);
            return;
          }

          // Handle exit button
          if (buttonId === "exit" || buttonId === "exit_session") {
            this.whatsappService.sessionManager.clearSession(from);
            await this.whatsappService.sendMessage(
              from,
              this.whatsappService.createTextMessage(
                from,
                "Thank you for using 1930 WhatsApp Bot! 👋\n\n" +
                  "If you need assistance in the future, just say 'Hello' to start again."
              )
            );
            return;
          }

          // Check if user is in verification registration flow
          if (
            session &&
            session.state === SessionManager.STATES.VERIFICATION_REGISTRATION
          ) {
            const handled =
              await this.verificationController.handleVerificationFlowButton(
                from,
                buttonId
              );
            if (handled) return;
          }

          // Handle button normally
          await this.handleButtonClick(from, buttonId);
        }
        return;
      }

      // Handle text messages
      if (messageType === "text") {
        const text = message.text.body;
        const session = this.whatsappService.sessionManager.getSession(from);

        console.log(`[TEXT MESSAGE DEBUG] From: ${from}, Text: "${text}"`);
        console.log(`[TEXT MESSAGE DEBUG] Session exists: ${!!session}`);
        if (session) {
          console.log(`[TEXT MESSAGE DEBUG] Session state: ${session.state}`);
          console.log(`[TEXT MESSAGE DEBUG] Session step: ${session.step}`);
          console.log(
            `[TEXT MESSAGE DEBUG] VERIFICATION_REGISTRATION constant: ${SessionManager.STATES.VERIFICATION_REGISTRATION}`
          );
          console.log(
            `[TEXT MESSAGE DEBUG] State matches VERIFICATION_REGISTRATION: ${
              session.state === SessionManager.STATES.VERIFICATION_REGISTRATION
            }`
          );
        }

        // Always show main menu on "Hello" - regardless of user status
        if (this.whatsappService.isGreeting(text)) {
          console.log(`Handling greeting for ${from}`);
          await this.whatsappService.handleGreeting(from);
          return;
        }

        // Check if user is in verification registration flow
        if (
          session &&
          session.state === SessionManager.STATES.VERIFICATION_REGISTRATION
        ) {
          console.log(
            `[TEXT MESSAGE DEBUG] Calling handleVerificationFlowMessage`
          );
          const handled =
            await this.verificationController.handleVerificationFlowMessage(
              from,
              text
            );
          console.log(
            `[TEXT MESSAGE DEBUG] handleVerificationFlowMessage returned: ${handled}`
          );
          if (handled) return;
        } else {
          console.log(
            `[TEXT MESSAGE DEBUG] NOT calling handleVerificationFlowMessage - state is ${session?.state}`
          );
        }

        // Handle text normally if not in verification flow
        if (session && session.state !== "MENU") {
          await this.handleTextMessage(from, text);
        } else {
          await this.handleTextMessage(from, text);
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

  // Add this enhanced debugging to handleTextMessage in WhatsAppController

  async handleTextMessage(from, text) {
    try {
      const session = this.whatsappService.sessionManager.getSession(from);
      console.log(`\n========== TEXT MESSAGE DEBUG START ==========`);
      console.log(`From: ${from}`);
      console.log(`Text: "${text}"`);
      console.log(`Session exists: ${!!session}`);
      if (session) {
        console.log(`Session state: ${session.state}`);
        console.log(`Session step: ${session.step}`);
        console.log(
          `VERIFICATION_REGISTRATION constant: ${SessionManager.STATES.VERIFICATION_REGISTRATION}`
        );
        console.log(
          `State matches: ${
            session.state === SessionManager.STATES.VERIFICATION_REGISTRATION
          }`
        );
        console.log(`Has extractedUserData: ${!!session.extractedUserData}`);
        console.log(`Full session:`, JSON.stringify(session, null, 2));
      }
      console.log(`========== TEXT MESSAGE DEBUG END ==========\n`);

      // Always show main menu on "Hello" - regardless of user status
      if (this.whatsappService.isGreeting(text)) {
        console.log(`Handling greeting for ${from}`);
        await this.whatsappService.handleGreeting(from);
        return;
      }

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

      // CRITICAL: Check if user is in verification registration flow FIRST
      console.log(`\n[VERIFICATION CHECK] Checking if in verification flow...`);
      console.log(`[VERIFICATION CHECK] session.state = "${session.state}"`);
      console.log(
        `[VERIFICATION CHECK] SessionManager.STATES.VERIFICATION_REGISTRATION = "${SessionManager.STATES.VERIFICATION_REGISTRATION}"`
      );
      console.log(
        `[VERIFICATION CHECK] Exact match: ${
          session.state === SessionManager.STATES.VERIFICATION_REGISTRATION
        }`
      );

      if (session.state === SessionManager.STATES.VERIFICATION_REGISTRATION) {
        console.log(
          `[VERIFICATION CHECK] ✅ IN VERIFICATION FLOW - Delegating to verification controller`
        );
        console.log(`[VERIFICATION CHECK] Current step: ${session.step}`);

        const handled =
          await this.verificationController.handleVerificationFlowMessage(
            from,
            text
          );

        console.log(
          `[VERIFICATION CHECK] Verification controller returned: ${handled}`
        );

        if (handled) {
          console.log(
            `[VERIFICATION CHECK] ✅ Message was handled by verification controller`
          );
          return;
        } else {
          console.log(
            `[VERIFICATION CHECK] ⚠️ Message was NOT handled by verification controller`
          );
        }
      } else {
        console.log(`[VERIFICATION CHECK] ❌ NOT in verification flow`);
      }

      // Handle text input based on current session state
      if (session.state === SessionManager.STATES.NEW_COMPLAINT) {
        await this.handleNewComplaintInput(from, text);
      } else if (session.state === SessionManager.STATES.STATUS_CHECK) {
        await this.handleStatusCheckInput(from, text);
      } else if (session.state === SessionManager.STATES.ACCOUNT_UNFREEZE) {
        await this.handleAccountUnfreezeInput(from, text);
      } else if (session.state === SessionManager.STATES.COMPLAINT_FILING) {
        await this.handleComplaintFilingInput(from, text, session);
      } else if (session.state === SessionManager.STATES.DOCUMENT_COLLECTION) {
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
        const currentStep = session.step;

        if (
          currentStep ===
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ALLEGED_URL ||
          currentStep ===
            SessionManager.SOCIAL_MEDIA_COLLECTION_STEPS.ORIGINAL_ID_URL
        ) {
          await this.handleSocialMediaUrlInput(from, text, session);
        } else {
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
        console.log(
          `[DEFAULT HANDLER] No matching state found. Current state: ${session.state}`
        );
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
      console.error("Stack trace:", error.stack);
    }
  }

  async handleButtonClick(from, buttonId) {
    try {
      // Note: Old confirm_registration button removed - now using DiDiT verification flow

      // Handle buttons through WhatsApp service
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
          console.error("Error details:", error.message);
          console.error("Error stack:", error.stack);

          const errorMessage = this.whatsappService.createTextMessage(
            from,
            "Sorry, there was an error processing your image. Please try uploading again.\n\nEnsure:\n• Image is under 10MB\n• File format is JPG, PNG, GIF, or WebP\n• Image is clear and readable\n\nIf the issue persists, please try with a different image."
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
          console.error("Error details:", error.message);
          console.error("Error stack:", error.stack);

          const errorMessage = this.whatsappService.createTextMessage(
            from,
            "Sorry, there was an error processing your Social Media document image. Please try uploading again.\n\nEnsure:\n• Image is under 10MB\n• File format is JPG, PNG, GIF, or WebP\n• Image is clear and readable\n\nIf the issue persists, please try with a different image."
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
      // This method is called after the user is already registered
      // Just proceed with complaint filing
      const session = this.whatsappService.sessionManager.getSession(from);

      if (!session) {
        await this.whatsappService.handleGreeting(from);
        return;
      }

      // Continue with the complaint filing process
      await this.handleComplaintFilingInput(from, text, session);
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

  // Note: saveUserRegistration() method removed - now using DiDiT verification flow
  // Registration is handled by verificationRegistrationController

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
        // Store incident description and ask for fraud location pincode
        this.whatsappService.sessionManager.updateSession(from, {
          step: "FRAUD_PINCODE",
          data: { ...session.data, incident: text },
        });

        const message = this.whatsappService.createTextMessage(
          from,
          `📍 *Fraud Location*\n\nPlease enter the 6-digit pincode where the fraud occurred:\n`
        );
        await this.whatsappService.sendMessage(from, message);
      } else if (step === "FRAUD_PINCODE") {
        // Validate pincode and fetch location details
        const pincode = text.trim();
        if (!/^\d{6}$/.test(pincode)) {
          const errorMessage = this.whatsappService.createTextMessage(
            from,
            `❌ Invalid pincode format.\n\nPlease enter a valid 6-digit pincode (e.g., 110001)`
          );
          await this.whatsappService.sendMessage(from, errorMessage);
          return;
        }

        // Fetch location details from pincode
        try {
          const locationResponse =
            await this.whatsappService.pinCodeService.getLocationDetails(
              pincode
            );

          if (locationResponse.success && locationResponse.data) {
            const locationDetails = locationResponse.data;

            // Store location data and show confirmation
            this.whatsappService.sessionManager.updateSession(from, {
              step: "PINCODE_CONFIRMATION",
              data: {
                ...session.data,
                fraudLocation: {
                  pincode: pincode,
                  area: locationDetails.area,
                  district: locationDetails.district,
                  postOffice: locationDetails.postOffice,
                },
              },
            });

            const confirmationMessage = {
              messaging_product: "whatsapp",
              to: from,
              type: "interactive",
              interactive: {
                type: "button",
                body: {
                  text:
                    `📍 *Location Details*\n\n` +
                    `*Pincode:* ${pincode}\n` +
                    `*Area:* ${locationDetails.area || "N/A"}\n` +
                    `*District:* ${locationDetails.district || "N/A"}\n` +
                    `*Post Office:* ${locationDetails.postOffice || "N/A"}\n` +
                    `*State:* ${locationDetails.state || "N/A"}\n\n` +
                    `Is this location correct?`,
                },
                action: {
                  buttons: [
                    {
                      type: "reply",
                      reply: { id: "location_yes", title: "Yes" },
                    },
                    {
                      type: "reply",
                      reply: { id: "location_no", title: "No" },
                    },
                    {
                      type: "reply",
                      reply: { id: "back_step", title: "Back" },
                    },
                  ],
                },
              },
            };
            await this.whatsappService.sendMessage(from, confirmationMessage);
          } else {
            const errorMessage = this.whatsappService.createTextMessage(
              from,
              `❌ Unable to fetch location details for pincode: ${pincode}\n\n${
                locationResponse.message || "Invalid pincode"
              }\n\nPlease try again with a valid pincode.`
            );
            await this.whatsappService.sendMessage(from, errorMessage);
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          const errorMessage = this.whatsappService.createTextMessage(
            from,
            `❌ Error fetching location details. Please try again.\n\nError: ${error.message}`
          );
          await this.whatsappService.sendMessage(from, errorMessage);
        }
      } else if (step === "FRAUD_DATE") {
        // Validate and store fraud date
        const dateText = text.trim();
        const dateValidation = this.validateDate(dateText);

        if (!dateValidation.valid) {
          const errorMessage = this.whatsappService.createTextMessage(
            from,
            `❌ ${dateValidation.error}\n\nPlease enter the date in DD-MM-YYYY format (e.g., 07-11-2024)`
          );
          await this.whatsappService.sendMessage(from, errorMessage);
          return;
        }

        // Store date and ask for time
        this.whatsappService.sessionManager.updateSession(from, {
          step: "FRAUD_TIME",
          data: {
            ...session.data,
            fraudDate: dateText,
            fraudDateObj: dateValidation.dateObj,
          },
        });

        const message = this.whatsappService.createTextMessage(
          from,
          `🕐 *Fraud Time*\n\nPlease enter the approximate time when the fraud occurred:\n\n*Formats accepted:*\n• 14:30 (24-hour format)\n• 2:30 PM (12-hour format)\n• 02:30 PM\n\n_If you don't remember the exact time, enter an approximate time._`
        );
        await this.whatsappService.sendMessage(from, message);
      } else if (step === "FRAUD_TIME") {
        // Validate and store fraud time
        const timeText = text.trim();
        const timeValidation = this.validateTime(timeText);

        if (!timeValidation.valid) {
          const errorMessage = this.whatsappService.createTextMessage(
            from,
            `❌ ${timeValidation.error}\n\nPlease enter a valid time (e.g., 14:30 or 2:30 PM)`
          );
          await this.whatsappService.sendMessage(from, errorMessage);
          return;
        }

        // Store time and move to category selection
        this.whatsappService.sessionManager.updateSession(from, {
          step: "FRAUD_CATEGORY_SELECTION",
          data: {
            ...session.data,
            fraudTime: timeValidation.formattedTime,
          },
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

  // Validate date input (DD-MM-YYYY format)
  validateDate(dateText) {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateText.match(dateRegex);

    if (!match) {
      return {
        valid: false,
        error: "Invalid date format. Please use DD-MM-YYYY format.",
      };
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Create date object (months are 0-indexed in JS)
    const dateObj = new Date(year, month - 1, day);

    // Validate date components
    if (
      dateObj.getDate() !== day ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getFullYear() !== year
    ) {
      return {
        valid: false,
        error: "Invalid date. Please check day, month, and year.",
      };
    }

    // Check if date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj > today) {
      return {
        valid: false,
        error: "Date cannot be in the future. Please enter a past date.",
      };
    }

    // Check if date is not too old (e.g., more than 10 years ago)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (dateObj < tenYearsAgo) {
      return {
        valid: false,
        error: "Date seems too old. Please verify and re-enter.",
      };
    }

    return {
      valid: true,
      dateObj: dateObj,
    };
  }

  // Validate time input (supports both 12-hour and 24-hour formats)
  validateTime(timeText) {
    // 24-hour format: HH:MM or H:MM
    const time24Regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    // 12-hour format: HH:MM AM/PM or H:MM AM/PM
    const time12Regex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM|am|pm)$/;

    let formattedTime = timeText;

    if (time24Regex.test(timeText)) {
      // Valid 24-hour format
      const parts = timeText.split(":");
      const hours = parts[0].padStart(2, "0");
      const minutes = parts[1];
      formattedTime = `${hours}:${minutes}`;
    } else if (time12Regex.test(timeText)) {
      // Valid 12-hour format - convert to 24-hour
      const match = timeText.match(time12Regex);
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;
    } else {
      return {
        valid: false,
        error: "Invalid time format.",
      };
    }

    return {
      valid: true,
      formattedTime: formattedTime,
    };
  }
}

module.exports = WhatsAppController;
