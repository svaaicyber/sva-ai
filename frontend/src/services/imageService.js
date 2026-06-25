export const generateImage = async (prompt) => {
  try {
    const token = localStorage.getItem("sva_token"); // Consistency ke liye token bhi bhej dete hain

    // 🚨 Hardcoded IP hata diya! Ab relative path use karenge taaki Proxy kaam kare
    const response = await fetch("/api/images/generate", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "SVA Backend blocked the request.");
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
      enhancedPrompt: data.enhancedPrompt 
    };
  } catch (error) {
    console.error("Image Service Error:", error);
    return {
      success: false,
      message: error.message
    };
  }
};