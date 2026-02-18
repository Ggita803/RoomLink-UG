require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { validateEnv, config } = require("./src/config/env");
const logger = require("./src/config/logger");
const { Server } = require("socket.io");

// Validate environment variables at startup
try {
  validateEnv();
  logger.info("✅ Environment variables validated");
} catch (error) {
  logger.error(`❌ Environment validation failed: ${error.message}`);
  process.exit(1);
}

// Connect to database
connectDB().then(() => {
  logger.info("✅ Database connection established");
});

// Create server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO basic setup
io.on("connection", (socket) => {
  logger.info(`🔌 Socket connected: ${socket.id}`);
  // Example: join dashboard room
  socket.on("joinDashboard", (role) => {
    socket.join(role);
    logger.info(`Socket ${socket.id} joined room: ${role}`);
  });
  socket.on("disconnect", () => {
    logger.info(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Make io available globally (for event emission in controllers)
global.io = io;

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(
    `🚀 Server running on http://localhost:${PORT} in ${config.app.env} mode`
  );
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  logger.info("⚠️ SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("⚠️ SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.info("✅ Server closed");
    process.exit(0);
  });
});

// Unhandled Exception Handler
process.on("uncaughtException", (error) => {
  logger.error(`❌ Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`❌ Unhandled Rejection at ${promise}: ${reason}`);
});

module.exports = server;
