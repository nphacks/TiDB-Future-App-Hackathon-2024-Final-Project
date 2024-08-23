const createConnection = require('../db');
const generateEmbeddings = require('./generateEmbeddings'); 
const cosineSimilarity = require('./cosineSimilarity');

async function searchNewsInDatabase(query) {
    console.log("search news in db => ", query)

    try {
        const queryEmbedding = await generateEmbeddings(query);
        const connection = await createConnection();

        const [rows] = await connection.query('SELECT _id, title, description, content, url, pub_date, embedding FROM news ORDER BY pub_date DESC');        

        // Filter out rows with empty or null values
        const validRows = rows.filter(row => 
            row.title && 
            row.description && 
            row.content && 
            row.pub_date && 
            row.embedding
        );
        // Calculate cosine similarity
        const results = validRows.map(row => {
            let articleEmbedding;
            try {
                // Ensure embedding is treated as a string and parse it
                const embeddingString = String(row.embedding).trim();
                const jsonString = `[${embeddingString}]`;
                articleEmbedding = JSON.parse(jsonString);
            } catch (jsonError) {
                console.error(`Error parsing embedding for _id ${row._id}:`, jsonError.message);
                return null; 
            }


            const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);
            return { ...row, similarity };
        }).filter(result => result && result.similarity > 0.8) // Filter by similarity threshold
        .sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date)); // Sort by date
        
        return results;
    } catch (error) {
        console.error('Error during search:', error.message);
        return { error: 'Internal server error' };
    }
}

module.exports = searchNewsInDatabase;
