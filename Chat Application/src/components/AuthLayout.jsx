import { ArrowLeft, Check, LockKeyhole, MessageCircleMore, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const benefits = [
  "Real-time messaging and presence",
  "Voice notes and shared images",
  "AI summaries and quick replies",
];

const AuthLayout = ({ mode, children }) => {
  const navigate = useNavigate();
  const isSignUp = mode === "sign-up";

  return (
    <main className="auth-page relative h-full overflow-y-auto bg-[#090713] text-white">
      <div className="landing-grid fixed inset-0 pointer-events-none opacity-30" />
      <div className="relative z-10 grid min-h-full lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.07] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
          <button onClick={() => navigate("/")} className="relative flex w-fit items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]"><img src={assets.logo_icon} alt="" className="h-7 w-7" /></span>
            <span className="text-xl font-semibold">ByteTalk</span>
          </button>

          <div className="relative max-w-xl py-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-violet-200">
              {isSignUp ? <Sparkles className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
              {isSignUp ? "A better place to talk" : "Welcome back"}
            </div>
            <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.035em] xl:text-6xl">
              {isSignUp ? "Start conversations that stay with you." : "Your conversations are waiting."}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/45">
              {isSignUp
                ? "Create your ByteTalk account and bring messages, media, voice, and AI assistance together."
                : "Sign in to pick up where you left off—messages, shared moments, and all."}
            </p>

            <div className="mt-9 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-white/65">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><Check className="h-3.5 w-3.5" /></span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-white/30">
            <MessageCircleMore className="h-4 w-4 text-violet-300" /> Built for conversations that feel effortless.
          </div>
        </section>

        <section className="flex min-h-full items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-[460px]">
            <div className="mb-7 flex items-center justify-between lg:hidden">
              <button onClick={() => navigate("/")} className="flex items-center gap-2.5 text-lg font-semibold"><img src={assets.logo_icon} alt="" className="h-8 w-8" /> ByteTalk</button>
              <button onClick={() => navigate("/")} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white"><ArrowLeft className="h-4 w-4" /> Home</button>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#151126]/90 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
              {children}
            </div>

            <button onClick={() => navigate("/")} className="mx-auto mt-6 hidden items-center gap-2 text-sm font-medium text-white/35 transition hover:text-white lg:flex">
              <ArrowLeft className="h-4 w-4" /> Back to ByteTalk
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
