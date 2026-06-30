// 🚨 Apni .env file se base URL uthao
const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = "https://sva-eniy.onrender.com/api/chat";

export const sendMessage = async (message, history, sessionId, activeAgent, location, selectedModel, base64Image = null) => {
  const ghostMode = localStorage.getItem("sva_ghost") === "true";
  const systemDirectives = localStorage.getItem("sva_directives") || "";
  const token = localStorage.getItem("sva_token");
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({
      message,
      history,
      sessionId,
      agent: activeAgent,
      ghostMode,
      location,
      model: selectedModel,
      systemDirectives,
      image: base64Image
    })
  });
  return response.json();
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file); 
  const token = localStorage.getItem("sva_token"); 

  try {
    const response = await fetch(`${BASE_URL}/api/upload/document`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}` 
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Document Upload Error:", error);
    throw error;
  }
};

// 🚨 YEH RAHA TERA NAYA DUAL-SAVE FUNCTION
export const saveImageToHistory = async (sessionId, prompt, imageUrl) => {
  const token = localStorage.getItem("sva_token");
  try {
    const response = await fetch(`${API_URL}/save-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId, prompt, imageUrl })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to save image to DB:", error);
  }
};