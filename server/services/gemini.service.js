// Gemini service: sends a prompt to the configured Gemini-like endpoint and returns model text
// Exports: generateFromGemini(prompt)
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateFromGemini(prompt) {
	const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
	const result = await model.generateContent(prompt);
	return result.response.text();
}
