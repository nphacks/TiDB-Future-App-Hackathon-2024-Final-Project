const express = require('express');
const latestResearch = require('../utils/latestResearch');
const searchAllRelatedResearch = require('../utils/searchAllRelatedResearch')
const router = express.Router();
require('dotenv').config();

router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const dbArticle = await latestResearch(query);
        // console.log(dbArticle)

        res.json({ article: dbArticle });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred in searching for research material' });
    }
});

router.get('/timeline', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const searchResults = await searchAllRelatedResearch(query);
        return res.json(searchResults);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred in searching research material' });
    }
});

module.exports = router;