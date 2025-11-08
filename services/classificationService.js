const axios = require("axios");

class ClassificationService {
  constructor() {
    this.classificationApiUrl =
      process.env.CLASSIFICATION_API_URL || "http://localhost:8000/classify";
  }

  /**
   * Classify incident description using ML API
   * @param {string} complaintText - The incident description text
   * @returns {Promise<Object>} Classification result
   */
  async classifyIncident(complaintText) {
    try {
      console.log(
        "Calling classification API with text:",
        complaintText.substring(0, 100) + "..."
      );

      const response = await axios.post(
        this.classificationApiUrl,
        {
          complaint_text: complaintText,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log(
        "Classification API response:",
        JSON.stringify(response.data, null, 2)
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error calling classification API:", error.message);

      if (error.response) {
        console.error("API Response Error:", error.response.data);
        return {
          success: false,
          error: "Classification API returned an error",
          details: error.response.data,
        };
      } else if (error.request) {
        console.error("No response from classification API");
        return {
          success: false,
          error:
            "Could not reach classification API. Please check if the service is running.",
        };
      } else {
        console.error(
          "Error setting up classification request:",
          error.message
        );
        return {
          success: false,
          error: "Failed to classify incident",
        };
      }
    }
  }

  /**
   * Format classification result for display to user
   * @param {Object} classificationData - Classification API response
   * @returns {string} Formatted text for WhatsApp message
   */
  formatClassificationResult(classificationData) {
    const {
      primary_category,
      subcategory,
      extracted_entities,
      confidence_scores,
      suggested_action,
    } = classificationData;

    let message = "*INCIDENT CLASSIFICATION REPORT*\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    // Main classification
    message += `*Category:* ${primary_category}\n`;
    message += `*Sub-category:* ${subcategory}\n`;
    message += `*Confidence Level:* ${(
      confidence_scores.primary_category * 100
    ).toFixed(1)}%\n\n`;

    // Extracted entities
    if (extracted_entities) {
      message += "*EXTRACTED INFORMATION:*\n";
      message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

      if (extracted_entities.amount) {
        message += `• Amount: ${extracted_entities.amount}\n`;
      }

      if (
        extracted_entities.phone_numbers &&
        extracted_entities.phone_numbers.length > 0
      ) {
        message += `• Phone Number(s): ${extracted_entities.phone_numbers.join(
          ", "
        )}\n`;
      }

      if (extracted_entities.upi_id) {
        message += `• UPI ID: ${extracted_entities.upi_id}\n`;
      }

      if (extracted_entities.urls && extracted_entities.urls.length > 0) {
        message += `• URLs Found: ${extracted_entities.urls.length}\n`;
      }

      if (extracted_entities.platform) {
        message += `• Platform: ${extracted_entities.platform}\n`;
      }

      if (extracted_entities.other) {
        const { bank_names, account_numbers, transaction_ids } =
          extracted_entities.other;

        if (bank_names && bank_names.length > 0) {
          message += `• Bank: ${bank_names.join(", ").toUpperCase()}\n`;
        }

        if (account_numbers && account_numbers.length > 0) {
          message += `• Account Numbers: ${account_numbers.length} detected\n`;
        }

        if (transaction_ids && transaction_ids.length > 0) {
          message += `• Transaction IDs: ${transaction_ids.length} detected\n`;
        }
      }

      message += "\n";
    }

    // Suggested action - formatted as numbered list
    if (suggested_action) {
      message += "*RECOMMENDED ACTIONS:*\n";
      message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

      // Parse the suggested action and format it properly
      const actions = this.parseSuggestedActions(suggested_action);
      actions.forEach((action, index) => {
        message += `${index + 1}. ${action}\n`;
      });
      message += "\n";
    }

    return message;
  }

  /**
   * Parse suggested actions into array of action items
   * @param {string} suggestedAction - Raw suggested action text
   * @returns {Array<string>} Array of action items
   */
  parseSuggestedActions(suggestedAction) {
    // Remove "URGENT:" or similar prefixes
    let cleaned = suggestedAction.replace(
      /^(URGENT:|IMMEDIATE:|ACTION REQUIRED:)\s*/i,
      ""
    );

    // Split by numbered list (1), 2), 3) etc.) or by sentence
    let actions = [];

    // Try to split by numbered patterns first
    const numberedPattern = /\d+\)\s*/;
    if (numberedPattern.test(cleaned)) {
      actions = cleaned
        .split(numberedPattern)
        .filter((action) => action.trim().length > 0)
        .map((action) => action.trim());
    } else {
      // Split by periods followed by space or capital letter
      actions = cleaned
        .split(/\.\s+(?=[A-Z0-9])/)
        .filter((action) => action.trim().length > 0)
        .map((action) => action.trim().replace(/\.$/, ""));
    }

    return actions;
  }

  /**
   * Map API category to internal category codes
   * @param {string} primaryCategory - Primary category from API
   * @returns {string} Internal category code (financial/social_media/other)
   */
  mapToInternalCategory(primaryCategory) {
    const categoryMap = {
      "Financial Fraud": "financial",
      "Online Financial Fraud": "financial",
      "Banking Fraud": "financial",
      "Credit Card Fraud": "financial",
      "Debit Card Fraud": "financial",
      "UPI Fraud": "financial",
      "Investment Fraud": "financial",

      "Social Media Fraud": "social_media",
      "Social Media": "social_media",
      "Facebook Fraud": "social_media",
      "Instagram Fraud": "social_media",
      "WhatsApp Fraud": "social_media",
      "Telegram Fraud": "social_media",
      "Twitter Fraud": "social_media",
      "X Fraud": "social_media",
    };

    return categoryMap[primaryCategory] || "other";
  }

  /**
   * Create classification confirmation message
   * @param {string} to - User phone number
   * @param {string} formattedResult - Formatted classification result
   * @returns {Object} WhatsApp interactive message
   */
  createClassificationConfirmationMessage(to, formattedResult) {
    return {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: formattedResult + "\n*Is this classification correct?*",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "confirm_classification",
                title: "Yes, Correct",
              },
            },
            {
              type: "reply",
              reply: {
                id: "reject_classification",
                title: "No, Wrong",
              },
            },
            {
              type: "reply",
              reply: {
                id: "back_step",
                title: "Back",
              },
            },
          ],
        },
      },
    };
  }
}

module.exports = ClassificationService;
