const axios = require('axios');

// The URL of your local Python FastAPI server
const PYTHON_API_URL = 'http://127.0.0.1:8000/predict';

// ── Helpers to derive current context automatically ───────────────────────────

/**
 * Maps current server hour to the model's time_of_day categories.
 *   Dawn      : 05:00 – 09:59
 *   Midday    : 10:00 – 14:59
 *   Afternoon : 15:00 – 23:59 / 00:00 – 04:59
 */
function getCurrentTimeOfDay() {
    const h = new Date().getHours();
    if (h >= 5 && h < 10)  return 'Dawn';
    if (h >= 10 && h < 15) return 'Midday';
    return 'Afternoon';
}

/**
 * Yala NP seasons:
 *   Dry season : May – September   (months 5-9)
 *   Wet season : October – April   (months 10-12, 1-4)
 */
function getCurrentSeason() {
    const m = new Date().getMonth() + 1; // 1-indexed
    return (m >= 5 && m <= 9) ? 'Dry' : 'Wet';
}

// ── GET /api/ai/status ────────────────────────────────────────────────────────
// Called by the admin dashboard every 30 s to get live AI predictions
exports.getAIStatus = async (req, res) => {
    const time_of_day = getCurrentTimeOfDay();
    const season      = getCurrentSeason();
    // Default to Sunny as a neutral baseline; can be extended to accept a
    // query param (?weather=Rainy) later.
    const weather     = req.query.weather || 'Sunny';

    // Query AI for the three priority animals in parallel
    const animals = ['Leopard', 'Elephant', 'Sloth Bear'];

    try {
        const results = await Promise.all(
            animals.map(animal =>
                axios.post(PYTHON_API_URL, { animal, time_of_day, weather, season })
                    .then(r => ({ animal, ...r.data }))
                    .catch(() => ({ animal, predicted_zone: 'N/A', confidence: {} }))
            )
        );

        return res.status(200).json({
            status: 'success',
            context: { time_of_day, season, weather },
            predictions: results,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'AI status service unavailable.',
        });
    }
};

// ── POST /api/ai/predict ──────────────────────────────────────────────────────
exports.predictZone = async (req, res) => {
    try {
        // 1. Get the data sent from the Next.js frontend
        const { animal, time_of_day, weather, season } = req.body;

        // 2. Validate that all fields are provided
        if (!animal || !time_of_day || !weather || !season) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide animal, time_of_day, weather, and season.'
            });
        }

        // 3. TRANSLATE: Convert frontend names (sloth_bear) to model names (Sloth Bear)
        const formatMap = {
            // Animals
            "leopard": "Leopard",
            "elephant": "Elephant",
            "sloth_bear": "Sloth Bear",
            "deer": "Deer",
            "peacock": "Peacock",
            // Times
            "dawn": "Dawn",
            "midday": "Midday",
            "afternoon": "Afternoon",
            // Weather
            "sunny": "Sunny",
            "rainy": "Rainy",
            "overcast": "Overcast",
            // Season
            "dry": "Dry",
            "wet": "Wet"
        };

        const formattedData = {
            animal: formatMap[animal.toLowerCase()] || animal,
            time_of_day: formatMap[time_of_day.toLowerCase()] || time_of_day,
            weather: formatMap[weather.toLowerCase()] || weather,
            season: formatMap[season.toLowerCase()] || season
        };

        console.log("Sending to AI:", formattedData);

        // 4. Send the TRANSLATED data to your Python AI Server
        const response = await axios.post(PYTHON_API_URL, formattedData);

        // 5. Send the AI's response back to the frontend
        return res.status(200).json({
            status: 'success',
            data: response.data
        });

    } catch (error) {
        console.error('Error connecting to AI Server:', error.message);

        return res.status(500).json({
            status: 'error',
            message: 'AI Prediction service is currently unavailable. Make sure the Python server is running.'
        });
    }
};