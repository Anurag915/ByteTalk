// import { createContext, useContext, useEffect, useState } from "react";
// import { AuthContext } from "./AuthContext";
// import toast from "react-hot-toast";

// export const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [messages, setMessages] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [unseenMessages, setUnseenMessages] = useState({});

//   const { socket, axios } = useContext(AuthContext);

//   const getUsers = async () => {
//     try {
//       const { data } = await axios.get("/api/messages/users");
//       if (data.success) {
//         setUsers(data.users);
//         setUnseenMessages(data.unseenMessages);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const getMessages = async (userId) => {
//     try {
//       const { data } = await axios.get(`/api/messages/${userId}`);
//       if (data.success) {
//         setMessages(data.messages);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const sendMessage = async (messageData) => {
//     try {
//       const { data } = await axios.post(
//         `/api/messages/send/${selectedUser._id}`,
//         messageData
//       );
//       if (data.success) {
//         setMessages((prevMessages) => [...prevMessages, data.newMessage]);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const subscribeToMessages = () => {
//     if (!socket) return;

//     socket.on("newMessage", (newMessage) => {
//       if (selectedUser && newMessage.senderId === selectedUser._id) {
//         newMessage.seen = true;
//         setMessages((prev) => [...prev, newMessage]);
//         axios.put(`/api/messages/mark/${newMessage._id}`);
//       } else {
//         setUnseenMessages((prev) => ({
//           ...prev,
//           [newMessage.senderId]: prev[newMessage.senderId]
//             ? prev[newMessage.senderId] + 1
//             : 1,
//         }));
//       }
//     });
//   };

//   const unsubscribeFromMessages = () => {
//     if (socket) {
//       socket.off("newMessage");
//     }
//   };

//   useEffect(() => {
//     subscribeToMessages();
//     return () => unsubscribeFromMessages();
//   }, [socket, selectedUser]);

//   const value = {
//     messages,
//     getUsers,
//     users,
//     selectedUser,
//     getMessages,
//     sendMessage,
//     setSelectedUser,
//     unseenMessages,
//     setUnseenMessages,
//   };

