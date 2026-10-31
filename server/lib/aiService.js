import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const AI_REQUEST_TIMEOUT_MS = 15000;

const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });

let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: AI_REQUEST_TIMEOUT_MS,
    maxRetries: 1,
  });
}

const generateWithGroq = async (prompt) => {
  if (!groqClient) {
    throw new Error("Groq is not configured.");
  }

  const request = {
    messages: [{ role: "user", content: prompt }],
    model: GROQ_MODEL,
  };

  if (GROQ_MODEL.startsWith("openai/gpt-oss")) {
    request.reasoning_effort = "low";
    request.max_completion_tokens = 1200;
  }

  const chatCompletion = await groqClient.chat.completions.create(request);
  const text = chatCompletion.choices[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
};

const generateWithGemini = async (prompt) => {
  const result = await geminiModel.generateContent(prompt, {
    timeout: AI_REQUEST_TIMEOUT_MS,
  });
  const response = await result.response;
  const text = response.text()?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
};

/**
 * Executes a prompt with the verified Groq model, then falls back to Gemini.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
const generateWithFailover = async (prompt) => {
  if (groqClient) {
    try {
      return await generateWithGroq(prompt);
    } catch (groqError) {
      console.error("Groq failed; trying Gemini:", groqError.message || groqError);
    }
  }

  try {
    return await generateWithGemini(prompt);
  } catch (geminiError) {
    console.error("Gemini also failed:", geminiError.message || geminiError);
    throw new Error("All configured AI providers failed.");
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
    throw new Error("Unable to generate the chat summary right now.");
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
