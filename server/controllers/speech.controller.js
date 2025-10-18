import { GoogleGenerativeAI } from '@google/generative-ai';
import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import 'dotenv/config';

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('ELEVENLABS_API_KEY exists:', !!process.env.ELEVENLABS_API_KEY);

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

// Store conversation contexts
const conversations = new Map();

export const processMessage = async (req, res) => {
  try {
    console.log('\n🎯 Processing new message...');
    const { message, sessionId, scenario } = req.body;
    console.log('📝 Received:', { message, sessionId, scenario });

    if (!message) {
      console.log('❌ Error: Message is required');
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or initialize conversation history
    if (!conversations.has(sessionId)) {
      console.log('🆕 Creating new conversation for session:', sessionId);
      conversations.set(sessionId, {
        messages: [],
        scenario: scenario || 'casual conversation'
      });
    }

    const conversation = conversations.get(sessionId);
    console.log('🗣️ Current scenario:', conversation.scenario);
    console.log('💬 Message history length:', conversation.messages.length);

    // Update scenario if provided
    if (scenario) {
      conversation.scenario = scenario;
    }

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Prepare context for Gemini
    const prompt = `
      Scenario: ${conversation.scenario}
      Previous conversation: ${JSON.stringify(conversation.messages)}
      
      You are engaging in a natural conversation. Respond in a conversational manner while staying in character for the scenario.
      Keep responses concise but engaging.
    `;

    // GEMINI PROMPTING API CODE (commented out)
    /*
    console.log('🤖 Sending request to Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    console.log('✨ Gemini response:', aiResponse);
    */

    // Mock response generation
    console.log('🤖 Generating mock response...');
    let aiResponse = 'mock response';
        
    console.log('✨ Mock response generated:', aiResponse);

    // Add AI response to history
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    // REAL API CODE (commented out)
    console.log('🔊 Converting to speech with ElevenLabs...');
    const audio = await elevenlabs.textToSpeech.convert(
      "21m00Tcm4TlvDq8ikWAM", // Default voice ID
      {
        text: aiResponse,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );
    console.log('🎵 Audio stream received from ElevenLabs');


    // Convert stream to buffer
    // const chunks = [];
    // const reader = audioStream.getReader();
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) break;
    //   chunks.push(value);
    // }
    // const audioBuffer = Buffer.concat(chunks);
    

    // Mock audio generation
    // console.log('🔊 Mocking audio response...');
    // const audioBuffer = null; // Mock empty audio buffer
    try{
        play(audio);
    } catch (err) {
        throw(err);
    }

    // Send response
    res.json({
      text: aiResponse,
    //   audio: audio,
      scenario: conversation.scenario,
      history: conversation.messages
    });

  } catch (error) {
    console.error('Error in speech controller:', error);
    res.status(500).json({ 
      error: 'Error processing request',
      details: error.message 
    });
  }
};

export const clearContext = (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  conversations.delete(sessionId);
  res.json({ message: 'Conversation context cleared' });
};

export const updateScenario = (req, res) => {
  const { sessionId, scenario } = req.body;

  if (!sessionId || !scenario) {
    return res.status(400).json({ error: 'Session ID and scenario are required' });
  }

  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, {
      messages: [],
      scenario
    });
  } else {
    const conversation = conversations.get(sessionId);
    conversation.scenario = scenario;
  }

  res.json({ 
    message: 'Scenario updated',
    scenario: scenario
  });
};
