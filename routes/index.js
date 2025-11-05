const express = require("express");
const whatsappRoutes = require("./whatsapp");

const router = express.Router();

// WhatsApp bot routes
router.use("/whatsapp", whatsappRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Suraksha Bot is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
