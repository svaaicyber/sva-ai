export const generateImage = async (prompt) => {
  try {
    const token = localStorage.getItem("sva_token"); 

    // 🚨 Render Cloud ka poora rasta daal diya
    const response = await fetch("https://sva-eniy.onrender.com/api/images/generate", { 
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