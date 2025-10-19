// ElevenLabs TTS service: synthesize text to audio using ELEVENLABS_API_URL and ELEVENLABS_API_KEY
// Exports: synthesizeSpeech(text, voiceId)
import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';

export async function synthesizeSpeech(text) {
	const elevenlabs = new ElevenLabsClient({
		apiKey: process.env.ELEVENLABS_API_KEY
	});

	const audio = await elevenlabs.textToSpeech.convert(
		"21m00Tcm4TlvDq8ikWAM", // Default voice ID
		{
		text: text,
		modelId: "eleven_multilingual_v2",
		outputFormat: "mp3_44100_128",
		}
	);
	play(audio);
	return null;
}
