import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "sva_super_secret_key_2026";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1️⃣ REGISTER (Local)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    
    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    if (user && !user.isVerified) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.authProvider = 'local';
      await user.save();
    } else {
      user = await User.create({ name, email, password: hashedPassword, otp, otpExpires, authProvider: 'local' });
    }

    await transporter.sendMail({
      from: `"SVA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your SVA Verification Code",
      text: `Welcome to SVA! Your verification code is: ${otp}. Expires in 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center;">
              <h2 style="color: #333;">Welcome to SVA 🚀</h2>
              <p style="color: #555;">Your verification code is:</p>
              <h1 style="color: #a855f7; letter-spacing: 5px; background: #f9f9f9; padding: 10px; border-radius: 8px;">${otp}</h1>
            </div>`
    });

    res.status(201).json({ success: true, message: "OTP sent to email." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2️⃣ VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Already verified." });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3️⃣ LOGIN (Local)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!user.isVerified) return res.status(403).json({ success: false, message: "Account not verified." });
    if (!user.password) return res.status(400).json({ success: false, message: "Please log in using Google/GitHub." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4️⃣ GOOGLE LOGIN (Called from frontend after Google popup)
export const googleLogin = async (req, res) => {
  try {
    const { email, name, verified } = req.body; // Sent from React frontend
    
    if (!verified) return res.status(400).json({ success: false, message: "Google email not verified." });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, authProvider: 'google', isVerified: true });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Google Auth Failed" });
  }
};

// 5️⃣ GITHUB LOGIN
export const githubLogin = async (req, res) => {
  try {
    const { code } = req.body;
    
    const { data: tokenData } = await axios.post("https://github.com/login/oauth/access_token", {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { Accept: "application/json" } });

    if (tokenData.error) throw new Error(tokenData.error_description);

    const { data: githubUser } = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    let email = githubUser.email;
    if (!email) {
      const { data: emails } = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      email = emails.find(e => e.primary && e.verified)?.email;
    }

    if (!email) return res.status(400).json({ success: false, message: "No verified email found." });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email, authProvider: 'github', isVerified: true
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "GitHub Auth Failed" });
  }
};