import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { X, CheckCheck, Clock, Info } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const MessageInfo = () => {
  const { selectedMessageInfo, setIsMessageInfoOpen, isMessageInfoOpen } =
    useContext(ChatContext);

  if (!selectedMessageInfo) return null;

  const formatDateLong = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-[#0F0C1D]/95 backdrop-blur-xl border-l border-white/10 z-[150] shadow-2xl transition-transform duration-500 ease-in-out ${
        isMessageInfoOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Message Info</h2>
          </div>
          <button
            onClick={() => setIsMessageInfoOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Message Preview */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message Preview
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              {selectedMessageInfo.image && (
                <img
                  src={selectedMessageInfo.image}
                  alt="preview"
                  className="rounded-lg mb-3 max-h-40 w-full object-cover border border-white/10"
                />
              )}
              {selectedMessageInfo.text && (
                <p className="text-sm text-gray-200 leading-relaxed italic">
                  "{selectedMessageInfo.text}"
                </p>
              )}
            </div>
          </div>

          {/* Status Details */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 rounded-full bg-violet-500/10 text-violet-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-100">Delivered</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateLong(selectedMessageInfo.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className={`mt-1 p-2 rounded-full ${
                  selectedMessageInfo.seen
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-gray-500/10 text-gray-400"
                }`}
              >
                <CheckCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-100">Read</p>
                {selectedMessageInfo.seen ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateLong(selectedMessageInfo.seenAt)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5 italic">
                    Not read yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-[10px] text-gray-500">
            ID: {selectedMessageInfo._id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageInfo;
