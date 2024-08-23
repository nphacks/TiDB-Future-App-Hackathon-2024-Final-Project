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
    } finally {
        await connection.end();
    }
}

async function getArticleById(connection, id) {
    const [rows] = await connection.query('SELECT headline, lead_paragraph, abstract FROM news WHERE _id = ?', [id]);
    const row = rows[0] || {};
    return `${row.headline || ''} ${row.lead_paragraph || ''}`;
}

updateEmbeddings();
