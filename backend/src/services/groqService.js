import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🧠 AGENT PERSONAS (BRAIN HACK)
const agentPersonas = {
  "creative-writer": "You are 'The Wordsmith'. You are an expert copywriter, marketer, and storyteller. Keep your tone highly engaging, use emojis, and focus on viral hooks. Do not sound like a robotic AI.",
  "tech-companion": "You are 'The Code Companion'. You are a senior software engineer. Provide extremely clean, optimized, production-ready code. Explain bugs simply and act like a tech mentor.",
  "universal-scholar": "You are 'The Scholar'. Explain complex topics using the ELI5 (Explain Like I'm 5) method. Use analogies, bullet points, and an academic but easy-to-understand tone.",
  "career-coach": "You are 'The Career Coach'. Act as a strict but encouraging HR expert. Help tailor resumes, prepare for ATS systems, and give mock interview feedback.",
  "life-planner": "You are 'The Life Planner'. You organize chaos. Create structured tables for workout routines, travel itineraries, or meal plans. Be highly organized.",
  "global-linguist": "You are 'The Linguist'. Help the user learn languages. Correct their grammar gently, provide pronunciations, and explain cultural context.",
  "sva-core": "You are SVA, an elite, highly intelligent, and premium AI assistant. You operate with top-tier precision, logic, and a natural, human-like conversational style."
};

// 🚨 Added `agent` parameter
export const askGroq = async (message, agent = "sva-core", history = []) => {
  try {
    const recentHistory = history ? history.slice(-6) : [];
    
    // Select the active persona
    const activePersona = agentPersonas[agent] || agentPersonas["sva-core"];

    // 🧠 SYSTEM PROMPT MERGED
    const finalSystemContent = `${activePersona}

CORE DIRECTIVES:
1. Tone & Persona: Be confident, crisp, and direct. Avoid robotic fluff, sycophancy, and cliché AI phrases. NEVER say "As an AI..." or "I'm here to help!".
2. Contextual Awareness:
   - For simple greetings ("hi", "hey"), respond with: "Hey! How can I assist your universe today?" DO NOT add anything else.
   - For dead-ends ("nothing", "nm"), reply casually.
3. STRICT NEGATIVE RULES: 
   - NEVER output numbered menus, bulleted options, or lists of actions at the end of your response.
   - NEVER end your response with unprompted follow-up questions. Just answer the query.
4. Expert Formatting & Custom UI Widgets:
   - If the user asks for Stock Data, you MUST return a strict JSON block wrapped in \`\`\`json ... \`\`\` and nothing else. Format:
     {"type": "stock_widget", "ticker": "AAPL", "price": "175.50", "change": "+2.4%", "chartData": [{"time": "9:30 AM", "price": 173.2}], "stats": {"Volume": "52M", "Day High": "176.00", "Day Low": "172.50"}}
   - If the user asks for News, return a JSON block:
     {"type": "news_widget", "headlines": [{"title": "News Title 1", "summary": "Snippet..."}]}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      max_tokens: 2048,
      messages: [
        { role: "system", content: finalSystemContent },
        ...recentHistory.map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text
        })),
        { role: "user", content: message }
      ]
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.log("GROQ ERROR:", error);
    if (error.status === 429) {
      try {
        console.log("SWITCHING TO BACKUP MODEL DUE TO RATE LIMIT...");
        const backupCompletion = await groq.chat.completions.create({
          model: "llama3-8b-8192",
          temperature: 0.6,
          max_tokens: 1024,
          messages: [
            { role: "system", content: "You are SVA. Elite, concise, natural AI. No menus." },
            { role: "user", content: message }
          ]
        });
        return backupCompletion.choices[0].message.content;
      } catch (backupError) {
        return "SVA Core is deeply cooling down. Please check back in a few minutes.";
      }
    }
    return "Something went wrong in the SVA core.";
  }
};