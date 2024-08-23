const express = require('express');
const extractDynamicKeywords = require('../utils/extractDynamicKeywords');
const searchAllRelatedResearch = require('../utils/searchAllRelatedResearch');
const chatbotResponse = require('../utils/chatbotResponse');
const router = express.Router();

router.get('/chat', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
    try {
        const keywords = await extractDynamicKeywords(query)
        const searchResults = await searchAllRelatedResearch(keywords.join(' '));
        const descriptions = [];
        await searchResults.forEach((result) => descriptions.push(result.description))
        const response = await chatbotResponse(descriptions, query)
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred in answering the chat message.' });
    }
});

module.exports = router;
