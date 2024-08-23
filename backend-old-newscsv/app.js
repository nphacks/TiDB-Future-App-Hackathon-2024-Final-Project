const express = require('express');
const db = require('./db');
const articleRoutes = require('./routes/articles'); 
const chatbotRoutes = require('./routes/chatbot'); 
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());  // Middleware to parse JSON bodies

const cors = require('cors');
app.use(cors());

app.use('/api/article', articleRoutes);  // Use the routes
app.use('/chatbot', chatbotRoutes);  // Use the routes

app.get('/', (req, res) => {
  res.send('Backend connected and running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
