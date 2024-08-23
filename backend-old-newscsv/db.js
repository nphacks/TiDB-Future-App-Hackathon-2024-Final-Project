const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      uri: dbUrl,
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
