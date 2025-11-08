const { StateContacts } = require('../models');

class ComplaintService {
  constructor() {
    this.financialFraudTypes = [
      {
        id: 1,
        title: "Investment/Trading/IPO",
        description: "Investment/Trading/IPO Fraud",
      },
      { id: 2, title: "Customer Care", description: "Customer Care Fraud" },
      {
        id: 3,
        title: "UPI Fraud",
        description: "UPI Fraud (UPI/IMPS/INB/NEFT/RTGS)",
      },
      { id: 4, title: "APK Fraud", description: "APK Fraud" },
      {
        id: 5,
        title: "Fake Franchisee",
        description: "Fake Franchisee/Dealership Fraud",
      },
      { id: 6, title: "Online Job", description: "Online Job Fraud" },
      { id: 7, title: "Debit Card", description: "Debit Card Fraud" },
      { id: 8, title: "Credit Card", description: "Credit Card Fraud" },
      { id: 9, title: "E-Commerce", description: "E-Commerce Fraud" },
      { id: 10, title: "Loan App", description: "Loan App Fraud" },
      { id: 11, title: "Sextortion", description: "Sextortion Fraud" },
      { id: 12, title: "OLX Fraud", description: "OLX Fraud" },
      { id: 13, title: "Lottery", description: "Lottery Fraud" },
      { id: 14, title: "Hotel Booking", description: "Hotel Booking Fraud" },
      { id: 15, title: "Gaming App", description: "Gaming App Fraud" },
      {
        id: 16,
        title: "AEPS Fraud",
        description: "AEPS Fraud (Aadhar Enabled Payment System)",
      },
      {
        id: 17,
        title: "Tower Installation",
        description: "Tower Installation Fraud",
      },
      { id: 18, title: "E-Wallet", description: "E-Wallet Fraud" },
      { id: 19, title: "Digital Arrest", description: "Digital Arrest Fraud" },
      { id: 20, title: "Fake Website", description: "Fake Website Scam Fraud" },
      { id: 21, title: "Ticket Booking", description: "Ticket Booking Fraud" },
      {
        id: 22,
        title: "Insurance Maturity",
        description: "Insurance Maturity Fraud",
      },
      { id: 23, title: "Others", description: "Others" },
    ];

    this.socialMediaFraudTypes = [
      { id: 1, title: "Facebook", description: "Facebook Fraud" },
      { id: 2, title: "Instagram", description: "Instagram Fraud" },
      { id: 3, title: "WhatsApp", description: "WhatsApp Fraud" },
      { id: 4, title: "Telegram", description: "Telegram Fraud" },
      { id: 5, title: "X (Twitter)", description: "X (Twitter) Fraud" },
      { id: 6, title: "Gmail", description: "Gmail Fraud" },
      { id: 7, title: "Fraud Call", description: "Fraud Call" },
    ];
  }