//   return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// };

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState(null); // Initialize as null to better track loading state
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }
  const [selectedMessageInfo, setSelectedMessageInfo] = useState(null);
  const [isMessageInfoOpen, setIsMessageInfoOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [smartReplies, setSmartReplies] = useState([]);
  const [chatSummary, setChatSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzingMessage, setIsAnalyzingMessage] = useState(false);

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const { socket, axios } = useContext(AuthContext);

  // Fetch the list of users and their unseen message counts
  const getUsers = useCallback(async () => {
    console.log("Attempting to fetch users..."); // DEBUG: Announce the fetch attempt
    if (!axios) {
      console.log("Axios instance not available. Skipping fetch."); // DEBUG
      return;
    }
    try {
      const { data } = await axios.get("/api/messages/users");

      // --- DEBUGGING: Log the entire raw response from the API ---
      console.log("API response from /api/messages/users:", data);

      // FIX: Changed data.users to data.user to match the API response
      if (data.success && Array.isArray(data.user)) {
        console.log("Successfully fetched users:", data.user); // DEBUG: Log the users array
        setUsers(data.user); // FIX: Changed data.users to data.user
        setUnseenMessages(data.unseenMessages);
      } else {
        console.error(
          "API call was successful but data.user is not an array or success is false.",
          data,
        );
        setUsers([]); // Set to empty array to prevent infinite loading state
      }
    } catch (error) {
      console.error("Error fetching users:", error); // DEBUG: Log the full error object
      toast.error(error?.response?.data?.message || error.message);
      setUsers([]); // Set to empty array on error
    }
  }, [axios]);

  // Fetch messages for a specific user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Send a message to the selected user
  const sendMessage = async (messageData) => {
    if (!selectedUser) {
      toast.error("No user selected!");
      return;
    }
    try {
      // messageData can now contain { text, image, audio }
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);

        // Move active user to top
        setUsers((prevUsers) => {
          if (!prevUsers) return prevUsers;
          const userIndex = prevUsers.findIndex(
            (u) => u._id === selectedUser._id,
          );
          if (userIndex <= 0) return prevUsers;
          const newUsers = [...prevUsers];
          const [user] = newUsers.splice(userIndex, 1);
          return [user, ...newUsers];
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Clear unseen messages for a specific user
  const clearUnseenMessages = (userId) => {
    setUnseenMessages((prev) => {
      const newUnseen = { ...prev };
      delete newUnseen[userId];
      return newUnseen;
    });
  };

  // Toggle a reaction on a message
  const toggleReaction = async (messageId, emoji) => {
    try {
      const { data } = await axios.put(`/api/messages/react/${messageId}`, {
        emoji,
      });
      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, reactions: data.reactions } : msg,
          ),
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const updateMessage = async (messageId, newText) => {
    try {
      const { data } = await axios.put(`/api/messages/edit/${messageId}`, {
        text: newText,
      });
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, text: newText } : msg,
          ),
        );
        toast.success("Message updated");
        setEditingMessage(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/${messageId}`);
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success("Message deleted");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const getSmartReplies = useCallback(async (text) => {
    try {
      if (!text || text.trim().length < 2) return;
      const { data } = await axios.post("/api/messages/ai-replies", { text: text.trim() });
      if (data.success) {
        setSmartReplies(data.replies);
      }
    } catch (error) {
      console.error("Error fetching AI replies:", error);
    }
  }, [axios]);

  const pinMessage = async (messageId, duration) => {
    try {
      const { data } = await axios.put(`/api/messages/pin/${messageId}`, {
        duration,
      });
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, isPinned: true, pinExpiry: data.message.pinExpiry }
              : msg,
          ),
        );
        toast.success("Message pinned");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const unpinMessage = async (messageId) => {
    try {
      const { data } = await axios.put(`/api/messages/unpin/${messageId}`);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isPinned: false, pinExpiry: null } : msg,
          ),
        );
        toast.success("Message unpinned");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

   const handleNewMessage = useCallback(
    (newMessage) => {
      const senderId = newMessage.senderId;

      if (selectedUserRef.current && senderId === selectedUserRef.current._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios
          .put(`/api/messages/mark/${newMessage._id}`)
          .catch((err) => console.error("Failed to mark message as seen", err));
        
        // Generate smart replies for incoming messages from the selected user
        if (newMessage.text) {
          getSmartReplies(newMessage.text);
        }
      } else {
        if (newMessage.receiverId === selectedUserRef.current?._id) {
          // If I sent this (from another tab), clear existing replies
          setSmartReplies([]);
        }
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }

      // Bubble user to top of sidebar
      setUsers((prevUsers) => {
        if (!prevUsers) return prevUsers;
        const userIndex = prevUsers.findIndex((u) => u._id === senderId);
        if (userIndex === -1) return prevUsers; // In case user list isn't fully loaded or fetched yet
        if (userIndex === 0) return prevUsers; // Already at top

        const newUsers = [...prevUsers];
        const [user] = newUsers.splice(userIndex, 1);
        return [user, ...newUsers];
      });
    },
    [axios, getSmartReplies],
  );

  const summarizeChat = async () => {
    if (!selectedUser) return;
    setIsSummarizing(true);
    try {
      const { data } = await axios.get(`/api/messages/summarize/${selectedUser._id}`);
      if (data.success) {
        setChatSummary(data.summary);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate summary");
    } finally {
      setIsSummarizing(false);
    }
  };

  const analyzeMessage = async (text) => {
    if (!text) return;
    setIsAnalyzingMessage(true);
    try {
      const { data } = await axios.post("/api/messages/analyze", { text });
      if (data.success) {
        setAnalysisResult(data.analysis);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to analyze message");
    } finally {
      setIsAnalyzingMessage(false);
    }
  };

  const handleTyping = useCallback(({ senderId }) => {
    setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
  }, []);

  const handleStopTyping = useCallback(({ senderId }) => {
    setTypingUsers((prev) => {
      const newState = { ...prev };
      delete newState[senderId];
      return newState;
    });
  }, []);

  const handleMessageReaction = useCallback(({ messageId, reactions }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId ? { ...msg, reactions } : msg,
      ),
    );

    // If the message being reacted to is currently viewed in info panel, update it
    setSelectedMessageInfo((prev) =>
      prev && prev._id === messageId ? { ...prev, reactions } : prev,
    );
  }, []);

  const handleMessageUpdate = useCallback(({ messageId, text }) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, text } : msg)),
    );
  }, []);

  const handleMessageDelete = useCallback((messageId) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
  }, []);

  const handleMessagePinUpdate = useCallback(
    ({ messageId, isPinned, pinExpiry }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned, pinExpiry } : msg,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("messageUpdate", handleMessageUpdate);
    socket.on("messageDelete", handleMessageDelete);
    socket.on("messagePinUpdate", handleMessagePinUpdate);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("messageUpdate", handleMessageUpdate);
      socket.off("messageDelete", handleMessageDelete);
      socket.off("messagePinUpdate", handleMessagePinUpdate);
    };
  }, [socket, handleNewMessage, handleTyping, handleStopTyping]);

  const value = {
    messages,
    setMessages,
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
    unseenMessages,
    clearUnseenMessages,
    isRightPanelOpen,
    setIsRightPanelOpen,
    typingUsers,
    socket,
    toggleReaction,
    selectedMessageInfo,
    setSelectedMessageInfo,
    isMessageInfoOpen,
    setIsMessageInfoOpen,
    editingMessage,
    setEditingMessage,
    updateMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    smartReplies,
    setSmartReplies,
    chatSummary,
    setChatSummary,
    isSummarizing,
    summarizeChat,
    analysisResult,
    setAnalysisResult,
    isAnalyzingMessage,
    analyzeMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
