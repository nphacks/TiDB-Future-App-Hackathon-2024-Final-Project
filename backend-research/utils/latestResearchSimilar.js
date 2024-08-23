// const cosineDistance = require('./cosineDistance');
const cosineSimilarity = require('./cosineSimilarity');

async function latestResearchSimilar(papers, queryEmbedding) {
    let closestPaper = null;
    let highestSimilarity = 0;

    const similarityThresholds = [0.9, 0.8, 0.7, 0.6, 0.5];

    for (const threshold of similarityThresholds) {
        for (const paper of papers) {
            let articleEmbedding;

            try {
                const embeddingString = paper.content_vec;
                articleEmbedding = JSON.parse(embeddingString);
            } catch (jsonError) {
                console.error(`Error parsing embedding for _id ${paper.id}:`, jsonError.message);
                continue;
            }

            const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);

            if (similarity >= threshold && similarity > highestSimilarity) {
                highestSimilarity = similarity;
                closestPaper = paper;
                closestPaper.similarity = similarity;
            }
        }

        if (closestPaper) break;
    }

    if (highestSimilarity < 0.5) {
        return null;
    }

    return closestPaper;
}

module.exports = latestResearchSimilar;