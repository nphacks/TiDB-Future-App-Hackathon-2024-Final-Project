const schedule = require('node-schedule');
const axios = require('axios');
const createConnection = require('../db'); // Assuming this is your database connection setup
const generateEmbeddings = require('./generateEmbeddings'); // Your embedding generation utility
require('dotenv').config();

async function storeDailyNews() {
    try {
        const connection = await createConnection();

        // Fetch today's news headlines
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: 'YOUR_SEARCH_KEYWORDS', // Replace with relevant search query or keywords
                from: new Date().toISOString().split('T')[0], // Fetch today’s news
                sortBy: 'publishedAt',
                apiKey: process.env.NEWS_API_KEY,
            },
        });

        const articles = response.data.articles;

        for (const article of articles) {
            // Skip articles already stored
            const [existing] = await connection.query(
                'SELECT _id FROM news WHERE _id = ?',
                [article.url] // Assuming URL is unique, replace as needed
            );

            if (existing.length > 0) continue;

            // Insert new articles with embeddings
            const embedding = await generateEmbeddings(article.title + ' ' + article.description);

            if (embedding && embedding.length > 0) { // Check if embeddings are generated
                await connection.query(
                    `INSERT INTO news (abstract, web_url, snippet, lead_paragraph, print_section, print_page, source, multimedia, headline, keywords, pub_date, document_type, news_desk, section_name, byline, type_of_material, _id, word_count, uri, subsection_name, embedding)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        article.description,
                        article.url,
                        article.description,
                        null, null, null, article.source.name, null,
                        article.title, null,
                        article.publishedAt, null, null, null, null, null,
                        article.url, null, article.url, null,
                        JSON.stringify(embedding),
                    ]
                );
            }
        }

        console.log('Daily news stored successfully.');
    } catch (error) {
        console.error('Error storing daily news:', error.message);
    }
}

// Schedule the function to run at four specific times daily
const times = ['0 6 * * *', '0 12 * * *', '0 18 * * *', '0 23 * * *']; // Adjust as needed
times.forEach(time => {
    schedule.scheduleJob(time, storeDailyNews);
});
