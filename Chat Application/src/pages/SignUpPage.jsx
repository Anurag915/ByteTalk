import { SignUp } from "@clerk/clerk-react";
import assets from "../assets/assets";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-xl">
      {/* left  */}
      <div className="flex flex-col items-center gap-4 transition-all duration-500 hover:scale-105 group/logo">
        <img 
          src={assets.logo_icon} 
          alt="logo" 
          className="w-[120px] md:w-[160px] object-contain transition-all duration-300" 
        />
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
          ByteTalk
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide opacity-80 group-hover/logo:opacity-100 transition-opacity">
          Connect effortlessly.
        </p>
      </div>
      {/* right */}
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all text-sm font-bold py-3 rounded-xl shadow-lg shadow-violet-500/20 active:scale-95",
              card: "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8",
              headerTitle: "text-white text-3xl font-black tracking-tight",
              headerSubtitle: "text-gray-400 font-medium",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors rounded-xl font-semibold",
              socialButtonsBlockButtonText: "text-white font-semibold",
              formFieldLabel: "text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-2",
              formFieldInput: "bg-[#282142] border border-white/5 text-white rounded-xl py-3 px-4 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm",
              footerActionText: "text-gray-400 font-medium",
              footerActionLink: "text-violet-400 hover:text-violet-300 font-bold transition-colors",
              identityPreviewText: "text-white font-bold",
              identityPreviewEditButtonIcon: "text-violet-400",
              formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
              dividerLine: "bg-white/10",
              dividerText: "text-gray-500 font-bold text-xs uppercase tracking-widest"
            }
          }}
          signInUrl="/login"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
