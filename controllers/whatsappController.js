const WhatsAppService = require("../services/whatsappService");
const SessionManager = require("../services/sessionManager");
const NotificationService = require("../services/notificationService");
const VoiceProcessingService = require("../services/voiceProcessingService");
const { Users, Cases, CaseDetails } = require("../models");

class WhatsAppController {
  constructor() {
    this.whatsappService = new WhatsAppService();
    this.voiceProcessingService = new VoiceProcessingService();
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
      } else if (messageType === "audio") {
        // Handle voice message
        console.log(`🎤 Received voice message from ${from}`);
        
        // Check if user is in the voice description state
        const session = this.whatsappService.sessionManager.getSession(from);
        
        if (session && session.step === "AWAITING_VOICE_DESCRIPTION") {
          // User is providing incident description via voice
          await this.handleVoiceDescriptionInput(from, message.audio);
        } else {
          // General voice message for full complaint
          await this.handleVoiceMessage(from, message.audio);
        }
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
      } else if (session.state === "VOICE_COMPLAINT_CONFIRM") {
        await this.handleVoiceComplaintConfirmation(from, text);
      } else if (session.state === SessionManager.STATES.NEW_COMPLAINT) {
        await this.handleNewComplaintInput(from, text);
      } else if (session.state === SessionManager.STATES.STATUS_CHECK) {
        await this.handleStatusCheckInput(from, text);
      } else if (session.state === SessionManager.STATES.ACCOUNT_UNFREEZE) {
        await this.handleAccountUnfreezeInput(from, text);
      } else if (session.state === SessionManager.STATES.COMPLAINT_FILING) {
        // Handle voice description confirmation
        if (session.step === "VOICE_DESCRIPTION_CONFIRM") {
          await this.handleVoiceDescriptionConfirmation(from, text);
        } else {
          await this.handleComplaintFilingInput(from, text, session);
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

      // Handle voice confirmation buttons
      if (buttonId === "voice_confirm_yes") {
        await this.handleVoiceDescriptionConfirmation(from, "YES");
        return;
      }

      if (buttonId === "voice_confirm_no") {
        await this.handleVoiceDescriptionConfirmation(from, "NO");
        return;
      }

      if (buttonId === "voice_confirm_retry") {
        await this.handleVoiceDescriptionConfirmation(from, "RETRY");
        return;
      }

      // Handle other buttons through WhatsApp service
      await this.whatsappService.handleButtonPress(from, buttonId);
    } catch (error) {
      console.error("Error handling button click:", error);
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
        "📝 *How would you like to provide the incident description?*\n\n" +
        "Choose your preferred method:\n" +
        "1️⃣ *VOICE* - Send a voice message (recommended)\n" +
        "2️⃣ *TEXT* - Type manually\n\n" +
        "Reply with *VOICE* or *TEXT*";

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

  async getAllCases(req, res) {
    try {
      const cases = await Cases.find()
        .populate("caseDetailsId")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: cases,
      });
    } catch (error) {
      console.error("Error fetching all cases:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching cases",
      });
    }
  }

  async getCaseById(req, res) {
    try {
      const { caseId } = req.params;
      const complaint = await Cases.findById(caseId).populate("caseDetailsId");

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Case not found",
        });
      }

      // Fetch user details
      const user = await Users.findOne({ aadharNumber: complaint.aadharNumber });

      res.json({
        success: true,
        data: {
          complaint,
          user: user || null,
        },
      });
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching case",
      });
    }
  }

  async updateCaseStatus(req, res) {
    try {
      const { caseId } = req.params;
      const { status, remarks, updatedBy, priority } = req.body;

      // Find the case first to get old status
      const existingCase = await Cases.findById(caseId);
      
      if (!existingCase) {
        return res.status(404).json({
          success: false,
          message: "Case not found",
        });
      }

      const oldStatus = existingCase.status;

      // Prepare update object
      const updateData = {
        status,
        updatedAt: Date.now(),
      };

      // Add remarks if provided
      if (remarks) {
        updateData.remarks = remarks;
      }

      // Add priority if provided
      if (priority) {
        updateData.priority = priority;
      }

      // Add to status history
      const statusHistoryEntry = {
        status,
        remarks: remarks || '',
        updatedBy: updatedBy || 'Admin',
        updatedAt: new Date(),
      };

      updateData.$push = { statusHistory: statusHistoryEntry };

      const updatedCase = await Cases.findByIdAndUpdate(
        caseId,
        updateData,
        { new: true }
      ).populate("caseDetailsId");

      // Emit notification if status changed
      if (oldStatus !== status) {
        NotificationService.emitStatusUpdate(updatedCase, oldStatus);
      }

      res.json({
        success: true,
        data: updatedCase,
        message: "Case status updated successfully",
      });
    } catch (error) {
      console.error("Error updating case status:", error);
      res.status(500).json({
        success: false,
        message: "Error updating case status",
      });
    }
  }

  async createCase(req, res) {
    try {
      const caseData = req.body;
      const newCase = new Cases(caseData);
      const savedCase = await newCase.save();

      // Emit real-time notification
      NotificationService.emitNewComplaint(savedCase);

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

  async getAllUsers(req, res) {
    try {
      const users = await Users.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching users",
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId).populate("caseIds");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user",
      });
    }
  }

  async handleComplaintFilingInput(from, text, session) {
    try {
      const step = session.step;

      if (step === "INCIDENT_DESCRIPTION") {
        // User should use buttons instead of typing
        // If they typed something, remind them to use buttons
        const reminderMessage = this.whatsappService.createTextMessage(
          from,
          "⚠️ Please use the buttons above to select *VOICE* or *TEXT* input method.\n\n" +
          "Click one of the buttons instead of typing."
        );
          
        await this.whatsappService.sendMessage(from, reminderMessage);
        
      } else if (step === "AWAITING_TEXT_DESCRIPTION") {
        // User provided text description
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

  // Send message from admin to user
  async sendAdminMessage(req, res) {
    try {
      const { phoneNumber, message, caseId } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({
          success: false,
          error: "Phone number and message are required",
        });
      }

      // Format phone number (remove +91 if present, ensure it's clean)
      const cleanPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      const formattedPhone = `91${cleanPhone}`;

      // Create the message with case reference if provided
      let messageText = message;
      if (caseId) {
        messageText = `[Case ID: ${caseId}]\n\n${message}\n\n---\n1930 Cyber Helpline, Odisha`;
      } else {
        messageText = `${message}\n\n---\n1930 Cyber Helpline, Odisha`;
      }

      const whatsappMessage = this.whatsappService.createTextMessage(
        formattedPhone,
        messageText
      );

      const result = await this.whatsappService.sendMessage(
        formattedPhone,
        whatsappMessage
      );

      console.log(`Admin message sent to ${formattedPhone}:`, result);

      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error sending admin message:", error);
      res.status(500).json({
        success: false,
        error: "Failed to send message",
        details: error.message,
      });
    }
  }

  // Handle voice message for complaint filing
  async handleVoiceMessage(from, audio) {
    try {
      const mediaId = audio.id;
      
      // Send processing message
      const processingMessage = this.whatsappService.createTextMessage(
        from,
        "🎤 Processing your voice message...\n\nPlease wait while we transcribe and extract details from your complaint."
      );
      await this.whatsappService.sendMessage(from, processingMessage);

      // Process the voice message
      const result = await this.voiceProcessingService.processVoiceMessage(
        mediaId,
        process.env.WHATSAPP_TOKEN
      );

      if (result.success) {
        const { transcription, details } = result;

        // Create a session with extracted data
        this.whatsappService.sessionManager.createSession(from, {
          state: "VOICE_COMPLAINT_CONFIRM",
          data: {
            description: transcription,
            amount: details.amount,
            incidentDate: details.date,
            fraudType: details.fraudType,
            transcription: transcription,
          },
        });

        // Send confirmation message with extracted details
        const confirmationText = 
          `✅ Voice message processed!\n\n` +
          `📝 *Transcription:*\n"${transcription.substring(0, 200)}${transcription.length > 200 ? '...' : ''}"\n\n` +
          `📊 *Extracted Details:*\n` +
          `💰 Amount: ${details.amount ? '₹' + details.amount : 'Not detected'}\n` +
          `📅 Date: ${details.date || 'Not detected'}\n` +
          `🔍 Fraud Type: ${details.fraudType || 'Not detected'}\n\n` +
          `Is this information correct?\n\n` +
          `Reply with:\n` +
          `✅ *YES* - To continue filing complaint\n` +
          `✏️ *EDIT* - To modify details\n` +
          `❌ *CANCEL* - To cancel`;

        const confirmMessage = this.whatsappService.createTextMessage(
          from,
          confirmationText
        );
        await this.whatsappService.sendMessage(from, confirmMessage);

      } else {
        throw new Error("Voice processing failed");
      }
    } catch (error) {
      console.error("Error handling voice message:", error);
      
      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, we couldn't process your voice message.\n\n" +
        "Please try again or type your complaint instead.\n\n" +
        "Type *MENU* to see all options."
      );
      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }

  // Handle confirmation for voice-generated complaint
  async handleVoiceComplaintConfirmation(from, text) {
    try {
      const session = this.whatsappService.sessionManager.getSession(from);
      const textLower = text.toLowerCase().trim();

      if (textLower === "yes" || textLower === "हां" || textLower === "ha") {
        // User confirmed, proceed to check if registered
        const user = await Users.findOne({ phoneNumber: from });

        if (!user) {
          // Start registration
          const message = this.whatsappService.createTextMessage(
            from,
            "To file a complaint, we need your details first.\n\n" +
            "Let's start with your registration.\n\n" +
            "Please provide your full name:"
          );
          
          // Store voice data for later use
          this.whatsappService.sessionManager.updateSession(from, {
            state: SessionManager.STATES.REGISTRATION,
            step: "NAME",
            data: {
              ...session.data,
              fromVoice: true,
            },
          });

          await this.whatsappService.sendMessage(from, message);
        } else {
          // User exists, create complaint directly
          await this.createComplaintFromVoiceData(from, user, session.data);
        }
      } else if (textLower === "edit" || textLower === "modify") {
        // User wants to edit details
        const message = this.whatsappService.createTextMessage(
          from,
          "Please type the correct details of your complaint:\n\n" +
          "Include:\n" +
          "• Amount lost (if any)\n" +
          "• Date of incident\n" +
          "• Description of fraud"
        );

        this.whatsappService.sessionManager.updateSession(from, {
          state: SessionManager.STATES.COMPLAINT_FILING,
          step: "DESCRIPTION",
        });

        await this.whatsappService.sendMessage(from, message);
      } else if (textLower === "cancel" || textLower === "no") {
        // User cancelled
        this.whatsappService.sessionManager.endSession(from);

        const message = this.whatsappService.createTextMessage(
          from,
          "❌ Complaint filing cancelled.\n\n" +
          "Type *HELLO* to start again."
        );

        await this.whatsappService.sendMessage(from, message);
      } else {
        // Invalid response
        const message = this.whatsappService.createTextMessage(
          from,
          "Please reply with:\n" +
          "✅ YES - To proceed\n" +
          "✏️ EDIT - To modify\n" +
          "❌ CANCEL - To cancel"
        );

        await this.whatsappService.sendMessage(from, message);
      }
    } catch (error) {
      console.error("Error handling voice complaint confirmation:", error);
    }
  }

  // Handle voice input specifically for incident description
  async handleVoiceDescriptionInput(from, audio) {
    try {
      const session = this.whatsappService.sessionManager.getSession(from);
      const VoiceService = require('../services/voiceService');
      const voiceService = new VoiceService();
      
      // Send processing message
      const processingMessage = this.whatsappService.createTextMessage(
        from,
        "🎤 Processing your English voice message...\n\nPlease wait while we convert your speech to text."
      );
      await this.whatsappService.sendMessage(from, processingMessage);

      // Download and transcribe the audio
      const audioFilePath = await voiceService.downloadAudioFromWhatsApp(audio.id);
      const transcription = await voiceService.transcribeAudio(audioFilePath);
      
      // Cleanup temp file
      voiceService.cleanupTempFile(audioFilePath);

      if (transcription) {
        // Store transcription temporarily
        this.whatsappService.sessionManager.updateSession(from, {
          step: "VOICE_DESCRIPTION_CONFIRM",
          data: {
            ...session.data,
            transcribedDescription: transcription,
          },
        });

        // Show transcription and ask for confirmation with clickable buttons
        const confirmationMessage = {
          messaging_product: "whatsapp",
          to: from,
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text: `Voice transcribed successfully!\n\n📝 Transcribed Text:\n"${transcription}"\n\nIs this correct?`,
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "voice_confirm_yes",
                    title: "YES",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: "voice_confirm_no",
                    title: "NO",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: "voice_confirm_retry",
                    title: "RETRY",
                  },
                },
              ],
            },
          },
        };

        await this.whatsappService.sendMessage(from, confirmationMessage);
      } else {
        throw new Error("Transcription failed");
      }
    } catch (error) {
      console.error("Error processing voice description:", error);
      
      // Get session data before it's lost
      const session = this.whatsappService.sessionManager.getSession(from);
      const sessionData = session ? session.data : {};
      
      // Fallback to text input
      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, we couldn't process your voice message.\n\n" +
        "Please type your incident description instead:"
      );
      await this.whatsappService.sendMessage(from, errorMessage);
      
      // Update session to text description mode
      this.whatsappService.sessionManager.updateSession(from, {
        step: "AWAITING_TEXT_DESCRIPTION",
        data: sessionData,
      });
    }
  }

  // Handle confirmation of voice-transcribed description
  async handleVoiceDescriptionConfirmation(from, text) {
    try {
      const session = this.whatsappService.sessionManager.getSession(from);
      const textLower = text.toLowerCase().trim();

      if (textLower === "yes" || textLower === "हां" || textLower === "ha" || textLower === "y") {
        // User confirmed transcription is correct
        const transcription = session.data.transcribedDescription;
        
        // Move to fraud category selection with transcribed description
        this.whatsappService.sessionManager.updateSession(from, {
          step: "FRAUD_CATEGORY_SELECTION",
          data: { 
            ...session.data, 
            incident: transcription 
          },
        });

        const message =
          this.whatsappService.complaintService.createFraudCategoryMessage(from);
        await this.whatsappService.sendMessage(from, message);
        
      } else if (textLower === "no" || textLower === "नहीं" || textLower === "nahi") {
        // User wants to type manually instead
        const textInputMessage = this.whatsappService.createTextMessage(
          from,
          "✍️ Please type the incident description manually:"
        );
        
        await this.whatsappService.sendMessage(from, textInputMessage);
        
        // Update session to text description mode
        this.whatsappService.sessionManager.updateSession(from, {
          step: "AWAITING_TEXT_DESCRIPTION",
          data: session.data,
        });
        
      } else if (textLower === "retry" || textLower === "फिर से" || textLower === "phir se") {
        // User wants to send voice again
        const retryMessage = this.whatsappService.createTextMessage(
          from,
          "🎤 Please send your voice message again.\n\n" +
          "Speak clearly and include all relevant details."
        );
        
        await this.whatsappService.sendMessage(from, retryMessage);
        
        // Update session back to awaiting voice
        this.whatsappService.sessionManager.updateSession(from, {
          step: "AWAITING_VOICE_DESCRIPTION",
          data: session.data,
        });
        
      } else {
        // Invalid response
        const message = this.whatsappService.createTextMessage(
          from,
          "Please reply with:\n" +
          "✅ *YES* - If transcription is correct\n" +
          "✏️ *NO* - To type manually\n" +
          "🔄 *RETRY* - To send voice again"
        );
        
        await this.whatsappService.sendMessage(from, message);
      }
    } catch (error) {
      console.error("Error handling voice description confirmation:", error);
    }
  }

  // Create complaint from voice-extracted data
  async createComplaintFromVoiceData(from, user, voiceData) {
    try {
      // Generate case ID
      const caseId = this.whatsappService.complaintService.generateCaseId();

      // Create complaint with voice data
      const complaintData = {
        userId: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        aadharNumber: user.aadharNumber,
        emailid: user.emailid,
        caseId: caseId,
        caseCategory: "Financial", // Default, can be improved
        typeOfFraud: voiceData.fraudType || "Voice Complaint",
        status: "pending",
        priority: voiceData.amount && parseInt(voiceData.amount) > 10000 ? "high" : "medium",
      };

      const newCase = new Cases(complaintData);
      await newCase.save();

      // Create case details
      const caseDetailsData = {
        caseId: newCase._id,
        incidentDescription: voiceData.transcription,
        amountLost: voiceData.amount || "Not specified",
        incidentDate: voiceData.incidentDate || new Date().toISOString(),
        suspectInfo: "Extracted from voice message",
        photos: [],
      };

      const newCaseDetails = new CaseDetails(caseDetailsData);
      await newCaseDetails.save();

      newCase.caseDetailsId = newCaseDetails._id;
      await newCase.save();

      // Send notification
      NotificationService.emitNewComplaint(newCase);

      // Clear session
      this.whatsappService.sessionManager.endSession(from);

      // Send success message
      const successMessage = this.whatsappService.createTextMessage(
        from,
        `✅ *Complaint Filed Successfully!*\n\n` +
        `📋 Your Case ID: *${caseId}*\n` +
        `📊 Priority: ${complaintData.priority.toUpperCase()}\n` +
        `💰 Amount: ${voiceData.amount ? '₹' + voiceData.amount : 'Not specified'}\n\n` +
        `Our team will investigate and contact you soon.\n\n` +
        `Save this Case ID for future reference.\n\n` +
        `Type *MENU* to see other options.`
      );

      await this.whatsappService.sendMessage(from, successMessage);

      console.log(`✅ Voice complaint filed successfully: ${caseId}`);
    } catch (error) {
      console.error("Error creating complaint from voice data:", error);
      
      const errorMessage = this.whatsappService.createTextMessage(
        from,
        "❌ Sorry, there was an error filing your complaint.\n\n" +
        "Please try again or contact our helpline.\n\n" +
        "Type *HELLO* to start over."
      );

      await this.whatsappService.sendMessage(from, errorMessage);
    }
  }
}

module.exports = WhatsAppController;
