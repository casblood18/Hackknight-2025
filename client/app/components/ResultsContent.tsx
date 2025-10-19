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
        const feedback = await getFeedbackAnalysis(messages, sessionId);
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
            className="cursor-pointer bg-yellow-500/30 hover:bg-yellow-500/50 border-b-2 border-yellow-500 px-1 rounded transition-colors"
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
    <div className="w-3/4 min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Training Complete!
            </span>
          </h1>
          <p className="text-gray-400 text-center">
            Review your conversation with AI-powered feedback
          </p>
        </div>

        {/* Loading State */}
        {isLoadingFeedback && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Analyzing your conversation...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Conversation Display */}
        {!isLoadingFeedback && annotatedMessages.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Click on highlighted text to see
                detailed feedback
              </p>
            </div>

            {annotatedMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700"
                  }`}
                >
                  <div className="text-xs opacity-70 mb-2">
                    {message.sender === "user" ? "You" : "AI Trainer"}
                  </div>
                  <div className="text-base leading-relaxed">
                    {renderMessageText(message.text)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Messages State */}
        {!isLoadingFeedback && annotatedMessages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">No conversation to display</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all"
            >
              Start New Training
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        {annotatedMessages.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-800">
            <Link
              to="/"
              className="px-8 py-3 text-lg font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 text-center"
            >
              Start New Training
            </Link>

            <Link
              to="/"
              className="px-8 py-3 text-lg font-semibold text-gray-300 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all text-center"
            >
              Back to Home
            </Link>
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
              <h3 className="text-2xl font-bold text-white">AI Feedback</h3>
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
              <div className="text-sm text-gray-400 mb-2">Original text:</div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white">
                "{feedbackMap[selectedAlias][0]}"
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">Analysis:</div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-gray-200 leading-relaxed">
                {feedbackMap[selectedAlias][1]}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAlias(null)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-medium"
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
