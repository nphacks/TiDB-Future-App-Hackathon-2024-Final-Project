const storeMonthlyData = require('./storeMonthlyData');

async function processTimelineArticles(topic) {
    try {
        // Fetch and store monthly data (as in your original code)
        await storeMonthlyData(topic);

        // Optionally send the updated list or notify the frontend (if using websockets or similar)
    } catch (error) {
        console.error('Error processing timeline articles:', error.message);
    }
}

module.exports = processTimelineArticles;