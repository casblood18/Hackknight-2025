// ElevenLabs TTS service: synthesize text to audio using ELEVENLABS_API_URL and ELEVENLABS_API_KEY
// Exports: synthesizeSpeech(text, voiceId)

export async function synthesizeSpeech(text, voiceId = process.env.DEFAULT_VOICE_ID) {
	if (!process.env.ELEVENLABS_API_URL || !process.env.ELEVENLABS_API_KEY) {
		throw new Error('ELEVENLABS_API_URL or ELEVENLABS_API_KEY not set');
	}

	const url = `${process.env.ELEVENLABS_API_URL}/text-to-speech/${voiceId}`;
	const resp = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'xi-api-key': process.env.ELEVENLABS_API_KEY,
		},
		body: JSON.stringify({ text }),
	});

	if (!resp.ok) {
		const txt = await resp.text();
		throw new Error(`ElevenLabs API error: ${resp.status} ${txt}`);
	}

	// Return raw audio buffer
	const arrayBuffer = await resp.arrayBuffer();
	return Buffer.from(arrayBuffer);
}
