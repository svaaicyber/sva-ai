import Groq from "groq-sdk";
import dotenv from "dotenv";
import Chat from "../models/Chat.js";
import { searchNearbyPlaces } from "../services/searchEngine.js";
import { webSearch } from "../services/searchService.js";

// Node.js v25+ has built-in fetch, so no node-fetch import needed!

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🛠️ FIX: Environment variable se Ollama URL lo, warna default fallback use karo
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";

export const chat = async (req, res) => {
  try {
    console.log("📥 Backend received body:", { ...req.body, image: req.body.image ? "[BASE64_IMAGE_DATA]" : null }); 

    const {
      message,
      sessionId,
      location,
      agent = "sva-core",
      model = "SVA Flash",
      ghostMode,
      systemDirectives,
      image // Frontend se Base64 Image string
    } = req.body;

    const userId = req.user.id;
    const lowerPrompt = message ? message.toLowerCase() : "";

    /* =========================================
       🛡️ SMART MEMORY: FOLLOW-UP DETECTION
    ========================================= */
    const followUpRegex = /^(what should i do|help me|suggest|then\??|why\??|how\??|kya karu|batao|explain|ok|okay|yes|no)$/i;
    const isFollowUp = followUpRegex.test(lowerPrompt.trim());

    /* =========================================
       🍕 FOOD INTENT DETECTION
    ========================================= */
    const foodRegex = /\b(hungry|food|eat|burger|pizza|shawarma|restaurant|cafe|near me|biryani)\b/i;
    const isFoodQuery = foodRegex.test(lowerPrompt) && !isFollowUp;

    let searchKeyword = "restaurant";
    if (lowerPrompt.includes("cafe") || lowerPrompt.includes("coffee")) searchKeyword = "cafe";
    else if (lowerPrompt.includes("pizza")) searchKeyword = "pizza";
    else if (lowerPrompt.includes("burger")) searchKeyword = "burger";
    else if (lowerPrompt.includes("biryani")) searchKeyword = "biryani";

    /* =========================================
       🧠 NATIVE MEMORY BUILDER (10 Messages)
    ========================================= */
    const previousChats = await Chat.find({ sessionId, userId }).sort({ createdAt: -1 }).limit(10);
    
    let directivesBlock = systemDirectives?.trim() ? `\n[GLOBAL SYSTEM DIRECTIVES]\n${systemDirectives}\n` : "";
    const locationAwareness = location 
      ? `\n[CRITICAL SENSOR DATA: USER EXACT LOCATION DETECTED - Latitude ${location.lat}, Longitude ${location.lng}]. You HAVE access to the user's location via frontend sensors. NEVER say "I don't have your current location".\n` 
      : `\n[USER LOCATION: UNKNOWN].\n`;
    
    const masterSystemInstruction = `You are SVA, a witty, warm, and highly advanced conversational AI. Owned By Incesa Ai.
${directivesBlock}
${locationAwareness}
CRITICAL RULES:
1. Talk like a real human friend, not a robotic script or encyclopedia.
2. ALWAYS prioritize the ongoing conversation context. If the user says "what should I do", look at what they said just before this.
3. For generic greetings or short follow-ups, reply naturally and directly without fetching definitions.
4. If code is requested, use clean markdown blocks.
5. 🚨 STRICT MAP RULE: If "CURRENT WEB DATA FOR CONTEXT" provides nearby places, YOU MUST ONLY suggest those exact names and YOU MUST provide their exact Address. DO NOT invent or guess generic brand names like CCD or Starbucks.
6. Use markdown effectively. Bold (**) the key terms, names, and important phrases to make the text easy to read and scan.
7. 🚨 ARTIFACT & MULTIPLE FILES RULE: If the user asks for a document, code file, or multiple files (e.g., .doc, .pdf, .txt, .js), DO NOT dump the raw text directly in the chat. 
- First, write a brief checklist of what you are generating using standard markdown task lists (e.g., - [x] Generating File 1).
- Then, for EACH file, wrap the content in a markdown code block using the exact tag "artifact:Filename.ext" (Example: \`\`\`artifact:Cookie_Policy.md ... \`\`\`).
- You can output multiple artifact blocks in a single response if the user asks for multiple files. SVA's frontend will render these as interactive downloadable file cards.`;

    const messagesArray = [
      { role: "system", content: masterSystemInstruction }
    ];

    previousChats.reverse().forEach(chat => {
      messagesArray.push({ role: "user", content: chat.message });
      messagesArray.push({ role: "assistant", content: chat.reply });
    });

    /* =========================================
       🔍 SEARCH ENGINE FILTER
    ========================================= */
    let webContext = "";
    if (!isFollowUp && !image) { 
      if (isFoodQuery && location) {
        try {
          const places = await searchNearbyPlaces(searchKeyword, location.lat, location.lng);
          if (places && places.length > 0) {
            webContext = places.map((p, i) => `\n[Place ${i + 1}]\nName: ${p.name}\nRating: ${p.rating || "N/A"}\nAddress: ${p.vicinity}\n`).join("\n");
          } else {
            webContext = "SYSTEM ALERT: No places found nearby on the real map. Tell the user gently that no places are listed in their immediate vicinity on the map.";
          }
        } catch (err) { console.log("Nearby Search Error:", err.message); }
      } else {
        try {
          webContext = await webSearch(message);
        } catch (searchError) { console.log("Web Search Error:", searchError.message); }
      }
    }

    if (webContext && webContext !== "EMPTY_NO_DATA") {
      messagesArray.push({ role: "system", content: `CURRENT WEB DATA FOR CONTEXT (Use if relevant):\n${webContext}` });
    }

    /* =========================================
       📷 VISION OR TEXT USER CONTENT SETUP
    ========================================= */
    if (image) {
      console.log("📸 Image detected! Formatting request for Vision Model...");
      messagesArray.push({
        role: "user",
        content: [
          { type: "text", text: message || "Analyze this image in detail." },
          { type: "image_url", image_url: { url: image } } 
        ]
      });
    } else {
      messagesArray.push({ role: "user", content: message });
    }

    /* =========================================
       🚨 UNIVERSAL MULTI-ENGINE ROUTER
    ========================================= */
    let reply = "SVA could not generate a response.";
    const activeModel = image ? "SVA Vision" : model;

    try {
      // 📷 CASE 0: VISION ANALYSIS
      if (activeModel === "SVA Vision") {
        console.log("⚙️ Executing Vision Track on Groq Llama 4 Scout...");
        const chatCompletion = await groq.chat.completions.create({
          messages: messagesArray,
          model: "meta-llama/llama-4-scout-17b-16e-instruct", 
          temperature: 0.2
        });
        reply = chatCompletion.choices?.[0]?.message?.content || reply;
      }
      
      // ⚡ CASE 1: GROQ (SVA Flash) -> Fallback to Ollama
      else if (activeModel === "SVA Flash") {
        console.log("⚙️ Executing SVA Flash on Groq Llama 3.1 8B...");
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: messagesArray,
            model: "llama-3.1-8b-instant",
            temperature: 0.3
          });
          reply = chatCompletion.choices?.[0]?.message?.content || reply;
        } catch (flashError) {
          console.log("🔥 Groq Limit/Error! Activating OLLAMA Local Engine for Flash...");
          // 🛠️ FIX APPLIED HERE
          const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama3.2', messages: messagesArray, stream: false })
          });
          const ollamaData = await ollamaResponse.json();
          reply = ollamaData.message?.content || "System overload. Local fallback also failed.";
          console.log("✅ Answered by Ollama (Flash Backup)");
        }
      } 
      
      // 🧠 CASE 2: SVA CORE (Triple-Engine)
      else if (activeModel === "SVA Core") {
        console.log("⚙️ Executing SVA Core: Trying SambaNova...");
        try {
          const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  model: 'Meta-Llama-3.2-3B-Instruct', 
                  messages: messagesArray,
                  temperature: 0.2
              })
          });

          const rawText = await response.text();
          if (!response.ok) throw new Error("SambaNova limit or issue");

          const data = JSON.parse(rawText);
          reply = data.choices?.[0]?.message?.content || reply;
          console.log("✅ Answered by SambaNova (Level 1)");

        } catch (backupError) {
          console.log("🔄 Level 1 Failed. Fetching from Groq 70B...");
          try {
            const chatCompletion = await groq.chat.completions.create({
              messages: messagesArray,
              model: "llama-3.3-70b-versatile", 
              temperature: 0.2 
            });
            reply = chatCompletion.choices?.[0]?.message?.content || reply;
            console.log("✅ Answered by Groq (Level 2 Backup)");

          } catch (criticalError) {
            console.log("🔥 Level 2 Failed. Activating OLLAMA Local Engine...");
            // 🛠️ FIX APPLIED HERE
            const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: 'llama3.2', messages: messagesArray, stream: false })
            });
            const ollamaData = await ollamaResponse.json();
            reply = ollamaData.message?.content || "System overload. Even local engine failed.";
            console.log("✅ Answered by Ollama (Ultimate Backup)");
          }
        }
      }

      // 🛡️ CASE 3: OLLAMA DIRECT (SVA Secure)
      else if (activeModel === "SVA Secure") {
        console.log("⚙️ Executing Locally on Ollama...");
        // 🛠️ FIX APPLIED HERE
        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'llama3.2:1b', messages: messagesArray, stream: false })
        });
        
        const data = await response.json();
        
        // 🚨 OLLAMA DEBUG LOG
        if (!response.ok || data.error) {
            console.log("❌ OLLAMA HIDDEN ERROR:", data);
        }
        
        reply = data.message?.content || reply;
      }

    } catch (engineError) {
      console.error(`❌ Engine Error (${activeModel}):`, engineError.message);
      return res.status(500).json({ success: false, message: `Engine Failure: ${activeModel} is offline.` });
    }

    /* =========================================
       💾 SAVE CHAT & RESPONSE
    ========================================= */
    let title = "New Chat";
    const existingSession = await Chat.findOne({ sessionId });
    if (!existingSession) {
      title = message ? message.replace(/[^\w\s]/g, "").trim().slice(0, 40) : "Image Upload Chat";
    } else {
      title = existingSession.title;
    }

    if (!ghostMode) {
      await Chat.create({ sessionId, userId, title, message: message || "[Uploaded Image]", reply });
    }

    res.json({ success: true, reply });

  } catch (error) {
    console.error("❌ UNIVERSAL CONTROLLER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    // 🚨 Yahan bhi safe check laga diya
    const userId = req.user._id || req.user.id; 
    
    const chats = await Chat.find({ sessionId, userId }).sort({ createdAt: 1 });
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load session" });
  }
};