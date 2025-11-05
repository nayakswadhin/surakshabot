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
      const aadharPattern = /^[0-9]{12}$/;
      const cleanText = text.replace(/\D/g, "");

      if (aadharPattern.test(cleanText)) {
        const cases = await Cases.find({ aadharNumber: cleanText })
          .populate("caseDetailsId")
          .sort({ createdAt: -1 });

        if (cases.length === 0) {
          const responseText = "❌ No complaints found for this Aadhar number.";
          const message = this.whatsappService.createNavigationMessage(
            from,
            responseText
          );
          await this.whatsappService.sendMessage(from, message);
        } else {
          let statusText = "📋 **Your Complaints Status:**\n\n";
          cases.forEach((case_, index) => {
            statusText += `${index + 1}. **${case_.typeOfFraud}**\n`;
            statusText += `   Status: ${
              case_.status === "pending" ? "🟡 Pending" : "✅ Solved"
            }\n`;
            statusText += `   Date: ${case_.createdAt.toLocaleDateString()}\n\n`;
          });

          const message = this.whatsappService.createNavigationMessage(
            from,
            statusText
          );
          await this.whatsappService.sendMessage(from, message);
        }
      } else {
        const responseText = "❌ Please enter a valid 12-digit Aadhar number.";
        const message = this.whatsappService.createNavigationMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, message);
      }
    } catch (error) {
      console.error("Error handling status check:", error);
    }
  }

  async handleAccountUnfreezeInput(from, text) {
    try {
      const aadharPattern = /^[0-9]{12}$/;
      const cleanText = text.replace(/\D/g, "");

      if (aadharPattern.test(cleanText)) {
        const user = await Users.findOne({ aadharNumber: cleanText });

        if (user) {
          const responseText =
            `✅ **Account Unfreeze Request**\n\n` +
            `Hello ${user.name},\n\n` +
            "Your account unfreeze request has been initiated.\n\n" +
            "📞 Please call 1930 for immediate assistance\n" +
            "📧 Or email: cybercrime.odisha@gov.in\n\n" +
            "Our team will contact you within 24 hours.";

          const message = this.whatsappService.createNavigationMessage(
            from,
            responseText
          );
          await this.whatsappService.sendMessage(from, message);
        } else {
          const responseText =
            "❌ User not found. Please register first or contact 1930.";
          const message = this.whatsappService.createNavigationMessage(
            from,
            responseText
          );
          await this.whatsappService.sendMessage(from, message);
        }
      } else {
        const responseText = "❌ Please enter a valid 12-digit Aadhar number.";
        const message = this.whatsappService.createNavigationMessage(
          from,
          responseText
        );
        await this.whatsappService.sendMessage(from, message);
      }
    } catch (error) {
      console.error("Error handling account unfreeze:", error);
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
        dob: userData.dob,
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
        "Your details have been saved securely in our database.\n\n" +
        `Registration ID: ${savedUser._id}\n\n` +
        "You can now proceed with filing your complaint or checking status anytime.";

      const message = this.whatsappService.createNavigationMessage(
        from,
        successText,
        [{ id: "main_menu", title: "Main Menu" }]
      );

      await this.whatsappService.sendMessage(from, message);

      // Clear the session after successful registration
      this.whatsappService.sessionManager.clearSession(from);
      console.log(`Registration completed and session cleared for ${from}`);
    } catch (error) {
      console.error("Error saving user registration:", error);

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
        errorText = `Validation error: ${error.message}`;
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
}

module.exports = WhatsAppController;
