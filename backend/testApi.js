import dotenv from "dotenv";
dotenv.config(); // 🚨 Yeh line ensure karegi ki test script API keys ko padh paye

import { getStockData, webSearch } from "./src/services/searchService.js"; 

async function runTests() {
  console.log("🚀 Starting API Tests...\n");

  console.log("🔑 Checking Tavily Key:", process.env.TAVILY_API_KEY ? "LOADED" : "MISSING!");

  console.log("\n📊 TEST 1: Fetching Yahoo Finance Data...");
  const stockData = await getStockData("LBGJ"); 
  console.log("Stock Result:", stockData);
  console.log("--------------------------------------------------\n");

  console.log("🌐 TEST 2: Fetching Tavily Web Search...");
  const searchData = await webSearch("Who won the T20 Cricket World Cup 2024?");
  console.log("Search Result:", searchData);
  console.log("--------------------------------------------------\n");

  console.log("✅ Tests Completed!");
}

runTests();