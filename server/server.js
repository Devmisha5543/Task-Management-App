const http = require("http");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { initSocket } = require("./socket");
const { initCronJobs } = require("./utils/cronJobs");

connectDB();

// Initialize automated scheduled cron jobs (for email & push notifications)
initCronJobs();

const app = express();
const httpServer = http.createServer(app);

// Initialize real-time Socket.IO engine
initSocket(httpServer);

const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";
  res.json({
    status: "ok",
    database: dbState,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Task Management API with Real-time WebSockets is running" });
});

const os = require("os");

const getNetworkIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

httpServer.listen(PORT, "0.0.0.0", () => {
  const networkIp = getNetworkIp();
  console.log(`Server running with WebSockets on:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://${networkIp}:${PORT} (use this for mobile Expo)`);
});

httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is in use. Trying port ${Number(PORT) + 1}...`);
    httpServer.listen(Number(PORT) + 1, "0.0.0.0", () => {
      console.log(`Server running on port ${Number(PORT) + 1}`);
    });
  } else {
    console.error("Server error:", err);
  }
});