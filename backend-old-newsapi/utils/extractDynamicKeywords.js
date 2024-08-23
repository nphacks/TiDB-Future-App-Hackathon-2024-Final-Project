const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });

// Function to dynamically extract keywords using NLP
const extractDynamicKeywords = async (chatMessage) => {
    await manager.train();
    const response = await manager.process('en', chatMessage);

    // Extract entities identified by NLP
    const entities = response.entities.map(entity => entity.sourceText.toLowerCase());

    // Tokenize and filter important words (nouns, verbs, etc.)
    const tokens = tokenizer.tokenize(chatMessage.toLowerCase());
    const importantTokens = tokens.filter(token => {
        return natural.PorterStemmer.tokenizeAndStem(token).length > 0;
    });

    // Combine entities and important tokens for dynamic keyword extraction
    return [...new Set([...entities, ...importantTokens])];
};

module.exports = extractDynamicKeywords;