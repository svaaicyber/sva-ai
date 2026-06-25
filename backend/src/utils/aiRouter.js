import { askGroq } from "../services/groqService.js";
import { askSambaNova } from "../services/sambanovaService.js";
import { askOllama } from "../services/ollamaService.js";
import { webSearch } from "../services/searchService.js";
import { searchNearbyPlaces } from "../services/searchEngine.js"; // 🚨 Search Engine service import kiya

export async function askAI(
  contextPrompt,
  userMessage,
  agent = "sva-core" // 🚨 Agent received
) {
  const originalUserMessage = userMessage;
  let finalMessage = contextPrompt;

/* =========================================
   FOOD / NEARBY SEARCH DETECTION
========================================= */

const lowerPrompt =
  userMessage.toLowerCase();

const isFoodQuery =

  lowerPrompt.includes("hungry") ||

  lowerPrompt.includes("food") ||

  lowerPrompt.includes("burger") ||

  lowerPrompt.includes("pizza") ||

  lowerPrompt.includes("cafe") ||

  lowerPrompt.includes("restaurant") ||

  lowerPrompt.includes("shawarma") ||

  lowerPrompt.includes("eat") ||

  lowerPrompt.includes("near me");

/* BUDGET DETECTION */

const budgetMatch =
  userMessage.match(/\d+/);

const budget =
  budgetMatch
    ? parseInt(budgetMatch[0])
    : null;

  /* IDENTITY QUESTIONS */
  const identityQuestions = ["who are you", "what are you", "tell me about yourself"];
  const isIdentityQuestion = identityQuestions.some(q => userMessage.toLowerCase().includes(q));

  if (isIdentityQuestion) {
    return `
# SVA
I'm SVA, an AI operating system built for:
- 💬 General conversations
- 💻 Coding assistance
- 🔍 Research
- 📈 Finance & stock analysis
- 📄 Reports & summaries
- 🌐 Live web information

How can I assist you today?
`;
  }

/* =========================================
   FOOD / PLACE SEARCH ENGINE
========================================= */

if (
  isFoodQuery &&
  contextPrompt?.location
) {

  try {

    console.log(
      "🍔 Searching nearby places..."
    );

    const places =
      await searchNearbyPlaces(

        "restaurant",

        contextPrompt.location.lat,

        contextPrompt.location.lng

      );

    const topPlaces =
      places.slice(0, 5);

    finalMessage = `

You are SVA.

User Budget:
₹${budget || "Unknown"}

Nearby Places Data:
${JSON.stringify(topPlaces)}

User Query:
${userMessage}

Instructions:

- Recommend BEST nearby places
- Mention ratings
- Mention addresses
- Keep response premium
- Do NOT hallucinate fake places
- Use markdown
- Suggest options under user's budget if possible

`;

  } catch (err) {

    console.log(
      "Nearby Search Error:",
      err.message
    );

  }

}


  /* WEB SEARCH DETECTION */
  const needsWeb = ["latest", "today", "news", "current", "recent", "announcement", "update"].some(word => userMessage.toLowerCase().includes(word));

  if (needsWeb) {
    try {
      console.log("🌐 Searching web...");
      const webResults = await webSearch(originalUserMessage);
      finalMessage = `
Use the live web data below when answering. Do not break your agent persona.
WEB RESULTS: ${JSON.stringify(webResults)}
USER QUESTION: ${originalUserMessage}
Instructions: Answer using latest information. Use markdown. Keep answers clean.
`;
    } catch (err) {
      console.log("Web search failed:", err.message);
    }
  }

  /* GROQ */
  try {
    console.log("⚡ Using Groq");
    return await askGroq(finalMessage, agent); // 🚨 Passed Agent
  } catch (err) {
    console.log("Groq failed:", err.message);
  }

  /* SAMBANOVA */
  try {
    console.log("⚡ Using SambaNova");
    return await askSambaNova(finalMessage, agent); // 🚨 Passed Agent
  } catch (err) {
    console.log("SambaNova failed:", err.message);
  }

  /* OLLAMA */
  try {
    console.log("⚡ Using Ollama");
    return await askOllama(finalMessage, agent); // 🚨 Passed Agent
  } catch (err) {
    console.log("Ollama failed:", err.message);
    return `# SVA\nAll AI providers are currently unavailable. Please try again in a few moments.`;
  }
}