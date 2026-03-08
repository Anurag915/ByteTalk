import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Search, Camera, Edit2, LogOut, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { activeSidebarSection, selectedUser } = useContext(ChatContext);

  const renderSection = () => {
    switch (activeSidebarSection) {
      case "chats":
        return <ChatsSection />;
      case "profile":
        return <ProfileSection />;
      case "media":
        return <MediaSection />;
      case "calls":
        return <CallsSection />;
      default:
        return <ChatsSection />;
    }
  };

  return (
    <div
      className={`bg-white/5 h-full flex flex-col border-r border-white/10 overflow-hidden text-white transition-all duration-300 ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {renderSection()}
    </div>
  );
};

// --- Sub-components ---

const ChatsSection = () => {
  const {
    users,
    getUsers,
    selectedUser,
    setSelectedUser,
    getMessages,
    unseenMessages,
    clearUnseenMessages,
    typingUsers,
  } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers, onlineUsers]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    getMessages(user._id);
    clearUnseenMessages(user._id);
  };

  const filteredUsers = searchInput
    ? (users || []).filter((user) =>
        user.fullName.toLowerCase().includes(searchInput.toLowerCase())
      )
    : users;

  return (
    <>
      <div className="p-5 flex-shrink-0 border-b border-white/5">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="bg-[#282142] rounded-xl py-2.5 px-4 flex items-center gap-3 border border-white/5 focus-within:border-violet-500/50 transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            type="text"
            className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 flex-1"
            placeholder="Search conversations"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-white/10">
        {(filteredUsers || []).map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          return (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                selectedUser?._id === user._id
                  ? "bg-violet-500/20 border border-violet-500/20"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="relative">
                <img
                  src={user?.profilePic || assets.avatar_icon}
                  className="w-12 h-12 object-cover rounded-full border-2 border-[#1A162E]"
                  alt={user.fullName}
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 bg-green-500 border-2 border-[#1A162E] rounded-full shadow-lg"></span>
                )}
              </div>

              <div className="flex flex-col leading-tight w-full overflow-hidden">
                <div className="flex justify-between items-center w-full">
                  <p className="font-bold text-gray-100 truncate">{user.fullName}</p>
                  {unseenMessages[user._id] > 0 && (
                    <span className="flex-shrink-0 text-[10px] h-5 w-5 flex justify-center items-center rounded-full bg-violet-500 text-white font-black">
                      {unseenMessages[user._id]}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs truncate ${
                    typingUsers[user._id]
                      ? "text-violet-400 animate-pulse font-medium italic"
                      : isOnline
                      ? "text-green-500/80"
                      : "text-gray-500"
                  }`}
                >
                  {typingUsers[user._id] ? "typing..." : isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

const ProfileSection = () => {
  const { authUser, updateProfile, logout } = useContext(AuthContext);
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      let profilePic = authUser.profilePic;
      if (selectedImage) {
        profilePic = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedImage);
          reader.onload = () => resolve(reader.result);
        });
      }
      await updateProfile({ fullName: name, bio, profilePic });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-xl font-bold mb-8">My Profile</h2>
      
      <form onSubmit={handleUpdate} className="flex flex-col gap-8">
        <div className="relative self-center group">
          <img
            src={selectedImage ? URL.createObjectURL(selectedImage) : authUser?.profilePic || assets.avatar_icon}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-violet-500/20 shadow-2xl"
          />
          <label htmlFor="pfp-upload" className="absolute bottom-0 right-0 bg-violet-500 p-2.5 rounded-full cursor-pointer shadow-xl hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-white" />
            <input id="pfp-upload" type="file" hidden accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Display Name</label>
            <div className="relative group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#282142] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
              />
              <Edit2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">About / Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-[#282142] border border-white/5 rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-4"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={logout}
          className="flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 py-3 rounded-xl transition-colors mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </form>
    </div>
  );
};

const MediaSection = () => {
  const { messages, selectedUser } = useContext(ChatContext);
  const mediaMessages = messages?.filter(m => m.image) || [];

  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-xl font-bold mb-6">Shared Media</h2>
      
      {!selectedUser ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-50">
          <ImageIcon className="w-16 h-16 text-gray-600" />
          <p className="text-sm">Select a conversation to view shared media</p>
        </div>
      ) : mediaMessages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-50">
          <ImageIcon className="w-16 h-16 text-gray-600" />
          <p className="text-sm">No media shared in this chat yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
          {mediaMessages.map((msg) => (
            <div key={msg._id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl bg-white/5">
              <img src={msg.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Shared media" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                 <p className="text-[10px] text-white truncate drop-shadow-lg">{new Date(msg.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CallsSection = () => {
  const dummyCalls = [
    { id: 1, name: "Alice Smith", type: "incoming", time: "10:30 AM", date: "Today" },
    { id: 2, name: "Bob Johnson", type: "outgoing", time: "Yesterday", date: "4:15 PM" },
    { id: 3, name: "Charlie Davis", type: "missed", time: "Dec 28", date: "11:00 AM" },
  ];

  return (
    <div className="flex flex-col h-full p-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-xl font-bold mb-6">Recent Calls</h2>
      <div className="flex flex-col gap-4 overflow-y-auto">
        {dummyCalls.map((call) => (
          <div key={call.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer">
            <div className={`p-3 rounded-full ${call.type === 'missed' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
              {call.type === 'incoming' && <PhoneIncoming className="w-5 h-5" />}
              {call.type === 'outgoing' && <PhoneOutgoing className="w-5 h-5" />}
              {call.type === 'missed' && <PhoneMissed className="w-5 h-5" />}
            </div>
            <div className="flex flex-1 flex-col leading-tight">
              <p className="font-bold">{call.name}</p>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                <Clock className="w-3 h-3" />
                <span>{call.date}, {call.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
