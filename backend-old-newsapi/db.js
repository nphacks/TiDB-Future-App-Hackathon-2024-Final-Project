const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbUrl = process.env.NEWS_DATABASE_URL;

async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      uri: 'mysql://2FcL9BJcF2khzGy.root:jgg7KvrqrhrcmkZ3@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/news_api_db?ssl={"rejectUnauthorized":true}',
      ssl: {
        rejectUnauthorized: true
      }
    });
    console.log('Connected to the TiDB database.');
    return connection;
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    throw err;
  }
}

module.exports = createConnection;