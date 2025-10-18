const fetch = require('node-fetch');
require('dotenv').config();

async function testSpeechController() {
  const baseUrl = 'http://localhost:5001/api';
  const sessionId = 'test-session-' + Date.now();
  
  try {
    console.log('\n1. Setting initial scenario...');
    const scenarioResponse = await fetch(`${baseUrl}/speech/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        scenario: 'friendly chat about programming'
      })
    });
    console.log('Scenario Response:', await scenarioResponse.json());

    console.log('\n2. Testing conversation...');
    const messages = [
      "Hi! I'm learning to code. Can you help me understand JavaScript?",
      "What's the difference between let and const?",
      "Can you give me an example of when to use each one?"
    ];

    for (const message of messages) {
      console.log(`\nSending message: "${message}"`);
      const response = await fetch(`${baseUrl}/speech/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message
        })
      });

      const data = await response.json();
      console.log('\nAI Response:', data.text);
      console.log('Audio received:', data.audio ? 'Yes' : 'No');
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n3. Changing scenario...');
    await fetch(`${baseUrl}/speech/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        scenario: 'technical interview practice'
      })
    });

    console.log('\n4. Testing new scenario...');
    const response = await fetch(`${baseUrl}/speech/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message: "Can you explain how JavaScript promises work?"
      })
    });
    
    const data = await response.json();
    console.log('\nAI Response:', data.text);
    console.log('Audio received:', data.audio ? 'Yes' : 'No');

    console.log('\n5. Clearing conversation context...');
    const clearResponse = await fetch(`${baseUrl}/speech/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    console.log('Clear Response:', await clearResponse.json());

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
console.log('Starting speech controller test...');
testSpeechController();