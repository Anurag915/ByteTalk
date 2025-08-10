import React, { useContext, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { useEffect } from "react";
import { formatMessageTime } from "../lib/utils";
import { useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const scrollEnd = useRef();

  //Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
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
  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {/* Left: User Info Header */}
        <div className="flex items-center gap-2">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            className="w-8 h-8 rounded-full"
            alt="profile"
          />
          <p className="text-lg text-white flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-3">
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            className="md:hidden w-6 cursor-pointer"
            alt="back"
          />
          <img
            src={assets.help_icon}
            className="hidden md:block w-5 cursor-pointer"
            alt="help"
          />
          z
        </div>
      </div>
      {/* chat area */}
      <div className="f1ex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                alt="message"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                  msg.senderId === authUser._id
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>
      {/* Bottom area */}

      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
            type="text"
            placeholder="Send a message"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/jpeg, image/png"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="attach"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <div>
          <img
            onClick={handleSendMessage}
            src={assets.send_button}
            alt="send"
            className="w-7 cursor-pointer"
          />
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
