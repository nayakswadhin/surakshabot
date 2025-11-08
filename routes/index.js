const express = require("express");
const whatsappRoutes = require("./whatsapp");
const chatbotRoutes = require("./chatbot");
const geminiRoutes = require("./gemini");
const unfreezeRoutes = require("./unfreeze");
const translationRoutes = require("./translation");
const NotificationService = require("../services/notificationService");

const router = express.Router();

// WhatsApp bot routes
router.use("/whatsapp", whatsappRoutes);

// Chatbot routes
router.use("/chatbot", chatbotRoutes);

// Gemini AI routes
router.use("/gemini", geminiRoutes);

// Account Unfreeze routes
router.use("/unfreeze", unfreezeRoutes);

// Translation routes
router.use("/translation", translationRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Suraksha Bot is running",
    timestamp: new Date().toISOString(),
  });
});

// Test notification endpoint
router.post("/test-notification", (req, res) => {
  const { title, message, data } = req.body;
  
  NotificationService.emitNotification(
    title || "Test Notification",
    message || "This is a test notification from the server",
    data || {}
  );

  res.json({
    success: true,
    message: "Test notification sent",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
