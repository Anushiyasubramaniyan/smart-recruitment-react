/* =====================================================
   MYSQL DATABASE CONNECTION POOL
===================================================== */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_recruitment_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    console.log(' Connected to database:',process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Make sure MySQL is running and .env credentials are correct.');
    console.error('   Run the schema in database/schema.sql to create the database.');
  }
}

module.exports = { pool, testConnection };
