const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speech.controller');

// Process a message and get AI response with speech
router.post('/process', speechController.processMessage);

// Clear conversation context
router.post('/clear', speechController.clearContext);

// Update conversation scenario
router.post('/scenario', speechController.updateScenario);

module.exports = router;