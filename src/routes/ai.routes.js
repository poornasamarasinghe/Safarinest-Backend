const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// GET  /api/ai/status  — live AI status for admin dashboard (polls every 30s)
router.get('/status', aiController.getAIStatus);

// POST /api/ai/predict — on-demand prediction from recommendation page
router.post('/predict', aiController.predictZone);

module.exports = router;