const createConnection = require('../db');
const generateEmbeddings = require('./generateEmbeddings'); 
const cosineSimilarity = require('./cosineSimilarity');

async function searchAllRelatedResearch(query) {
    console.log("search all papers in db => ", query)

    try {
        const queryEmbedding = await generateEmbeddings(query);
        const connection = await createConnection();

        const similaritySteps = [0.9, 0.8, 0.7, 0.6, 0.5];
        const allPapers = [];

        for (const similarityNum of similaritySteps) {
            const [papers] = await connection.query(
                `SELECT id, title, abstract, doi, update_date, versions, content_vec
                FROM research_paper
                WHERE VEC_COSINE_DISTANCE(content_vec, ?) <= ?
                ORDER BY update_date DESC`, [JSON.stringify(queryEmbedding), 1 - similarityNum]
            );

            for (let paper of papers) {
                try {
                    const articleEmbedding = JSON.parse(paper.content_vec);
                    const similarity = cosineSimilarity(queryEmbedding, articleEmbedding);

                    if (similarity >= 0.5) {
                        allPapers.push({ ...paper, similarity });
                    }
                } catch (jsonError) {
                    console.error(`Error parsing content_vec for id ${paper.id}:`, jsonError.message);
                    continue;
                }
            }

            if (allPapers.length >= 30) break;
        }

        allPapers.sort((a, b) => b.similarity - a.similarity);

        const topPapers = allPapers.slice(0, 30);

        const minSimilarity = topPapers.length > 0 ? Math.min(...topPapers.map(p => p.similarity)) : 0;
        const maxSimilarity = topPapers.length > 0 ? Math.max(...topPapers.map(p => p.similarity)) : 0;
        const similarities = topPapers.map(p => p.similarity);
        const medianSimilarity = calculateMedian(similarities);

        return {
            topPapers,
            minSimilarity,
            maxSimilarity,
            medianSimilarity
        }
    } catch (error) {
        console.error('Error during search:', error.message);
        return { error: 'Internal server error' };
    }
}

function calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

module.exports = searchAllRelatedResearch;
