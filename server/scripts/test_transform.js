import { transformGeminiOutput } from '../controllers/feedback.controller.js';

// Mock Gemini-style output resembling the example and including explicit (highlight) markers
const feedbackText = `user: (highlight)I dunno(highlight). Something… quiet.
ai: Hmm, quiet. Maybe some cozy fiction or poetry? We just got a shipment of small-town mystery novels — really calm reads.

user: I don’t really read much.
ai: That’s okay! Maybe we can find something that’ll make you want to. Do you like short stories? They’re less of a commitment.

user: (highlight)I guess(highlight).
ai: Nice. [hands over a book] This one’s a collection of short stories about people who talk to strangers and accidentally make friends. It’s light but surprisingly sweet.

----

feedback 1: Avoid non-committal phrases like "I dunno"; be more specific to help the ai assist you better.

feedback 2: Avoid non-committal phrases like "I guess"; be more decisive to guide the conversation.`;

const result = transformGeminiOutput(feedbackText);
console.log(JSON.stringify(result, null, 2));
