// Gemini service: sends a prompt to the configured Gemini-like endpoint and returns model text
// Exports: generateFromGemini(prompt)

export async function generateFromGemini(prompt) {
	if (!process.env.GEMINI_API_URL || !process.env.GEMINI_API_KEY) {
		throw new Error('GEMINI_API_URL or GEMINI_API_KEY not set');
	}

	const resp = await fetch(process.env.GEMINI_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
		},
		body: JSON.stringify({ input: prompt }),
	});

	if (!resp.ok) {
		const txt = await resp.text();
		throw new Error(`Gemini API error: ${resp.status} ${txt}`);
	}

	const data = await resp.json();
	return data.output || (data.choices && data.choices[0] && (data.choices[0].text || data.choices[0].message?.content)) || JSON.stringify(data);
}
