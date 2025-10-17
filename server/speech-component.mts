import { GoogleGenerativeAI } from '@google/generative-ai';
import { ElevenLabs, ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';
import { Stream } from 'stream';

// Load environment variables
dotenv.config();

interface ConversationState {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  scenario: string;
}

export class SpeechComponent {
  private elevenlabs: ElevenLabsClient;
  private genAI: GoogleGenerativeAI;
  private conversationState: ConversationState;

  constructor() {
    // Initialize APIs
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!elevenlabsKey || !geminiKey) {
      throw new Error('Missing API keys in environment variables');
    }

    this.elevenlabs = new ElevenLabsClient({
      apiKey: elevenlabsKey
    });

    this.genAI = new GoogleGenerativeAI(geminiKey);

    // Initialize conversation state
    this.conversationState = {
      messages: [],
      scenario: ''
    };
  }

  public setScenario(scenario: string) {
    this.conversationState.scenario = scenario;
  }

  async handleSpeechStream(audioStream: Stream): Promise<void> {
    try {
      // TODO: Implement speech-to-text conversion
      // For now, we'll assume we get text directly
      const transcript = await this.mockTranscription(audioStream);
      await this.handleConversation(transcript);
    } catch (error) {
      console.error('Error handling speech stream:', error);
      throw error;
    }
  }

  private async handleConversation(userInput: string): Promise<void> {
    try {
      // Add user message to conversation
      this.conversationState.messages.push({
        role: 'user',
        content: userInput
      });

      // Get response from Gemini
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
        Scenario: ${this.conversationState.scenario}
        Previous messages: ${JSON.stringify(this.conversationState.messages)}
        User input: ${userInput}
        
        Respond naturally as a conversation partner in this scenario.
      `;

      console.log('\nSending to Gemini...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      console.log('Assistant:', response);

      // Add assistant response to conversation
      this.conversationState.messages.push({
        role: 'assistant',
        content: response
      });

      // Convert response to speech
      await this.generateSpeech(response);

    } catch (error) {
      console.error('Error in conversation:', error);
      throw error;
    }
  }

  private async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const stream = await this.elevenlabs.textToSpeech.convert(
        "21m00Tcm4TlvDq8ikWAM",
        {
          text,
          modelId: "eleven_multilingual_v2",
          outputFormat: "mp3_44100_128",
        }
      );

      // Consume the ReadableStream and combine chunks
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) chunks.push(value);
        done = readerDone;
      }

      // Concatenate into a single ArrayBuffer
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      return merged.buffer;
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;
    }
  }

  // Mock function for speech-to-text (replace with actual implementation)
  private async mockTranscription(audioStream: Stream | AsyncIterable<Uint8Array | Buffer>): Promise<string> {
    // For testing, we'll read the buffer content as text
    const chunks: Buffer[] = [];

    const isAsyncIterable = (obj: any): obj is AsyncIterable<Uint8Array | Buffer> =>
      obj != null && typeof (obj as any)[Symbol.asyncIterator] === 'function';

    if (isAsyncIterable(audioStream)) {
      for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk));
      }
    } else if ((audioStream as any).on && typeof (audioStream as any).on === 'function') {
      // Fallback for Node.js Readable streams that may not be typed as async iterable
      await new Promise<void>((resolve, reject) => {
        (audioStream as Stream).on('data', (chunk: Buffer | string) => {
          chunks.push(Buffer.from(chunk));
        });
        (audioStream as Stream).on('end', () => resolve());
        (audioStream as Stream).on('error', (err: any) => reject(err));
      });
    } else {
      throw new Error('Unsupported stream type for transcription');
    }

    return Buffer.concat(chunks).toString('utf-8');
  }

  public getConversationFeedback(): string {
    // Analyze conversation and provide feedback
    const messageCount = this.conversationState.messages.length;
    const userMessages = this.conversationState.messages.filter(m => m.role === 'user').length;
    
    return `Conversation summary:
      Total messages: ${messageCount}
      User messages: ${userMessages}
      Assistant messages: ${messageCount - userMessages}
      Scenario: ${this.conversationState.scenario}`;
  }
}
