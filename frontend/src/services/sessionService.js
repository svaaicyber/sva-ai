// 🚨 Render Cloud ka poora rasta
const API_URL = "https://sva-eniy.onrender.com/api/session"; 

export const getSession = async (sessionId) => {
  try {
    const token = localStorage.getItem("sva_token"); 
    
    const response = await fetch(`${API_URL}/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      }
    });

    const text = await response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error("Session Fetch Error:", err);
    return { success: false, chats: [] };
  }
};