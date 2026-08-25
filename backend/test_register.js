const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_RQzFH9jASY8L@ep-bitter-flower-ay1wdgkq.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const insertQuery = `
      INSERT INTO users (first_name, last_name, name, username, email, phone, password_hash, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, username, email, first_name, last_name
    `;
    const result = await pool.query(insertQuery, ['Test', 'User', 'Test User', 'testuser123', 'test12345@test.com', '1234567890', 'hash']);
    console.log("Success:", result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  }
  process.exit();
}

main();
