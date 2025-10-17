import { SpeechComponent } from './speech-component.mjs';
import { Readable } from 'stream';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSpeechComponent() {
  try {
    console.log('Initializing SpeechComponent...');
    const speechComponent = new SpeechComponent();

    // Set a test scenario
    const scenario = 'You are a helpful programming mentor having a conversation with a student';
    console.log('\nSetting scenario:', scenario);
    speechComponent.setScenario(scenario);

    // Test multiple conversation turns
    const userMessages = [
      "I'm struggling with understanding async/await in JavaScript. Can you help?",
      "Could you give me a simple example?",
      "What's the difference between Promise.all and Promise.race?"
    ];

    for (const message of userMessages) {
      console.log('\n--- New Message ---');
      console.log('\nUser:', message);
      
      // Create a mock audio stream with the message
      const mockAudioStream = new Readable({
        read() {
          this.push(Buffer.from(message));
          this.push(null);
        }
      });

      // Process the message and get response
      console.log('\nProcessing message:', message);
      try {
        await speechComponent.handleSpeechStream(mockAudioStream);
      } catch (error) {
        console.error('Error during processing:', error);
      }
    }

    // Get conversation feedback
    console.log('\n--- Conversation Summary ---');
    const feedback = speechComponent.getConversationFeedback();
    console.log(feedback);

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
console.log('Starting speech component test...');
testSpeechComponent();