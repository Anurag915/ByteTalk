import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import exp from "constants";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

import { Server } from "socket.io";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import User from "./models/User.js";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
//create express app
const app = express();
//create server
const server = http.createServer(app);

//initialise socket.io server
export const io = new Server(server, {
  cors: {
    origin: ["https://byte-talk-frontend.vercel.app", "http://localhost:5173"],
    credentials: true,
  },
});
//store online user

export const userSocketMap = {}; // { userId: [socketId1, socketId2...] }

//socket.io middleware for Clerk authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = await clerkClient.verifyToken(token);
    socket.userId = decoded.sub; // This is the Clerk User ID
    next();
  } catch (err) {
    console.error("Socket authentication error details:", {
      message: err.message,
      name: err.name,
      err
    });
    next(new Error("Authentication error: Invalid token"));
  }
});

//socket.io connection handler
io.on("connection", async (socket) => {
  try {
    const clerkId = socket.userId;
    
    // We need to map clerkId to our MongoDB _id for existing socket logic
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      console.error("Connected socket user not found in DB:", clerkId);
      return socket.disconnect();
    }

    const userId = user._id.toString();
    console.log("User connected", userId, "Socket ID:", socket.id);
    
    if (userId) {
      if (!userSocketMap[userId]) {
        userSocketMap[userId] = [];
      }
      if (!userSocketMap[userId].includes(socket.id)) {
        userSocketMap[userId].push(socket.id);
      }
    }
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Typing indicator events
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketIds = userSocketMap[receiverId];
      if (receiverSocketIds) {
        receiverSocketIds.forEach(id => {
          io.to(id).emit("typing", { senderId });
        });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketIds = userSocketMap[receiverId];
      if (receiverSocketIds) {
        receiverSocketIds.forEach(id => {
          io.to(id).emit("stopTyping", { senderId });
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", userId, "Socket ID:", socket.id);
      if (userId && userSocketMap[userId]) {
        // Remove specific socket ID
        userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
        
        // If no sockets left for this user, remove user from map
        if (userSocketMap[userId].length === 0) {
          delete userSocketMap[userId];
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  } catch (error) {
    console.error("Error in socket connection handler:", error);
    socket.disconnect();
  }
});

//Middleware setup
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.dev https://clerk.accounts.dev https://*.clerk.accounts.dev; " +
    "connect-src 'self' https://*.clerk.dev https://clerk.accounts.dev https://*.clerk.accounts.dev ws://localhost:5000 wss://localhost:5000 http://localhost:5000 https://byte-talk-frontend.vercel.app; " +
    "img-src 'self' data: blob: https://*.clerk.dev https://clerk.accounts.dev https://*.clerk.accounts.dev https://res.cloudinary.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://*.clerk.dev https://clerk.accounts.dev https://*.clerk.accounts.dev;"
  );
  next();
});

app.use(express.json({ limit: "4mb" }));
// app.use(cors({ origin: "*"}));
app.use(
  cors({
    origin: ["https://byte-talk-frontend.vercel.app", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  }),
);

app.use("/api/status", (req, res) => {
  res.send("server is running");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
//connect to MongoDB

await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//export server function for vercel
export default server;
