const express = require("express");
const WhatsAppController = require("../controllers/whatsappController");

const router = express.Router();
const whatsappController = new WhatsAppController();

// Webhook verification endpoint
router.get("/webhook", (req, res) => {
  whatsappController.verifyWebhook(req, res);
});

// Webhook endpoint for receiving messages
router.post("/webhook", (req, res) => {
  whatsappController.handleWebhook(req, res);
});

// API endpoint to get cases by Aadhar number
router.get("/cases/:aadharNumber", (req, res) => {
  whatsappController.getCases(req, res);
});

// API endpoint to create a new case
router.post("/cases", (req, res) => {
  whatsappController.createCase(req, res);
});

module.exports = router;
