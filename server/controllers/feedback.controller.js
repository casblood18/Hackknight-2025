// New: feedback.controller.js
// Controller that receives an array of messages, builds a transcript, constructs a preprompt
// for a Gemini-style LLM, and returns the model's feedback parsed into message objects
// and a highlights hashmap mapping (highlightN) -> [originalHighlight, feedback]

// Note: This file uses a gemini service helper. Ensure services/gemini.service.js exports
// an async function `callGemini(prompt)` that returns the raw model text output.

import { generateFromGemini } from "../services/gemini.service.js";

export async function reviewConversation(req, res) {
  try {
    console.log("Received messages:", req.body);
    const messagesIn = req.body.messages;
    if (!Array.isArray(messagesIn)) {
      return res
        .status(400)
        .json({ error: "Request body must be an array of messages" });
    }

    // 1) Call model via service to get feedback text
    const feedbackText = await generateModelFeedback(messagesIn);
    console.log("\n=== RAW GEMINI RESPONSE ===");
    console.log(feedbackText);
    console.log("=== END GEMINI RESPONSE ===\n");

    // 2) Transform model output into structured JSON
    const result = transformGeminiOutput(feedbackText);
    console.log("\n=== TRANSFORMED RESULT ===");
    console.log(JSON.stringify(result, null, 2));
    console.log("=== END TRANSFORMED RESULT ===\n");

    return res.json(result);
  } catch (err) {
    console.error("reviewConversation error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Build prompt and call external Gemini service
export async function generateModelFeedback(messagesIn) {
  // Build a single transcript with each line as: sender: text
  const transcript = messagesIn.map((m) => `${m.sender}: ${m.text}`).join("\n");

  // Preprompt designed to instruct the LLM to produce one-to-one highlights and feedback
  const preprompt = `You are an assistant that reviews dialogues between two participants labeled exactly as "user" and "ai".

Task: Review the conversation and produce feedback that is ONLY about the USER messages (do NOT critique or rewrite ai messages).

Output format MUST follow this structure exactly for each important user point of interest, in the order they appear in the conversation:

(important point of interest should be in parentheses)
------------------------------------------------

so for example:
input:
user: I dunno. Something… quiet.
ai: Hmm, quiet. Maybe some cozy fiction or poetry? We just got a shipment of small-town mystery novels — really calm reads.

user: I don’t really read much.
ai: That’s okay! Maybe we can find something that’ll make you want to. Do you like short stories? They’re less of a commitment.

output:
user: (I dunno). Something… quiet.
ai: Hmm, quiet. Maybe some cozy fiction or poetry? We just got a shipment of small-town mystery novels — really calm reads.

user: I don’t really read much.
ai: That’s okay! Maybe we can find something that’ll make you want to. Do you like short stories? They’re less of a commitment.

user: (I guess).
ai: Nice. [hands over a book] This one’s a collection of short stories about people who talk to strangers and accidentally make friends. It’s light but surprisingly sweet.
----
feedback: Avoid non-committal phrases like "I dunno"; be more specific to help the ai assist you better.
feedback: Avoid non-committal phrases like "I guess"; be more decisive to guide the conversation.

Rules:
- The number of highlights should correspond 1:1 with the number of feedback blocks.
- Keep highlights concise (one short sentence or phrase) and place them verbatim in parenthesis '('important point of interest')' FEEDBACK SHOULD MAINLY BE ABOUT THE POINT OF INTEREST.
- Feedback lines should be short, actionable, and only address the user's content/intent/behavior.
- Do not include commentary about ai messages.
- There does not need to be a highlighted point for every user message for feedback, and there could be multiple point of interest in a dialouge.
- Preserve the original content; do not paraphrase user messages inside the feedback beyond what is necessary for the highlight.
- We want the original input, but with highlights marked and feedback provided separately below the '----' we also added for the output.
- DO NOT USE SEMICOLON OUTSIDE OF "ai:", "user:", and "feedback:"
- Do not use emojis.
Now analyze the transcript provided after this instruction and produce the output in the requested exact format.`;

  const prompt = `${preprompt}\n\nTranscript:\n${transcript}`;

  // Use the centralized gemini service to get model output. If the service fails or is not configured,
  // fall back to returning the prompt for testing parity with previous behavior.
  try {
    const data = await generateFromGemini(prompt);
    // Expect the service to return the model text directly. If it returns an object, try to extract text.
    if (typeof data === "string") return data;
    if (data && (data.output || data.text || data.choices)) {
      return (
        data.output ||
        data.text ||
        (data.choices &&
          (data.choices[0]?.text || data.choices[0]?.message?.content)) ||
        JSON.stringify(data)
      );
    }
    return String(data);
  } catch (err) {
    console.warn(
      "generateModelFeedback: gemini service failed, returning prompt for testing",
      err?.message || err
    );
    return prompt;
  }
}

// Transform the raw model output text into { messages, highlights }
export function transformGeminiOutput(feedbackText) {
  const text = String(feedbackText ?? "");
  console.log("Parsing feedback text...");

  // 1) Split sections by the first dashed divider (a line of >=3 dashes) or by the first 'feedback:' line if no dashes
  let head = text;
  let tail = "";
  const dashMatch = text.match(/\n-{3,}\n/);
  if (dashMatch) {
    const idx = text.indexOf(dashMatch[0]);
    head = text.slice(0, idx).trim();
    tail = text.slice(idx + dashMatch[0].length).trim();
  } else {
    // If there's no dashed divider, look for a 'feedback:' line and treat everything from there as tail
    const fbStartIdx = text.search(/(^|\n)\s*feedback\s*\d*\s*:/i);
    if (fbStartIdx !== -1) {
      head = text.slice(0, fbStartIdx).trim();
      tail = text.slice(fbStartIdx).trim();
    }
  }

  console.log("HEAD (messages):", head);
  console.log("TAIL (feedback):", tail);

  // 2) Parse messages from head - plain messages without highlights initially
  const parsedMessages = [];
  const msgRegex = /(user|ai)\s*:\s*([\s\S]*?)(?=(?:\s*(?:user|ai)\s*:)|$)/gim;
  let m;
  while ((m = msgRegex.exec(head)) !== null) {
    const sender = m[1].toLowerCase();
    const body = m[2].trim();
    parsedMessages.push({ sender, text: body });
  }

  console.log("Parsed messages (before highlights):", parsedMessages);

  // 3) Extract quoted text from feedback lines in tail
  const feedbackPairs = [];
  const fbRegex =
    /feedback\s*\d*\s*:\s*"([^"]+)"[^]*?(?:try to |should |could |avoid |consider |be more |provide more |instead of )([\s\S]*?)(?=(?:\s*feedback\s*\d*\s*:)|$)/gim;
  let f;
  while ((f = fbRegex.exec(tail)) !== null) {
    const quotedText = f[1].trim();
    const feedbackText = f[0].trim(); // Get the full feedback line
    feedbackPairs.push({ highlight: quotedText, feedback: feedbackText });
  }

  // Fallback: if the above doesn't work, try simpler pattern
  if (feedbackPairs.length === 0 && tail) {
    const simpleFbRegex = /feedback\s*\d*\s*:\s*([^\n]+)/gim;
    while ((f = simpleFbRegex.exec(tail)) !== null) {
      const fullLine = f[1].trim();
      // Try to extract quoted text
      const quoteMatch = fullLine.match(/"([^"]+)"/);
      if (quoteMatch) {
        feedbackPairs.push({ highlight: quoteMatch[1], feedback: fullLine });
      }
    }
  }

  console.log("Extracted feedback pairs:", feedbackPairs);

  // 4) Replace highlighted text in user messages with (highlighted1), (highlighted2), etc.
  let highlightCounter = 0;
  const highlightsMap = {};

  for (let i = 0; i < parsedMessages.length; i++) {
    const msg = parsedMessages[i];
    if (msg.sender === "user") {
      // Check if this message contains any of the highlighted texts
      for (const pair of feedbackPairs) {
        if (msg.text.includes(pair.highlight)) {
          highlightCounter++;
          const key = `(highlighted${highlightCounter})`;

          // Replace the highlighted text with the key
          msg.text = msg.text.replace(pair.highlight, key);

          // Store in highlights map
          highlightsMap[key] = [pair.highlight, pair.feedback];

          console.log(
            `Added highlight ${key}: "${pair.highlight}" -> "${pair.feedback}"`
          );
          break; // Only highlight once per message
        }
      }
    }
  }

  console.log("Final messages (with highlights):", parsedMessages);
  console.log("Final highlights map:", highlightsMap);

  return { messages: parsedMessages, highlights: highlightsMap };
}
