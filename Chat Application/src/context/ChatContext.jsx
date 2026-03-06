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

  const handleNewMessage = useCallback(
    (newMessage) => {
      const senderId = newMessage.senderId;

      if (selectedUserRef.current && senderId === selectedUserRef.current._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios
          .put(`/api/messages/mark/${newMessage._id}`)
          .catch((err) => console.error("Failed to mark message as seen", err));
      } else {
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
    [axios],
  );

  const handleTyping = useCallback(({ senderId }) => {
    console.log("CLIENT: Received typing event from:", senderId);
    setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
  }, []);

  const handleStopTyping = useCallback(({ senderId }) => {
    console.log("CLIENT: Received stopTyping event from:", senderId);
    setTypingUsers((prev) => {
      const newState = { ...prev };
      delete newState[senderId];
      return newState;
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