  // Generate unique case ID
  generateCaseId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `CC${timestamp}${random}`;
  }

  // Create incident description message with voice/text choice
  createIncidentDescriptionMessage(to) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "🎙️ Incident Description\n\nHow would you like to provide the incident details?\n\n*Voice Input:* Send a voice message describing what happened\n*Text Input:* Type out the incident description\n\nChoose your preferred method:",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "voice_input",
                title: "🎤 Voice Input",
              },
            },
            {
              type: "reply",
              reply: {
                id: "text_input",
                title: "⌨️ Text Input",
              },
            },
            { type: "reply", reply: { id: "back_step", title: "Back" } },
          ],
        },
      },
    };
  }

  // Create voice input instruction message
  createVoiceInputInstructionMessage(to) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body:
          "🎙️ *Voice Recording Instructions*\n\n" +
          "Please send a voice message describing the cyber crime incident.\n\n" +
          "*Include the following details:*\n" +
          "• What exactly happened?\n" +
          "• When did it occur?\n" +
          "• Any financial loss amount?\n" +
          "• Suspect details if known\n\n" +
          "📌 *Tip:* Speak clearly and provide as much detail as possible.\n\n" +
          "▶️ *Press and hold the microphone button to record your voice message.*",
      },
    };
  }

  // Create text input instruction message
  createTextInputInstructionMessage(to) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body:
          "⌨️ *Type Incident Description*\n\n" +
          "Please type the cyber crime incident details.\n\n" +
          "*Include:*\n" +
          "• What exactly happened?\n" +
          "• When did it occur?\n" +
          "• Any financial loss amount?\n" +
          "• Evidence available (screenshots, messages, etc.)?\n" +
          "• Suspect details if known\n\n" +
          "Provide as much detail as possible:",
      },
    };
  }

  // Create transcription confirmation message
  createTranscriptionConfirmationMessage(to, transcribedText) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text:
            "📝 *Voice Transcription*\n\n" +
            "Here's what I understood from your voice message:\n\n" +
            `"${transcribedText}"\n\n` +
            "Is this correct?",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "confirm_transcription",
                title: "✅ Correct",
              },
            },
            {
              type: "reply",
              reply: {
                id: "retry_voice",
                title: "🔄 Record Again",
              },
            },
            {
              type: "reply",
              reply: {
                id: "switch_to_text",
                title: "⌨️ Type Instead",
              },
            },
          ],
        },
      },
    };
  }

  // Create fraud category selection message
  createFraudCategoryMessage(to) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "Complaint Classification\n\nPlease select the type of cyber fraud:\n\nThis helps us route your complaint to the right department for faster resolution.",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: { id: "financial_fraud", title: "Financial Fraud" },
            },
            {
              type: "reply",
              reply: { id: "social_media_fraud", title: "Social Media Fraud" },
            },
            { type: "reply", reply: { id: "back_step", title: "Back" } },
          ],
        },
      },
    };
  }

  // Create financial fraud types message (text list instead of buttons)
  createFinancialFraudTypesMessage(to) {
    let bodyText = "Financial Fraud Types\n\n";
    bodyText += "Please select by typing the number (1-23):\n\n";

    this.financialFraudTypes.forEach((type) => {
      bodyText += `${type.id}. ${type.description}\n`;
    });

    bodyText += "\nType the number of your fraud type (1-23):";

    return {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: bodyText },
    };
  }

  // Create social media fraud types message (text list instead of buttons)
  createSocialMediaFraudTypesMessage(to) {
    let bodyText = "Social Media Fraud Types\n\n";
    bodyText += "Please select by typing the number (1-7):\n\n";

    this.socialMediaFraudTypes.forEach((type) => {
      bodyText += `${type.id}. ${type.description}\n`;
    });

    bodyText += "\nType the number of your fraud type (1-7):";

    return {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: bodyText },
    };
  }

  // Create additional social media options
  createSocialMediaMoreOptionsMessage(to) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "More Social Media Fraud Types:\n\n3. WhatsApp Fraud\n4. Telegram Fraud\n5. X (Twitter) Fraud\n6. Gmail Fraud\n7. Fraud Call\n\nSelect an option:",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: { id: "social_type_3", title: "WhatsApp" },
            },
            {
              type: "reply",
              reply: { id: "social_type_4", title: "Telegram" },
            },
            {
              type: "reply",
              reply: { id: "social_type_others", title: "Others" },
            },
          ],
        },
      },
    };
  }

  // Validate fraud type selection by number
  validateFraudTypeSelection(category, typeNumber) {
    const typeId = parseInt(typeNumber);

    if (category === "financial") {
      if (typeId >= 1 && typeId <= 23) {
        return this.financialFraudTypes.find((type) => type.id === typeId);
      }
    } else if (category === "social_media") {
      if (typeId >= 1 && typeId <= 7) {
        return this.socialMediaFraudTypes.find((type) => type.id === typeId);
      }
    }

    return null;
  }

  // Get fraud type details by ID and category
  getFraudTypeDetails(category, typeId) {
    if (category === "financial") {
      return this.financialFraudTypes.find(
        (type) => type.id === parseInt(typeId)
      );
    } else if (category === "social_media") {
      return this.socialMediaFraudTypes.find(
        (type) => type.id === parseInt(typeId)
      );
    }
    return null;
  }

  // Create final complaint confirmation message
  createComplaintConfirmationMessage(to, complaintData) {
    const incidentPreview =
      complaintData.incident.length > 100
        ? complaintData.incident.substring(0, 100) + "..."
        : complaintData.incident;

    const confirmationText =
      `Complaint Summary\n\n` +
      `Case ID: ${complaintData.caseId}\n` +
      `Category: ${complaintData.category}\n` +
      `Type: ${complaintData.fraudType}\n` +
      `Incident: ${incidentPreview}\n\n` +
      `Please confirm to submit your complaint:`;

    return {
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
              reply: { id: "confirm_complaint", title: "Submit Complaint" },
            },
            {
              type: "reply",
              reply: { id: "back_step", title: "Edit Details" },
            },
            { type: "reply", reply: { id: "main_menu", title: "Cancel" } },
          ],
        },
      },
    };
  }

  // Create complaint submitted success message
  async createComplaintSubmittedMessage(to, caseId, userState = null) {
    // Get state contact information
    let contactInfo = '';
    try {
      if (userState) {
        const stateContact = await StateContacts.findByState(userState);
        if (stateContact) {
          contactInfo = 
            `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📞 GRIEVANCE CONTACTS\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `If the response has not been appropriate, you may contact:\n\n` +
            `🏛️ ${stateContact.stateUT}\n\n` +
            `👨‍✈️ Nodal Officer:\n` +
            `${stateContact.nodalOfficer.name}\n` +
            `${stateContact.nodalOfficer.rank}\n` +
            `📧 ${stateContact.nodalOfficer.email}\n\n` +
            `👨‍⚖️ Grievance Officer:\n` +
            `${stateContact.grievanceOfficer.name}\n` +
            `${stateContact.grievanceOfficer.rank}\n` +
            `📞 ${stateContact.grievanceOfficer.contact}\n` +
            `📧 ${stateContact.grievanceOfficer.email}`;
        }
      }
    } catch (error) {
      console.error('Error fetching state contact:', error);
    }

    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text:
            `Complaint Submitted Successfully!\n\n` +
            `Your Case ID: ${caseId}\n\n` +
            `Your complaint has been registered with 1930 Cyber Helpline, India.\n\n` +
            `• You will receive updates on this number\n` +
            `• Keep your Case ID for future reference\n` +
            `• Our team will contact you within 24 hours\n\n` +
            `For urgent matters, call 1930 directly.` +
            contactInfo,
        },
        action: {
          buttons: [
            { type: "reply", reply: { id: "main_menu", title: "Main Menu" } },
            {
              type: "reply",
              reply: { id: "status_check", title: "Check Status" },
            },
            { type: "reply", reply: { id: "exit_session", title: "Exit" } },
          ],
        },
      },
    };
  }
}

module.exports = ComplaintService;
