import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { X, FileText, Sparkles, Copy, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const SummaryPanel = () => {
  const { chatSummary, setChatSummary, summarizeChat, isSummarizing } = useContext(ChatContext);

  if (!chatSummary && !isSummarizing) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(chatSummary);
    toast.success("Summary copied to clipboard");
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-[400px] z-[50] transition-all duration-500 ease-in-out transform ${chatSummary || isSummarizing ? "translate-x-0" : "translate-x-full"}`}>
      <div className="h-full bg-[#16122C]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI Summary</h2>
              <p className="text-[10px] text-violet-400/70 font-semibold uppercase tracking-widest">Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={() => setChatSummary(null)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isSummarizing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl border-2 border-violet-500/20 border-t-violet-500 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-violet-300/80 font-medium animate-pulse">Analyzing conversation...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="prose prose-invert max-w-none">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-inner">
                  <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-line space-y-2">
                    {chatSummary}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Summary
                </button>
                <button 
                  onClick={summarizeChat}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 rounded-xl text-xs font-bold text-white shadow-lg shadow-violet-900/20 transition-all active:scale-[0.98]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              This summary is generated based on the last 100 messages in this conversation. AI can make mistakes, please double check important details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
