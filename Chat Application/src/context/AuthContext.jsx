import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";

export const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Connect socket function
  const connectSocket = useCallback(async (userData) => {
    if (!userData || !userData._id) return;
    if (socket && socket.connected) return;

    const token = await getToken();
    const newSocket = io(backendUrl, {
      auth: {
        token
      }
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    setSocket(newSocket);
  }, [socket]);

  // Sync user with backend or check auth
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && userId && clerkUser) {
        try {
          const token = await getToken();
          const { data } = await axios.get("/api/auth/check", {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (data.success) {
            setAuthUser(data.user);
            connectSocket(data.user);
          }
        } catch (error) {
          console.error("User sync error:", error);
          // If sync fails (e.g., first login), we might need to handle creation logic here
          // But usually, the backend check endpoint will handle "Upsert" logic
        }
      } else if (isLoaded && !userId) {
        setAuthUser(null);
        setOnlineUsers([]);
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
      }
    };

    syncUser();
  }, [isLoaded, userId, clerkUser, getToken, connectSocket]);

  // Axios interceptor for tokens
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, [getToken]);

  const logout = async () => {
    try {
      await signOut();
      setAuthUser(null);
      setOnlineUsers([]);
      if (socket) socket.disconnect();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile Updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    logout,
    updateProfile,
    isLoaded,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
