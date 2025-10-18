import express from 'express';
import { processMessage, clearContext, updateScenario } from '../controllers/speech.controller.js';

const router = express.Router();

// Process a message and get AI response with speech
router.post('/process', processMessage);

// Clear conversation context
router.post('/clear', clearContext);

// Update conversation scenario
router.post('/scenario', updateScenario);

export default router;