import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useSpeechAI } from "../hooks/useSpeechAI";

// Feature 2: Define available scenarios
const SCENARIOS = [
  "Casual",
  "Job Interview",
  "Dating",
  "Networking Event",
  "Customer Support",
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ChitChat" },
    {
      name: "description",
      content:
        "Train your conversational skills with AI-powered voice conversations",
    },
  ];
}

interface Message {
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function Home() {
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]); // Feature 2: State for selected scenario
  const recognitionRef = useRef<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>("session-" + Date.now()); // Store sessionId

  const {
    messages,
    isProcessing,
    sendMessage,
    startConversation,
    clearConversation,
    error,
  } = useSpeechAI(sessionIdRef.current);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && isStarted) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          // Ignore results if conversation has ended
          if (!isActiveRef.current) {
            return;
          }

          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              console.log("✨ Final transcript:", transcript);
              finalTranscript += transcript + " ";
            } else {
              console.log("🔄 Interim transcript:", transcript);
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setCurrentTranscript("");
            // Send to AI
            sendMessage(finalTranscript.trim(), selectedScenario).catch(console.error);
          } else {
            setCurrentTranscript(interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [isStarted, selectedScenario, isListening]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsAiSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsAiSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStart = () => {
    // Feature 1: Clear all state for a fresh session
    setCurrentTranscript("");
    startConversation(selectedScenario);
    setIsAiSpeaking(false);

    isActiveRef.current = true;
    setIsStarted(true);
    setTimeout(() => {
      if (recognitionRef.current) {
        console.log("🎤 Starting speech recognition");
        recognitionRef.current.start();
        setIsListening(true);
      }
    }, 500);
  };

  const handleEndConversation = () => {
    // Immediately mark as inactive to prevent any new messages
    isActiveRef.current = false;

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clear all state
    setIsListening(false);
    setIsStarted(false);
    setCurrentTranscript("");
    setIsAiSpeaking(false);

    // Navigate to results page with conversation data
    navigate("/results", {
      state: {
        messages: messages,
        sessionId: sessionIdRef.current,
      },
    });

    // Clear conversation after navigation
    clearConversation().catch(console.error);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex">
        {/* Left Side - Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Hey! Let's have a chat.
              </span>
              <br />
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Train your conversational skills with AI-powered voice
              conversations.
            </p>

<<<<<<< HEAD
          {/* Feature 2: Scenario Selector UI */}
          <div className="mb-10 max-w-xs mx-auto">
            <label
              htmlFor="scenario-select"
              className="block text-lg font-medium text-gray-400 mb-2 text-left"
            >
              Pick a Conversation Scenario:
            </label>
            <select
              id="scenario-select"
              value={selectedScenario}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedScenario(e.target.value)
              }
              className="block w-full py-3 px-4 border border-gray-700 bg-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-white text-base appearance-none"
              style={{
                // Custom arrow style for dark mode
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.7rem center",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              {SCENARIOS.map((scenario) => (
                <option key={scenario} value={scenario}>
                  {scenario}
                </option>
              ))}
            </select>
          </div>
          {/* End Feature 2 UI */}

          <button
            onClick={handleStart}
            className="group relative px-12 py-5 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-105"
          >
            <span className="flex items-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
=======
            {/* Feature 2: Scenario Selector UI */}
            <div className="mb-10 max-w-xs mx-auto">
              <label
                htmlFor="scenario-select"
                className="block text-lg font-medium text-gray-400 mb-2 text-center"
>>>>>>> main
              >
                Pick a Conversation Scenario:
              </label>
              <select
                id="scenario-select"
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="block w-full py-3 px-4 border border-gray-700 bg-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white text-base text-center appearance-none"
                style={{
                  // Custom arrow style for dark mode
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.7rem center",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                {SCENARIOS.map((scenario) => (
                  <option key={scenario} value={scenario}>
                    {scenario}
                  </option>
                ))}
              </select>
            </div>
            {/* End Feature 2 UI */}

            <button
              onClick={handleStart}
              className="group relative px-12 py-5 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 hover:from-purple-300 hover:via-pink-300 hover:to-orange-300 transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-pink-500/60 hover:scale-105 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                Start Training
              </span>
            </button>
          </div>
        </div>

        {/* Right Side - Sidebar */}
        <div className="w-1/4 min-h-screen relative overflow-hidden border-l border-gray-800">
          {/* Base gradient + bloom (blue theme with pink bottom) */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_0%,#0f1423_0%,#0a0f1a_60%)]" />
            <div className="absolute -inset-32 opacity-35 mix-blend-screen pointer-events-none">
              <div className="absolute w-[50rem] h-[50rem] -top-28 -left-28 rounded-full bg-blue-500/30 blur-[80px]" />
              <div className="absolute w-[56rem] h-[56rem] -bottom-32 -right-28 rounded-full bg-cyan-500/30 blur-[90px]" />
              <div className="absolute w-[46rem] h-[46rem] top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500/25 blur-[76px]" />
              <div className="absolute w-[60rem] h-[60rem] -bottom-40 left-1/2 -translate-x-1/2 rounded-full bg-pink-500/25 blur-[90px]" />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(80%_60%_at_50%_60%,transparent_62%,rgba(0,0,0,.35)_100%)]" />
          </div>

          {/* Content area */}
          <div className="absolute inset-0 flex items-center justify-center ml-6 mr-6">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Auroras (blue theme) */}
              <span className="aurora-blue a1" />
              <span className="aurora-blue a2" />
              <span className="aurora-blue a3" />

              {/* Comet + bubbles */}
              <span className="comet-blue" />
              <div className="bubble-blue b1" />
              <div className="bubble-blue b2" />
              <div className="bubble-blue b3" />

              <div className="relative flex flex-col items-center gap-5 z-10">
                {/* Logo */}
                <div className="logo-pop animate-float-blue ring-pulse-blue">
                  <div
                    className="relative w-20 h-20 rounded-2xl bg-gray-800/70 border border-white/10
                                  flex items-center justify-center shadow-xl shadow-blue-500/25"
                  >
                    <svg className="w-10 h-10" viewBox="0 0 24 24">
                      <path
                        className="logo-stroke"
                        fill="none"
                        stroke="#E9D5FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8zM8 12h.01M12 12h.01M16 12h.01"
                      />
                      <path
                        className="logo-fill"
                        fill="url(#grad)"
                        d="M12 4c-5 0-9 3.582-9 8 0 1.574.512 3.042 1.395 4.28L3 20l4.745-.949A9.86 9.86 0 0 0 12 20c4.97 0 9-3.582 9-8s-4.03-8-9-8z"
                      />
                      <defs>
                        <linearGradient
                          id="grad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#C4B5FD" />
                          <stop offset="50%" stopColor="#F472B6" />
                          <stop offset="100%" stopColor="#FB923C" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Orbits + sparkles */}
                    <div className="orbit-blue orbit-1">
                      <span className="satellite-blue" />
                    </div>
                    <div className="orbit-blue orbit-2">
                      <span className="satellite-blue" />
                    </div>
                    <span className="sparkle-blue s1" />
                    <span className="sparkle-blue s2" />
                    <span className="sparkle-blue s3" />
                  </div>
                </div>

                {/* Title */}
                <div className="relative">
                  <h2
                    className="title-breathe-blue text-5xl xl:text-6xl font-extrabold logo-pop"
                    style={{ animationDelay: "140ms" }}
                  >
                    <span
                      className="bg-gradient-to-r from-purple-300 via-pink-400 to-orange-400
                                     bg-clip-text text-transparent text-shimmer-blue"
                    >
                      ChitChat
                    </span>
                  </h2>
                  <span className="shine" />
                  <span className="underline-lava" />
                </div>
              </div>
            </div>
          </div>

          {/* Local CSS for blue theme */}
          <style>{`
            /* Pop-in */
            @keyframes pop-in-blue { 0%{opacity:0;transform:translateY(10px) scale(.95);} 100%{opacity:1;transform:translateY(0) scale(1);} }
            .logo-pop { animation: pop-in-blue .65s cubic-bezier(.22,.61,.36,1) both; }

            /* Float */
            @keyframes float-blue { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
            .animate-float-blue { animation: float-blue 4.5s ease-in-out infinite; }

            /* Title breathe */
            @keyframes breathe-blue { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.03); } }
            .title-breathe-blue { animation: breathe-blue 4.8s ease-in-out infinite; }

            /* Gradient shimmer */
            @keyframes gradient-shift-blue { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
            .text-shimmer-blue { background-size: 220% 220%; animation: gradient-shift-blue 7s ease infinite; }

            /* Shine sweep */
            @keyframes sweep { 0%{transform:translateX(-140%) skewX(-15deg);opacity:0} 35%{opacity:.75} 100%{transform:translateX(140%) skewX(-15deg);opacity:0} }
            .shine { position:absolute; top:52%; left:0; width:150%; height:1.6em; transform:translateY(-50%); pointer-events:none; mix-blend-mode:screen;
                     background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.7) 50%,rgba(255,255,255,0) 100%); animation:sweep 2.8s ease-in-out 700ms infinite; }
            @keyframes sweep-blue { 0%{transform:translateX(-140%) skewX(-15deg);opacity:0} 35%{opacity:.75} 100%{transform:translateX(140%) skewX(-15deg);opacity:0} }
            .shine-blue { position:absolute; top:52%; left:0; width:150%; height:1.6em; transform:translateY(-50%); pointer-events:none; mix-blend-mode:screen;
                     background:linear-gradient(90deg,rgba(147,197,253,0) 0%,rgba(147,197,253,.7) 50%,rgba(147,197,253,0) 100%); animation:sweep-blue 2.8s ease-in-out 700ms infinite; }

            /* Underline lava */
            @keyframes lava { 0%{background-position-x:0%} 100%{background-position-x:200%} }
            .underline-lava { position:absolute; left:8px; right:8px; bottom:-10px; height:4px; border-radius:9999px;
              background:linear-gradient(90deg,#a78bfa,#f472b6,#fb923c,#a78bfa);
              background-size:200% 100%; animation: lava 2.6s linear infinite; opacity:.85; }
            /* Underline lava (blue) */
            @keyframes lava-blue { 0%{background-position-x:0%} 100%{background-position-x:200%} }
            .underline-lava-blue { position:absolute; left:8px; right:8px; bottom:-10px; height:4px; border-radius:9999px;
              background:linear-gradient(90deg,#60a5fa,#3b82f6,#2563eb,#60a5fa);
              background-size:200% 100%; animation: lava-blue 2.6s linear infinite; opacity:.85; }

            /* Stroke draw + fill */
            @keyframes draw{to{stroke-dashoffset:0}} @keyframes fillIn{to{opacity:1}}
            .logo-stroke{stroke-dasharray:320;stroke-dashoffset:320;animation:draw 1.2s ease forwards;filter:drop-shadow(0 0 7px rgba(231,219,255,.6))}
            .logo-fill{opacity:0;animation:fillIn .55s ease 950ms forwards}

            /* Ring pulse (blue) */
            @keyframes ring-blue { 0%{transform:scale(.65);opacity:.55} 100%{transform:scale(1.6);opacity:0} }
            .ring-pulse-blue{position:relative}
            .ring-pulse-blue::before{content:"";position:absolute;inset:-24px;border-radius:9999px;background:radial-gradient(closest-side,rgba(59,130,246,.5),rgba(59,130,246,0));animation:ring-blue 1.7s ease-out infinite;pointer-events:none}

            /* Orbits */
            @keyframes orbit-blue{to{transform:rotate(360deg)}}
            .orbit-blue{position:absolute;inset:-18px;border-radius:9999px;animation:orbit-blue 7s linear infinite}
            .orbit-blue.orbit-2{animation-duration:11s}
            .satellite-blue{position:absolute;top:50%;left:-7px;width:9px;height:9px;border-radius:9999px;transform:translateY(-50%);
              background:radial-gradient(circle at 30% 30%,#FFF 0%,#93C5FD 55%,rgba(147,197,253,0) 75%);
              box-shadow:0 0 12px 3px rgba(96,165,250,.55);}

            /* Sparkles (blue) */
            @keyframes twinkle-blue { 0%,100%{transform:scale(.6); opacity:.35} 50%{transform:scale(1); opacity:1} }
            .sparkle-blue{ position:absolute; width:6px; height:6px; background:radial-gradient(circle,#fff,#60a5fa 60%,transparent 70%); border-radius:50%; filter:blur(.2px); }
            .sparkle-blue.s1{ top:-6px; right:-8px; animation: twinkle-blue 1.6s ease-in-out infinite; }
            .sparkle-blue.s2{ bottom:-6px; left:-10px; animation: twinkle-blue 2.1s ease-in-out .2s infinite; }
            .sparkle-blue.s3{ top:-14px; left:12px; width:4px; height:4px; animation: twinkle-blue 1.9s ease-in-out .4s infinite; }

            /* Auroras (blue) */
            @keyframes auroraMove-blue{0%{transform:translate3d(-10%,0,0) scale(1)}50%{transform:translate3d(10%,-6%,0) scale(1.12)}100%{transform:translate3d(-10%,0,0) scale(1)}}
            .aurora-blue{position:absolute;border-radius:9999px;filter:blur(90px);opacity:.22;pointer-events:none}
            .aurora-blue.a1{width:60rem;height:60rem;left:-20rem;top:-18rem;background:#3B82F6;animation:auroraMove-blue 12s ease-in-out infinite}
            .aurora-blue.a2{width:64rem;height:64rem;right:-22rem;bottom:-18rem;background:#60A5FA;animation:auroraMove-blue 14s ease-in-out -2s infinite}
            .aurora-blue.a3{width:52rem;height:52rem;left:58%;top:20%;transform:translateX(-50%);background:#0EA5E9;animation:auroraMove-blue 16s ease-in-out -4s infinite}

            /* Bubbles (blue) */
            @keyframes rise-blue { 0%{ transform: translateY(40%); opacity:0 } 10%{opacity:.35} 100%{ transform: translateY(-60%); opacity:0 } }
            .bubble-blue{ position:absolute; bottom:-10%; width:14rem; height:14rem; border-radius:9999px; background:radial-gradient(circle at 30% 30%,rgba(96,165,250,.28),rgba(96,165,250,0) 60%); filter:blur(30px); opacity:.25; pointer-events:none; }
            .bubble-blue.b1{ left:10%; animation: rise-blue 18s ease-in-out infinite; }
            .bubble-blue.b2{ left:45%; width:12rem; height:12rem; animation: rise-blue 22s ease-in-out 4s infinite; }
            .bubble-blue.b3{ left:78%; width:16rem; height:16rem; animation: rise-blue 20s ease-in-out 8s infinite; }

            /* Comet (blue) */
            @keyframes shoot-blue { 0%{ transform: translate(-30%, -40%) rotate(-10deg); opacity:0 } 10%{ opacity:.8 } 100%{ transform: translate(130%, 40%) rotate(-10deg); opacity:0 } }
            .comet-blue{ position:absolute; top:56%; left:30%; width:140px; height:3px; background:linear-gradient(90deg, rgba(96,165,250,.0), rgba(96,165,250,.85), rgba(96,165,250,0)); filter:blur(2px);
                    border-radius:9999px; animation: shoot-blue 6.5s ease-in-out 1.1s infinite; mix-blend-mode:screen; opacity:.0; }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a1628] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/10 flex-shrink-0">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ChitChat
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{selectedScenario}</span>
          </div>
          <button
            onClick={handleEndConversation}
            className="px-6 py-2 text-sm font-semibold text-white rounded-md bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
          >
            End Training
          </button>
        </div>
      </div>

      {/* Main Conversation Layout - Split Background */}
      <div className="flex-1 relative overflow-hidden">
        {/* Split Background */}
        <div className="absolute inset-0 flex">
          {/* Left Half Background - Pink/Purple theme */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_0%,#0f1423_0%,#0a0f1a_60%)]" />
              <div className="absolute -inset-32 opacity-35 mix-blend-screen pointer-events-none">
                <div className="absolute w-[50rem] h-[50rem] -top-28 -left-28 rounded-full bg-fuchsia-500/30 blur-[80px]" />
                <div className="absolute w-[56rem] h-[56rem] -bottom-32 -right-28 rounded-full bg-indigo-500/30 blur-[90px]" />
                <div className="absolute w-[46rem] h-[46rem] top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500/25 blur-[76px]" />
              </div>
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(80%_60%_at_50%_60%,transparent_62%,rgba(0,0,0,.35)_100%)]" />
              <div className="absolute inset-0 bg-pink-500/10 pointer-events-none" />
            </div>
          </div>

          {/* Center Divider */}
          <div className="w-px bg-white/10"></div>

          {/* Right Half Background - Blue theme */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_0%,#0f1423_0%,#0a0f1a_60%)]" />
              <div className="absolute -inset-32 opacity-35 mix-blend-screen pointer-events-none">
                <div className="absolute w-[50rem] h-[50rem] -top-28 -left-28 rounded-full bg-blue-500/30 blur-[80px]" />
                <div className="absolute w-[56rem] h-[56rem] -bottom-32 -right-28 rounded-full bg-cyan-500/30 blur-[90px]" />
                <div className="absolute w-[46rem] h-[46rem] top-1/3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500/25 blur-[76px]" />
                <div className="absolute w-[60rem] h-[60rem] -bottom-40 left-1/2 -translate-x-1/2 rounded-full bg-pink-500/25 blur-[90px]" />
              </div>
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(80%_60%_at_50%_60%,transparent_62%,rgba(0,0,0,.35)_100%)]" />
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Conversation Content */}
        <div className="relative z-10 h-full flex flex-col py-12 overflow-hidden">
          {/* Title Row */}
          <div className="flex mb-8 flex-shrink-0">
            <div className="flex-1 flex justify-center">
              <h2 className="text-6xl font-bold text-pink-400">You</h2>
            </div>
            <div className="flex-1 flex justify-center">
              <h2 className="text-6xl font-bold text-cyan-400">ChitChat AI</h2>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="w-full space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-32"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-start pl-12"
                    : "justify-end pr-12"
                }`}
              >
                <div className="w-[38%]">
                  <div
                    className={`text-3xl font-bold leading-relaxed break-words overflow-wrap-anywhere pl-6 ${
                      message.sender === "user"
                        ? "text-shimmer-user text-left border-l-4 border-pink-400"
                        : "text-shimmer-ai text-right border-r-4 border-cyan-400 pr-6"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}

            {currentTranscript && (
              <div className="flex justify-start pl-12">
                <div className="w-[38%]">
                  <div className="text-3xl font-bold leading-relaxed break-words overflow-wrap-anywhere text-shimmer-user text-left opacity-70 border-l-4 border-pink-400 pl-6">
                    {currentTranscript}
                  </div>
                </div>
              </div>
            )}

            {isAiSpeaking && (
              <div className="flex justify-end pr-12">
                <div className="w-[38%]">
                  <div className="flex items-center gap-2 justify-end border-r-4 border-cyan-400 pr-6">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Microphone Button */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <button className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
        {isListening && (
          <div className="mt-3 px-4 py-1 bg-gray-800 rounded-full">
            <span className="text-gray-300 text-sm">
              Listening... Speak now
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
