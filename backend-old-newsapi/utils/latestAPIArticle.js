const NewsAPI = require('newsapi');
const crypto = require('crypto');
const createConnection = require('../db');
const generateEmbeddings = require('./generateEmbeddings');

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

async function latestApiArticle(query) {
    try {
        const today = new Date();
        const monthEnd = today.toISOString().split('T')[0];
        const monthStart = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];

        const response = await newsapi.v2.everything({
            q: query,
            from: monthStart,
            to: monthEnd,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 1 
        });

        if (!response.articles.length) return null;

        const latestArticle = response.articles[0];

        const connection = await createConnection();
        const articleId = crypto.createHash('sha256').update(latestArticle.url).digest('hex');

        const [existingArticle] = await connection.query(
            'SELECT _id FROM news WHERE _id = ?',
            [articleId]
        );

        if (existingArticle.length === 0) {
            const embedding = await generateEmbeddings(latestArticle.content);

            await connection.query(
                'INSERT INTO news (_id, source_id, source_name, author, title, description, url, url_to_image, pub_date, content, embedding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    articleId,
                    latestArticle.source.id || null,
                    latestArticle.source.name || null,
                    latestArticle.author || null,
                    latestArticle.title || null,
                    latestArticle.description || null,
                    latestArticle.url || null,
                    latestArticle.urlToImage || null,
                    latestArticle.publishedAt || null,
                    latestArticle.content || null,
                    JSON.stringify(embedding).trim()
                ]
            );
        }

        return latestArticle;
    } catch (error) {
        console.error('Error fetching or storing the latest article:', error.message);
        return null;
    }
}

module.exports = latestApiArticle;
