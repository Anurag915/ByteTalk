import React, { useContext } from "react";
import { MessageSquare, Phone, Image, User, LogOut, Settings } from "lucide-react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import assets from "../assets/assets";

const NavSidebar = () => {
  const { activeSidebarSection, setActiveSidebarSection } = useContext(ChatContext);
  const { authUser, logout } = useContext(AuthContext);

  const navItems = [
    { id: "chats", icon: MessageSquare, label: "Chats" },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "media", icon: Image, label: "Media" },
  ];

  return (
    <div className="w-[75px] h-full bg-[#1A162E] flex flex-col items-center py-6 border-r border-white/5 flex-shrink-0 z-20">
      {/* Top Section: Nav Icons */}
      <div className="flex flex-col gap-6 flex-1 w-full items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSidebarSection(item.id)}
            className={`relative group p-3 rounded-xl transition-all duration-300 ${
              activeSidebarSection === item.id
                ? "bg-violet-500/20 text-violet-400"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
            title={item.label}
          >
            <item.icon className="w-6 h-6" />
            
            {/* Tooltip or Label - optional for clean look */}
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </span>

            {/* Active Indicator */}
            {activeSidebarSection === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Bottom Section: Profile & Logout */}
      <div className="flex flex-col gap-4 items-center w-full px-2">
         {/* Profile Icon */}
         <button
          onClick={() => setActiveSidebarSection("profile")}
          className={`relative group p-1 rounded-full transition-all duration-300 border-2 ${
            activeSidebarSection === "profile"
              ? "border-violet-500 p-1"
              : "border-transparent hover:border-white/10"
          }`}
          title="Profile"
        >
          <img
            src={authUser?.profilePic || assets.avatar_icon}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
           <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Profile
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group relative"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
          <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default NavSidebar;
