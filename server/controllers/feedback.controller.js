// New: feedback.controller.js
// Controller that receives an array of messages, builds a transcript, constructs a preprompt
// for a Gemini-style LLM, and returns the model's feedback parsed into message objects
// and a highlights hashmap mapping (highlightN) -> [originalHighlight, feedback]

// Note: This file uses global fetch (Node 18+). Set GEMINI_API_URL and GEMINI_API_KEY in env to make real calls.

export async function reviewConversation(req, res) {
	try {
		const messagesIn = req.body;
		if (!Array.isArray(messagesIn)) {
			return res.status(400).json({ error: 'Request body must be an array of messages' });
		}

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

		// If GEMINI API variables are not configured, return the composed prompt for testing
		let feedbackText;
		if (!process.env.GEMINI_API_URL || !process.env.GEMINI_API_KEY) {
			// For testing, we'll pretend the model returned the prompt (so we can still demonstrate parsing)
			feedbackText = prompt;
		} else {
			const resp = await fetch(process.env.GEMINI_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
				},
				body: JSON.stringify({ input: prompt }),
			});

			const data = await resp.json();
			feedbackText = data.output || (data.choices && data.choices[0] && (data.choices[0].text || data.choices[0].message?.content)) || JSON.stringify(data);
		}

		// Now parse feedbackText to extract messages and highlight-feedback pairs
		// 1) Split sections by the first dashed divider (a line of >=3 dashes)
		let head = feedbackText;
		let tail = '';
		const dashMatch = feedbackText.match(/\n-{3,}\n/);
		if (dashMatch) {
			const idx = feedbackText.indexOf(dashMatch[0]);
			head = feedbackText.slice(0, idx).trim();
			tail = feedbackText.slice(idx + dashMatch[0].length).trim();
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
				// start new message
				if (current) parsedMessages.push(current);
				current = { sender: labelMatch[1].toLowerCase(), text: line.replace(labelMatch[0], '') };
			} else {
				if (!current) continue; // skip stray lines before first label
				if (current.text.length > 0) current.text += '\n' + line; else current.text = line;
			}

			// If current contains highlight markers, replace them by wrapping the inner text in parentheses (e.g. (important point))
			// but still record the original highlighted text in highlightsFromMessages for mapping.
			if (current) {
				current.text = current.text.replace(/\(highlight\)\s*([\s\S]*?)\s*\(highlight\)/gi, function (_, inner) {
					highlightCounter += 1;
					highlightsFromMessages.push(inner.trim());
					// Show the actual highlighted content in parentheses in the message text
					return `(${inner.trim()})`;
				});
			}
		}
		if (current) parsedMessages.push(current);

		// 3) Parse highlight-feedback pairs from tail. Expect repeating pattern:
		// (highlight) ... (highlight)\n---\nfeedback text (possibly multiple lines) until next (highlight) or end
		const pairs = [];
		const pairRegex = /\(highlight\)\s*([\s\S]*?)\s*\(highlight\)\s*[-]{3,}\s*[\r\n]+([\s\S]*?)(?=(?:\(highlight\)\s*[\s\S]*?\s*\(highlight\))|$)/gim;
		let m;
		while ((m = pairRegex.exec(tail)) !== null) {
			const highlightText = m[1].trim();
			const feedbackBlock = m[2].trim();
			pairs.push({ highlight: highlightText, feedback: feedbackBlock });
		}

		// 4) Build the highlights hashmap keyed by (highlightN)
		const highlightsMap = {};
		const total = Math.max(highlightsFromMessages.length, pairs.length);
		for (let i = 0; i < total; i++) {
			const key = `(highlighted${i + 1})`;
			const highlighted = highlightsFromMessages[i] || (pairs[i] && pairs[i].highlight) || '';
			const feedback = (pairs[i] && pairs[i].feedback) || '';
			highlightsMap[key] = [highlighted, feedback];
		}

		// 5) Ensure parsedMessages text still contains the placeholder format (highlightN) which we used above
		// Return structured JSON
		return res.json({ messages: parsedMessages, highlights: highlightsMap });
	} catch (err) {
		console.error('reviewConversation error', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
}