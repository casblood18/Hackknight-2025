import express from 'express';
import { reviewConversation } from '../controllers/feedback.controller.js';

const router = express.Router();

// Accepts array of messages and returns model feedback
router.post('/feedback', reviewConversation);

export default router;
