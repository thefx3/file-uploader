const { Pool } = require('pg');
require('dotenv').config();

const connection = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });

connection.connect()
.then(() => console.log('✅ Connected to PostgreSQL'))
.catch((err) => console.error('❌ PostgreSQL connection error:', err));

module.exports = connection;