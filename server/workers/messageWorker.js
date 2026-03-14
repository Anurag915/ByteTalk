import { getChannel } from "../lib/rabbitmq.js";
import Message from "../models/Message.js";
import { userSocketMap, io } from "../server.js";

export const startMessageWorker = () => {
  const channel = getChannel();
  if (!channel) {
    console.error("RabbitMQ channel not available for worker");
    return;
  }

  const queue = "chat_messages";

  console.log(`Worker waiting for messages in ${queue}...`);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        const payload = JSON.parse(msg.content.toString());
        const { senderId, receiverId, text, image, audio } = payload;

        // Save to Database
        const newMessage = new Message({
          senderId,
          receiverId,
          text,
          image,
          audio,
        });
        
        await newMessage.save();

        // Broadcast to receiver via Socket.IO
        const receiverSocketIds = userSocketMap[receiverId];
        if (receiverSocketIds) {
          receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("newMessage", newMessage);
          });
        }

        // Broadcast to sender via Socket.IO to confirm message persistence
        const senderSocketIds = userSocketMap[senderId];
        if (senderSocketIds) {
          senderSocketIds.forEach((socketId) => {
            io.to(socketId).emit("newMessage", newMessage);
          });
        }

        // Acknowledge the message
        channel.ack(msg);
      } catch (error) {
        console.error("Error processing message in worker:", error);
        // We could selectively nack or reject here depending on the error
        // channel.nack(msg, false, false);
      }
    }
  });
};
