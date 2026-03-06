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

export const userSocketMap = {};

//socket.io connection handler

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  //emit online user to all connected clients

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicator events
  socket.on("typing", ({ senderId, receiverId }) => {
    console.log(`SERVER: ${senderId} is typing to ${receiverId}`);
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    } else {
      console.log(`SERVER: Receiver socket not found for ${receiverId}`);
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    console.log(`SERVER: ${senderId} stopped typing to ${receiverId}`);
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete userSocketMap[userId];
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
