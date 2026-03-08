import React, { useContext, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { useEffect } from "react";
import { formatMessageTime, formatDateSeparator } from "../lib/utils";
import { useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { Info, Edit3, Trash2, Check, X, Mic, Square, Trash, Play, Pause, SendHorizontal, RefreshCw, Pin, PinOff, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
const AudioMessage = ({ src, isSent, formatMessageTime, createdAt, onContextMenu }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatAudioTime = (time) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div 
      onContextMenu={onContextMenu}
      onClick={(e) => e.stopPropagation()}
      className={`p-3 rounded-2xl break-words shadow-sm transition-all cursor-context-menu min-w-[240px] ${
      isSent
        ? "bg-violet-600 text-white rounded-tr-none hover:bg-violet-700"
        : "bg-white/10 text-gray-100 rounded-tl-none border border-white/5"
    }`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4 text-white fill-current" /> : <Play className="w-4 h-4 text-white fill-current" />}
        </button>
        
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center text-[10px] opacity-70">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{formatAudioTime(duration || 0)}</span>
          </div>
          <div 
            className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pos * duration;
            }}
          >
            <div 
              className="h-full bg-white/50 transition-all duration-100" 
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
        </div>
        
        <audio 
          ref={audioRef}
          src={src} 
          className="hidden" 
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    isRightPanelOpen,
    setIsRightPanelOpen,
    typingUsers,
    socket,
    toggleReaction,
    setSelectedMessageInfo,
    setIsMessageInfoOpen,
    editingMessage,
    setEditingMessage,
    updateMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    smartReplies,
    setSmartReplies,
    summarizeChat,
    isSummarizing,
    analysisResult,
    setAnalysisResult,
    isAnalyzingMessage,
    activeSidebarSection,
    setActiveSidebarSection,
    viewedProfile,
    setViewedProfile,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);
  const [reactionPicker, setReactionPicker] = useState(null); // { messageId: string, x: number, y: number }
  const [removePopover, setRemovePopover] = useState(null); // { messageId: string, emoji: string, x: number, y: number }
  const [actionMenu, setActionMenu] = useState(null); // { message: object, x: number, y: number }
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPinDuration, setShowPinDuration] = useState(null); // messageId
  const [selectedDuration, setSelectedDuration] = useState(undefined);
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false);
  const mediaRecorderRef = useRef(null);
  const previewAudioRef = useRef(null);
  const audioChunksRef = useRef([]);
  const allRecordedBlobsRef = useRef([]); // Store all blobs from different segments
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  const handleReactionSelect = (messageId, emoji) => {
    toggleReaction(messageId, emoji);
    setReactionPicker(null);
  };

  const handleReactionBadgeClick = (e, messageId, emoji, hasReacted) => {
    e.stopPropagation();
    if (hasReacted) {
      setRemovePopover({
        messageId,
        emoji,
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      toggleReaction(messageId, emoji);
    }
  };

  const handleMessageClick = (msg, isSent) => {
    if (isSent) {
      setSelectedMessageInfo(msg);
      setIsMessageInfoOpen(true);
    }
  };

  const startRecording = async (isResuming = false) => {
    try {
      if (isResuming !== true || !streamRef.current || !streamRef.current.active) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // If this is a fresh recording (not resuming), reset state
        if (isResuming !== true) {
          allRecordedBlobsRef.current = [];
          setRecordingTime(0);
        }
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        allRecordedBlobsRef.current.push(audioBlob);
        
        const completeBlob = new Blob(allRecordedBlobsRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(completeBlob);
        setPreviewUrl(url);
        setIsPreviewing(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setIsPreviewing(false);
      
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied or error occurred.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopAndPreview = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const sendVoiceMessage = async () => {
    if (!previewUrl) return;
    
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64Audio = reader.result;
        sendMessage({ audio: base64Audio });
        resetRecording();
      };
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message.");
    }
  };

  const resetRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setIsRecording(false);
    setIsPaused(false);
    setIsPreviewing(false);
    setIsPreviewPlaying(false);
    setPreviewUrl(null);
    setRecordingTime(0);
    setPreviewDuration(0);
    setPreviewCurrentTime(0);
    audioChunksRef.current = [];
    allRecordedBlobsRef.current = [];
    clearInterval(timerIntervalRef.current);
  };

  const togglePreviewPlayback = () => {
    if (previewAudioRef.current) {
      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
      } else {
        previewAudioRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  const handlePreviewTimeUpdate = () => {
    if (previewAudioRef.current) {
      setPreviewCurrentTime(previewAudioRef.current.currentTime);
    }
  };

  const handlePreviewLoadedMetadata = () => {
    if (previewAudioRef.current) {
      setPreviewDuration(previewAudioRef.current.duration);
    }
  };

  const handlePreviewEnded = () => {
    setIsPreviewPlaying(false);
    setPreviewCurrentTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerIntervalRef.current);
      // Logic for auto-sending if not previewing would go here, 
      // but we now always route to preview via onstop.
      // So let's make a direct send helper if needed or just use stopAndPreview.
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Don't trigger the send logic
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
      audioChunksRef.current = [];
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleMessageContextMenu = (e, msg, isSent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Context menu (two-finger click) detected for message:", msg._id, "isSent:", isSent);
    setActionMenu({
      message: msg,
      isSent,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Close pickers on click anywhere else
  useEffect(() => {
    const handleClick = () => {
      setReactionPicker(null);
      setRemovePopover(null);
      setActionMenu(null);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Handle typing status
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!socket || !selectedUser) return;

    // Send typing event
    socket.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to send stopTyping
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }, 2000);
  };

  const messageRefs = useRef({});

  const scrollToMessage = (messageId) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Brief highlight effect
      element.classList.add("ring-2", "ring-violet-500", "p-2", "rounded-2xl");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-violet-500", "p-2", "rounded-2xl");
      }, 2000);
    } else {
      toast.error("Message not found in current view");
    }
  };

  //Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;

    // Clear AI suggestions when user sends a message
    setSmartReplies([]);

    if (editingMessage) {
      await updateMessage(editingMessage._id, input.trim());
    } else {
      // Stop typing immediately when sending new message
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });

      await sendMessage({ text: input.trim() });
    }
    setEditingMessage(null);
    setInput("");
  };

  useEffect(() => {
    if (editingMessage) {
      setInput(editingMessage.text);
    }
  }, [editingMessage]);

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
    if (scrollEnd.current && messages && messages.length > 0) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]); // Only scroll when message count changes

  const isUserTyping = selectedUser && typingUsers[selectedUser._id];

  return selectedUser ? (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md z-10">
        {/* Left: User Info Header */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setIsRightPanelOpen(true);
          }}
        >
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            className="w-10 h-10 rounded-full object-cover transition-transform group-hover:scale-105"
            alt="profile"
          />
          <div>
            <p className="text-white font-medium flex items-center gap-2 group-hover:text-violet-400 transition-colors">
              {selectedUser.fullName}
              {onlineUsers.includes(selectedUser._id) && (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0F0C1D]"></span>
              )}
            </p>
            <p className="text-xs text-neutral-400">
              {onlineUsers.includes(selectedUser._id)
                ? isUserTyping
                  ? "typing..."
                  : "Active now"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <button
            onClick={summarizeChat}
            disabled={isSummarizing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSummarizing
                ? "bg-violet-500/10 text-violet-400 cursor-not-allowed"
                : "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/30"
            }`}
            title="Summarize conversation"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? "animate-spin" : ""}`} />
            {isSummarizing ? "Summarizing..." : "Summarize Chat"}
          </button>
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            className="md:hidden w-6 cursor-pointer opacity-70 hover:opacity-100"
            alt="back"
          />
        </div>
      </div>

      {/* Pinned Messages Header - Moved outside padded area for better alignment */}
      {messages.some((m) => m.isPinned) && (
        <div className="z-[5] border-b border-white/5 group/pinned">
          <div
            className={`bg-[#1A162E]/40 backdrop-blur-md transition-all duration-300 ${
              isPinnedExpanded ? "pb-2" : ""
            }`}
          >
            <div
              className="flex items-center justify-between p-3 px-4 cursor-pointer select-none hover:bg-white/5 transition-colors"
              onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/20">
                  <Pin className="w-3 h-3 text-violet-400 rotate-45" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                    Pinned Messages
                  </span>
                  <span className="bg-violet-500/80 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {messages.filter((m) => m.isPinned).length}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPinnedExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>

            {isPinnedExpanded && (
              <div className="px-4 pb-2 space-y-1 max-h-[68px] overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200">
                {messages
                  .filter((m) => m.isPinned)
                  .map((msg) => (
                    <div
                      key={msg._id}
                      onClick={() => scrollToMessage(msg._id)}
                      className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all border border-transparent hover:border-white/5 active:scale-[0.99]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-violet-400/80 uppercase tracking-tighter">
                            {String(msg.senderId) === String(authUser._id)
                              ? "You"
                              : selectedUser.fullName.split(" ")[0]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate leading-tight">
                          {msg.text ||
                            (msg.image
                              ? "📷 Photo"
                              : msg.audio
                                ? "🎤 Voice"
                                : "Message")}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unpinMessage(msg._id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-all opacity-0 group-hover/pinned:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative flex flex-col">

        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => {
            const isSent = String(msg.senderId) === String(authUser?._id);
            const currentDate = new Date(msg.createdAt).toDateString();
            const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
            const showDateSeparator = currentDate !== prevDate;

            return (
              <React.Fragment key={msg._id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-6 sticky top-2 z-[2]">
                    <span className="bg-[#1A162E]/80 backdrop-blur-md text-gray-400 text-[11px] font-bold px-4 py-1.5 rounded-full border border-white/5 shadow-sm uppercase tracking-wider">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  ref={el => messageRefs.current[msg._id] = el}
                  className={`flex gap-3 transition-all duration-500 ${
                    isSent
                      ? "flex-row justify-end"
                      : "flex-row-reverse justify-end"
                  }`}
                >
                  {/* Message Content */}
                  <div
                    className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isSent ? "items-end" : "items-start"}`}
                    >
                      {msg.image ? (
                        <div className="relative group">
                          <img
                            src={msg.image}
                            className="rounded-2xl border border-white/10 shadow-lg mb-1 max-h-80 object-cover cursor-pointer hover:brightness-90 transition-all"
                            alt="message"
                            onContextMenu={(e) => handleMessageContextMenu(e, msg, isSent)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : msg.audio ? (
                        <AudioMessage 
                          src={msg.audio} 
                          isSent={isSent} 
                          formatMessageTime={formatMessageTime} 
                          createdAt={msg.createdAt}
                          onContextMenu={(e) => handleMessageContextMenu(e, msg, isSent)}
                        />
                      ) : (
                        <div
                          onContextMenu={(e) => handleMessageContextMenu(e, msg, isSent)}
                          onClick={(e) => e.stopPropagation()}
                          className={`p-3.5 text-sm rounded-2xl break-words shadow-sm transition-all cursor-context-menu ${
                            isSent
                              ? "bg-violet-600 text-white rounded-tr-none hover:bg-violet-700 cursor-pointer"
                              : "bg-white/10 text-gray-100 rounded-tl-none border border-white/5"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      {(msg.image || msg.text || msg.audio) && (
                        <p className={`text-[10px] text-gray-400 mt-1.5 px-1 ${isSent ? "text-right" : "text-left"}`}>
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      )}

                      {/* Reactions Display */}
                      {msg.reactions?.length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1 ${isSent ? "justify-end" : "justify-start"}`}>
                          {Object.entries(
                            msg.reactions.reduce((acc, curr) => {
                              acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                              return acc;
                            }, {}),
                          ).map(([emoji, count]) => {
                            const hasReacted = msg.reactions.some(
                              (r) => String(r.userId) === String(authUser?._id) && r.emoji === emoji,
                            );
                            return (
                              <div
                                key={emoji}
                                onClick={(e) => handleReactionBadgeClick(e, msg._id, emoji, hasReacted)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer transition-all ${
                                  hasReacted
                                    ? "bg-violet-500/30 text-violet-300"
                                    : "bg-white/10 text-gray-400 hover:bg-white/20"
                                }`}
                              >
                                <span>{emoji}</span>
                                {count > 1 && <span>{count}</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Pin Indicator */}
                      {msg.isPinned && (
                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-violet-400 font-bold bg-violet-500/10 w-fit px-1.5 py-0.5 rounded-md transition-all ${isSent ? "self-end" : "self-start"}`}>
                          <Pin className="w-2.5 h-2.5 rotate-45" />
                          Pinned
                        </div>
                      )}
                    </div>

                  {/* Avatar */}
                  <img
                    src={
                      isSent
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start mt-0.5"
                  />
                </div>
              </React.Fragment>
            );
          })}
          <div ref={scrollEnd}></div>
        </div>
      </div>

      {/* input area */}
      <div className={`p-4 border-t border-white/10 backdrop-blur-xl flex-shrink-0 relative transition-all duration-300 ${editingMessage ? "bg-violet-500/10 shadow-[0_-10px_20px_rgba(124,58,237,0.1)]" : "bg-[#0F0C1D]/40"}`}>
        <div className="w-full flex flex-col gap-2">
          {isRecording || isPaused || isPreviewing ? (
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              {isPreviewing ? (
                /* Preview State */
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
                  <button onClick={togglePreviewPlayback} className="hover:scale-110 transition-transform">
                    {isPreviewPlaying ? (
                      <Pause className="w-5 h-5 text-violet-400 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 text-violet-400 fill-current" />
                    )}
                  </button>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-violet-300/70 font-mono">
                      <span>{formatTime(Math.floor(previewCurrentTime))}</span>
                      <span>{formatTime(Math.floor(previewDuration))}</span>
                    </div>
                    <div 
                      className="h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        if (previewAudioRef.current) {
                          previewAudioRef.current.currentTime = pos * previewDuration;
                        }
                      }}
                    >
                      <div 
                        className="h-full bg-violet-500 transition-all duration-100" 
                        style={{ width: `${(previewCurrentTime / (previewDuration || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <audio 
                    ref={previewAudioRef}
                    src={previewUrl}
                    onTimeUpdate={handlePreviewTimeUpdate}
                    onLoadedMetadata={handlePreviewLoadedMetadata}
                    onEnded={handlePreviewEnded}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Recording/Paused State */
                <div className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 ${isPaused ? "bg-orange-500/10 border-orange-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                  <div className={`w-2 h-2 rounded-full ${isPaused ? "bg-orange-500" : "bg-red-500 animate-pulse"}`} />
                  <span className={`font-mono text-sm font-bold ${isPaused ? "text-orange-400" : "text-red-400"}`}>{formatTime(recordingTime)}</span>
                  <span className="text-xs text-gray-400 font-medium ml-2">{isPaused ? "Recording paused" : "Recording voice message..."}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button
                  onClick={resetRecording}
                  className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                  title="Discard"
                >
                  <Trash className="w-5 h-5" />
                </button>

                {!isPreviewing && (
                  <button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className={`p-3 rounded-xl transition-all active:scale-95 ${isPaused ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                    title={isPaused ? "Resume" : "Pause"}
                  >
                    {isPaused ? <RefreshCw className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                )}

                {isPreviewing ? (
                  <button
                    onClick={() => {
                      setIsPreviewing(false);
                      startRecording(true); // Resume by starting a new recorder but keeping chunks
                    }}
                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all active:scale-95"
                    title="Continue Recording"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={stopAndPreview}
                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all active:scale-95"
                    title="Preview"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                )}

                {(isPaused || isPreviewing) && (
                  <button
                    onClick={sendVoiceMessage}
                    className="p-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all active:scale-95"
                    title="Send"
                  >
                    <SendHorizontal className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {editingMessage && (
                <div className="flex items-center justify-between px-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-violet-500/5 border border-violet-500/10 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                    <span className="text-xs text-violet-400 font-medium tracking-wide">Editing message</span>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingMessage(null);
                      setInput("");
                    }}
                    className="group flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/5"
                  >
                    <X className="w-3 h-3" />
                    Cancel Edit
                  </button>
                </div>
              )}
              
              {/* Smart Replies */}
              {!input.trim() && !editingMessage && smartReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {smartReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(reply);
                        setSmartReplies([]);
                      }}
                      className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold hover:bg-violet-500/20 hover:border-violet-500/30 transition-all active:scale-95 shadow-sm"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className={`flex-1 flex items-center bg-white/5 border px-4 py-1.5 rounded-2xl transition-all duration-300 ${
                  editingMessage ? "border-violet-500/50 shadow-[0_0_15px_rgba(124,58,237,0.1)]" : "border-white/10 focus-within:border-violet-500/50"
                }`}>
                  <input
                    onChange={handleInputChange}
                    value={input}
                    onKeyDown={(e) =>
                      e.key === "Enter" ? handleSendMessage(e) : null
                    }
                    className="flex-1 text-sm py-2.5 border-none bg-transparent outline-none text-white placeholder-white/30"
                    type="text"
                    placeholder={editingMessage ? "Edit your message..." : "Type your message..."}
                  />
                  {!editingMessage && (
                    <div className="flex items-center">
                      <input
                        onChange={handleSendImage}
                        type="file"
                        id="image"
                        accept="image/jpeg, image/png"
                        hidden
                      />
                      <label
                        htmlFor="image"
                        className="hover:scale-110 transition-transform cursor-pointer p-2 rounded-full hover:bg-white/5"
                      >
                        <img
                          src={assets.gallery_icon}
                          alt="attach"
                          className="w-5 h-5 opacity-60 hover:opacity-100"
                        />
                      </label>

                      {!input.trim() && (
                        <button
                          onClick={() => startRecording()}
                          className="hover:scale-110 transition-transform cursor-pointer p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-violet-400"
                          title="Record voice message"
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSendMessage}
                  className={`p-3.5 rounded-2xl transition-all duration-200 active:scale-90 flex-shrink-0 shadow-lg ${
                    input.trim()
                      ? "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-500/30 hover:-translate-y-0.5"
                      : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                  }`}
                  disabled={!input.trim()}
                >
                  {editingMessage ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <SendHorizontal className={`w-5 h-5 transition-transform ${input.trim() ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : ""}`} />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Emoji Reaction Picker Overlay */}
      {reactionPicker && (
        <div
          className="fixed z-[100] bg-[#1A162E] border border-white/10 p-2 rounded-2xl shadow-2xl flex gap-2 animate-in fade-in zoom-in duration-200"
          style={{
            top: reactionPicker.y + 80 > window.innerHeight 
              ? (window.innerHeight - 80 - 10) 
              : reactionPicker.y,
            left: Math.max(10, Math.min(reactionPicker.x, window.innerWidth - 250)),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionSelect(reactionPicker.messageId, emoji)}
              className="text-xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-white/5"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Pin Duration Selector */}
      {showPinDuration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1A162E] border border-white/20 p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Pin className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Pin Duration</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">Choose how long this message should stay pinned for everyone in the chat.</p>
            
            <div className="space-y-3">
              {[
                { label: "24 Hours", value: 24 },
                { label: "7 Days", value: 168 },
                { label: "30 Days", value: 720 },
                { label: "Keep Forever", value: null },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group border ${
                    selectedDuration === option.value 
                      ? "bg-violet-500/20 border-violet-500/50 shadow-lg shadow-violet-500/10" 
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className={`text-sm font-medium transition-colors ${selectedDuration === option.value ? "text-violet-300" : "text-gray-300 group-hover:text-white"}`}>{option.label}</span>
                  <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                    selectedDuration === option.value ? "border-violet-500" : "border-white/20 group-hover:border-white/40"
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-violet-500 transition-transform ${selectedDuration === option.value ? "scale-100" : "scale-0"}`} />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowPinDuration(null);
                  setSelectedDuration(undefined);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold text-sm tracking-wide"
              >
                Cancel
              </button>
              <button
                disabled={selectedDuration === undefined}
                onClick={() => {
                  pinMessage(showPinDuration, selectedDuration);
                  setShowPinDuration(null);
                  setSelectedDuration(undefined);
                }}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all ${
                  selectedDuration !== undefined
                  ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 active:scale-95"
                  : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
              >
                Pin Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Action Menu */}
      {actionMenu && (
        <>
          {/* Backdrop for the menu */}
          <div 
            className="fixed inset-0 z-[140] bg-black/5 backdrop-blur-[0px]" 
            onClick={() => setActionMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setActionMenu(null);
            }}
          />
          <div
            className="fixed z-[150] bg-[#1A162E] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in min-w-[220px] max-h-[85vh] overflow-y-auto scrollbar-none"
            style={{
              top: actionMenu.y + 350 > window.innerHeight 
                ? Math.max(10, window.innerHeight - 350 - 20) 
                : actionMenu.y,
              left: Math.max(10, Math.min(actionMenu.x, window.innerWidth - 230)),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1">
              <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500 font-bold border-b border-white/5 mb-2 flex justify-between">
                <span>Message Options</span>
                <span className="text-violet-500/50">{actionMenu.isSent ? "Sender" : "Receiver"}</span>
              </div>
              
              {/* Universal Reaction Option */}
              <button
                onClick={() => {
                  setReactionPicker({
                    messageId: actionMenu.message._id,
                    x: actionMenu.x,
                    y: actionMenu.y,
                  });
                  setActionMenu(null);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 w-full transition-all rounded-xl font-medium group"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-violet-500/20 transition-colors">
                  <span className="text-lg group-hover:scale-125 transition-transform">✨</span>
                </div>
              </button>
              
              {/* AI Analyze Option */}
              {actionMenu.message.text && (
                <button
                  onClick={() => {
                    analyzeMessage(actionMenu.message.text);
                    setActionMenu(null);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 w-full transition-all rounded-xl font-medium group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span>AI Analyze & Extract</span>
                </button>
              )}

              {/* Pin/Unpin Option */}
              {actionMenu.message.isPinned ? (
                <button
                  onClick={() => {
                    unpinMessage(actionMenu.message._id);
                    setActionMenu(null);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition-all rounded-xl font-medium group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 transition-colors">
                    <PinOff className="w-4 h-4" />
                  </div>
                  <span>Unpin from Conversation</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowPinDuration(actionMenu.message._id);
                    setActionMenu(null);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-violet-400 hover:bg-violet-500/10 w-full transition-all rounded-xl font-medium group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                    <Pin className="w-4 h-4" />
                  </div>
                  <span>Pin to Conversation</span>
                </button>
              )}

              <div className="h-px bg-white/5 my-1 mx-2" />

              {/* Sender Only Options */}
              {actionMenu.isSent && (
                <>
                  <button
                    onClick={() => {
                      handleMessageClick(actionMenu.message, true);
                      setActionMenu(null);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 w-full transition-all rounded-xl font-medium"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5">
                      <Info className="w-4 h-4 text-violet-400" />
                    </div>
                    <span>Message Info</span>
                  </button>
                  {actionMenu.message.text && !actionMenu.message.image && !actionMenu.message.audio && (
                    <button
                      onClick={() => {
                        setEditingMessage(actionMenu.message);
                        setActionMenu(null);
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 w-full transition-all rounded-xl font-medium"
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5">
                        <Edit3 className="w-4 h-4 text-blue-400" />
                      </div>
                      <span>Edit Message</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this message?"
                        )
                      ) {
                        deleteMessage(actionMenu.message._id);
                      }
                      setActionMenu(null);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-100 hover:bg-red-500/20 w-full transition-colors rounded-xl font-medium"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </div>
                    <span>Delete Message</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Remove Reaction Popover */}
      {removePopover && (
        <div
          className="fixed z-[100] bg-[#1A162E] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
          style={{
            top: Math.min(removePopover.y + 10, window.innerHeight - 80),
            left: Math.min(removePopover.x, window.innerWidth - 120),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              toggleReaction(removePopover.messageId, removePopover.emoji);
              setRemovePopover(null);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <span className="text-base text-white/50">{removePopover.emoji}</span>
            Remove
          </button>
        </div>
      )}

      {/* AI Analysis Result Modal */}
      {(analysisResult || isAnalyzingMessage) && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A162E]/90 border border-white/20 p-8 rounded-[2rem] shadow-2xl max-w-lg w-full relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">AI Analysis</h3>
                    <p className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest">Actionable Insights</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAnalysisResult(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="min-h-[200px]">
                {isAnalyzingMessage ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                      <Sparkles className="w-4 h-4 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-amber-200/60 font-medium text-sm animate-pulse tracking-wide">Processing message...</p>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {analysisResult}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-lg shadow-amber-900/20 active:scale-95"
                    >
                      Got it
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full p-4">
      <img src={assets.logo_icon} alt="logo" className="w-16" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
