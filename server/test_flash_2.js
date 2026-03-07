import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const text = "Hey, what are you doing?";
  const prompt = `You are a helpful chat assistant. Based on the following message, provide exactly three short, natural, conversational replies.
  Each reply should be between 1-5 words.
  Return ONLY the three replies, separated by newlines. No numbers, no extra text.
  
  Message: "${text}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("PROMPT:", prompt);
    console.log("RESULT:\n", response.text());
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}

test();
