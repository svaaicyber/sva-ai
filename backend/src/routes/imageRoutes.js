import express from "express";
import { enhanceImagePrompt } from "../services/promptEnhancer.js";

const router = express.Router();

/* GENERATE IMAGE: POLLINATIONS (FLUX CORE) UNSTOPPABLE ENGINE */
router.post("/generate", async (req, res) => {
  try {
    let { prompt } = req.body;
    
    // Safety check
    if (!prompt || prompt.trim() === "") {
        prompt = "A futuristic glowing AI core, highly detailed, neon lights";
    }
    
    // 🧠 SVA Brain: JSON markdown cleanup
    if (prompt.includes("```json")) {
      try {
        const cleanJson = prompt.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        prompt = parsed.description || parsed.prompt || prompt;
      } catch (e) {
        prompt = prompt.replace(/```json[\s\S]*?}/g, "").trim();
      }
    }

    // 🔥 Step 1: Pass it through our Master Prompt Enhancer
    const enhancedPrompt = await enhanceImagePrompt(prompt);
    
    // 🚀 THE ULTIMATE CACHE BUSTER!
    const cacheBuster = ` [sig: ${Math.floor(Math.random() * 9999999)}]`;
    const finalPromptForAPI = enhancedPrompt + cacheBuster;
    
    console.log(`🎨 SVA Vision Generating: "${finalPromptForAPI.substring(0, 70)}..."`);

    const encodedPrompt = encodeURIComponent(finalPromptForAPI);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=1024&nologo=true`;

    // ⚡ Step 3: Fetch the image binary and convert to Base64
    const response = await fetch(pollinationsUrl);
    
    if (!response.ok) {
      throw new Error("Pollinations network response was not ok");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    // Success response formatted perfectly for frontend
    res.json({
      success: true,
      imageUrl,
      enhancedPrompt
    });

  } catch (error) {
    console.error("❌ Pollinations Engine Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate image via Pollinations."
    });
  }
});

export default router;