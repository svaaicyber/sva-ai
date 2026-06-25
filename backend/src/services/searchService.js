import axios from "axios";
import YahooFinance from "yahoo-finance2";
import dotenv from "dotenv";

dotenv.config();

// 🚨 Notice Fix: Yeh line faltu ke warning logs ko terminal mein aane se rokegi
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

/* ==========================
   📈 STOCK DATA (AI-Optimized)
========================== */
export async function getStockData(ticker) {
  try {
    const quote = await yahooFinance.quote(ticker.toUpperCase());
    
    if (!quote || !quote.regularMarketPrice) {
      return `Sorry, could not find real-time data for ticker: ${ticker}`;
    }

    // AI ko samajhne mein asani ho isliye ek clean string/object bhejenge
    return {
      ticker: ticker.toUpperCase(),
      price: quote.regularMarketPrice,
      changePercent: `${quote.regularMarketChangePercent?.toFixed(2)}%`,
      volume: quote.regularMarketVolume,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      marketCap: quote.marketCap,
      summary: `Currently, ${ticker.toUpperCase()} is trading at $${quote.regularMarketPrice} with a daily change of ${quote.regularMarketChangePercent?.toFixed(2)}%.`
    };

  } catch (error) {
    console.log("❌ Yahoo Finance Error:", error.message);
    return `Error fetching stock data for ${ticker}. Please check if the ticker symbol is correct.`;
  }
}

/* ==========================
   🌐 WEB SEARCH (LLM-Optimized)
========================== */
export async function webSearch(query) {
  try {
    const response = await axios.post("https://api.tavily.com/search", {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: "basic", // 'basic' agents ke liye best aur fast hai
      max_results: 3,        // Token bachane ke liye top 3 results kaafi hain
      include_answer: true   // Tavily khud ek short AI answer banake dega
    });

    const data = response.data;

    // 🚨 YAHAN MAGIC HAI: AI ko raw JSON mat do, sirf kaam ki cheez do
    let aiContext = `Tavily Search Summary: ${data.answer || "No direct answer provided by search."}\n\nTop Sources:\n`;
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((result, index) => {
        aiContext += `${index + 1}. [${result.title}] - ${result.content}\n`;
      });
    } else {
      aiContext += "No relevant sources found.\n";
    }

    return aiContext; // Yeh clean text LLM bohot pyaar se samjhega

  } catch (error) {
    console.log("❌ Tavily Error:", error.response?.data || error.message);
    return "Web search is currently unavailable. Proceed with your existing knowledge.";
  }
}

/* ==========================
   📰 NEWS SEARCH
========================== */
export async function getLatestNews(category = "technology") {
  try {
    const query = `latest breaking ${category} news today`;
    const result = await webSearch(query);
    return result;
  } catch (error) {
    console.log("❌ News Error:", error.message);
    return "Could not fetch the latest news at the moment.";
  }
}