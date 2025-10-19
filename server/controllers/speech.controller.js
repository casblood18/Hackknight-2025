// import { GoogleGenerativeAI } from '@google/generative-ai';
import { play } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import { generateFromGemini } from "../services/gemini.service.js";
import { synthesizeSpeech } from "../services/elevenlabs.service.js";

// Debug: Check if environment variables are loaded
console.log("Environment check:");
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("ELEVENLABS_API_KEY exists:", !!process.env.ELEVENLABS_API_KEY);
console.log("STAGE exists:", process.env.STAGE);

// Note: Gemini and ElevenLabs calls are handled by services in /services

// Store conversation contexts
const conversations = new Map();

export const processMessage = async (req, res) => {
  try {
    console.log("\n🎯 Processing new message...");
    const { message, sessionId, scenario, voiceId } = req.body;
    console.log("📝 Received:", { message, sessionId, scenario });

    if (!message) {
      console.log("❌ Error: Message is required");
      return res.status(400).json({ error: "Message is required" });
    }

    // Get or initialize conversation history
    if (!conversations.has(sessionId)) {
      console.log("🆕 Creating new conversation for session:", sessionId);
      conversations.set(sessionId, {
        messages: [],
        scenario: scenario || "casual conversation",
      });
    }

    const conversation = conversations.get(sessionId);
    console.log("🗣️ Current scenario:", conversation.scenario);
    console.log("💬 Message history length:", conversation.messages.length);

    // Update scenario if provided
    if (scenario) {
      conversation.scenario = scenario;
    }

    // Add user message to history
    conversation.messages.push({
      role: "user",
      content: message,
    });

    // Prepare context for Gemini
    const prompt = `
      Scenario: ${conversation.scenario}
      Previous conversation: ${JSON.stringify(conversation.messages)}
      
      You are engaging in a natural conversation. Respond in a conversational manner while staying in character for the scenario.
      Keep responses concise but engaging.
      Do not use emojis.
    `;

    // Call Gemini service to generate AI response
    let aiResponse;
    switch (process.env.STAGE) {
      case "prod":
        try {
          aiResponse = await generateFromGemini(prompt);
          console.log("✨ Gemini response:", aiResponse);
        } catch (err) {
          console.warn(
            "Gemini service failed, falling back to mock response:",
            err.message
          );
          aiResponse = "mock response";
        }
        break;
      case "dev":
        // Mock response generation
        console.log("🤖 Generating mock response...");
        aiResponse = "mock response";
        break;
    }

    // Add AI response to history
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    // Use ElevenLabs service to synthesize speech (returns Buffer)
    let audioBuffer = null;
    switch (process.env.STAGE) {
      case "prod":
        try {
          audioBuffer = await synthesizeSpeech(aiResponse);
          console.log("🎵 Audio buffer generated from ElevenLabs service");
        } catch (err) {
          console.warn(
            "ElevenLabs service failed or not configured:",
            err.message
          );
          audioBuffer = null;
        }
        // Attempt server-side playback for dev/testing
        if (audioBuffer) {
          try {
            play(audioBuffer);
            console.log("▶️ Played audio on server");
          } catch (err) {
            console.warn("Server playback failed:", err.message);
          }
        }
        break;
      case "dev":
        break;
    }

    // Send response
    res.json({
      text: aiResponse,
      audio: audioBuffer ? audioBuffer.toString("base64") : null,

      scenario: conversation.scenario,
      history: conversation.messages,
    });
  } catch (error) {
    console.error("Error in speech controller:", error);
    res.status(500).json({
      error: "Error processing request",
      details: error.message,
    });
  }
};

export const clearContext = (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  conversations.delete(sessionId);
  res.json({ message: "Conversation context cleared" });
};

export const updateScenario = (req, res) => {
  const { sessionId, scenario } = req.body;

  if (!sessionId || !scenario) {
    return res
      .status(400)
      .json({ error: "Session ID and scenario are required" });
  }

  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, {
      messages: [],
      scenario,
    });
  } else {
    const conversation = conversations.get(sessionId);
    conversation.scenario = scenario;
  }

  res.json({
    message: "Scenario updated",
    scenario: scenario,
  });
};
