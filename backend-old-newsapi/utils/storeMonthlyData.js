const NewsAPI = require('newsapi');
const crypto = require('crypto');
const createConnection = require('../db'); // Your database connection
const generateEmbeddings = require('./generateEmbeddings'); // Your embeddings generation

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

async function storeMonthlyData(topic) {
    try {
        const connection = await createConnection();
        
        const today = new Date();
        const monthEnd = today.toISOString().split('T')[0];
        const monthStart = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];

        const response = await newsapi.v2.everything({
            q: topic, 
            from: monthStart,
            to: monthEnd,
            language: 'en',
            sortBy: 'publishedAt',
        });

        const newsArticles = response.articles;
        for (const article of newsArticles) {
            const articleId = crypto.createHash('sha256').update(article.url).digest('hex');
            // Handling empty fields
            const sourceId = article.source.id || null;
            const sourceName = article.source.name || null;
            const author = article.author || null;
            const title = article.title || null;
            const description = article.description || null;
            const url = article.url || null;
            const urlToImage = article.urlToImage || null;
            const pubDate = article.publishedAt || null;
            const content = article.content || null;

            // Checking if the article already exists
            const [rows] = await connection.query('SELECT _id FROM news WHERE _id = ?', [articleId]);
            if (rows.length > 0) {
                continue;
            }

            const embedding = await generateEmbeddings(article.content);

            if (embedding.length > 0) {
                await connection.query(
                    'INSERT INTO news (_id, source_id, source_name, author, title, description, url, url_to_image, pub_date, content, embedding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [articleId, sourceId, sourceName, author, title, description, url, urlToImage, pubDate, content, JSON.stringify(embedding).trim()]
                );
            }
        }
    } catch (error) {
        console.error('Error storing monthly data:', error.message);
    }
}

module.exports = storeMonthlyData;
