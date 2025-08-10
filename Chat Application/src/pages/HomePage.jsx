import React, { useContext } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/chatContainer.jsx";
import RightSidebar from "../components/RightSidebar.jsx";
import { useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { ChatContext } from "../context/ChatContext.jsx";
const HomePage = () => {
  // const [selectedUser, setSelectedUser] = useState(false);
  const {selectedUser}=useContext(ChatContext);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        {}
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
