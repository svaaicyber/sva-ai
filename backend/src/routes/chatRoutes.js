import express from "express";

import {
  chat,
  getSession
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

/* =========================================
   GET CHAT SESSION
========================================= */

router.get(
  "/:sessionId",
  protect,
  getSession
);

export default router;