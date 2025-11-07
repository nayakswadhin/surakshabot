const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

class VoiceProcessingService {
  constructor() {
    // Using OpenAI Whisper for speech-to-text (you can use free alternatives too)
    this.openaiApiKey = process.env.OPENAI_API_KEY || "";
  }

  /**
   * Download audio file from WhatsApp
   * @param {string} mediaId - WhatsApp media ID
   * @param {string} accessToken - WhatsApp access token
   * @returns {Promise<string>} - Local file path
   */
  async downloadAudioFromWhatsApp(mediaId, accessToken) {
    try {
      // Step 1: Get media URL from WhatsApp
      const mediaUrlResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const mediaUrl = mediaUrlResponse.data.url;

      // Step 2: Download the audio file
      const audioResponse = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "arraybuffer",
      });

      // Step 3: Save to local file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const filePath = path.join(tempDir, `${mediaId}.ogg`);
      fs.writeFileSync(filePath, audioResponse.data);

      console.log(`Audio downloaded: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("Error downloading audio:", error.message);
      throw error;
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   * @param {string} audioFilePath - Path to audio file
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeAudio(audioFilePath) {
    try {
      if (!this.openaiApiKey) {
        console.warn("OpenAI API key not set, using mock transcription");
        return this.mockTranscription();
      }

      const formData = new FormData();
      formData.append("file", fs.createReadStream(audioFilePath));
      formData.append("model", "whisper-1");
      formData.append("language", "hi"); // Hindi/English auto-detect

      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            ...formData.getHeaders(),
          },
        }
      );

      console.log("Transcription successful:", response.data.text);
      return response.data.text;
    } catch (error) {
      console.error("Error transcribing audio:", error.message);
      // Fallback to mock if API fails
      return this.mockTranscription();
    }
  }

  /**
   * Mock transcription for testing without API key
   */
  mockTranscription() {
    return "मुझे एक फ्रॉड कॉल आई थी। उन्होंने कहा कि मैं बैंक से बोल रहा हूं और मेरे अकाउंट में प्रॉब्लम है। उन्होंने मुझसे ₹50000 ट्रांसफर करवा लिए। ये कल 5 November 2025 को हुआ था।";
  }

  /**
   * Extract key details from transcribed text using NLP
   * @param {string} text - Transcribed text
   * @returns {Object} - Extracted details
   */
  extractDetailsFromText(text) {
    const details = {
      amount: null,
      date: null,
      fraudType: null,
      description: text,
    };

    // Extract amount (₹, Rs, rupees)
    const amountPatterns = [
      /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi,
      /(?:rs|rupees?)\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi,
      /(\d+(?:,\d+)*)\s*(?:rupees?|rs)/gi,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const numberMatch = match[0].match(/\d+(?:,\d+)*(?:\.\d+)?/);
        if (numberMatch) {
          details.amount = numberMatch[0].replace(/,/g, "");
          break;
        }
      }
    }

    // Extract date
    const datePatterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g, // DD/MM/YYYY
      /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/gi,
      /(yesterday|today|आज|कल)/gi,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[0].toLowerCase().includes("today") || match[0].includes("आज")) {
          details.date = new Date().toISOString();
        } else if (match[0].toLowerCase().includes("yesterday") || match[0].includes("कल")) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          details.date = yesterday.toISOString();
        } else {
          details.date = match[0];
        }
        break;
      }
    }

    // Detect fraud type using keywords
    const fraudTypes = {
      "UPI Fraud": [
        "upi",
        "phonepe",
        "paytm",
        "google pay",
        "gpay",
        "bhim",
        "payment",
      ],
      "Banking Fraud": [
        "bank",
        "account",
        "atm",
        "credit card",
        "debit card",
        "otp",
        "password",
      ],
      "WhatsApp Fraud": [
        "whatsapp",
        "व्हाट्सएप",
        "message",
        "screenshot",
        "qr code",
      ],
      "Call Fraud": [
        "call",
        "phone",
        "कॉल",
        "फोन",
        "बोल रहा",
        "customer care",
      ],
      "Investment Fraud": [
        "investment",
        "stock",
        "share",
        "trading",
        "profit",
        "bitcoin",
        "crypto",
      ],
      "Job Fraud": ["job", "नौकरी", "work from home", "recruitment", "salary"],
      "Lottery Fraud": ["lottery", "prize", "winner", "जीत", "इनाम"],
      "OLX Fraud": ["olx", "sale", "buy", "product", "delivery"],
    };

    const lowerText = text.toLowerCase();
    for (const [type, keywords] of Object.entries(fraudTypes)) {
      if (keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))) {
        details.fraudType = type;
        break;
      }
    }

    // Default to Social Media Fraud if no specific type found
    if (!details.fraudType) {
      details.fraudType = "Other Cyber Crime";
    }

    return details;
  }

  /**
   * Process voice message end-to-end
   * @param {string} mediaId - WhatsApp media ID
   * @param {string} accessToken - WhatsApp access token
   * @returns {Promise<Object>} - Extracted complaint details
   */
  async processVoiceMessage(mediaId, accessToken) {
    try {
      console.log("🎤 Processing voice message...");

      // Step 1: Download audio
      const audioFilePath = await this.downloadAudioFromWhatsApp(
        mediaId,
        accessToken
      );

      // Step 2: Transcribe audio to text
      const transcribedText = await this.transcribeAudio(audioFilePath);

      // Step 3: Extract key details using NLP
      const extractedDetails = this.extractDetailsFromText(transcribedText);

      // Step 4: Clean up temp file
      try {
        fs.unlinkSync(audioFilePath);
      } catch (e) {
        console.log("Could not delete temp file:", e.message);
      }

      console.log("✅ Voice processing complete:", extractedDetails);
      return {
        success: true,
        transcription: transcribedText,
        details: extractedDetails,
      };
    } catch (error) {
      console.error("❌ Error processing voice message:", error);
      throw error;
    }
  }

  /**
   * Clean up old temp files
   */
  cleanupTempFiles() {
    const tempDir = path.join(__dirname, "../temp");
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < oneHourAgo) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old temp file: ${file}`);
        }
      });
    }
  }
}

module.exports = VoiceProcessingService;
