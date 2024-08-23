const createConnection = require('../db');
const generateEmbeddings = require('./generateEmbeddings');
const cosineSimilarity = require('./cosineSimilarity');

async function latestDbArticle(query) {
    try {
        const queryEmbedding = await generateEmbeddings(query);
        const connection = await createConnection();

        const [rows] = await connection.query(
            'SELECT _id, title, description, content, url, pub_date, embedding FROM news ORDER BY pub_date DESC'
        );

        // Filter out rows with empty or null values
        const validRows = rows.filter(row => 
            row.title && 
            row.description && 
            row.content && 
            row.pub_date && 
            row.embedding
        );

        // Find the most similar article
        let bestMatch = null;
        let highestSimilarity = 0;

        for (const row of validRows) {
            let articleEmbedding;
            try {
                const embeddingString = String(row.embedding).trim();
                const jsonString = `[${embeddingString}]`;
                articleEmbedding = JSON.parse(jsonString);
            } catch (jsonError) {
                console.error(`Error parsing embedding for _id ${row._id}:`, jsonError.message);
                continue;
            }

            const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);
            if (similarity > 0.8 && similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = row;
            }
        }

        return bestMatch;
    } catch (error) {
        console.error('Error fetching latest DB article:', error.message);
        return null;
    }
}

module.exports = latestDbArticle;
