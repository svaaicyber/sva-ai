// 🚨 IP hata diya! Ab proxy sambhalega.
const API_URL = "/api/auth";

export const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network Error" };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network Error" };
  }
};

// 🚨 YEH THA MISSING FUNCTION
export const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_URL}/verify-otp`, { // Make sure tera backend route yahi ho
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network Error" };
  }
};

// 🚨 Safety ke liye Send OTP bhi daal diya (incase Auth.jsx maange)
export const sendOTP = async (email) => {
  try {
    const response = await fetch(`${API_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network Error" };
  }
};