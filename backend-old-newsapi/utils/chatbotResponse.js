const { NlpManager } = require('node-nlp');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const similarity = require('compute-cosine-similarity');

// Initialize NLP Manager for entity extraction
const manager = new NlpManager({ languages: ['en'] });

// Function to compute cosine similarity between two sets of tokens
const getCosineSimilarity = (tokens1, tokens2) => {
    const uniqueTokens = [...new Set([...tokens1, ...tokens2])];
    const vector1 = uniqueTokens.map(token => tokens1.includes(token) ? 1 : 0);
    const vector2 = uniqueTokens.map(token => tokens2.includes(token) ? 1 : 0);
    return similarity(vector1, vector2);
};

// Function to extract entities or keywords dynamically from chatMessage
const extractKeywords = async (chatMessage) => {
    await manager.train();
    const response = await manager.process('en', chatMessage);
    return response.entities.map(entity => entity.sourceText.toLowerCase());
};

const scoreSentence = (sentence, keywords, chatMessage) => {
    const tokens = tokenizer.tokenize(sentence.toLowerCase());
    const keywordMatchScore = keywords.filter(keyword => tokens.includes(keyword.toLowerCase())).length * 2; // Increase weight

    const chatTokens = tokenizer.tokenize(chatMessage.toLowerCase());
    const contextRelevance = getCosineSimilarity(tokens, chatTokens);

    // Emphasize keyword match over context relevance
    const totalScore = keywordMatchScore * 2 + contextRelevance;

    return totalScore;
};

const getRelevantSentences = async (descriptions, chatMessage) => {
    console.log("Generate relevant sentences")
    const keywords = await extractKeywords(chatMessage);
    const scoredSentences = descriptions.map(description => {
        const sentences = description.split('. ').map(sentence => ({
            sentence,
            score: scoreSentence(sentence, keywords, chatMessage)
        }));
        return sentences;
    }).flat();
    console.log(keywords, scoredSentences)
    // Apply a stricter threshold to filter out less relevant sentences
    const relevantSentences = scoredSentences.filter(({ score }) => score > 0.2)
                                             .sort((a, b) => b.score - a.score)
                                             .map(({ sentence }) => sentence);

    return relevantSentences;
};


// Function to limit the number of sentences returned
const getLimitedSentences = (sentences, limit) => {
    return sentences.slice(0, limit);
};

const chatbotResponse = async (descriptions, chatMessage) => {
    const response = getRelevantSentences(descriptions, chatMessage)
    console.log('Coming to chatbot response', response)
    return response
}

module.exports = chatbotResponse;

// Example
// (async () => {
//     const descriptions = [
//         "The latest Google Pixel model introduces a new AI-powered camera system that significantly improves low-light photography and adds enhanced video stabilization features.",
//         "Google has launched the Pixel 8 with an upgraded processor and longer battery life. The new device also includes a redesigned display for better color accuracy and brightness.",
//         "The new Google Pixel is priced at $699. It is available for purchase directly from the Google Store or various online retailers like Amazon and Best Buy.",
//         "In a recent comparison, the Google Pixel was compared to the iPhone 15. The review highlighted that while the Pixel offers better AI features and camera capabilities, the iPhone 15 excels in overall performance and ecosystem integration.",
//         "Japan faced a recent 7.8 earthquake.",
//         "Earthquakes are difficult in Japanese territory."
//     ];

//     const chatMessage = "What is the price of Google Pixel?";
//     const relevantSentences = await getRelevantSentences(descriptions, chatMessage);
//     const limitedSentences = getLimitedSentences(relevantSentences, 3);

//     const chatMessage2 = "Where was the recent earthquake?";
//     const relevantSentences2 = await getRelevantSentences(descriptions, chatMessage2);
//     const limitedSentences2 = getLimitedSentences(relevantSentences2, 3);

//     console.log(relevantSentences, limitedSentences, relevantSentences2, limitedSentences2);
// })();
