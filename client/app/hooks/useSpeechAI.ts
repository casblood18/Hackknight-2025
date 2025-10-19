import { play } from "@elevenlabs/elevenlabs-js";
import { useState, useCallback } from "react";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// FeedbackMap is a hashmap where keys are aliases and values are [original_text, feedback]
export type FeedbackMap = Record<string, [string, string]>;

export interface FeedbackResponse {
  annotatedMessages: Message[];
  feedbackMap: FeedbackMap;
}

interface UseSpeechAIReturn {
  messages: Message[];
  isProcessing: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => Promise<void>;
  error: string | null;
}

export function useSpeechAI(sessionId: string = "default", currentScenario: string = "casual"): UseSpeechAIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let selectedScenario = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      try {
        console.log("🎤 Sending message:", text);
        setIsProcessing(true);
        setError(null);

        // Add user message
        setMessages((prev) => {
          console.log("📝 Adding user message to chat");
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              text,
              sender: "user",
              timestamp: new Date(),
            },
          ];
        });

        const response = await fetch(
          "http://localhost:5001/api/speech/process",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              message: text,
              sessionId,
              scenario: currentScenario,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response;
          console.error("📛 Server error details:", errorText);
          throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        console.log("🔍 Response status:", response.status);
        if (!response.ok) {
          const errorData = await response.text();
          console.error("📛 Server error details:", errorData);
          throw new Error(`Server error: ${errorData}`);
        }

        const data = await response.json();
        console.log("🤖 Received AI response:", data);

        // Add AI response
        setMessages((prev) => {
          console.log("💬 Adding AI response to chat");
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              text: data.text,
              sender: "ai",
              timestamp: new Date(),
            },
          ];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId]
  );

  const clearConversation = useCallback(async () => {
    try {
      setError(null);
      await fetch("http://localhost:5001/api/speech/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear conversation"
      );
    }
  }, [sessionId]);

  return {
    messages,
    isProcessing,
    sendMessage,
    clearConversation,
    error,
  };
}

/**
 * Get feedback analysis for a conversation from the backend
 * @param messages - Array of conversation messages
 * @param sessionId - Session identifier
 * @returns Promise with annotated messages and feedback map
 */
export async function getFeedbackAnalysis(
  messages: Message[],
  sessionId: string
): Promise<FeedbackResponse> {
  try {
    const response = await fetch("http://localhost:5001/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get feedback: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return {
      annotatedMessages: data.annotatedMessages || [],
      feedbackMap: data.feedbackMap || {},
    };
  } catch (error) {
    console.error("Error getting feedback analysis:", error);
    throw error;
  }
}
