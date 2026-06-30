import express from "express";

import {
  chat,
  getSession,
  saveGeneratedImage
} from "../controllers/chatController.js";

import {
  protect
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* =========================================
   SEND MESSAGE
========================================= */

router.post(
  "/",
  protect,
  chat
);

router.post(
  "/save-image",
  protect,
  saveGeneratedImage
);

/* =========================================
   GET CHAT SESSION
========================================= */

router.get(
  "/:sessionId",
  protect,
  getSession
);

export default router;