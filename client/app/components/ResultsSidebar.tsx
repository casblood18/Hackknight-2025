import { useEffect, useState } from "react";

export default function ResultsSidebar() {
  const [activeTab, setActiveTab] =
    useState<"home" | "results" | "feedback">("home");

  const [summary, setSummary] = useState<{ good: string; bad: string } | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Tab click handler (no routing)
  const handleTabNav = (tab: "home" | "results" | "feedback") => () => {
    setActiveTab(tab);
  };

  // summary data when results tab is active
  useEffect(() => {
    if (activeTab === "results") {
      setIsLoadingSummary(true);

      // replace with your deployed backend URL when ready
      fetch("http://localhost:5000/api/summary")
        .then((res) => res.json())
        .then((data) => {
          setSummary({
            good: data.summary_good,
            bad: data.summary_bad,
          });
        })
        .catch((err) => console.error("Error fetching summary:", err))
        .finally(() => setIsLoadingSummary(false));
    }
  }, [activeTab]);

  /**
   *  backend response shape:
   * {
   *   "summary_good": "You spoke clearly and kept the conversation friendly.",
   *   "summary_bad": "You interrupted a few times and didn’t ask follow-up questions."
   * }
   */

  return (
    <div className="w-1/4 min-h-screen relative overflow-hidden border-r border-gray-800">
      {/* Base gradient + bloom */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_0%,#0f1423_0%,#0a0f1a_60%)]" />
        <div className="absolute -inset-32 opacity-35 mix-blend-screen pointer-events-none">
          <div className="absolute w-[50rem] h-[50rem] -top-28 -left-28 rounded-full bg-fuchsia-500/30 blur-[80px]" />
          <div className="absolute w-[56rem] h-[56rem] -bottom-32 -right-28 rounded-full bg-indigo-500/30 blur-[90px]" />
          <div className="absolute w-[46rem] h-[46rem] top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500/25 blur-[76px]" />
        </div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(80%_60%_at_50%_60%,transparent_62%,rgba(0,0,0,.35)_100%)]" />
      </div>

      {/* Button rail (no routing, just state) */}
      <nav className="absolute z-50 left-3 top-1/2 -translate-y-1/2 flex flex-col gap-8">
        {/* Home */}
        <button
          type="button"
          onClick={handleTabNav("home")}
          aria-label="Home"
          className={`btn-fx w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                      bg-gray-900/85 border border-gray-700 hover:scale-110
                      ${
                        activeTab === "home"
                          ? "text-white ring-2 ring-purple-500/60 shadow-xl shadow-purple-500/40"
                          : "text-gray-300 hover:text-white"
                      }`}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        {/* Results */}
        <button
          type="button"
          onClick={handleTabNav("results")}
          aria-label="Results"
          className={`btn-fx w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                      bg-gray-900/85 border border-gray-700 hover:scale-110
                      ${
                        activeTab === "results"
                          ? "text-white ring-2 ring-purple-500/60 shadow-xl shadow-purple-500/40"
                          : "text-gray-300 hover:text-white"
                      }`}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Feedback (Ratings) */}
        <button
          type="button"
          onClick={handleTabNav("feedback")}
          aria-label="Feedback"
          className={`btn-fx w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                      bg-gray-900/85 border border-gray-700 hover:scale-110
                      ${
                        activeTab === "feedback"
                          ? "text-white ring-2 ring-purple-500/60 shadow-xl shadow-purple-500/40"
                          : "text-gray-300 hover:text-white"
                      }`}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </nav>

      {/* Content area */}
      <div className="absolute inset-0 flex items-center justify-center ml-24 mr-6">
        {/* HOME */}
        {activeTab === "home" && (
          <div className="relative w-full h-full flex items-center justify-center page-in">
            {/* Auroras */}
            <span className="aurora a1" />
            <span className="aurora a2" />
            <span className="aurora a3" />

            {/* Comet + bubbles */}
            <span className="comet" />
            <div className="bubble b1" />
            <div className="bubble b2" />
            <div className="bubble b3" />

            <div className="relative flex flex-col items-center gap-5 z-10">
              {/* Logo */}
              <div className="logo-pop animate-float ring-pulse">
                <div className="relative w-20 h-20 rounded-2xl bg-gray-800/70 border border-white/10
                                flex items-center justify-center shadow-xl shadow-purple-500/25">
                  <svg className="w-10 h-10" viewBox="0 0 24 24">
                    <path className="logo-stroke" fill="none" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8zM8 12h.01M12 12h.01M16 12h.01" />
                    <path className="logo-fill" fill="url(#grad)" d="M12 4c-5 0-9 3.582-9 8 0 1.574.512 3.042 1.395 4.28L3 20l4.745-.949A9.86 9.86 0 0 0 12 20c4.97 0 9-3.582 9-8s-4.03-8-9-8z" />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C4B5FD" />
                        <stop offset="50%" stopColor="#F472B6" />
                        <stop offset="100%" stopColor="#FB923C" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Orbits + sparkles */}
                  <div className="orbit orbit-1"><span className="satellite" /></div>
                  <div className="orbit orbit-2"><span className="satellite" /></div>
                  <span className="sparkle s1" />
                  <span className="sparkle s2" />
                  <span className="sparkle s3" />
                </div>
              </div>

              {/* Title */}
              <div className="relative">
                <h2 className="title-breathe text-5xl xl:text-6xl font-extrabold logo-pop" style={{ animationDelay: "140ms" }}>
                  <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-orange-400
                                   bg-clip-text text-transparent text-shimmer">
                    Chit Chat
                  </span>
                </h2>
                <span className="shine" />
                <span className="underline-lava" />
              </div>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {activeTab === "results" && (
          <div className="relative w-full h-full text-gray-200 overflow-visible page-in">
            {/* FULL-BLEED FX to cover ml-24/mr-6 */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 left-[-6rem] right-[-1.5rem] z-0"
            >
              <span className="aurora a1" />
              <span className="aurora a2" />
              <span className="aurora a3" />
              <span className="comet" />
              <div className="bubble b1" />
              <div className="bubble b2" />
              <div className="bubble b3" />
            </div>

            {/* Content above FX */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Center divider */}
              <div className="absolute top-1/2 left-12 right-12 border-t border-gray-700/60" />

              {/* --- GOOD SUMMARY (top) --- */}
              <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
                <h2 className="text-3xl font-extrabold mb-3">
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent animate-pulse">
                    What You Did Great 🌟
                  </span>
                </h2>
                {isLoadingSummary ? (
                  <p className="text-gray-500 italic animate-pulse">Generating summary...</p>
                ) : (
                  <p className="text-gray-400 leading-relaxed max-w-lg">
                    {summary?.good || "Waiting for feedback..."}
                  </p>
                )}
              </div>

              {/* --- BAD SUMMARY (bottom) --- */}
              <div className="flex-1 flex flex-col items-center justify-center px-10 text-center border-t border-gray-800/40">
                <h2 className="text-3xl font-extrabold mb-3">
                  <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent animate-pulse">
                    What Could Be Better 💭
                  </span>
                </h2>
                {isLoadingSummary ? (
                  <p className="text-gray-500 italic animate-pulse">Analyzing areas for improvement...</p>
                ) : (
                  <p className="text-gray-400 leading-relaxed max-w-lg">
                    {summary?.bad || "Waiting for feedback..."}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK (Ratings coming soon) */}
        {activeTab === "feedback" && (
          <div className="relative w-full h-full text-gray-200 overflow-visible page-in">
            {/* Same animated background, full-bleed */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 left-[-6rem] right-[-1.5rem] z-0"
            >
              <span className="aurora a1" />
              <span className="aurora a2" />
              <span className="aurora a3" />
              <span className="comet" />
              <div className="bubble b1" />
              <div className="bubble b2" />
              <div className="bubble b3" />
            </div>

            {/* Centered message */}
            <div className="relative z-10 w-full h-full grid place-items-center text-center px-8">
              <div className="space-y-3">
                <h2 className="text-4xl font-extrabold">
                  <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-orange-400 bg-clip-text text-transparent text-shimmer">
                    Ratings page coming soon…
                  </span>
                </h2>
                <p className="text-gray-400">We’re polishing the scoring &amp; insights experience.</p>
              </div>
            </div>
          </div>
        )}

        {/* Transition veil overlay (re-mounts on tab change) */}
        <div key={activeTab} className="tab-veil" />
      </div>

      {/* Local CSS */}
      <style>{`
        /* Pop-in */
        @keyframes pop-in { 0%{opacity:0;transform:translateY(10px) scale(.95);filter:blur(6px);} 100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);} }
        .logo-pop { animation: pop-in .65s cubic-bezier(.22,.61,.36,1) both; }

        /* Float */
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .animate-float { animation: float 4.5s ease-in-out infinite; }

        /* Title breathe */
        @keyframes breathe { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.03); } }
        .title-breathe { animation: breathe 4.8s ease-in-out infinite; }

        /* Gradient shimmer */
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .text-shimmer { background-size: 220% 220%; animation: gradient-shift 7s ease infinite; }

        /* Shine sweep */
        @keyframes sweep { 0%{transform:translateX(-140%) skewX(-15deg);opacity:0} 35%{opacity:.75} 100%{transform:translateX(140%) skewX(-15deg);opacity:0} }
        .shine { position:absolute; top:52%; left:0; width:150%; height:1.6em; transform:translateY(-50%); pointer-events:none; mix-blend-mode:screen; filter:blur(8px);
                 background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.7) 50%,rgba(255,255,255,0) 100%); animation:sweep 2.8s ease-in-out 700ms infinite; }

        /* Underline lava */
        @keyframes lava { 0%{background-position-x:0%} 100%{background-position-x:200%} }
        .underline-lava { position:absolute; left:8px; right:8px; bottom:-10px; height:4px; border-radius:9999px;
          background:linear-gradient(90deg,#a78bfa,#f472b6,#fb923c,#a78bfa);
          background-size:200% 100%; animation: lava 2.6s linear infinite; opacity:.85; }

        /* Stroke draw + fill */
        @keyframes draw{to{stroke-dashoffset:0}} @keyframes fillIn{to{opacity:1}}
        .logo-stroke{stroke-dasharray:320;stroke-dashoffset:320;animation:draw 1.2s ease forwards;filter:drop-shadow(0 0 7px rgba(231,219,255,.6))}
        .logo-fill{opacity:0;animation:fillIn .55s ease 950ms forwards}

        /* Ring pulse */
        @keyframes ring { 0%{transform:scale(.65);opacity:.55} 100%{transform:scale(1.6);opacity:0} }
        .ring-pulse{position:relative}
        .ring-pulse::before{content:"";position:absolute;inset:-24px;border-radius:9999px;background:radial-gradient(closest-side,rgba(168,85,247,.5),rgba(168,85,247,0));animation:ring 1.7s ease-out infinite;pointer-events:none}

        /* Orbits */
        @keyframes orbit{to{transform:rotate(360deg)}}
        .orbit{position:absolute;inset:-18px;border-radius:9999px;animation:orbit 7s linear infinite}
        .orbit-2{animation-duration:11s}
        .satellite{position:absolute;top:50%;left:-7px;width:9px;height:9px;border-radius:9999px;transform:translateY(-50%);
          background:radial-gradient(circle at 30% 30%,#FFF 0%,#C4B5FD 55%,rgba(196,181,253,0) 75%);
          box-shadow:0 0 12px 3px rgba(167,139,250,.55);}

        /* Sparkles */
        @keyframes twinkle { 0%,100%{transform:scale(.6); opacity:.35} 50%{transform:scale(1); opacity:1} }
        .sparkle{ position:absolute; width:6px; height:6px; background:radial-gradient(circle,#fff,#a78bfa 60%,transparent 70%); border-radius:50%; filter:blur(.2px); }
        .s1{ top:-6px; right:-8px; animation: twinkle 1.6s ease-in-out infinite; }
        .s2{ bottom:-6px; left:-10px; animation: twinkle 2.1s ease-in-out .2s infinite; }
        .s3{ top:-14px; left:12px; width:4px; height:4px; animation: twinkle 1.9s ease-in-out .4s infinite; }

        /* Auroras */
        @keyframes auroraMove{0%{transform:translate3d(-10%,0,0) scale(1)}50%{transform:translate3d(10%,-6%,0) scale(1.12)}100%{transform:translate3d(-10%,0,0) scale(1)}}
        .aurora{position:absolute;border-radius:9999px;filter:blur(90px);opacity:.22;pointer-events:none}
        .a1{width:60rem;height:60rem;left:-20rem;top:-18rem;background:#F472B6;animation:auroraMove 12s ease-in-out infinite}
        .a2{width:64rem;height:64rem;right:-22rem;bottom:-18rem;background:#A78BFA;animation:auroraMove 14s ease-in-out -2s infinite}
        .a3{width:52rem;height:52rem;left:58%;top:20%;transform:translateX(-50%);background:#60A5FA;animation:auroraMove 16s ease-in-out -4s infinite}

        /* Bubbles */
        @keyframes rise { 0%{ transform: translateY(40%); opacity:0 } 10%{opacity:.35} 100%{ transform: translateY(-60%); opacity:0 } }
        .bubble{ position:absolute; bottom:-10%; width:14rem; height:14rem; border-radius:9999px; background:radial-gradient(circle at 30% 30%,rgba(167,139,250,.28),rgba(167,139,250,0) 60%); filter:blur(30px); opacity:.25; pointer-events:none; }
        .b1{ left:10%; animation: rise 18s ease-in-out infinite; }
        .b2{ left:45%; width:12rem; height:12rem; animation: rise 22s ease-in-out 4s infinite; }
        .b3{ left:78%; width:16rem; height:16rem; animation: rise 20s ease-in-out 8s infinite; }

        /* Comet */
        @keyframes shoot { 0%{ transform: translate(-30%, -40%) rotate(-10deg); opacity:0 } 10%{ opacity:.8 } 100%{ transform: translate(130%, 40%) rotate(-10deg); opacity:0 } }
        .comet{ position:absolute; top:56%; left:30%; width:140px; height:3px; background:linear-gradient(90deg, rgba(255,255,255,.0), rgba(255,255,255,.85), rgba(255,255,255,0)); filter:blur(2px);
                border-radius:9999px; animation: shoot 6.5s ease-in-out 1.1s infinite; mix-blend-mode:screen; opacity:.0; }

        /* Button ripple */
        .btn-fx{position:relative;overflow:hidden}
        .btn-fx::after{content:"";position:absolute;inset:0;border-radius:9999px;background:radial-gradient(circle at center,rgba(167,139,250,.28),rgba(167,139,250,0) 60%);transform:scale(0);opacity:0;transition:transform .35s ease,opacity .35s ease}
        .btn-fx:hover::after{transform:scale(1);opacity:1}

        /* -------- Tab transition veil (plays on each tab change) -------- */
        @keyframes veil {
          0% { opacity: 1; transform: scale(1.05); backdrop-filter: blur(8px); }
          100% { opacity: 0; transform: scale(1);    backdrop-filter: blur(0px); }
        }
        .tab-veil {
          position: absolute;
          inset: 0;
          z-index: 30;
          pointer-events: none;
          background: radial-gradient(90% 90% at 50% 50%,
                      rgba(168,85,247,0.20),
                      rgba(236,72,153,0.16) 40%,
                      rgba(2,6,23,0.00) 75%);
          animation: veil .45s cubic-bezier(.22,.61,.36,1) both;
        }

        /* -------- Page in animation for each screen -------- */
        @keyframes pageIn {
          0%   { opacity: 0; transform: translateY(10px) scale(.985); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0)     scale(1);    filter: blur(0); }
        }
        .page-in { animation: pageIn .45s cubic-bezier(.22,.61,.36,1) both; }
      `}</style>
    </div>
  );
}
