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
    { title: "Small Talk Trainer - Practice Your Conversation Skills" },
    {
      name: "description",
      content:
        "Train your small talk skills with AI-powered voice conversations",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef<boolean>(false);

  const {
    messages,
    isProcessing,
    sendMessage,
    setScenario,
    clearConversation,
    error,
  } = useSpeechAI("session-" + Date.now());

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
            sendMessage(finalTranscript.trim()).catch(console.error);
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
  }, [isStarted, isListening]);

  // Set initial scenario when conversation starts
  useEffect(() => {
    if (isStarted) {
      setScenario(selectedScenario).catch(console.error);
    }
  }, [isStarted, selectedScenario, setScenario]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    clearConversation().catch(console.error);

    // Navigate to results page
    navigate("/results");
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Hey! Let's have a chat.
            </span>
            <br />
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
            Train your small talk skills with AI-powered voice conversations.
          </p>

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
              onChange={(e) => setSelectedScenario(e.target.value)}
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
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          SmallTalk Trainer
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">🎓</span>
            <span className="text-white font-medium">{selectedScenario}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-white font-medium">Simulation Active</span>
          </div>
          <button
            onClick={handleEndConversation}
            className="px-6 py-2 text-sm font-semibold text-white rounded-md bg-red-600 hover:bg-red-700 transition-colors"
          >
            End Training
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex relative">
        {/* Left Side - You */}
        <div className="flex-1 flex flex-col items-center px-8 py-12">
          {/* User Icon and Label */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center mb-3">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold">You</span>
          </div>

          {/* User Messages */}
          <div className="w-full max-w-md space-y-4">
            {messages
              .filter((m) => m.sender === "user")
              .map((message, index) => (
                <div key={index} className="flex flex-col items-start">
                  <div className="bg-transparent border-2 border-white/30 rounded-xl px-4 py-3">
                    <div className="text-white/70 text-xs font-semibold mb-1">
                      YOU
                    </div>
                    <div className="text-white">{message.text}</div>
                  </div>
                </div>
              ))}

            {currentTranscript && (
              <div className="flex flex-col items-start">
                <div className="bg-transparent border-2 border-white/30 rounded-xl px-4 py-3">
                  <div className="text-white/70 text-xs font-semibold mb-1">
                    YOU
                  </div>
                  <div className="text-white opacity-70">
                    {currentTranscript}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Divider */}
        <div className="w-px bg-white/10"></div>

        {/* Right Side - Trainer AI */}
        <div className="flex-1 flex flex-col items-center px-8 py-12">
          {/* AI Icon and Label */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center mb-3">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold">Trainer AI</span>
          </div>

          {/* AI Messages */}
          <div className="w-full max-w-md space-y-4">
            {messages
              .filter((m) => m.sender === "ai")
              .map((message, index) => (
                <div key={index} className="flex flex-col items-start">
                  <div className="bg-transparent border-2 border-white/30 rounded-xl px-4 py-3">
                    <div className="text-white/70 text-xs font-semibold mb-1">
                      TRAINER AI
                    </div>
                    <div className="text-white">{message.text}</div>
                  </div>
                </div>
              ))}

            {isAiSpeaking && (
              <div className="flex flex-col items-start">
                <div className="bg-transparent border-2 border-white/30 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div ref={messagesEndRef} />
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
