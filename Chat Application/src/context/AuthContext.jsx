import { createContext } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client";
export const AuthContext = createContext();

axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  //check if user is authenticated or not , set the user data & if connected then connect the socket
  //   const checkAuth = async () => {
  //     try {
  //       const { data } = await axios.get("/api/auth/check");
  //       if (data.success) {
  //         setAuthUser(data.user);
  //         connectSocket(data.user);
  //       }
  //     } catch (error) {
  //       toast.error(error.message);
  //     }
  //   };

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Token invalid → logout
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
      }
      toast.error(error.response?.data?.message || error.message);
    }
  };

  //login function  to handle user authentication and socket connenction

  const login = async (state, credantiels) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credantiels);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //logout function  to handle user logout  and socket disconnection

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("logged out succesfully");
    socket.disconnect();
  };

  //update profile  to handle user profile updates
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile Updated successflly");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //connect socket function  to handle socket connection & online user updates
  const connectSocket = (userData) => {
    if (!userData) return;
    if (socket && socket.connected) return; // Only skip if already connected
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // useEffect(() => {
  //   if (!token) return; // Don't even try if no token
  //   axios.defaults.headers.common["token"] = token;
  //   checkAuth();
  // }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
  }, [token]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
