import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Generates three short, conversational smart replies based on the input message content.
 * @param {string} messageContent - The content of the received message.
 * @returns {Promise<string[]>} - A promise that resolves to an array of 3 strings.
 */
export const generateSmartReplies = async (messageContent) => {
  try {
    const prompt = `
      You are an AI assistant integrated into a chat application.
      Based on the received message below, generate exactly 3 short, natural, and conversational replies that a user might want to send in response.
      
      Rules:
      1. Each reply should be between 1 and 5 words.
      2. The tone should be friendly and informal.
      3. Return ONLY the 3 replies separated by newlines, with no numbering, bullets, or extra text.
      
      Message: "${messageContent}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split by newline and clean up
    const replies = text
      .split("\n")
      .map(reply => reply.trim())
      .filter(reply => reply.length > 0)
      .slice(0, 3);
      
    return replies;
  } catch (error) {
    console.error("Error generating smart replies with Gemini:", error);
    return ["Okay", "Got it", "Thanks!"]; // Fallback replies
  }
};
