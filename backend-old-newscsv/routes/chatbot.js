const express = require('express');
const router = express.Router();
const createConnection = require('../db'); // Database connection
const axios = require('axios');
const generateEmbeddings = require('../generate_embeddings');
const nlp = require('compromise'); // or use spaCy via a Python script

// Middleware to parse JSON requests
router.use(express.json());

// Endpoint to handle user queries
// router.post('/chat', async (req, res) => {
//     try {
//         const userMessage = req.body.message;
//         if (!userMessage) {
//             return res.status(400).json({ error: 'Message parameter is required' });
//         }

//         // Extract keywords or entities from the userMessage
//         const { entity, question } = parseUserMessage(userMessage);

//         // Fetch relevant news data
//         const results = await fetchNewsData(entity, question);
//         res.json(results);
//     } catch (error) {
//         console.error('Error handling chat request:', error.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// function parseUserMessage(message) {
//     // Implement a basic entity extraction or keyword-based parsing
//     // Example: Simple keyword extraction
//     // This can be improved with more sophisticated NLP techniques
//     const entity = extractEntity(message);
//     const question = message;
//     return { entity, question };
// }

// function extractEntity(message) {
//     // Basic entity extraction logic
//     // Example: Extract entity based on known patterns
//     if (message.includes('republicans')) return 'Donald Trump'; // Simplified example
//     return 'General';
// }

// async function fetchNewsData(entity, question) {
//     const connection = await createConnection();
//     const [rows] = await connection.query(
//         `SELECT headline, lead_paragraph, snippet
//          FROM news
//          WHERE headline LIKE ? OR lead_paragraph LIKE ? OR snippet LIKE ?`,
//         [`%${entity}%`, `%${entity}%`, `%${entity}%`]
//     );
//     return rows;
// }

router.post('/ask', async (req, res) => {
    try {
        const question = req.body.question;
        if (!question) {
            return res.status(400).json({ error: 'Question parameter is required' });
        }

        // Extract entities and keywords from the question
        const { entities, keywords } = extractEntitiesAndKeywords(question);

        // Connect to the database
        const connection = await createConnection();

        // Find relevant articles
        const articles = await findRelevantArticles(connection, entities, keywords);

        // Generate a response
        const response = generateResponseFromArticles(articles);

        res.json({ response });
    } catch (error) {
        console.error('Error during question processing:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function extractEntitiesAndKeywords(question) {
    const doc = nlp(question);
    // Extract entities and keywords (simplified example)
    const entities = doc.people().out('array');
    const keywords = doc.nouns().out('array');
    return { entities, keywords };
}

async function findRelevantArticles(connection, entities, keywords) {
    const query = `
        SELECT _id, headline, abstract, lead_paragraph
        FROM news
        WHERE MATCH(headline, abstract, lead_paragraph) AGAINST(? IN BOOLEAN MODE);
    `;
    const [rows] = await connection.query(query, [keywords.join(' ')]);
    return rows;
}

function generateResponseFromArticles(articles) {
    if (articles.length === 0) return 'No relevant information found.';

    // Basic response generation
    return articles.map(article => `${article.headline}: ${article.abstract}`).join('\n');
}

module.exports = router;