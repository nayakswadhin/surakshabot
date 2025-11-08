const express = require("express");
const whatsappRoutes = require("./whatsapp");
<<<<<<< Updated upstream
const chatbotRoutes = require("./chatbot");
=======
const geminiRoutes = require("./gemini");
>>>>>>> Stashed changes
const NotificationService = require("../services/notificationService");

const router = express.Router();

// WhatsApp bot routes
router.use("/whatsapp", whatsappRoutes);

<<<<<<< Updated upstream
// Chatbot routes
router.use("/chatbot", chatbotRoutes);
=======
// Gemini AI routes
router.use("/gemini", geminiRoutes);
>>>>>>> Stashed changes

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
