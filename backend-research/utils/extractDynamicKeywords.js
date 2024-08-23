const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });

const extractDynamicKeywords = async (chatMessage) => {
    await manager.train();
    const response = await manager.process('en', chatMessage);

    const entities = response.entities.map(entity => entity.sourceText.toLowerCase());

    const tokens = tokenizer.tokenize(chatMessage.toLowerCase());
    const importantTokens = tokens.filter(token => {
        return natural.PorterStemmer.tokenizeAndStem(token).length > 0;
    });

    return [...new Set([...entities, ...importantTokens])];
};

module.exports = extractDynamicKeywords;