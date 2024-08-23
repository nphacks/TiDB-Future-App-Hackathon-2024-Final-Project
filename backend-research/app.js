const express = require('express');
const db = require('./db');
const researchPaperRoutes = require('./routes/research-papers'); 
const chatbotRoutes = require('./routes/chatbot'); 
const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();

app.use(express.json());  

const cors = require('cors');
app.use(cors());1
require('dotenv').config();

app.use('/paper', researchPaperRoutes);  
// app.use('/chatbot', chatbotRoutes);  

app.get('/', (req, res) => {
  res.send('Backend connected and running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
