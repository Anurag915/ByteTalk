import express from "express";
import { protectRoute } from "../middleware/auth.js";
import User from "../models/User.js";

import {
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
  toggleReaction,
  editMessage,
  deleteMessage,
  pinMessage,
  unpinMessage,
  getAIReplies,
  getChatSummary,
  getAIAnalysis,
} from "../controllers/messageController.js";
const messageRouter = express.Router();
messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/react/:id", protectRoute, toggleReaction);
messageRouter.put("/edit/:id", protectRoute, editMessage);
messageRouter.put("/pin/:id", protectRoute, pinMessage);
messageRouter.put("/unpin/:id", protectRoute, unpinMessage);
messageRouter.delete("/:id", protectRoute, deleteMessage);
messageRouter.post("/ai-replies", protectRoute, getAIReplies);
messageRouter.get("/summarize/:userToChatId", protectRoute, getChatSummary);
messageRouter.post("/analyze", protectRoute, getAIAnalysis);
export default messageRouter;


