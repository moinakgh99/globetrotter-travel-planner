const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_RQzFH9jASY8L@ep-bitter-flower-ay1wdgkq.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  // Simulate what syncUser does with real Neon session data
  const email = "realuser@gmail.com";
  const name = "Real User";
  const names = name ? name.split(' ') : ['User'];
  const firstName = names[0];
  const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
  const baseUsername = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
  const username = baseUsername + Math.floor(Math.random() * 10000);

  try {
    // 1. Check if exists
    const check = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    console.log("Existing user check:", check.rows);

    if (check.rows.length === 0) {
      const insertQuery = `
        INSERT INTO users (first_name, last_name, name, username, email, password_hash, created_at)
        VALUES ($1, $2, $3, $4, $5, 'OAUTH_USER', NOW())
        RETURNING id, username, email, first_name, last_name, name
      `;
      const result = await pool.query(insertQuery, [firstName, lastName, name, username, email]);
      console.log("Inserted new user:", result.rows);
    } else {
      console.log("User already exists, returning existing.");
    }
  } catch (err) {
    console.error("DB Error details:", err.message);
    console.error("DB Error code:", err.code);
    console.error("DB Error constraint:", err.constraint);
  }
  process.exit();
}

main();
