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

// API endpoint to get all cases
router.get("/cases/all", (req, res) => {
  whatsappController.getAllCases(req, res);
});

// API endpoint to get cases by Aadhar number
router.get("/cases/:aadharNumber", (req, res) => {
  whatsappController.getCases(req, res);
});

// API endpoint to get single case by ID
router.get("/case/:caseId", (req, res) => {
  whatsappController.getCaseById(req, res);
});

// API endpoint to update case status
router.patch("/cases/:caseId", (req, res) => {
  whatsappController.updateCaseStatus(req, res);
});

// API endpoint to create a new case
router.post("/cases", (req, res) => {
  whatsappController.createCase(req, res);
});

// API endpoint to get all users
router.get("/users/all", (req, res) => {
  whatsappController.getAllUsers(req, res);
});

// API endpoint to get single user by ID
router.get("/users/:userId", (req, res) => {
  whatsappController.getUserById(req, res);
});

// API endpoint to send admin message to user via WhatsApp
router.post("/send-message", (req, res) => {
  whatsappController.sendAdminMessage(req, res);
});

module.exports = router;
