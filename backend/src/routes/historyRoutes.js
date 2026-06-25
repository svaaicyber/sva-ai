import express from "express";
import { getHistory, deleteSession, archiveSession } from "../controllers/historyController.js";
import { protect } from "../middleware/authMiddleware.js"; // 🚨 Middleware import kiya

const router = express.Router();

// 🚨 Har route ke aage 'protect' laga diya
router.get("/", protect, getHistory);
router.delete("/:sessionId", protect, deleteSession);
router.post("/archive/:sessionId", protect, archiveSession);

export default router;