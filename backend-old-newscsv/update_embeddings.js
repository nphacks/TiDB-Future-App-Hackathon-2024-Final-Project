const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const generateEmbeddings = require('./generate_embeddings');

dotenv.config();
const dbUrl = process.env.DATABASE_URL;

async function updateEmbeddings() {
    const connection = await mysql.createConnection({
        uri: dbUrl,
        ssl: {
          rejectUnauthorized: true
        }
      });

    try {
        // Fetch all rows without embeddings
        const [rows] = await connection.execute('SELECT _id, abstract FROM news WHERE embedding IS NULL');

        for (const row of rows) {
            const embedding = await generateEmbeddings(row.abstract);

            // Update row with embedding
            await connection.execute(
                'UPDATE news SET embedding = ? WHERE _id = ?',
                [JSON.stringify(embedding), row._id]
            );
        }

        console.log('Embeddings updated successfully.');
    } catch (error) {
        console.error('Error updating embeddings:', error.message);
    } finally {
        await connection.end();
    }
}

updateEmbeddings();
