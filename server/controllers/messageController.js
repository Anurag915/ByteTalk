import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

//Get all user except logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );

    // Get unseen counts and last message timestamp for each user
    const unseenMessages = {};
    const usersWithActivity = await Promise.all(
      filteredUsers.map(async (user) => {
        // Find last message between me and this user
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: user._id },
            { senderId: user._id, receiverId: userId },
          ],
        }).sort({ createdAt: -1 });

        const unseenCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });

        if (unseenCount > 0) {
          unseenMessages[user._id] = unseenCount;
        }

        return {
          ...user.toObject(),
          lastActivity: lastMessage ? lastMessage.createdAt : new Date(0),
        };
      }),
    );

    // Sort users by last activity (most recent first)
    usersWithActivity.sort((a, b) => b.lastActivity - a.lastActivity);

    res.json({ success: true, user: usersWithActivity, unseenMessages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Get all message for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true, seenAt: new Date() },
    );
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to mark messages as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true, seenAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//send message to the selected user

// export const sendMessage=async(req,res)=>{
//     try{
//         const [text,image]=req.body;
//         const receiverId=req.params.id;
//         const senderId=req.user._id;
//         let imageUrl
//         if(image){
//             const uploadResponse=await cloudinary.uploader.upload(image);
//             imageUrl=uploadResponse.secure_url;
//         }
//         const newMessage=await Message.create({
//             senderId,receiverId,text,image:imageUrl
//         })

//         //emit the new message to the receiver's socket

//         const receiverSocketId=useSocketMap[receiverId];
//         if(receiverSocketId){
//             io.to(receiverSocketId).emit("newMessage",newMessage);
//         }

//         res.json({success:true,newMessage});

//     }
//     catch(error){
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }

// }

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video", // Cloudinary handles audio under 'video' resource type
      });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Toggle reaction on a message
export const toggleReaction = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Check if the reaction already exists
    const reactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji,
    );

    if (reactionIndex > -1) {
      // Remove reaction if it exists
      message.reactions.splice(reactionIndex, 1);
    } else {
      // Add reaction if it doesn't exist
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Broadcast the update to all connected users in the chat
    // We can emit to both sender and receiver sockets if online
    const receiverSocketId = userSocketMap[message.receiverId];
    const senderSocketId = userSocketMap[message.senderId];

    const reactionUpdate = {
      messageId,
      reactions: message.reactions,
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", reactionUpdate);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReaction", reactionUpdate);
    }

    res.json({ success: true, reactions: message.reactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Verify ownership
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to edit this message" });
    }

    message.text = text;
    // Optional: add an "edited" flag if desired, though not in schema yet
    await message.save();

    // Broadcast update
    const receiverSocketId = userSocketMap[message.receiverId];
    const senderSocketId = userSocketMap[message.senderId];

    const update = { messageId, text };

    if (receiverSocketId) io.to(receiverSocketId).emit("messageUpdate", update);
    if (senderSocketId) io.to(senderSocketId).emit("messageUpdate", update);

    res.json({ success: true, message });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Verify ownership
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to delete this message",
        });
    }

    await Message.findByIdAndDelete(messageId);

    // Broadcast delete
    const receiverSocketId = userSocketMap[message.receiverId];
    const senderSocketId = userSocketMap[message.senderId];

    if (receiverSocketId)
      io.to(receiverSocketId).emit("messageDelete", messageId);
    if (senderSocketId) io.to(senderSocketId).emit("messageDelete", messageId);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
