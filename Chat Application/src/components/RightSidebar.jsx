import React, { useContext, useState, useEffect } from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
const RightSidebar = () => {
  const { selectedUser, messages, isRightPanelOpen, setIsRightPanelOpen } =
    useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImage, setMsgImage] = useState([]);

  useEffect(() => {
    setMsgImage(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  return (
    <>
      {/* Backdrop */}
      {isRightPanelOpen && (
        <div
          onClick={() => setIsRightPanelOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-[#0F0C1D] border-l border-white/10 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl ${
          selectedUser && isRightPanelOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <p className="font-medium text-white/50 uppercase text-xs tracking-widest">
            User Info
          </p>
          <button
            onClick={() => setIsRightPanelOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <img
              src={assets.arrow_icon}
              className="w-5 rotate-180"
              alt="close"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center gap-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src={selectedUser?.profilePic || assets.avatar_icon}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white/5"
            />
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {onlineUsers.includes(selectedUser?._id) && (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              )}
              {selectedUser?.fullName}
            </h1>
            <p className="text-sm text-neutral-400 max-w-[250px]">
              {selectedUser?.bio || "No bio available"}
            </p>
          </div>

          <hr className="w-full border-white/5" />

          <div className="w-full">
            <h2 className="text-sm font-medium mb-4 text-white/50 px-2 uppercase tracking-wider">
              Shared Media
            </h2>
            <div className="grid grid-cols-2 gap-3 opacity-90">
              {msgImage.length > 0 ? (
                msgImage.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => window.open(url)}
                    className="group relative cursor-pointer aspect-square rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"
                  >
                    <img
                      src={url}
                      alt={`media-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <img
                        src={assets.gallery_icon}
                        className="w-5 h-5 invert"
                        alt="view"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-white/20 text-xs italic">
                  No media shared yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full p-6 border-t border-white/5 flex-shrink-0 bg-white/5">
          <button
            onClick={() => {
              logout();
              setIsRightPanelOpen(false);
            }}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default RightSidebar;
