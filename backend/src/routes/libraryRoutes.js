import express from "express";
import { getLibraryAssets, deleteAsset } from "../controllers/libraryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(verifyToken);
router.get("/", getLibraryAssets);
router.delete("/:id", deleteAsset);

export default router;