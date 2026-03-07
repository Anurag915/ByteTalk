import "dotenv/config";
import fs from "fs";

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  let log = "Listing Models via API...\n";
  
  const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(modelsUrl);
    const data = await response.json();
    if (response.ok) {
      log += "✅ Successfully fetched models list\n";
      log += JSON.stringify(data, null, 2);
    } else {
      log += `❌ Failed to list models: ${response.status} ${JSON.stringify(data)}\n`;
    }
  } catch (e) {
    log += `❌ Exception: ${e.message}\n`;
  }

  fs.writeFileSync("gemini_models_list.txt", log);
  console.log("Results written to gemini_models_list.txt");
}

test();
