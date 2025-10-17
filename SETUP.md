# Small Talk Trainer - Setup Guide

A voice-powered AI conversation trainer with real-time speech recognition and text-to-speech capabilities.

## Features

✅ **Dark Theme UI** - Modern gradient design matching the Neural.ai aesthetic
✅ **Real-time Speech Recognition** - Your speech appears instantly as you talk
✅ **WebSocket Communication** - Fast, real-time backend connection
✅ **Text-to-Speech Responses** - AI responses are spoken out loud
✅ **ChatGPT-style Interface** - Familiar chat interface with smooth animations
✅ **End Conversation Button** - Stop and reset the conversation anytime

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A modern web browser (Chrome, Edge, or Safari recommended for best speech recognition support)

## Installation

### 1. Install Server Dependencies

```bash
cd Hackknight-2025/server
npm install
```

### 2. Install Client Dependencies

```bash
cd ../client
npm install
```

## Running the Application

### Start the Backend Server

```bash
cd Hackknight-2025/server
npm run dev
```

The server will start on `http://localhost:5000` with WebSocket support.

### Start the Client Application

In a new terminal:

```bash
cd Hackknight-2025/client
npm run dev
```

The client will start on `http://localhost:5173` (or similar).

## How to Use

1. **Open the Application** - Navigate to the client URL in your browser
2. **Click "Start Training"** - The centered button on the homepage
3. **Grant Microphone Permission** - Your browser will ask for microphone access
4. **Start Speaking** - Begin talking naturally:
   - Your words appear in real-time on the right side
   - The AI responds with relevant small talk
   - Responses are spoken out loud automatically
5. **End Conversation** - Click the "End Conversation" button in the top-right when done

## Browser Compatibility

### Speech Recognition Support

- ✅ **Chrome/Edge** - Full support (best experience)
- ✅ **Safari** - Full support
- ⚠️ **Firefox** - Limited support (may not work)

### Text-to-Speech Support

- ✅ All modern browsers support text-to-speech

## Tips for Best Experience

1. **Use a quiet environment** for better speech recognition accuracy
2. **Speak clearly** and at a normal pace
3. **Wait for the AI to finish speaking** before responding (or it might interrupt)
4. **Use Chrome or Edge** for the most reliable speech recognition

## Architecture

### Frontend (React Router + Vite)

- Real-time speech recognition using Web Speech API
- WebSocket connection for instant communication
- Text-to-speech for AI responses
- Tailwind CSS for beautiful, gradient-based styling

### Backend (Express + WebSocket)

- WebSocket server for real-time bidirectional communication
- Smart small talk response system
- Conversation history tracking per client
- Context-aware responses based on topic detection

## Customization

### Modify AI Responses

Edit `Hackknight-2025/server/index.js` to customize the AI's responses:

```javascript
const smallTalkResponses = {
  greetings: [...],
  followUps: [...],
  // Add more categories
};
```

### Integrate Real AI (OpenAI, etc.)

Replace the `generateResponse()` function in `server/index.js` with your preferred AI API:

```javascript
// Example: OpenAI integration
async function generateResponse(userMessage, history) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: history,
  });
  return response.choices[0].message.content;
}
```

## Troubleshooting

### Microphone Not Working

- Check browser permissions in settings
- Ensure you're using HTTPS in production (required for speech recognition)
- Try a different browser

### WebSocket Connection Failed

- Ensure the backend server is running on port 5000
- Check for CORS issues in the browser console
- Verify firewall settings aren't blocking WebSocket connections

### Speech Not Being Recognized

- Check browser compatibility
- Ensure microphone is properly connected
- Try speaking louder or more clearly
- Check browser console for errors

### Text-to-Speech Not Working

- Check browser audio settings
- Ensure audio isn't muted
- Try a different browser voice in settings

## Future Enhancements

- [ ] Add support for multiple languages
- [ ] Integrate GPT-4 or other advanced AI models
- [ ] Add conversation analytics and feedback
- [ ] Save and review past conversations
- [ ] Add difficulty levels for training
- [ ] Support for custom training scenarios
- [ ] Mobile app version

## Support

For issues or questions, please check the console logs in both the browser and server terminal for error messages.
