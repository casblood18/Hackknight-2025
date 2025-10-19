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
  const [selectedAlias, setSelectedAlias] = useState<string | null>(null);
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
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay

        const mockFeedbackMap: FeedbackMap = {
          ALIAS_1: [
            "hello",
            "Good greeting! Starting with 'hello' is a friendly and universal way to begin a conversation. However, you could make it more engaging by adding a follow-up question or comment about the context.",
          ],
          ALIAS_2: [
            "how are you",
            "This is a common courtesy question that shows interest. In professional settings, consider being more specific, like 'How has your day been?' or 'How's the project going?' to encourage deeper conversation.",
          ],
          ALIAS_3: [
            "that's great",
            "Positive response! While this acknowledges the other person, you could enhance engagement by asking a follow-up question or sharing a related thought to keep the conversation flowing naturally.",
          ],
        };

        const mockAnnotatedMessages: Message[] = messages.map((msg, idx) => {
          // Add some aliases to certain messages for demonstration
          if (idx === 0 && msg.sender === "user") {
            return {
              ...msg,
              text: "[ALIAS_1] there aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab",
            };
          }
          if (idx === 2 && msg.sender === "user") {
            return { ...msg, text: "I'm doing well, [ALIAS_2]?" };
          }
          if (idx === 4 && msg.sender === "user") {
            return { ...msg, text: "[ALIAS_3], glad to hear that!" };
          }
          return msg;
        });

        setAnnotatedMessages(mockAnnotatedMessages);
        setFeedbackMap(mockFeedbackMap);

        // Real API call (commented out for testing)
        // const feedback = await getFeedbackAnalysis(messages, sessionId);
        // setAnnotatedMessages(feedback.annotatedMessages);
        // setFeedbackMap(feedback.feedbackMap);
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

  // Parse text with aliases and make them clickable
  const renderMessageText = (text: string) => {
    // Match text in brackets like [ALIAS_1]
    const parts = text.split(/(\[[\w_]+\])/g);

    return parts.map((part, index) => {
      const aliasMatch = part.match(/\[([\w_]+)\]/);
      if (aliasMatch && feedbackMap[aliasMatch[1]]) {
        const alias = aliasMatch[1];
        const [originalText] = feedbackMap[alias];

        return (
          <span
            key={index}
            onClick={() => setSelectedAlias(alias)}
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
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {annotatedMessages.map((message, index) => (
                <div
                  key={message.id || index}
                  className="flex gap-6 items-center message-pop"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`text-lg font-semibold min-w-[100px] ${
                      message.sender === "user"
                        ? "text-pink-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {message.sender === "user" ? "You" : "AI"}
                  </div>
                  <div className="flex-1 message-container relative overflow-hidden">
                    <div
                      className={`text-5xl font-bold leading-relaxed title-breathe break-words overflow-wrap-anywhere ${
                        message.sender === "user"
                          ? "text-shimmer-user"
                          : "text-shimmer-ai"
                      }`}
                    >
                      {renderMessageText(message.text)}
                    </div>
                    <div className="shine"></div>
                  </div>
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

      {/* Feedback Modal */}
      {selectedAlias && feedbackMap[selectedAlias] && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAlias(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-bold text-white">AI Feedback</h3>
              <button
                onClick={() => setSelectedAlias(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="text-lg text-gray-400 mb-2">Original text:</div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white text-xl">
                "{feedbackMap[selectedAlias][0]}"
              </div>
            </div>

            <div>
              <div className="text-lg text-gray-400 mb-2">Analysis:</div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-gray-200 text-xl leading-relaxed">
                {feedbackMap[selectedAlias][1]}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAlias(null)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-lg rounded-full transition-colors font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
