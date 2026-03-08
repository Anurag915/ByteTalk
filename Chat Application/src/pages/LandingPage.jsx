import React from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { MessageSquare, Shield, Zap, ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F0C1D] text-white flex flex-col items-center justify-center p-6 text-center">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-4xl">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="relative group">
            <div className="absolute inset-0 bg-violet-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <img 
              src={assets.logo_icon} 
              alt="ByteTalk Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain relative group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              ByteTalk
            </h1>
            <p className="text-violet-400 font-bold tracking-[0.2em] uppercase text-sm md:text-base">
              The Next Evolution of Chat
            </p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-2xl md:text-4xl font-medium text-gray-300 max-w-2xl mx-auto leading-tight">
            Connect with anyone, anywhere. <br />
            <span className="text-white font-bold italic">Secure. Fast. Minimal.</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-gray-500 font-medium">
             <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-500" />
                <span>Clerk Protected</span>
             </div>
             <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-500" />
                <span>Real-time Sync</span>
             </div>
             <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-500" />
                <span>AI Powered</span>
             </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-5 mt-4 animate-in fade-in zoom-in duration-500 delay-500">
          <button 
            onClick={() => navigate("/login")}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-violet-500 hover:text-white transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate("/sign-up")}
            className="px-8 py-4 bg-[#1A162E] text-white font-bold rounded-2xl border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
