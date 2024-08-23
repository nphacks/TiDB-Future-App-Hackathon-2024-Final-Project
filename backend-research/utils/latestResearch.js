const createConnection = require('../db');
const generateEmbeddings = require('./generateEmbeddings');
const latestResearchSimilar = require('./latestResearchSimilar')
const cosineSimilarity = require('./cosineSimilarity');

async function latestResearch(query) {
    console.log("search one paper in db => ", query)

    try {
        const queryEmbedding = await generateEmbeddings(query);
        const connection = await createConnection();

        const similaritySteps = [0.9, 0.8, 0.7, 0.6, 0.5];
        let bestPaper = null;
        let highestSimilarity = 0;

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

                    if (similarity > highestSimilarity) {
                        highestSimilarity = similarity;
                        bestPaper = { ...paper, similarity };
                    }
                } catch (jsonError) {
                    console.error(`Error parsing content_vec for id ${paper.id}:`, jsonError.message);
                    continue; 
                }
            }

            if (bestPaper && highestSimilarity >= similarityNum) {
                break;
            }
        }
        return bestPaper || null;
    } catch (error) {
        console.error('Error fetching latest DB article:', error.message);
        return null;
    }
}

module.exports = latestResearch;
