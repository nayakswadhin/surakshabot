const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/database");

// Import routes
const routes = require("./routes");
const WhatsAppController = require("./controllers/whatsappController");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize WhatsApp controller for direct webhook handling
const whatsappController = new WhatsAppController();

// Make io available globally for other modules
global.io = io;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Connect to MongoDB
connectDB();

// Middleware - CORS configuration for frontend
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === "POST") {
    console.log("Request body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use("/api", routes);

// Direct webhook endpoints (since Meta sends to /webhook directly)
app.get("/webhook", (req, res) => {
  whatsappController.verifyWebhook(req, res);
});

app.post("/webhook", (req, res) => {
  whatsappController.handleWebhook(req, res);
});

// Direct webhook routes for WhatsApp (to handle /webhook directly)
app.get("/webhook", (req, res) => {
  whatsappController.verifyWebhook(req, res);
});

app.post("/webhook", (req, res) => {
  whatsappController.handleWebhook(req, res);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🤖 Suraksha Bot - WhatsApp Cyber Crime Helpline",
    version: "1.0.0",
    description: "1930 Cyber Helpline, India - WhatsApp Bot Service",
    endpoints: {
      health: "/api/health",
      webhook: "/api/whatsapp/webhook",
      cases: "/api/whatsapp/cases",
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    timestamp: new Date().toISOString(),
  });
});

// Start server
server.listen(PORT, () => {
  console.log("🚀 ================================");
  console.log(`🤖 Suraksha Bot Server Started`);
  console.log(`📱 WhatsApp Bot Service Running`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/api/whatsapp/webhook`);
  console.log("🚀 ================================");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM. Shutting down gracefully...");
  process.exit(0);
});

module.exports = app;
