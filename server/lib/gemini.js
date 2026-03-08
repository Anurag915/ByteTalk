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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing message content:", error);
    return "Failed to analyze message content. Please try again later.";
  }
};
