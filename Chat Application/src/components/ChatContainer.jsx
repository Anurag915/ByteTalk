import React, { useContext, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { useEffect } from "react";
import { formatMessageTime } from "../lib/utils";
import { useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    isRightPanelOpen,
    setIsRightPanelOpen,
    typingUsers,
    socket,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);

  // Handle typing status
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!socket || !selectedUser) return;

    // Send typing event
    socket.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to send stopTyping
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }, 2000);
  };

  //Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;

    // Stop typing immediately when sending
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stopTyping", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  //handle sending the image

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  const isUserTyping = selectedUser && typingUsers[selectedUser._id];

  return selectedUser ? (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md z-10">
        {/* Left: User Info Header */}
        <div className="flex items-center gap-2">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            className="w-10 h-10 rounded-full object-cover"
            alt="profile"
          />
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              {selectedUser.fullName}
              {onlineUsers.includes(selectedUser._id) && (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0F0C1D]"></span>
              )}
            </p>
            <p className="text-xs text-neutral-400">
              {onlineUsers.includes(selectedUser._id)
                ? isUserTyping
                  ? "typing..."
                  : "Active now"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            className="md:hidden w-6 cursor-pointer opacity-70 hover:opacity-100"
            alt="back"
          />
          <img
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer opacity-70 hover:opacity-100 transition-transform active:scale-90"
            alt="menu"
          />
        </div>
      </div>

      {/* chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => {
            const isSent = msg.senderId === authUser._id;
            return (
              <div
                key={index}
                className={`flex gap-3 ${
                  isSent
                    ? "flex-row justify-end"
                    : "flex-row-reverse justify-end"
                }`}
              >
                {/* Message Content */}
                <div
                  className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isSent ? "items-end" : "items-start"}`}
                >
                  {msg.image ? (
                    <div className="relative group">
                      <img
                        src={msg.image}
                        className="rounded-2xl border border-white/10 shadow-lg mb-1 max-h-80 object-cover cursor-pointer hover:brightness-90 transition-all"
                        alt="message"
                        onClick={() => window.open(msg.image)}
                      />
                      <p
                        className={`text-[10px] text-gray-400 mt-1 px-1 ${isSent ? "text-right" : "text-left"}`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`p-3.5 text-sm rounded-2xl break-words shadow-sm transition-all ${
                          isSent
                            ? "bg-violet-600 text-white rounded-tr-none"
                            : "bg-white/10 text-gray-100 rounded-tl-none border border-white/5"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p
                        className={`text-[10px] text-gray-400 mt-1.5 px-1 ${isSent ? "text-right" : "text-left"}`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </>
                  )}
                </div>

                {/* Avatar */}
                <img
                  src={
                    isSent
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start mt-0.5"
                />
              </div>
            );
          })}
          <div ref={scrollEnd}></div>
        </div>
      </div>

      {/* Bottom area */}
      <div className="p-4 md:p-6 border-t border-white/10 bg-[#0F0C1D]/40 backdrop-blur-xl flex-shrink-0 relative">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 px-4 py-1.5 rounded-2xl focus-within:border-violet-500/50 transition-all duration-200">
            <input
              onChange={handleInputChange}
              value={input}
              onKeyDown={(e) =>
                e.key === "Enter" ? handleSendMessage(e) : null
              }
              className="flex-1 text-sm py-2.5 border-none bg-transparent outline-none text-white placeholder-white/30"
              type="text"
              placeholder="Type your message..."
            />
            <input
              onChange={handleSendImage}
              type="file"
              id="image"
              accept="image/jpeg, image/png"
              hidden
            />
            <label
              htmlFor="image"
              className="hover:scale-110 transition-transform cursor-pointer p-2 rounded-full hover:bg-white/5"
            >
              <img
                src={assets.gallery_icon}
                alt="attach"
                className="w-5 h-5 opacity-60 hover:opacity-100"
              />
            </label>
          </div>
          <button
            onClick={handleSendMessage}
            className="bg-violet-600 hover:bg-violet-500 p-3 rounded-2xl transition-all duration-200 active:scale-95 flex-shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          >
            <img
              src={assets.send_button}
              alt="send"
              className="w-6 h-6 invert brightness-0"
            />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full p-4">
      <img src={assets.logo_icon} alt="logo" className="w-16" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
