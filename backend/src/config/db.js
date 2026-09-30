const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'hrm_user',
  password: process.env.DB_PASSWORD || 'hrm_secure_password_2026',
  database: process.env.DB_NAME || 'hrm_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  decimalNumbers: true,
  charset: 'utf8mb4',
});

// Helper for executing queries with consistent return shape { rows, insertId, affectedRows }
async function query(sql, params = []) {
  const [result] = await pool.query(sql, params);
  if (Array.isArray(result)) {
    return {
      rows: result,
      rowCount: result.length,
    };
  }
  return {
    rows: [],
    rowCount: result.affectedRows,
    insertId: result.insertId,
    affectedRows: result.affectedRows,
  };
}

module.exports = {
  pool,
  query,
};
