import express from "express";
import { getInsights } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js"; // 🚨 YEH SABSE ZAROORI HAI

const router = express.Router();

// 🚨 'protect' middleware add karna zaroori hai, taaki token decode ho aur req.user bane
router.get("/", protect, getInsights);

export default router;