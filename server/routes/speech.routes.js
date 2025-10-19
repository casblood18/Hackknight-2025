import express from 'express';
import { processMessage, startConversation, clearContext, updateScenario } from '../controllers/speech.controller.js';

const router = express.Router();

// Process a message and get AI response with speech
router.post('/process', processMessage);

// Begin the AI conversation
router.post('/start', startConversation);

// Clear conversation context
router.post('/clear', clearContext);

// Update conversation scenario
router.post('/scenario', updateScenario);

export default router;