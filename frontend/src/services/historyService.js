// 🚨 IP ka jhanjhat khatam! Proxy seedha backend pe le jayega
const API_URL = "/api/history"; 

// ✅ Correct syntax: 'export' aur 'const' ek saath aate hain
export const getHistory = async () => {
  try {
    const token = localStorage.getItem("sva_token");
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    });

    const text = await response.text();
    return JSON.parse(text);
  } catch (err) {
    console.log("History Parse Error:", err);
    return { success: false, sessions: [] };
  }
};