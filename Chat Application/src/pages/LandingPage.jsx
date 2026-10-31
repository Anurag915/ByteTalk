import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCheck,
  Image as ImageIcon,
  LockKeyhole,
  MessageCircleMore,
  Mic2,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import assets from "../assets/assets";

const features = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Live by default",
    copy: "Messages, presence, typing, and read status update as the conversation happens.",
  },
  {
    icon: <WandSparkles className="h-5 w-5" />,
    title: "AI that helps",
    copy: "Summarize long threads, inspect action items, and turn incoming messages into quick replies.",
  },
  {
    icon: <ImageIcon className="h-5 w-5" />,
    title: "More than text",
    copy: "Share images and voice notes without leaving the flow of your conversation.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main className="landing-page h-full overflow-y-auto bg-[#090713] text-white">
      <div className="landing-grid fixed inset-0 pointer-events-none opacity-40" />
      <div className="fixed -top-48 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />

      <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="ByteTalk home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg shadow-violet-950/40">
            <img src={assets.logo_icon} alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-xl font-semibold tracking-tight">ByteTalk</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate("/login")} className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white">
            Sign in
          </button>
          <button onClick={() => navigate("/sign-up")} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#100c20] shadow-lg shadow-white/10 transition hover:-translate-y-0.5 hover:bg-violet-100">
            Create account
          </button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[610px] w-full max-w-7xl items-stretch gap-12 px-6 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-10 lg:py-16">
        <div className="flex h-full max-w-2xl flex-col justify-start landing-reveal">
          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[5.25rem]">
            Talk naturally.
            <span className="block bg-gradient-to-r from-violet-300 via-white to-cyan-200 bg-clip-text text-transparent">Stay in sync.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-white/55 sm:text-xl">
            ByteTalk brings real-time chat, voice, shared media, and useful AI tools into one focused space built for everyday conversations.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate("/sign-up")} className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-4 text-sm font-semibold shadow-xl shadow-violet-950/40 transition hover:-translate-y-0.5 hover:shadow-violet-900/50">
              Start chatting free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => navigate("/login")} className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white">
              I already have an account
            </button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
            <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-400" /> Secure sign-in</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-amber-300" /> Real-time delivery</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-300" /> AI assistance</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[570px] self-start landing-reveal-delayed">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-400/10 blur-3xl" />
          <div className="relative flex h-[500px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#121022]/90 shadow-[0_32px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-700 font-medium">A</div>
                <div>
                  <p className="text-sm font-medium">Anika</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5 text-white/50"><MessageCircleMore className="h-4 w-4" /></div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_38%)] px-5 py-4 sm:px-7">
              <div className="mx-auto w-fit rounded-full bg-white/[0.05] px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/30">Today</div>
              <div className="flex max-w-[82%] items-end gap-2.5">
                <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.07] px-4 py-2.5 text-sm leading-5 text-white/80">
                  Are we still on for the product review at 4?
                  <div className="mt-1 text-right text-[10px] text-white/30">2:41 PM</div>
                </div>
              </div>
              <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-2.5 text-sm leading-5 shadow-lg shadow-violet-950/30">
                Yes — I’ve finished the new chat flow. I’ll share it before the call.
                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/60">2:42 PM <CheckCheck className="h-3 w-3 text-cyan-200" /></div>
              </div>
              <div className="flex max-w-[72%] items-center gap-3 rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.07] p-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300"><Mic2 className="h-4 w-4" /></div>
                <div className="flex flex-1 items-center gap-1">
                  {[12, 20, 9, 26, 16, 30, 12, 22, 8, 17, 11, 25, 15, 8].map((height, index) => (
                    <span key={index} className="w-1 rounded-full bg-violet-300/70" style={{ height }} />
                  ))}
                </div>
                <span className="text-[10px] text-white/35">0:18</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {["Perfect, see you then!", "I’ll be there", "Sounds good"].map((reply) => (
                  <span key={reply} className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-2 text-xs font-medium text-violet-200">{reply}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/[0.07] p-3 sm:px-5">
              <div className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white/25">Write a message...</div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-950/40"><ArrowRight className="h-4 w-4" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[0.07] bg-[#0d0a18] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid items-end gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">Inside ByteTalk</p>
              <h2 className="mt-3 max-w-lg text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl">
                Everything your conversations need.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-white/45 lg:justify-self-end">
              One focused place for fast messages, richer ways to respond, and practical AI assistance when a conversation gets busy.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(({ icon, title, copy }, index) => (
              <article key={title} className="group flex min-h-[240px] flex-col rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.045] lg:p-7">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/[0.08] text-violet-300">{icon}</div>
                  <span className="text-xs font-medium tracking-[0.16em] text-white/20">0{index + 1}</span>
                </div>
                <div className="mt-auto pt-10">
                  <h3 className="text-xl font-medium">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/[0.07] px-6 py-8 text-sm text-white/30 sm:flex-row lg:px-10">
        <div className="flex items-center gap-2 font-medium text-white/55"><img src={assets.logo_icon} alt="" className="h-5 w-5" /> ByteTalk</div>
        <p>Real-time conversations with a little more intelligence.</p>
      </footer>
    </main>
  );
};

export default LandingPage;
