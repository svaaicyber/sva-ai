import express from "express";
import { enhanceImagePrompt } from "../services/promptEnhancer.js";

const router = express.Router();

/* GENERATE IMAGE: POLLINATIONS (FLUX CORE) UNSTOPPABLE ENGINE */
router.post("/generate", async (req, res) => {
  try {
    let { prompt } = req.body;
    
    // 🧠 SVA Brain: Agar frontend se json markdown galti se aa jaye toh clean karein
    if (prompt.includes("```json")) {
      try {
        const cleanJson = prompt.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        prompt = parsed.description || parsed.prompt || prompt;
      } catch (e) {
        // Fallback agar parse na ho
        prompt = prompt.replace(/```json[\s\S]*?}/g, "").trim();
      }
    }

    // 🔥 Step 1: Pass it through our Master Prompt Enhancer (8K, detailed anatomy rules)
    const enhancedPrompt = await enhanceImagePrompt(prompt);
    console.log(`🎨 SVA Vision (Pollinations Flux) Generating: "${enhancedPrompt.substring(0, 50)}..."`);

    // 🚀 Step 2: Force Pollinations to use the ultra-premium 'flux' model
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=1024&enhance=false`;

    // ⚡ Step 3: Fetch the image binary and convert to Base64 for the React Widget
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