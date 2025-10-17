const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const usersRouter = require("./routes/users.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Mount API (GET /api/users, POST /api/users)
app.use("/api/users", usersRouter);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store conversation history for each client
const conversationHistory = new Map();

// Small talk conversation starters and responses
const smallTalkResponses = {
  greetings: [
    "Hello! I'm excited to practice small talk with you. How are you doing today?",
    "Hi there! Great to meet you. What brings you here today?",
    "Hey! Thanks for practicing with me. How's your day going so far?",
  ],
  followUps: [
    "That's interesting! Tell me more about that.",
    "I see. How do you feel about it?",
    "That sounds great! What made you interested in that?",
    "Fascinating! Have you been doing this for long?",
    "Nice! What do you enjoy most about it?",
  ],
  weather: [
    "The weather can really affect our mood, can't it? What kind of weather do you prefer?",
    "Weather is such a great conversation starter! Do you have any plans for the weekend?",
  ],
  hobbies: [
    "That sounds like a fun hobby! How did you get into it?",
    "I'd love to hear more about your interests. What else do you like to do in your free time?",
  ],
  work: [
    "Work can be challenging but rewarding. What's the best part of your day usually?",
    "That's cool! What do you find most interesting about your work?",
  ],
  general: [
    "That's a great point! I hadn't thought about it that way.",
    "Absolutely! What's your take on it?",
    "I understand. How does that make you feel?",
    "That makes sense. Have you always felt that way?",
  ],
};

// Simple AI response generator for small talk training
function generateResponse(userMessage, history) {
  const lowerMessage = userMessage.toLowerCase();

  // Check if it's a greeting
  if (
    !history.length &&
    (lowerMessage.includes("hi") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hey"))
  ) {
    return smallTalkResponses.greetings[
      Math.floor(Math.random() * smallTalkResponses.greetings.length)
    ];
  }

  // Check for weather-related topics
  if (
    lowerMessage.includes("weather") ||
    lowerMessage.includes("sunny") ||
    lowerMessage.includes("rain") ||
    lowerMessage.includes("cold") ||
    lowerMessage.includes("hot")
  ) {
    return smallTalkResponses.weather[
      Math.floor(Math.random() * smallTalkResponses.weather.length)
    ];
  }

  // Check for work-related topics
  if (
    lowerMessage.includes("work") ||
    lowerMessage.includes("job") ||
    lowerMessage.includes("office") ||
    lowerMessage.includes("career")
  ) {
    return smallTalkResponses.work[
      Math.floor(Math.random() * smallTalkResponses.work.length)
    ];
  }

  // Check for hobby-related topics
  if (
    lowerMessage.includes("hobby") ||
    lowerMessage.includes("like to") ||
    lowerMessage.includes("enjoy") ||
    lowerMessage.includes("love to")
  ) {
    return smallTalkResponses.hobbies[
      Math.floor(Math.random() * smallTalkResponses.hobbies.length)
    ];
  }

  // Default responses
  if (history.length % 3 === 0) {
    return smallTalkResponses.followUps[
      Math.floor(Math.random() * smallTalkResponses.followUps.length)
    ];
  }

  return smallTalkResponses.general[
    Math.floor(Math.random() * smallTalkResponses.general.length)
  ];
}

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Initialize conversation history for this client
  const clientId = Date.now().toString();
  conversationHistory.set(clientId, []);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "message") {
        const userMessage = data.text;
        console.log("Received message:", userMessage);

        // Get conversation history
        const history = conversationHistory.get(clientId) || [];
        history.push({ role: "user", content: userMessage });

        // Generate AI response with a slight delay to simulate processing
        setTimeout(() => {
          const aiResponse = generateResponse(userMessage, history);
          history.push({ role: "assistant", content: aiResponse });
          conversationHistory.set(clientId, history);

          // Send response back to client
          ws.send(
            JSON.stringify({
              type: "response",
              text: aiResponse,
            })
          );

          console.log("Sent response:", aiResponse);
        }, 800); // Simulate some processing time
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    conversationHistory.delete(clientId);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
