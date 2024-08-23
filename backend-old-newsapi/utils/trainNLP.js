const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'] });

manager.addDocument('en', 'What is the latest news about %entity%', 'news.latest');
manager.addEntity('entity', 'company');

(async () => {
    await manager.train();
    manager.save();
    console.log('NLP Manager trained and saved.');
})();
