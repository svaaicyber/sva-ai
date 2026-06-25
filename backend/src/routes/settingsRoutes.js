import express from "express";
import { exportUserData, clearAllChats } from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js"; // 🚨 verifyToken ko protect kar diya

const router = express.Router();

// Apply auth middleware to protect these routes
router.use(protect); // 🚨 Yahan bhi protect kar diya

router.get("/export", exportUserData);
router.delete("/clear-chats", clearAllChats);

export default router;