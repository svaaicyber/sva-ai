import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  // 🚨 Password is no longer required! OAuth users don't have passwords.
  password: {
    type: String,
  },
  // Track how they signed up
  authProvider: { 
    type: String, 
    enum: ['local', 'google', 'github'], 
    default: 'local' 
  },
  isVerified: {
    type: Boolean,
    default: false, 
  },
  otp: {
    type: String, 
  },
  otpExpires: {
    type: Date, 
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;