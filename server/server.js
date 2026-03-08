import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import exp from "constants";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

import { Server } from "socket.io";
import { log } from "console";
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

//socket.io connection handler

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId, "Socket ID:", socket.id);
  
  if (userId && userId !== "undefined") {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    // Add socket id if not already present
    if (!userSocketMap[userId].includes(socket.id)) {
      userSocketMap[userId].push(socket.id);
    }
  }
  
  // emit online user IDs to all connected clients
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
});

//Middleware setup
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

if (process.env.NODE_ENV != "production") {
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

//export server function for vercel
export default server;
