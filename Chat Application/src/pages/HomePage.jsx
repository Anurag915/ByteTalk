import React, { useContext } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import RightSidebar from "../components/RightSidebar.jsx";
import { useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { ChatContext } from "../context/ChatContext.jsx";
const HomePage = () => {
  // const [selectedUser, setSelectedUser] = useState(false);
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen bg-[#0F0C1D] text-white overflow-hidden">
      <div className="backdrop-blur-xl h-full grid relative grid-cols-1 md:grid-cols-[380px_1fr]">
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
