import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCheck,
  Image as ImageIcon,
  LockKeyhole,
  MessageCircleMore,
  Mic2,
  Radio,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import assets from "../assets/assets";

const features = [
  {
    icon: <Radio className="h-5 w-5" />,
    kicker: "Always current",
    title: "Live by default",
    copy: "Messages, presence, typing, and read status update as the conversation happens.",
  },
  {
    icon: <BrainCircuit className="h-5 w-5" />,
    kicker: "Built-in assistance",
    title: "AI that helps",
    copy: "Summarize long threads, inspect action items, and turn incoming messages into quick replies.",
  },
  {
    icon: <ImageIcon className="h-5 w-5" />,
    kicker: "Richer replies",
    title: "More than text",
    copy: "Share images and voice notes without leaving the flow of your conversation.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="landing-page h-full overflow-y-auto bg-[#07060a] text-white">
      <div className="landing-grid fixed inset-0 pointer-events-none opacity-25" />
      <div className="landing-aurora fixed left-1/2 top-0 h-[620px] w-[900px] -translate-x-1/2 pointer-events-none" />

      <nav className="relative z-50 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          aria-label="ByteTalk home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] shadow-lg shadow-black/30">
            <img src={assets.logo_icon} alt="" className="h-7 w-7 object-contain" />
          </span>
          <span className="text-lg font-semibold tracking-tight">ByteTalk</span>
        </button>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.035] p-1 text-sm text-white/50 backdrop-blur-xl md:flex">
          <button onClick={scrollToFeatures} className="rounded-full px-4 py-2 transition hover:bg-white/[0.06] hover:text-white">Experience</button>
          <button onClick={scrollToFeatures} className="rounded-full px-4 py-2 transition hover:bg-white/[0.06] hover:text-white">Features</button>
          <button onClick={scrollToFeatures} className="rounded-full px-4 py-2 transition hover:bg-white/[0.06] hover:text-white">AI tools</button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={() => navigate("/login")} className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white sm:px-4">
            Sign in
          </button>
          <button onClick={() => navigate("/sign-up")} className="rounded-xl bg-[#d9c7ff] px-4 py-2.5 text-sm font-semibold text-[#17101f] shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-white sm:px-5">
            Get started
          </button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto min-h-[900px] w-full max-w-[1440px] overflow-hidden px-5 pb-8 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        <div className="relative z-30 mx-auto flex max-w-5xl flex-col items-center text-center landing-reveal">
          {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-violet-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.8)]" />
            A more intelligent way to talk
          </div> */}

          <h1 className="text-balance text-[3.5rem] font-medium leading-[0.93] tracking-[-0.06em] sm:text-7xl lg:text-[6.7rem]">
            Conversations,
            <span className="block bg-gradient-to-r from-violet-300 via-[#f4efff] to-cyan-200 bg-clip-text text-transparent">elevated.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg sm:leading-8">
            Real-time chat, voice, shared moments, and useful AI tools—designed to keep every conversation moving naturally.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate("/sign-up")} className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#d9c7ff] px-6 py-3.5 text-sm font-semibold text-[#17101f] shadow-xl shadow-violet-950/40 transition hover:-translate-y-0.5 hover:bg-white">
              Start a conversation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={scrollToFeatures} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-6 py-3.5 text-sm font-medium text-white/70 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white">
              Explore ByteTalk
            </button>
          </div>
        </div>

        <div className="landing-visual-stage relative mx-auto mt-10 h-[430px] w-full max-w-6xl sm:mt-5 sm:h-[480px]">
          <div className="landing-beam absolute left-1/2 top-1/2 h-[420px] w-[700px] -translate-x-1/2 -translate-y-1/2" />

          <div className="absolute left-1/2 top-1/2 h-[360px] w-[650px] -translate-x-1/2 -translate-y-1/2">
            <div className="byte-orbit byte-orbit-one h-full w-full rounded-[50%] border border-violet-200/10" />
          </div>
          <div className="absolute left-1/2 top-1/2 h-[270px] w-[500px] -translate-x-1/2 -translate-y-1/2">
            <div className="byte-orbit byte-orbit-two h-full w-full rounded-[50%] border border-cyan-200/[0.08]" />
          </div>

          <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 sm:h-[270px] sm:w-[270px]">
            <div className="byte-orb flex h-full w-full items-center justify-center rounded-full">
              <div className="byte-orb-core flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-[#17111f]/80 shadow-2xl backdrop-blur-xl sm:h-28 sm:w-28">
                <img src={assets.logo_icon} alt="ByteTalk" className="h-14 w-14 sm:h-16 sm:w-16" />
              </div>
            </div>
          </div>

          <div className="byte-float absolute left-[2%] top-[17%] hidden w-[245px] rounded-3xl border border-white/[0.09] bg-[#16131c]/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:block lg:left-[7%]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Zap className="h-4 w-4" /></div>
              <div><p className="text-sm font-medium">Instant delivery</p><p className="mt-0.5 text-xs text-white/35">Presence and typing, live</p></div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              {[32, 52, 40, 70, 55, 82, 62, 90, 68, 76, 58].map((height, index) => (
                <span key={index} className="w-full rounded-full bg-gradient-to-t from-violet-500/25 to-violet-300/80" style={{ height: `${height / 2}px` }} />
              ))}
            </div>
          </div>

          <div className="byte-float byte-float-delay absolute right-[2%] top-[6%] hidden w-[260px] rounded-3xl border border-white/[0.09] bg-[#16131c]/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:block lg:right-[6%]">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200"><WandSparkles className="h-4 w-4" /></div>
              <span className="rounded-full bg-violet-300/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-violet-200">AI recap</span>
            </div>
            <p className="mt-5 text-sm leading-6 text-white/65">The key points are ready when the thread gets long.</p>
          </div>

          <div className="byte-float byte-float-slow absolute bottom-[8%] left-[8%] hidden w-[230px] rounded-3xl border border-white/[0.09] bg-[#16131c]/75 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl md:block lg:left-[16%]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20"><Mic2 className="h-4 w-4 text-violet-200" /></div>
              <div className="flex flex-1 items-center gap-1">
                {[10, 20, 14, 28, 18, 24, 12, 20, 8].map((height, index) => <span key={index} className="w-1 rounded-full bg-white/45" style={{ height }} />)}
              </div>
              <span className="text-[10px] text-white/30">0:18</span>
            </div>
          </div>

          <div className="byte-float byte-float-delay absolute bottom-[4%] right-[8%] w-[265px] rounded-3xl border border-white/[0.09] bg-[#16131c]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:right-[12%] lg:right-[16%]">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-700 text-sm font-medium">A<span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#16131c] bg-emerald-400" /></div>
              <div><p className="text-sm font-medium">Anika</p><p className="text-xs text-emerald-300/70">typing...</p></div>
            </div>
            <div className="mt-3 rounded-2xl rounded-bl-md bg-white/[0.07] px-3.5 py-2.5 text-xs leading-5 text-white/60">The new flow feels much cleaner.</div>
          </div>

          <div className="absolute left-1/2 top-[76%] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[11px] text-white/60 shadow-xl backdrop-blur-xl">
            <MessageCircleMore className="h-3.5 w-3.5 text-violet-200" />
            <span>Connected in real time</span>
            <CheckCheck className="h-3.5 w-3.5 text-cyan-200" />
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 border-y border-white/[0.07] bg-[#0b090e] py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid items-end gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/75">Inside ByteTalk</p>
              <h2 className="mt-4 max-w-xl text-4xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-5xl">Less friction.<br />More conversation.</h2>
            </div>
            <div className="max-w-xl lg:justify-self-end">
              <p className="text-base leading-7 text-white/42">A focused communication space with the live details people expect and AI assistance that stays out of the way until it is useful.</p>
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/35">
                <span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5 text-emerald-300" /> Secure sign-in</span>
                <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-violet-200" /> AI assistance</span>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map(({ icon, kicker, title, copy }, index) => (
              <article key={title} className="group flex min-h-[280px] flex-col overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-300/20 hover:bg-white/[0.045] lg:p-7">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.07] text-violet-200">{icon}</div>
                  <span className="text-xs tracking-[0.18em] text-white/18">0{index + 1}</span>
                </div>
                <div className="mt-auto pt-12">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/28">{kicker}</p>
                  <h3 className="mt-2 text-xl font-medium">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/42">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-white/25 sm:flex-row lg:px-10">
        <div className="flex items-center gap-2 font-medium text-white/50"><img src={assets.logo_icon} alt="" className="h-5 w-5" /> ByteTalk</div>
        <p>Real-time conversations with a little more intelligence.</p>
      </footer>
    </main>
  );
};

export default LandingPage;
