import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllSessions, getSessionChats } from "../controllers/sessionController.js"; 

const router = express.Router();

router.get("/", protect, getAllSessions);
router.get("/:sessionId", protect, getSessionChats);

export default router;