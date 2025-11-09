const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const speech = require("@google-cloud/speech");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class VoiceProcessingService {
  constructor() {
    // Initialize Google Cloud Speech-to-Text client
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credentialsPath && fs.existsSync(credentialsPath)) {
      this.speechClient = new speech.SpeechClient({
        keyFilename: credentialsPath,
      });
      console.log(
        "[VoiceService] ✅ Initialized with Google Cloud Speech-to-Text"
      );
      console.log(`[VoiceService] Credentials: ${credentialsPath}`);
    } else {
      console.warn(
        "[VoiceService] ⚠️  Google credentials not found, some features may not work"
      );
    }

    // Google Translate API key
    this.translateApiKey = process.env.GEMINI_TRANSLATION_API_KEY || "";

    // Initialize Gemini for refinement (optional)
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    if (this.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
      this.geminiModel = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
      });
    }
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
   * Transcribe audio using Google Cloud Speech-to-Text
   * @param {string} audioFilePath - Path to audio file
   * @param {string} languageCode - Language code (e.g., 'hi-IN' for Hindi, 'en-IN' for English)
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeAudio(audioFilePath, languageCode = "hi-IN") {
    try {
      if (!this.speechClient) {
        console.warn(
          "Google Speech-to-Text not configured, using mock transcription"
        );
        return this.mockTranscription();
      }

      console.log(`🎤 Transcribing audio with language: ${languageCode}`);

      // Read the audio file
      const audioBytes = fs.readFileSync(audioFilePath).toString("base64");

      // Configure the request
      const request = {
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: "OGG_OPUS", // WhatsApp audio format
          sampleRateHertz: 16000,
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
          model: "default",
        },
      };

      // Perform the transcription
      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      if (!transcription || transcription.trim() === "") {
        console.warn("No speech detected in audio");
        return "No speech detected";
      }

      console.log(
        `✅ Transcription successful (${languageCode}):`,
        transcription
      );
      return transcription;
    } catch (error) {
      console.error("❌ Error transcribing audio:", error.message);
      // Fallback to mock if API fails
      return this.mockTranscription();
    }
  }

  /**
   * Translate text from Hindi to English using Google Translate API
   * @param {string} hindiText - Text in Hindi language
   * @returns {Promise<string>} - Translated English text
   */
  async translateHindiToEnglish(hindiText) {
    try {
      if (
        !hindiText ||
        hindiText.trim() === "" ||
        hindiText === "No speech detected"
      ) {
        return hindiText;
      }

      if (!this.translateApiKey) {
        console.warn("Google Translate API key not set, skipping translation");
        return hindiText;
      }

      console.log("🌐 Translating Hindi text to English...");

      const url = `https://translation.googleapis.com/language/translate/v2?key=${this.translateApiKey}`;

      const response = await axios.post(url, {
        q: hindiText,
        source: "hi", // Hindi
        target: "en", // English
        format: "text",
      });

      const translatedText = response.data.data.translations[0].translatedText;
      console.log(
        "✅ Translation successful (Hindi → English):",
        translatedText
      );
      return translatedText;
    } catch (error) {
      console.error("❌ Error translating text:", error.message);
      // If translation fails, return original text
      return hindiText;
    }
  }

  /**
   * Refine and structure the translated text using Gemini AI
   * @param {string} englishText - Translated English text
   * @returns {Promise<string>} - Refined and structured text
   */
  async refineTextWithGemini(englishText) {
    try {
      if (!this.geminiModel) {
        console.log("Gemini API not configured, returning original text");
        return englishText;
      }

      console.log("✨ Refining text with Gemini AI...");

      const prompt = `You are a cyber crime report assistant. Refine the following incident description to make it clear, structured, and professional while preserving all details like dates, amounts, phone numbers, account numbers, etc.

Original text: "${englishText}"

Provide a refined version that:
1. Corrects grammar and spelling
2. Organizes information logically
3. Preserves all specific details (dates, amounts, numbers, names)
4. Makes it concise and suitable for a formal cyber crime complaint
5. Keep it brief and to the point (max 3-4 sentences)

Refined text:`;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const refinedText = response.text();

      console.log("✅ Text refined with Gemini AI");
      return refinedText.trim();
    } catch (error) {
      console.error("❌ Error refining text with Gemini:", error.message);
      // If Gemini fails, return the original English text
      return englishText;
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
        if (
          match[0].toLowerCase().includes("today") ||
          match[0].includes("आज")
        ) {
          details.date = new Date().toISOString();
        } else if (
          match[0].toLowerCase().includes("yesterday") ||
          match[0].includes("कल")
        ) {
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
      "Call Fraud": ["call", "phone", "कॉल", "फोन", "बोल रहा", "customer care"],
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
      if (
        keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))
      ) {
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
   * Process voice message end-to-end with Hindi → English → Gemini refinement
   * @param {string} mediaId - WhatsApp media ID
   * @param {string} accessToken - WhatsApp access token
   * @returns {Promise<Object>} - Extracted complaint details
   */
  async processVoiceMessage(mediaId, accessToken) {
    try {
      console.log("🎤 Processing Hindi voice message...");

      // Step 1: Download audio from WhatsApp
      const audioFilePath = await this.downloadAudioFromWhatsApp(
        mediaId,
        accessToken
      );

      // Step 2: Transcribe Hindi audio to Hindi text using Google Speech-to-Text
      console.log("📝 Step 1: Transcribing Hindi audio...");
      const hindiText = await this.transcribeAudio(audioFilePath, "hi-IN");

      if (!hindiText || hindiText === "No speech detected") {
        throw new Error("No speech detected in audio");
      }

      // Step 3: Translate Hindi text to English using Google Translate
      console.log("🌐 Step 2: Translating Hindi to English...");
      const englishText = await this.translateHindiToEnglish(hindiText);

      // Step 4: Refine English text using Gemini AI (optional)
      console.log("✨ Step 3: Refining with Gemini AI...");
      const refinedText = await this.refineTextWithGemini(englishText);

      // Step 5: Extract key details from refined text
      console.log("🔍 Step 4: Extracting details...");
      const extractedDetails = this.extractDetailsFromText(refinedText);

      // Step 6: Clean up temp file
      try {
        fs.unlinkSync(audioFilePath);
      } catch (e) {
        console.log("Could not delete temp file:", e.message);
      }

      console.log("✅ Voice processing complete!");
      console.log("📊 Processing Summary:");
      console.log("  - Hindi Text:", hindiText.substring(0, 100) + "...");
      console.log(
        "  - English Translation:",
        englishText.substring(0, 100) + "..."
      );
      console.log("  - Refined Text:", refinedText.substring(0, 100) + "...");

      return {
        success: true,
        hindiTranscription: hindiText, // Original Hindi transcription
        englishTranslation: englishText, // English translation
        transcription: refinedText, // Final refined text (main output)
        details: extractedDetails,
      };
    } catch (error) {
      console.error("❌ Error processing voice message:", error);
      return {
        success: false,
        error: error.message,
        transcription: "",
        details: {},
      };
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
