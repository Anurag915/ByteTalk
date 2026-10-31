import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const GROQ_MODEL = "llama-3.1-8b-instant";

/**
 * Generic function to execute a prompt with Gemini, falling back to Groq.
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
const generateWithFailover = async (prompt) => {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (geminiError) {
    console.error("Gemini failed:", geminiError.message || geminiError);
    
    if (groqClient) {
      console.log("Switched to Groq successfully for fallback processing.");
      try {
        const chatCompletion = await groqClient.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: GROQ_MODEL,
        });
        return chatCompletion.choices[0]?.message?.content || "";
      } catch (groqError) {
        console.error("Groq also failed:", groqError.message || groqError);
        throw new Error("Both Gemini and Groq AI providers failed.");
      }
    } else {
      console.error("Groq fallback not configured (missing GROQ_API_KEY).");
      throw geminiError;
    }
  }
};

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

    const text = await generateWithFailover(prompt);
    
    // Split by newline and clean up
    const replies = text
      .split("\n")
      .map(reply => reply.trim())
      // remove any markdown bullets or numbers if AI didn't follow instructions perfectly
      .map(reply => reply.replace(/^[-*0-9.]+\s*/, ''))
      .filter(reply => reply.length > 0)
      .slice(0, 3);
      
    return replies.length > 0 ? replies : ["Okay", "Got it", "Thanks!"];
  } catch (error) {
    console.error("Error generating smart replies:", error);
    return ["Okay", "Got it", "Thanks!"]; // Fallback replies
  }
};

/**
 * Generates a concise, bulleted summary of a chat conversation.
 * @param {Array} messages - Array of message objects containing text and sender info.
 * @returns {Promise<string>} - The generated summary text.
 */
export const generateChatSummary = async (messages) => {
  try {
    if (!messages || messages.length === 0) return "No messages to summarize.";

    const conversationText = messages
      .map((msg) => `${msg.senderId?.fullName || "User"}: ${msg.text || "[Media Message]"}`)
      .join("\n");

    const prompt = `You are a helpful assistant that summarizes chat conversations.
    Based on the following chat history, provide a concise summary of the most important points.
    Use bullet points and keep it professional but conversational.
    
    Chat History:
    ${conversationText}`;

    return await generateWithFailover(prompt);
  } catch (error) {
    console.error("Error generating chat summary:", error);
    return "Failed to generate summary. Please try again later.";
  }
};

/**
 * Analyzes a single message to extract tasks, deadlines, and meetings.
 * @param {string} text - The message text to analyze.
 * @returns {Promise<string>} - The structured analysis result.
 */
export const analyzeMessageContent = async (text) => {
  try {
    if (!text) return "No text provided for analysis.";

    const prompt = `You are a productivity assistant. Analyze the following chat message and extract any mentioned:
    - Tasks (actions to be done)
    - Deadlines (specific dates or times for tasks)
    - Meetings or Appointments (events with participants and times)
    
    Format the output clearly with headers and bullet points. If no actionable information is found, say "No tasks or deadlines found in this message."
    
    Message: "${text}"`;

    return await generateWithFailover(prompt);
  } catch (error) {
    console.error("Error analyzing message content:", error);
    return "Failed to analyze message content. Please try again later.";
  }
};
