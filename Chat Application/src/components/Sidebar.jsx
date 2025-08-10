// import React, { useContext,useState,useEffect } from "react";
// import assets, { userDummyData } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { ChatContext } from "../context/ChatContext";

// const Sidebar = () => {
//   const {
//     users,
//     getUsers,
//     selectedUser,
//     setSelectedUser,
//     unseenMessages,
//     setUnseenMessages,
//   } = useContext(ChatContext);
//   const navigate = useNavigate();
//   const { logout, onlineUsers } = useContext(AuthContext);
//   const [input, setinput] = useState("");
//   // const filteredUser = input
//   //   ? users.filter((user) =>
//   //       user.fullName.toLowerCase().includes(input.toLowerCase())
//   //     )
//   //   : users;

//   const filteredUser = input
//         ? (users || []).filter((user) => // Added fallback here to prevent crash if users is undefined
//             user.fullName.toLowerCase().includes(input.toLowerCase())
//         )
//         : users;
//   useEffect(() => {
//     getUsers();
//   }, [onlineUsers]);

//   return (
//     <div className='bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser?"max-md:hidden":""}'>
//       <div className="pb-5">
//         <div className="flex justify-between items-center">
//           <img src={assets.logo} alt="logo" className="max-w-40" />
//           <div className="relative py-2 group">
//             <img
//               src={assets.menu_icon}
//               alt="menu"
//               className="max-h-5 cursor-pointer"
//             />
//             <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
//               <p
//                 onClick={() => navigate("/profile")}
//                 className="cursor-pointer text-sm"
//               >
//                 Edit Profile
//               </p>
//               <hr className="my-2 border-t border-green-500" />
//               <p className="cursor-pointer text-sm" onClick={() => logout()}>
//                 Logout
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-[#282142] rounded-full py-3 px-4  mt-5  flex items-center gap-2 ">
//           <img src={assets.search_icon} alt="search" className="w-3 " />
//           <input
//             onChange={(e) => setinput(e.target.value)}
//             type="text"
//             className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
//             placeholder="Search users"
//           />
//         </div>
//       </div>
//       <div className="flex flex-col">
//         {filteredUser.map((user, index) => (
//           //   <div key={index} onClick={()=>{
//           //     setSelectedUser(user);
//           //   }} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id===user._id && 'bg-[#282142]/50'}`}>
//           //     <img
//           //       src={user?.profilePic || assets.avatar_icon}
//           //       className="w-[35px] aspect-[1/1] rounded-full"
//           //       alt=""
//           //     />
//           //     <div className="flex flex-col leading-5">
//           //       <p>{user.fullName}</p>
//           //       {index < 3 ? (
//           //         <span className="text-green-400 text-xs">Online</span>
//           //       ) : (
//           //         <span className="text-neutral-400 text-xs">Offline</span>
//           //       )}
//           //     </div>

//           //     {index > 2 && (
//           //       <p className="abs01ute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-vi01et-500/50">
//           //         {index}
//           //       </p>
//           //     )}
//           //   </div>

//           <div
//             key={index}
//             onClick={() => setSelectedUser(user)}
//             className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
//               selectedUser?._id === user._id && "bg-[#282142]/50"
//             }`}
//           >
//             <img
//               src={user?.profilePic || assets.avatar_icon}
//               className="w-[35px] aspect-[1/1] rounded-full"
//               alt=""
//             />

//             <div className="flex flex-col leading-5 w-full">
//               <div className="flex justify-between items-center w-full pr-2">
//                 <p>{user.fullName}</p>
//                 {unseenMessages[user._id] >0 && (
//                   <span className="text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
//                     {unseenMessages[user._id]}
//                   </span>
//                 )}
//               </div>
//               <span
//                 className={`${
//                   onlineUsers.includes(user._id) < 3 ? "text-green-400" : "text-neutral-400"
//                 } text-xs`}
//               >
//                 {index < 3 ? "Online" : "Offline"}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets"; // Assuming assets are correctly imported
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Sidebar = () => {
  const {
    users,
    getUsers,
    selectedUser,
    setSelectedUser,
    getMessages,
    unseenMessages,
    clearUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  // Fetch users when the component mounts or when onlineUsers change
  useEffect(() => {
    getUsers();
  }, [getUsers, onlineUsers]);

  // Handle selecting a user from the list
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    getMessages(user._id);
    clearUnseenMessages(user._id); // Clear unseen messages for this user
  };

  // Filter users based on search input
  const filteredUsers = searchInput
    ? (users || []).filter(
        (
          user // Added fallback here to prevent crash if users is undefined
        ) => user.fullName.toLowerCase().includes(searchInput.toLowerCase())
      )
    : users;

  return (
    // Added a check to hide sidebar on mobile when a user is selected
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-green-500" />
              <p className="cursor-pointer text-sm" onClick={logout}>
                Logout
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#282142] rounded-full py-3 px-4 mt-5 flex items-center gap-2">
          <img src={assets.search_icon} alt="search" className="w-3" />
          <input
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search users"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {/* FIX: Added a fallback to an empty array to prevent map of undefined */}
        {(filteredUsers || []).map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          return (
            <div
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`relative flex items-center gap-3 p-2 pl-3 rounded-lg cursor-pointer max-sm:text-sm transition-colors duration-200 ${
                selectedUser?._id === user._id
                  ? "bg-[#282142]/80"
                  : "hover:bg-[#282142]/40"
              }`}
            >
              <div className="relative">
                <img
                  src={user?.profilePic || assets.avatar_icon}
                  className="w-[40px] h-[40px] object-cover rounded-full"
                  alt={`${user.fullName}'s profile`}
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 bg-green-500 border-2 border-[#1A162E] rounded-full"></span>
                )}
              </div>

              <div className="flex flex-col leading-5 w-full">
                <div className="flex justify-between items-center w-full pr-2">
                  <p className="font-semibold">{user.fullName}</p>
                  {unseenMessages[user._id] > 0 && (
                    <span className="flex-shrink-0 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500 text-white font-bold ml-2">
                      {unseenMessages[user._id]}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    isOnline ? "text-green-400" : "text-neutral-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
