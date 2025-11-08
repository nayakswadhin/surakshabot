const express = require("express");
const router = express.Router();
const translationController = require("../controllers/translationController");

// Translate text
router.post("/translate", (req, res) => {
  translationController.translateText(req, res);
});

// Detect language
router.post("/detect", (req, res) => {
  translationController.detectLanguage(req, res);
});

// Get supported languages
router.get("/languages", (req, res) => {
  translationController.getSupportedLanguages(req, res);
});

// Set user's preferred language
router.post("/user-language", (req, res) => {
  translationController.setUserLanguage(req, res);
});

// Get user's preferred language
router.get("/user-language/:phoneNumber", (req, res) => {
  translationController.getUserLanguage(req, res);
});

// Translate batch
router.post("/batch", (req, res) => {
  translationController.translateBatch(req, res);
});

module.exports = router;
