// Import required libraries
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function fetchArticleContent(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const info = cheerio.load(html);
        const articleContent = info('article').text().trim();

        return articleContent;
    } catch (error) {
        console.error('Error fetching article content:', error);
        return null;
    }
}

// Example usage
const url = 'https://www.theguardian.com/us-news/article/2024/aug/21/tim-walz-dnc-harris-vp';

fetchArticleContent(url).then(content => {
    console.log(content);
});
