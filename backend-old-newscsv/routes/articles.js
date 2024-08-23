// const express = require('express');
// const router = express.Router();
// const db = require('../db');  // Import database connection

// router.get('/articles', (req, res) => {
//     console.log('Hitting articles')
//     const query = 'SELECT * FROM articles';

//     db.query(query, (err, results) => {
//       if (err) {
//         console.error('Error fetching articles:', err.message);
//         res.status(500).json({ error: 'Internal server error' });
//         return;
//       }
//       res.json(results);
//     });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const createConnection = require('../db');  // Import database connection
require('dotenv').config();

// Import your vector generation utility
const generateEmbeddings = require('../generate_embeddings');

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const queryEmbedding = await generateEmbeddings(query);

        const connection = await createConnection(); // Get the connection

        const searchResults = await performSearch(connection, queryEmbedding);

        res.json(searchResults);
    } catch (error) {
        console.error('Error during search:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function performSearch(connection, queryEmbedding) {
    try {
        // Fetch all articles
        const [rows] = await connection.query('SELECT _id, headline, abstract, embedding FROM news');

        // Log the raw results
        console.log('Raw query results:', rows);

        // Calculate cosine similarity
        const results = rows.map(row => {
            console.log(`Raw embedding data for ID ${row._id}:`, row.embedding);

            let articleEmbedding;
            try {
                if (row.embedding) {
                    if (isValidJson(row.embedding)) {
                        articleEmbedding = JSON.parse(row.embedding); // Parse JSON string to array
                    } else {
                        console.error(`Invalid JSON for ID ${row._id}`);
                        return null; // Skip this row if JSON is not valid
                    }
                } else {
                    console.error(`No embedding data for ID ${row._id}`);
                    return null; // Skip this row if embedding data is null
                }
            } catch (error) {
                console.error(`Error parsing embedding JSON for ID ${row._id}:`, error.message);
                return null; // Skip this row if JSON parsing fails
            }

            // Ensure embeddings are arrays
            if (!Array.isArray(articleEmbedding) || !Array.isArray(queryEmbedding)) {
                console.error(`Embedding is not an array or is malformed for ID ${row._id}`);
                console.error(`Article embedding for ID ${row._id}: ${JSON.stringify(articleEmbedding)}`);
                console.error(`Query embedding: ${JSON.stringify(queryEmbedding)}`);
                return null; // Skip this row if the embedding is not an array
            }

            // Calculate similarity
            const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);
            return { ...row, similarity };
        }).filter(result => result !== null); // Filter out rows where parsing failed

        // Sort by similarity and return top 5 results
        results.sort((a, b) => b.similarity - a.similarity);
        return results.slice(0, 5);
    } catch (error) {
        console.error('Error performing search:', error.message);
        throw new Error('Failed to perform search');
    }
}

function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of the same length');
    }
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
}


router.get('/update-embeddings', async (req, res) => {
    try {
        const connection = await createConnection(); // Get the connection

        // Fetch rows with empty embeddings
        const [rows] = await connection.query(
            `SELECT _id FROM news WHERE embedding IS NULL OR JSON_LENGTH(embedding) = 0;`
        );

        // Generate and update embeddings for these rows
        for (const row of rows) {
            const id = row._id;
            const article = await getArticleById(connection, id); // Define this function to get article content
            const embedding = await generateEmbeddings(article);

            await connection.query(
                'UPDATE news SET embedding = ? WHERE _id = ?',
                [JSON.stringify(embedding), id]
            );
        }

        res.json({ message: 'Embeddings updated successfully' });
    } catch (error) {
        console.error('Error updating embeddings:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function getArticleById(connection, id) {
    const [rows] = await connection.query('SELECT headline, lead_paragraph, abstract FROM news WHERE _id = ?', [id]);
    const row = rows[0] || {};
    return `${row.headline || ''} ${row.lead_paragraph || ''}`;
}

module.exports = router;