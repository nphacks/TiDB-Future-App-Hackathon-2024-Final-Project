const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function generateEmbeddings(text) {
    try {
        const response = await axios.post('https://api.jina.ai/v1/embeddings', {
            input: [text],
            model: 'jina-embeddings-v2-base-en'  // Dimension is 768.
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer jina_8fc30da0df0e4c67abc8863681d2eebag78iVzz8LOgtPhe4nqaZkBpqNtKl`
            }
        });
        return response.data.data[0].embedding; // Adjust based on your service's response format
    } catch (error) {
        console.error('Error generating embeddings:', error.message);
        throw new Error('Failed to generate embeddings');
    }
}

module.exports = generateEmbeddings;
