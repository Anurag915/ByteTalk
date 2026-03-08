import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import fs from "fs";

async function test() {
  let log = "Testing Gemini API...\n";
  log += "API Key found: " + (process.env.GEMINI_API_KEY ? "Yes" : "No") + "\n";
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelList = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-1.5-pro-latest", "gemini-pro"];
    
    for (const modelName of modelList) {
      log += `\nTesting model: ${modelName}\n`;
      try {
        const m = genAI.getGenerativeModel({ model: modelName });
        const r = await m.generateContent("Hi");
        const resp = await r.response;
        log += `✅ Success with ${modelName}: ${resp.text().substring(0, 50)}\n`;
      } catch (e) {
        log += `❌ Failed with ${modelName}: ${e.message}\n`;
      }
    }
  } catch (error) {
    log += "GENERAL ERROR: " + error.message + "\n";
  }
  
  fs.writeFileSync("gemini_test_results.txt", log);
  console.log("Results written to gemini_test_results.txt");
}

test();
