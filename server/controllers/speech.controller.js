const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
require('dotenv').config();

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

// Store conversation contexts
const conversations = new Map();

exports.processMessage = async (req, res) => {
  try {
    const { message, sessionId, scenario } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or initialize conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, {
        messages: [],
        scenario: scenario || 'casual conversation'
      });
    }

    const conversation = conversations.get(sessionId);

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

    // Get response from Gemini
    console.log('Sending request to Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Add AI response to history
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    // Generate speech from response
    console.log('Converting to speech with ElevenLabs...');
    const audioStream = await elevenlabs.textToSpeech.convert(
      "21m00Tcm4TlvDq8ikWAM", // Default voice ID
      {
        text: aiResponse,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    // Convert stream to buffer
    const chunks = [];
    const reader = audioStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Send response with both text and audio
    res.json({
      text: aiResponse,
      audio: audioBuffer,
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

exports.clearContext = (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  conversations.delete(sessionId);
  res.json({ message: 'Conversation context cleared' });
};

exports.updateScenario = (req, res) => {
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
