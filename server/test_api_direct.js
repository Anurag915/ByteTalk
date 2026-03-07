import "dotenv/config";
import fs from "fs";

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  let log = "Direct API Test (using fetch)...\n";
  
  const v1betaUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const v1Url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: "Hi" }] }]
  };

  const testUrl = async (url, label) => {
    log += `\nTesting ${label}...\n`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        log += `✅ ${label} Success: ${JSON.stringify(data).substring(0, 50)}\n`;
      } else {
        log += `❌ ${label} Failed: ${response.status} ${JSON.stringify(data.error?.message || data)}\n`;
      }
    } catch (e) {
      log += `❌ ${label} Exception: ${e.message}\n`;
    }
  };

  await testUrl(v1betaUrl, "v1beta");
  await testUrl(v1Url, "v1");

  fs.writeFileSync("gemini_api_debug.txt", log);
  console.log("Results written to gemini_api_debug.txt");
}

test();
