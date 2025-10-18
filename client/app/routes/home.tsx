import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";

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
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef<boolean>(false);

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
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            // Double-check before saving
            if (!isActiveRef.current) {
              return;
            }

            const userMessage: Message = {
              id: Date.now().toString(),
              text: finalTranscript.trim(),
              sender: "user",
              timestamp: new Date(),
            };
            setMessages((prev) => {
              // Check again right before updating (prevents race condition)
              if (!isActiveRef.current) return prev;
              return [...prev, userMessage];
            });
            setCurrentTranscript("");

            // Send to backend via HTTP
            sendMessageToBackend(finalTranscript.trim());
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

  // Send message to backend via HTTP
  const sendMessageToBackend = async (text: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();

      // Check if still active before adding AI response
      if (!isActiveRef.current) {
        return;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => {
        // Check again right before updating (prevents race condition)
        if (!isActiveRef.current) return prev;
        return [...prev, aiMessage];
      });

      // Speak the response only if still active
      if (isActiveRef.current) {
        speakText(data.response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error to user
    }
  };

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
    isActiveRef.current = true;
    setIsStarted(true);
    setTimeout(() => {
      if (recognitionRef.current) {
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
    setMessages([]);
    setCurrentTranscript("");
    setIsAiSpeaking(false);
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

          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Train your small talk skills with AI-powered voice conversations.
          </p>

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-gray-300 font-medium">
              Small Talk Trainer
            </span>
          </div>
          <button
            onClick={handleEndConversation}
            className="px-6 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
          >
            End Conversation
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !currentTranscript && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                <svg
                  className="w-8 h-8 text-purple-400"
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
              </div>
              <p className="text-gray-400 text-lg">
                Start speaking to begin your conversation...
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-6 py-4 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                    : "bg-gray-800 text-gray-100 border border-gray-700"
                }`}
              >
                <p className="text-base leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}

          {currentTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[75%] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600/60 to-purple-700/60 text-white border border-purple-500/30">
                <p className="text-base leading-relaxed opacity-80">
                  {currentTranscript}
                </p>
              </div>
            </div>
          )}

          {isAiSpeaking && (
            <div className="flex justify-start">
              <div className="px-6 py-4 rounded-2xl bg-gray-800 border border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3 text-sm">
            {isListening && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-gray-400">Listening...</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
