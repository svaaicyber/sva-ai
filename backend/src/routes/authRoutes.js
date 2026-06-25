import express from 'express';
import { 
  registerUser, 
  loginUser, 
  verifyOTP, 
  googleLogin, // 🚨 Added Google logic
  githubLogin  // 🚨 Added GitHub logic
} from '../controllers/authController.js';

const router = express.Router();

// Local Auth Routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);

// 🚨 YEH HAIN NAYE ROUTES JO MISSING THE 🚨
router.post('/google', googleLogin);
router.post('/github', githubLogin);

export default router;