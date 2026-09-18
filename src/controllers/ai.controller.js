const axios = require('axios');

// The URL of your local Python FastAPI server
const PYTHON_API_URL = 'http://127.0.0.1:8000/predict';

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

        console.log("Sending to AI:", formattedData); // Debug log

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