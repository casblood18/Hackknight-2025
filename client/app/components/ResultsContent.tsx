import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import {
  getFeedbackAnalysis,
  type Message,
  type FeedbackMap,
} from "../hooks/useSpeechAI";

interface LocationState {
  messages?: Message[];
  sessionId?: string;
}

export default function ResultsContent() {
  const location = useLocation();
  const state = location.state as LocationState;
  const messages = state?.messages || [];
  const sessionId = state?.sessionId || "default";
  const [annotatedMessages, setAnnotatedMessages] = useState<Message[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<FeedbackMap>({});
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    messageIndex: number;
    alias: string;
  } | null>(null);
  const [isClosingFeedback, setIsClosingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedback analysis when component mounts
  useEffect(() => {
    const fetchFeedback = async () => {
      if (messages.length === 0) {
        return;
      }

      setIsLoadingFeedback(true);
      setError(null);

      try {
        // TODO: Remove this mock data once backend is ready
        // MOCK DATA FOR TESTING - Simulates Gemini API response
        // await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay

        // const mockFeedbackMap: FeedbackMap = {
        //   ALIAS_1: [
        //     "hello",
        //     "Good greeting! Starting with 'hello' is a friendly and universal way to begin a conversation. However, you could make it more engaging by adding a follow-up question or comment about the context.",
        //   ],
        //   ALIAS_2: [
        //     "how are you",
        //     "This is a common courtesy question that shows interest. In professional settings, consider being more specific, like 'How has your day been?' or 'How's the project going?' to encourage deeper conversation.",
        //   ],
        //   ALIAS_3: [
        //     "that's great",
        //     "Positive response! While this acknowledges the other person, you could enhance engagement by asking a follow-up question or sharing a related thought to keep the conversation flowing naturally.",
        //   ],
        // };

        // const mockAnnotatedMessages: Message[] = messages.map((msg, idx) => {
        //   // Add some aliases to certain messages for demonstration
        //   if (idx === 0 && msg.sender === "user") {
        //     return {
        //       ...msg,
        //       text: "[ALIAS_1] there aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab",
        //     };
        //   }
        //   if (idx === 2 && msg.sender === "user") {
        //     return { ...msg, text: "I'm doing well, [ALIAS_2]?" };
        //   }
        //   if (idx === 4 && msg.sender === "user") {
        //     return { ...msg, text: "[ALIAS_3], glad to hear that!" };
        //   }
        //   return msg;
        // });

        // setAnnotatedMessages(mockAnnotatedMessages);
        // setFeedbackMap(mockFeedbackMap);

        // Real API call
        const feedback = await getFeedbackAnalysis(messages, sessionId);
        console.log("Setting annotatedMessages:", feedback.annotatedMessages);
        console.log("Setting feedbackMap:", feedback.feedbackMap);
        setAnnotatedMessages(feedback.annotatedMessages);
        setFeedbackMap(feedback.feedbackMap);
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load feedback"
        );
        // If feedback fails, use original messages
        setAnnotatedMessages(messages);
      } finally {
        setIsLoadingFeedback(false);
      }
    };

    fetchFeedback();
  }, [messages, sessionId]);

  // Handle closing feedback with animation
  const handleCloseFeedback = () => {
    setIsClosingFeedback(true);
    setTimeout(() => {
      setSelectedFeedback(null);
      setIsClosingFeedback(false);
    }, 200); // Match animation duration
  };

  // Parse text with aliases and make them clickable
  const renderMessageText = (text: string, messageIndex: number) => {
    // Match text in parentheses like (highlighted1)
    const parts = text.split(/(\(highlighted\d+\))/g);

    return parts.map((part, index) => {
      const aliasMatch = part.match(/(\(highlighted\d+\))/);
      if (aliasMatch && feedbackMap[aliasMatch[1]]) {
        const alias = aliasMatch[1];
        const [originalText] = feedbackMap[alias];

        return (
          <span
            key={index}
            onClick={() => {
              // Toggle feedback: close if same, open if different
              if (
                selectedFeedback?.messageIndex === messageIndex &&
                selectedFeedback?.alias === alias
              ) {
                setSelectedFeedback(null);
              } else {
                setSelectedFeedback({ messageIndex, alias });
              }
            }}
            className="cursor-pointer bg-purple-500/40 hover:bg-purple-500/60 border-b-2 border-purple-400 px-1 rounded transition-colors"
            title="Click to see feedback"
          >
            {originalText}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };
  return (
    <div className="w-3/4 h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col overflow-hidden">
      <div className="w-full flex-1 flex flex-col p-8 overflow-hidden">
        {/* Loading State */}
        {isLoadingFeedback && (
          <div className="flex-1 flex items-center justify-center flex-col">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-xl">
              Analyzing your conversation...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-xl">{error}</p>
          </div>
        )}

        {/* Conversation Display */}
        {!isLoadingFeedback && annotatedMessages.length > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Scrollable conversation container */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-6 custom-scrollbar">
              {annotatedMessages.map((message, index) => (
                <div key={message.id || index} className="space-y-4">
                  <div
                    className="flex gap-6 items-center message-pop"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`text-4xl font-semibold min-w-[100px] text-center ${
                        message.sender === "user"
                          ? "text-pink-700"
                          : "text-cyan-700"
                      }`}
                    >
                      {message.sender === "user" ? "User" : "AI"}
                    </div>
                    <div className="flex-1 message-container relative overflow-hidden">
                      <div
                        className={`text-5xl font-bold leading-relaxed title-breathe break-words overflow-wrap-anywhere border-l-4 pl-6 pr-6 ${
                          message.sender === "user"
                            ? "text-shimmer-user border-pink-700"
                            : "text-shimmer-ai border-cyan-700"
                        }`}
                      >
                        {renderMessageText(message.text, index)}
                      </div>
                    </div>
                  </div>

                  {/* Inline Feedback Display */}
                  {selectedFeedback?.messageIndex === index &&
                    feedbackMap[selectedFeedback.alias] && (
                      <div
                        className={`ml-[124px] bg-gray-800/80 border border-purple-500/30 rounded-xl p-6 ${isClosingFeedback ? "blink-close" : "blink-open"}`}
                      >
                        <div className="text-gray-200 text-lg leading-relaxed">
                          {feedbackMap[selectedFeedback.alias][1]}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleCloseFeedback}
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Close ✕
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Messages State */}
        {!isLoadingFeedback && annotatedMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-xl">No conversation to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
