// 🚨 IP aur Port ka jhanjhat hamesha ke liye khatam
const API_URL = "/api/chat";

export const sendMessage = async (message, history, sessionId, activeAgent, location, selectedModel, base64Image = null) => {
  const ghostMode = localStorage.getItem("sva_ghost") === "true";
  const systemDirectives = localStorage.getItem("sva_directives") || "";
  const token = localStorage.getItem("sva_token");
  
  // 🚨 Yahan se CURRENT_IP wala kachra nikal diya
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
      image: base64Image // 📸 YEH LINE PHOTO KO BACKEND TAK LE JAYEGI
    })
  });
  return response.json();
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file); 
  const token = localStorage.getItem("sva_token"); // 🚨 Uploads mein bhi token bhej de better security ke liye

  try {
    // 🚨 Yahan se bhi hardcoded IP (192.168...) hata diya aur proxy path daal diya
    const response = await fetch("/api/upload/document", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}` // FormData ke saath Content-Type automatic set hota hai, toh usko empty chhod de
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Document Upload Error:", error);
    throw error;
  }
};