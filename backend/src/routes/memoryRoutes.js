import express from "express";
import { getMemories, addMemory, deleteMemory, wipeMemories } from "../controllers/memoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // 🚨 Apne middleware ka sahi path/naam check kar lena!

const router = express.Router();

// Apply auth middleware to all memory routes
router.use(verifyToken);

router.get("/", getMemories);
router.post("/", addMemory);
router.delete("/all", wipeMemories); // Yeh pehle aana chahiye
router.delete("/:id", deleteMemory); // Yeh specific ID ke liye

export default router;