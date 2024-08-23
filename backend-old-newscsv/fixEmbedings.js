const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEmbeddings() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: true }
    });

    try {
        const [rows] = await connection.query('SELECT _id, embedding FROM news');
        
        for (const row of rows) {
            try {
                // Attempt to parse JSON
                JSON.parse(row.embedding);
            } catch (error) {
                // Log and update invalid JSON rows
                console.error(`Invalid JSON for _id ${row._id}:`, row.embedding);

                // Example of fixing: Set to an empty array or some default valid value
                await connection.query('UPDATE news SET embedding = ? WHERE _id = ?', [JSON.stringify([]), row._id]);
            }
        }
    } catch (error) {
        console.error('Error processing embeddings:', error.message);
    } finally {
        await connection.end();
    }
}

fixEmbeddings();
