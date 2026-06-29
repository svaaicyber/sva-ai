import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet"; // 🛡️ NEW: Secures HTTP headers
import rateLimit from "express-rate-limit"; // 🛡️ NEW: Blocks API spam

import authRoutes from "./routes/authRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import connectDB from "./config/db.js";
import historyRoutes from "./routes/historyRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import agentRoutes from "./routes/agentRoutes.js"; // 🚨 NEW: Imported Agent Routes

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

connectDB();

const app = express();

// =========================================
// 🛡️ SECURITY SHIELD MIDDLEWARES
// =========================================

// 1. Helmet: Hides backend tech stack info and secures headers
app.use(helmet());

// 2. CORS Restrictor: Dynamic setup (Allows any local network IP automatically)
app.use(cors({
  origin: true, // 🚨 YEH JADOO HAI: Jo bhi IP request bhejega (mobile ya laptop), usko auto-allow kar dega
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
})); 

// 3. API Rate Limiter: 15 minutes mein maximum 100 requests per user
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes."
  }
});

// Apply rate limiter to ALL routes starting with /api/
app.use("/api", apiLimiter);

// =========================================
// ⚙️ STANDARD MIDDLEWARES
// =========================================

// 🚨 JSON Limit badha di taaki Base64 images easily DB tak jaa sakein
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ROUTES */

app.use("/api/auth", authRoutes);
app.use("/api/memory", memoryRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/agents", agentRoutes); // 🚨 NEW: Added Agent Route Handler

const PORT = process.env.PORT || 5000;

// 🚨 UPDATED LISTEN COMMAND: "0.0.0.0" added to broadcast on local network
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running and broadcasting on Network: http://192.168.0.100:${PORT}`
  );
});