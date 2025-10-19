import { generateFromGemini } from "../services/gemini.service.js";

export async function generateSummary(req, res) {
  try {
    console.log("Generating summary for messages:", req.body);
    const messagesIn = req.body.messages;

    if (!Array.isArray(messagesIn)) {
      return res
        .status(400)
        .json({ error: "Request body must contain an array of messages" });
    }

    // Build transcript
    const transcript = messagesIn
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    // Create prompt for summary
    const prompt = `You are an assistant that reviews conversations between a user and an AI assistant.

Review the following conversation and provide TWO separate summaries:

1. "GOOD" summary: List 0-3 specific things the USER did well in the conversation (e.g., clear communication, asking questions, showing interest, being polite, etc.)

2. "BAD" summary: List 0-3 specific areas where the USER could improve (e.g., being more specific, asking follow-up questions, providing more detail, etc.)

If the user does not do well in the conversation, do not provide much good feedback.

Do not use emojis.

Format your response EXACTLY like this:
GOOD: [your summary of what the user did well]
BAD: [your summary of what could be improved]

Conversation:
${transcript}`;

    console.log("Sending prompt to Gemini...");
    const response = await generateFromGemini(prompt);
    console.log("Gemini response:", response);

    // Parse the response
    const goodMatch = response.match(/GOOD:\s*(.+?)(?=BAD:|$)/is);
    const badMatch = response.match(/BAD:\s*(.+?)$/is);

    const good = goodMatch
      ? goodMatch[1].trim()
      : "You engaged in the conversation!";
    const bad = badMatch
      ? badMatch[1].trim()
      : "Keep practicing to improve your conversational skills.";

    console.log("Parsed summary - Good:", good);
    console.log("Parsed summary - Bad:", bad);

    return res.json({
      good,
      bad,
    });
  } catch (err) {
    console.error("generateSummary error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
