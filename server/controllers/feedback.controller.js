// New: feedback.controller.js
// Controller that receives an array of messages, builds a transcript, constructs a preprompt
// for a Gemini-style LLM, and returns the model's feedback parsed into message objects
// and a highlights hashmap mapping (highlightN) -> [originalHighlight, feedback]

// Note: This file uses a gemini service helper. Ensure services/gemini.service.js exports
// an async function `callGemini(prompt)` that returns the raw model text output.

import { generateFromGemini } from '../services/gemini.service.js';

export async function reviewConversation(req, res) {
	try {
		const messagesIn = req.body;
		if (!Array.isArray(messagesIn)) {
			return res.status(400).json({ error: 'Request body must be an array of messages' });
		}

		// 1) Call model via service to get feedback text
		const feedbackText = await generateModelFeedback(messagesIn);

		// 2) Transform model output into structured JSON
		const result = transformGeminiOutput(feedbackText);

		return res.json(result);
	} catch (err) {
		console.error('reviewConversation error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

// Build prompt and call external Gemini service
export async function generateModelFeedback(messagesIn) {
	// Build a single transcript with each line as: sender: text
	const transcript = messagesIn.map((m) => `${m.sender}: ${m.text}`).join('\n');

	// Preprompt designed to instruct the LLM to produce one-to-one highlights and feedback
	const preprompt = `You are an assistant that reviews dialogues between two participants labeled exactly as "user" and "ai".

Task: Review the conversation and produce feedback that is ONLY about the USER messages (do NOT critique or rewrite ai messages).

Output format MUST follow this structure exactly for each important user point of interest, in the order they appear in the conversation:

(important point of interest should be in parentheses)
------------------------------------------------
feedback 1
feedback 2

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
feedback 1: Avoid non-committal phrases like "I dunno"; be more specific to help the ai assist you better.
feedback 2: Avoid non-committal phrases like "I guess"; be more decisive to guide the conversation.

Rules:
- For each highlight line, provide one matching feedback block below the dashed line(add the line in the output '----'). The number of highlights should correspond 1:1 with the number of feedback blocks.
- Keep highlights concise (one short sentence or phrase) and place them verbatim in parenthesis '('important point of interest')' FEEDBACK SHOULD MAINLY BE ABOUT THE POINT OF INTEREST.
- Feedback lines should be short, actionable, and only address the user's content/intent/behavior.
- Do not include commentary about ai messages.
- There does not need to be a highlighted point for every user message for feedback.
- Preserve the original content; do not paraphrase user messages inside the feedback beyond what is necessary for the highlight.
- We want the original input, but with highlights marked and feedback provided separately below the '----' we also added for the output.
Now analyze the transcript provided after this instruction and produce the output in the requested exact format.`;

	const prompt = `${preprompt}\n\nTranscript:\n${transcript}`;

	// Use the centralized gemini service to get model output. If the service fails or is not configured,
	// fall back to returning the prompt for testing parity with previous behavior.
	try {
		const data = await generateFromGemini(prompt);
		// Expect the service to return the model text directly. If it returns an object, try to extract text.
		if (typeof data === 'string') return data;
		if (data && (data.output || data.text || data.choices)) {
			return data.output || data.text || (data.choices && (data.choices[0]?.text || data.choices[0]?.message?.content)) || JSON.stringify(data);
		}
		return String(data);
	} catch (err) {
		console.warn('generateModelFeedback: gemini service failed, returning prompt for testing', err?.message || err);
		return prompt;
	}
}

// Transform the raw model output text into { messages, highlights }
export function transformGeminiOutput(feedbackText) {
	const text = String(feedbackText ?? '');
	// 1) Split sections by the first dashed divider (a line of >=3 dashes)
	let head = text;
	let tail = '';
	const dashMatch = text.match(/\n-{3,}\n/);
	if (dashMatch) {
		const idx = text.indexOf(dashMatch[0]);
		head = text.slice(0, idx).trim();
		tail = text.slice(idx + dashMatch[0].length).trim();
	}

	// 2) Parse messages from head: lines starting with 'user:' or 'ai:' (case-insensitive)
	const lines = head.split(/\r?\n/);
	const parsedMessages = [];
	let current = null;
	let highlightCounter = 0;
	const highlightsFromMessages = []; // keeps original highlighted strings in order

	for (let rawLine of lines) {
		const line = rawLine.trim();
		const labelMatch = line.match(/^(user|ai)\s*:\s*/i);
		if (labelMatch) {
			if (current) parsedMessages.push(current);
			current = { sender: labelMatch[1].toLowerCase(), text: line.replace(labelMatch[0], '') };
		} else {
			if (!current) continue;
			if (current.text.length > 0) current.text += '\n' + line; else current.text = line;
		}

		// capture special (highlight) wrappers if present in the head
		if (current) {
			current.text = current.text.replace(/\(highlight\)\s*([\s\S]*?)\s*\(highlight\)/gi, function (_, inner) {
				highlightCounter += 1;
				const val = inner.trim();
				highlightsFromMessages.push(val);
				// replace with a stable placeholder used as a key in the highlights map
				return `(highlighted${highlightCounter})`;
			});
		}
	}
	if (current) parsedMessages.push(current);

	// 3) Parse highlight-feedback pairs from tail. Try explicit (highlight) blocks first
	const pairs = [];
	const pairRegex = /\(highlight\)\s*([\s\S]*?)\s*\(highlight\)\s*[-]{3,}\s*[\r\n]+([\s\S]*?)(?=(?:\(highlight\)\s*[\s\S]*?\s*\(highlight\))|$)/gim;
	let m;
	while ((m = pairRegex.exec(tail)) !== null) {
		const highlightText = m[1].trim();
		const feedbackBlock = m[2].trim();
		pairs.push({ highlight: highlightText, feedback: feedbackBlock });
	}

	// If no explicit pairs found, try to parse fallback feedback lines like 'feedback 1: ...' in order
	if (pairs.length === 0 && tail) {
		const fallback = [];
		const fbRegex = /feedback\s*\d+\s*:\s*([\s\S]*?)(?=(?:\nfeedback\s*\d+\s*:)|$)/gim;
		let f;
		while ((f = fbRegex.exec(tail)) !== null) {
			fallback.push(f[1].trim());
		}
		// Map fallback feedbacks to highlightsFromMessages by order
		for (let i = 0; i < fallback.length; i++) {
			pairs.push({ highlight: (highlightsFromMessages[i] || ''), feedback: fallback[i] });
		}
	}

	// 4) Build the highlights hashmap keyed by (highlightedN)
	const highlightsMap = {};
	const total = Math.max(highlightsFromMessages.length, pairs.length);
	for (let i = 0; i < total; i++) {
		const key = `(highlighted${i + 1})`;
		const highlighted = highlightsFromMessages[i] || (pairs[i] && pairs[i].highlight) || '';
		const feedback = (pairs[i] && pairs[i].feedback) || '';
		highlightsMap[key] = [highlighted, feedback];
	}

	return { messages: parsedMessages, highlights: highlightsMap };
}