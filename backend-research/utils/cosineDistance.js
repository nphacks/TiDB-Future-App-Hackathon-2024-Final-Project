const cosineSimilarity = require('./cosineSimilarity');

function cosineDistance(vecA, vecB) {
    return 1 - cosineSimilarity(vecA, vecB);
}

module.exports = cosineDistance;