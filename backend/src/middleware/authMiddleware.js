// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

// 🚨 TEMPORARY BYPASS FOR FIREBASE MIGRATION
// Abhi ke liye hum is check ko bypass kar rahe hain taaki tera SVA UI chalna shuru ho.
// Baad mein hum yahan Firebase Admin SDK lagayenge proper verification ke liye.

export const protect = (req, res, next) => {
  try {
    // Backend ko lagne do ki user verified hai
    req.user = { id: "firebase_user_temp_id" }; 
    
    // Sab theek hai, sidha API ko call karne do!
    next(); 
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

export const verifyToken = protect;