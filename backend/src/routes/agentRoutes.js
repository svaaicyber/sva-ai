import express from "express";
import { createAgent, getAgents, deleteAgent } from "../controllers/agentController.js";
import { protect } from "../middleware/authMiddleware.js"; // 👈 Yahan import kiya

const router = express.Router();

router.post("/create", protect, createAgent);
router.get("/", protect, getAgents);
router.delete("/:id", protect, deleteAgent); // 👈 Ab isko protect mil jayega!

export default router;