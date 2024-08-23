const express = require('express');
const latestApiArticle = require('../utils/latestAPIArticle');
const latestDbArticle = require('../utils/latestDBArticle');
const processTimelineArticles = require('../utils/processingTimelineArticles')
const searchNewsInDatabase = require('../utils/searchNewsInDatabase')
const router = express.Router();
require('dotenv').config();

router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        // Get the latest article from the API and database
        const apiArticle = await latestApiArticle(query);
        const dbArticle = await latestDbArticle(query);
        console.log(apiArticle, dbArticle)
        // Compare published dates
        const latestArticle = compareArticles(apiArticle, dbArticle);

        // Send the latest article immediately
        res.json({ article: latestArticle });

        // Fetch remaining articles in the background
        processTimelineArticles(query);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred in searching for article' });
    }
});

router.get('/timeline', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const searchResults = await searchNewsInDatabase(query);
        return res.json(searchResults);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred in searching articles' });
    }
});

function compareArticles(apiArticle, dbArticle) {
    if (!apiArticle) return dbArticle;
    if (!dbArticle) return apiArticle;

    const apiDate = new Date(apiArticle.publishedAt);
    const dbDate = new Date(dbArticle.pub_date);

    return apiDate > dbDate ? apiArticle : dbArticle;
}


// router.get('/search/newsapi', async (req, res) => {
//     try {
//         const topic = req.query.q; // Extract topic from query params
//         if (!topic) {
//             return res.status(400).json({ error: 'Topic is required' });
//         }
//         await storeMonthlyData(topic); // Call the function with the topic
//         res.json({ message: 'Data stored successfully.' });
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).json({ error: 'Failed to store news data.' });
//     }
// });

// const isValidJson = (str) => {
//     try {
//         JSON.parse(str);
//         return true;
//     } catch {
//         return false;
//     }
// };

module.exports = router;