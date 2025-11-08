const translationService = require("../services/translationService");
const SessionManager = require("../services/sessionManager");
const sessionManager = new SessionManager();

class TranslationController {
  /**
   * Translate text
   * POST /api/translation/translate
   * Body: { text, targetLang, sourceLang? }
   */
  async translateText(req, res) {
    try {
      const { text, targetLang = "en", sourceLang } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: "Text is required",
        });
      }

      const translatedText = await translationService.translate(
        text,
        targetLang,
        sourceLang
      );

      res.json({
        success: true,
        data: {
          originalText: text,
          translatedText,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang || "auto",
        },
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({
        success: false,
        message: "Translation failed",
        error: error.message,
      });
    }
  }

  /**
   * Detect language of text
   * POST /api/translation/detect
   * Body: { text }
   */
  async detectLanguage(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: "Text is required",
        });
      }

      const detectedLang = await translationService.detectLanguage(text);

      res.json({
        success: true,
        data: {
          text,
          detectedLanguage: detectedLang,
          languageName: translationService.supportedLanguages[detectedLang],
        },
      });
    } catch (error) {
      console.error("Language detection error:", error);
      res.status(500).json({
        success: false,
        message: "Language detection failed",
        error: error.message,
      });
    }
  }

  /**
   * Get supported languages
   * GET /api/translation/languages
   */
  getSupportedLanguages(req, res) {
    try {
      const languages = translationService.getSupportedLanguages();

      res.json({
        success: true,
        data: {
          languages,
          count: Object.keys(languages).length,
        },
      });
    } catch (error) {
      console.error("Get languages error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get supported languages",
        error: error.message,
      });
    }
  }

  /**
   * Set user's preferred language
   * POST /api/translation/user-language
   * Body: { phoneNumber, language }
   */
  setUserLanguage(req, res) {
    try {
      const { phoneNumber, language } = req.body;

      if (!phoneNumber || !language) {
        return res.status(400).json({
          success: false,
          message: "Phone number and language are required",
        });
      }

      const updated = sessionManager.setUserLanguage(phoneNumber, language);

      if (updated) {
        res.json({
          success: true,
          message: `Language set to ${language} for ${phoneNumber}`,
          data: {
            phoneNumber,
            language,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Session not found for this phone number",
        });
      }
    } catch (error) {
      console.error("Set user language error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set user language",
        error: error.message,
      });
    }
  }

  /**
   * Get user's preferred language
   * GET /api/translation/user-language/:phoneNumber
   */
  getUserLanguage(req, res) {
    try {
      const { phoneNumber } = req.params;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required",
        });
      }

      const language = sessionManager.getUserLanguage(phoneNumber);

      res.json({
        success: true,
        data: {
          phoneNumber,
          language,
          languageName: translationService.supportedLanguages[language],
        },
      });
    } catch (error) {
      console.error("Get user language error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user language",
        error: error.message,
      });
    }
  }

  /**
   * Translate batch texts
   * POST /api/translation/batch
   * Body: { texts: [], targetLang }
   */
  async translateBatch(req, res) {
    try {
      const { texts, targetLang = "en" } = req.body;

      if (!texts || !Array.isArray(texts)) {
        return res.status(400).json({
          success: false,
          message: "Texts array is required",
        });
      }

      const translations = await translationService.translateBatch(
        texts,
        targetLang
      );

      res.json({
        success: true,
        data: {
          originalTexts: texts,
          translations,
          targetLanguage: targetLang,
          count: translations.length,
        },
      });
    } catch (error) {
      console.error("Batch translation error:", error);
      res.status(500).json({
        success: false,
        message: "Batch translation failed",
        error: error.message,
      });
    }
  }
}

module.exports = new TranslationController();
