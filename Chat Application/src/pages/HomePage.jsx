import React, { useContext } from "react";
import Sidebar from "../components/Sidebar.jsx";
import NavSidebar from "../components/NavSidebar.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import RightSidebar from "../components/RightSidebar.jsx";
import MessageInfo from "../components/MessageInfo.jsx";
import SummaryPanel from "../components/SummaryPanel.jsx";
import { useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { ChatContext } from "../context/ChatContext.jsx";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#07060a] text-white">
      <div className="h-full flex relative">
        <NavSidebar />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] h-full">
          <Sidebar />
          <ChatContainer />
          <RightSidebar />
          <MessageInfo />
          <SummaryPanel />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
