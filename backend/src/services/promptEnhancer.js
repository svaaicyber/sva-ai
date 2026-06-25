import { askGroq } from "./groqService.js";

export async function enhanceImagePrompt(userPrompt) {
  try {
    const prompt = `
You are an elite AI image prompt engineer.

Transform the user's request into a professional image generation prompt.

USER REQUEST:
"${userPrompt}"

RULES:
- Understand the user's intent.
- For humans, emphasize realistic anatomy and natural proportions.
- For logos, focus on branding, simplicity and clarity.
- For wallpapers/backgrounds, focus on composition, atmosphere and lighting.
- For technology/AI concepts, focus on futuristic details.
- If text is requested, ensure it is clear, readable and correctly spelled.
- Keep the final prompt under 120 words.
- Return ONLY the prompt.

QUALITY KEYWORDS:
masterpiece, best quality, ultra detailed, highly detailed,
sharp focus, cinematic lighting, volumetric lighting,
professional composition, 8k resolution
`;

    const result = await askGroq(prompt);

    return result
      .replace(/^"+|"+$/g, "")
      .replace(/\n/g, " ")
      .trim();

  } catch (error) {
    console.log("Prompt Enhancer Error:", error);

    return `masterpiece, best quality, ultra detailed, highly detailed, sharp focus, cinematic lighting, professional composition, 8k resolution, ${userPrompt}`;
  }
}