const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Define the POST route for predictions
// The full URL will be: http://localhost:5000/api/ai/predict (or whatever your base URL is)
router.post('/predict', aiController.predictZone);

module.exports = router;