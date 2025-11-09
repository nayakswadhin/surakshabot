const axios = require("axios");
require("dotenv").config();

/**
 * Status Notification Service
 * Sends WhatsApp notifications to users when their case status changes
 */
class StatusNotificationService {
  constructor() {
    this.phoneNumberId = process.env.PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_TOKEN;
    this.graphApiUrl = process.env.GRAPH_API_URL;
  }

  /**
   * Send WhatsApp message to user
   * @param {string} to - User's phone number
   * @param {object} message - WhatsApp message object
   */
  async sendWhatsAppMessage(to, message) {
    const url = `${this.graphApiUrl}/${this.phoneNumberId}/messages`;

    try {
      const response = await axios.post(url, message, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`✅ Status notification sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error sending WhatsApp notification:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Format status update message
   * @param {string} caseId - Case ID
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @param {string} remarks - Optional remarks from admin
   * @param {object} caseInfo - Additional case information
   */
  formatStatusUpdateMessage(caseId, oldStatus, newStatus, remarks, caseInfo = {}) {
    const statusEmoji = {
      pending: "🕐",
      under_review: "🔍",
      investigating: "🔎",
      resolved: "✅",
      closed: "✔️",
      rejected: "❌",
      on_hold: "⏸️",
    };

    const statusMessages = {
      pending: "Your case is awaiting initial review",
      under_review: "Your case is being reviewed by our team",
      investigating: "Our investigation team is actively working on your case",
      resolved: "Your case has been successfully resolved",
      closed: "Your case has been closed",
      rejected: "Your case could not be processed",
      on_hold: "Your case is temporarily on hold",
    };

    const emoji = statusEmoji[newStatus] || "📋";
    const statusDescription = statusMessages[newStatus] || "Status has been updated";

    let messageText =
      `📢 *Case Status Update Notification*\n\n` +
      `Dear valued user,\n\n` +
      `Your complaint status has been updated:\n\n` +
      `📋 *Case ID:* ${caseId}\n`;

    if (caseInfo.fraudType) {
      messageText += `🔍 *Fraud Type:* ${caseInfo.fraudType}\n`;
    }

    messageText +=
      `\n━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📊 *Status Change:*\n` +
      `Previous: ${this.formatStatusLabel(oldStatus)}\n` +
      `Current: ${emoji} *${this.formatStatusLabel(newStatus)}*\n\n` +
      `${statusDescription}\n`;

    if (remarks) {
      messageText += `\n💬 *Update Details:*\n${remarks}\n`;
    }

    // Add next steps based on status
    if (newStatus === "under_review") {
      messageText +=
        `\n📝 *Next Steps:*\n` +
        `• Our team is reviewing your submitted documents\n` +
        `• You may be contacted for additional information\n` +
        `• Expected review time: 2-3 business days\n`;
    } else if (newStatus === "investigating") {
      messageText +=
        `\n📝 *Next Steps:*\n` +
        `• Investigation is underway\n` +
        `• Please keep all relevant documents ready\n` +
        `• Cooperate with our team if contacted\n`;
    } else if (newStatus === "resolved") {
      messageText +=
        `\n🎉 *Congratulations!*\n` +
        `Your case has been successfully resolved. Thank you for your patience and cooperation.\n`;
    } else if (newStatus === "on_hold") {
      messageText +=
        `\n⏸️ *Action Required:*\n` +
        `• Your case requires additional information\n` +
        `• Please check your email for details\n` +
        `• Contact our helpline for assistance\n`;
    }

    messageText +=
      `\n━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📞 *Need Help?*\n` +
      `• Helpline: 1930 (24x7)\n` +
      `• Check Status: Reply with "Status Check"\n` +
      `• Website: https://cybercrime.gov.in\n\n` +
      `Thank you for using 1930 Cyber Helpline services.\n\n` +
      `_This is an automated notification. Please do not reply to this message._`;

    return messageText;
  }

  /**
   * Format status label for display
   * @param {string} status - Status code
   * @returns {string} - Formatted status label
   */
  formatStatusLabel(status) {
    const statusLabels = {
      pending: "Pending Review",
      under_review: "Under Review",
      investigating: "Under Investigation",
      resolved: "Resolved",
      closed: "Closed",
      rejected: "Rejected",
      on_hold: "On Hold",
    };

    return statusLabels[status] || status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Send status update notification to user
   * @param {string} phoneNumber - User's phone number (with country code)
   * @param {string} caseId - Case ID
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @param {string} remarks - Optional remarks
   * @param {object} caseInfo - Additional case information
   */
  async sendStatusUpdateNotification(
    phoneNumber,
    caseId,
    oldStatus,
    newStatus,
    remarks = null,
    caseInfo = {}
  ) {
    try {
      console.log(
        `📤 Sending status update notification to ${phoneNumber} for case ${caseId}`
      );

      const messageText = this.formatStatusUpdateMessage(
        caseId,
        oldStatus,
        newStatus,
        remarks,
        caseInfo
      );

      const message = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: messageText,
        },
      };

      await this.sendWhatsAppMessage(phoneNumber, message);

      console.log(
        `✅ Status update notification sent successfully for case ${caseId}`
      );
      return {
        success: true,
        message: "Notification sent successfully",
      };
    } catch (error) {
      console.error(
        `❌ Failed to send status update notification for case ${caseId}:`,
        error.message
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send high priority alert notification
   * @param {string} phoneNumber - User's phone number
   * @param {string} caseId - Case ID
   * @param {string} fraudType - Type of fraud
   */
  async sendHighPriorityAlert(phoneNumber, caseId, fraudType) {
    try {
      const messageText =
        `🚨 *HIGH PRIORITY CASE ALERT*\n\n` +
        `Dear valued user,\n\n` +
        `Your complaint has been registered and marked as HIGH PRIORITY due to its financial nature.\n\n` +
        `📋 *Case Details:*\n` +
        `• Case ID: ${caseId}\n` +
        `• Type: ${fraudType}\n` +
        `• Priority: HIGH ⚠️\n` +
        `• Status: Under Immediate Review\n\n` +
        `🚀 *Fast-Track Processing:*\n` +
        `• Your case will be reviewed immediately\n` +
        `• Specialized financial fraud team assigned\n` +
        `• You will receive updates via WhatsApp\n\n` +
        `⏱️ *Expected Timeline:*\n` +
        `• Initial Review: Within 12 hours\n` +
        `• Team Assignment: Within 24 hours\n` +
        `• First Status Update: Within 48 hours\n\n` +
        `💡 *Important Reminders:*\n` +
        `• Do NOT share OTP/PIN with anyone\n` +
        `• Keep all transaction records safe\n` +
        `• Block compromised accounts immediately\n` +
        `• Report to your bank if not already done\n\n` +
        `📞 *Emergency Support:*\n` +
        `• Helpline: 1930 (24x7)\n` +
        `• For banking fraud: Contact your bank immediately\n\n` +
        `We are committed to resolving your case with utmost priority.\n\n` +
        `Thank you for reporting to 1930 Cyber Helpline.`;

      const message = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: messageText,
        },
      };

      await this.sendWhatsAppMessage(phoneNumber, message);

      console.log(`✅ High priority alert sent for case ${caseId}`);
      return {
        success: true,
        message: "High priority alert sent",
      };
    } catch (error) {
      console.error(
        `❌ Failed to send high priority alert for case ${caseId}:`,
        error.message
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = StatusNotificationService;
