import { useState, useCallback } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface UseSpeechAIReturn {
  messages: Message[];
  isProcessing: boolean;
  sendMessage: (text: string) => Promise<void>;
  setScenario: (scenario: string) => Promise<void>;
  clearConversation: () => Promise<void>;
  error: string | null;
}

export function useSpeechAI(sessionId: string = 'default'): UseSpeechAIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    try {
      console.log('🎤 Sending message:', text);
      setIsProcessing(true);
      setError(null);

      // Add user message
      setMessages(prev => {
        console.log('📝 Adding user message to chat');
        return [...prev, {
          text,
          sender: 'user',
          timestamp: new Date()
        }];
      });

      const response = await fetch('http://localhost:5001/api/speech/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          sessionId
        }),
      });

      console.log('🔍 Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('📛 Server error details:', errorData);
        throw new Error(`Server error: ${errorData}`);
      }

      const data = await response.json();
      console.log('🤖 Received AI response:', data);
      
      // Add AI response
      setMessages(prev => {
        console.log('💬 Adding AI response to chat');
        return [...prev, {
          text: data.text,
          sender: 'ai',
          timestamp: new Date()
        }];
      });

      // Play audio if available
      if (data.audio) {
        console.log('🔊 Received audio, preparing to play...');
        const audioBlob = new Blob([new Uint8Array(data.audio)], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('🎵 Created audio URL:', audioUrl);
        const audio = new Audio(audioUrl);
        await audio.play();
        console.log('🎶 Audio playback started');
        URL.revokeObjectURL(audioUrl);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId]);

  const setScenario = useCallback(async (scenario: string) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5001/api/speech/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          scenario
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set scenario');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set scenario');
    }
  }, [sessionId]);

  const clearConversation = useCallback(async () => {
    try {
      setError(null);
      await fetch('http://localhost:5001/api/speech/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear conversation');
    }
  }, [sessionId]);

  return {
    messages,
    isProcessing,
    sendMessage,
    setScenario,
    clearConversation,
    error
  };
}