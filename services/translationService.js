const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

class TranslationService {
  constructor() {
    this.apiKey = process.env.GEMINI_TRANSLATION_API_KEY;
    if (!this.apiKey) {
      console.error("❌ GEMINI_TRANSLATION_API_KEY not found in .env");
      throw new Error("Translation API key is required");
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    // Supported languages
    this.supportedLanguages = {
      en: "English",
      hi: "Hindi",
      or: "Odia (Oriya)",
    };

    console.log("✅ Translation Service initialized");
  }

  /**
   * Translate text to target language using Gemini AI
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code (en, hi, or)
   * @param {string} sourceLang - Source language code (optional, auto-detect if not provided)
   * @returns {Promise<string>} - Translated text
   */
  async translate(text, targetLang = "en", sourceLang = null) {
    try {
      if (!text || typeof text !== "string") {
        return text;
      }

      // If target language is English and no source specified, return as is
      if (targetLang === "en" && !sourceLang) {
        return text;
      }

      const targetLanguage = this.supportedLanguages[targetLang];
      if (!targetLanguage) {
        console.warn(`⚠️ Unsupported language: ${targetLang}, defaulting to English`);
        return text;
      }

      const prompt = sourceLang
        ? `Translate the following text from ${this.supportedLanguages[sourceLang]} to ${targetLanguage}. Return ONLY the translated text without any explanations:\n\n${text}`
        : `Translate the following text to ${targetLanguage}. Return ONLY the translated text without any explanations:\n\n${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text().trim();

      return translatedText;
    } catch (error) {
      console.error("❌ Translation error:", error.message);
      return text; // Return original text if translation fails
    }
  }

  /**
   * Detect language of text using Gemini AI
   * @param {string} text - Text to analyze
   * @returns {Promise<string>} - Language code (en, hi, or)
   */
  async detectLanguage(text) {
    try {
      if (!text || typeof text !== "string") {
        return "en";
      }

      const prompt = `Detect the language of the following text. Reply with ONLY one of these codes: 'en' for English, 'hi' for Hindi, 'or' for Odia/Oriya. Do not include any other text:\n\n${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const detectedLang = response.text().trim().toLowerCase();

      // Validate detected language
      if (["en", "hi", "or"].includes(detectedLang)) {
        return detectedLang;
      }

      console.warn(`⚠️ Could not detect language, defaulting to English`);
      return "en";
    } catch (error) {
      console.error("❌ Language detection error:", error.message);
      return "en"; // Default to English if detection fails
    }
  }

  /**
   * Translate multiple texts in batch
   * @param {Array<string>} texts - Array of texts to translate
   * @param {string} targetLang - Target language code
   * @returns {Promise<Array<string>>} - Array of translated texts
   */
  async translateBatch(texts, targetLang = "en") {
    try {
      const translations = await Promise.all(
        texts.map((text) => this.translate(text, targetLang))
      );
      return translations;
    } catch (error) {
      console.error("❌ Batch translation error:", error.message);
      return texts; // Return original texts if batch translation fails
    }
  }

  /**
   * Get user's preferred language from session or default to English
   * @param {string} phoneNumber - User's phone number
   * @returns {string} - Language code
   */
  getUserLanguage(phoneNumber) {
    // This will be integrated with session management
    // For now, return English as default
    return "en";
  }

  /**
   * Set user's preferred language
   * @param {string} phoneNumber - User's phone number
   * @param {string} langCode - Language code (en, hi, or)
   */
  setUserLanguage(phoneNumber, langCode) {
    if (!this.supportedLanguages[langCode]) {
      console.warn(`⚠️ Invalid language code: ${langCode}`);
      return false;
    }
    // This will be integrated with session management
    console.log(`✅ Set language for ${phoneNumber}: ${langCode}`);
    return true;
  }

  /**
   * Get list of supported languages
   * @returns {Object} - Object with language codes and names
   */
  getSupportedLanguages() {
    return { ...this.supportedLanguages };
  }

  /**
   * Translate WhatsApp message templates
   * @param {Object} messageTemplate - Message template object
   * @param {string} targetLang - Target language code
   * @returns {Promise<Object>} - Translated message template
   */
  async translateMessageTemplate(messageTemplate, targetLang) {
    try {
      const translatedTemplate = { ...messageTemplate };

      // Translate text content
      if (messageTemplate.text) {
        translatedTemplate.text = await this.translate(
          messageTemplate.text,
          targetLang
        );
      }

      // Translate body content
      if (messageTemplate.body) {
        translatedTemplate.body = await this.translate(
          messageTemplate.body,
          targetLang
        );
      }

      // Translate buttons if present
      if (messageTemplate.buttons && Array.isArray(messageTemplate.buttons)) {
        translatedTemplate.buttons = await Promise.all(
          messageTemplate.buttons.map(async (button) => {
            if (button.text) {
              return {
                ...button,
                text: await this.translate(button.text, targetLang),
              };
            }
            return button;
          })
        );
      }

      return translatedTemplate;
    } catch (error) {
      console.error("❌ Template translation error:", error.message);
      return messageTemplate; // Return original if translation fails
    }
  }
}

module.exports = new TranslationService();
