const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  try {
    const { first_name, last_name, username, email, phone, password } = req.body;

    // Check if user already exists
    const checkQuery = `SELECT * FROM users WHERE email = $1 OR username = $2`;
    const existingUser = await db.query(checkQuery, [email, username]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const name = `${first_name} ${last_name}`.trim();
    const insertQuery = `
      INSERT INTO users (first_name, last_name, name, username, email, phone, password_hash, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, username, email, first_name, last_name, name
    `;
    const result = await db.query(insertQuery, [first_name, last_name, name, username, email, phone, passwordHash]);
    const user = result.rows[0];

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userQuery = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    if (!user.password_hash || user.password_hash === 'OAUTH_USER') {
      return res.status(401).json({ error: 'Please login with your Google account' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Remove password hash from response
    delete user.password_hash;

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
};

const syncUser = async (req, res, next) => {
  try {
    const { email, name, picture } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required to sync user' });
    }

    // Check if user exists
    let userQuery = `SELECT * FROM users WHERE email = $1`;
    let result = await db.query(userQuery, [email]);
    let user;

    if (result.rows.length === 0) {
      // Split name for first and last
      const names = name ? name.split(' ') : ['User'];
      const firstName = names[0];
      const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
      const baseUsername = (firstName + lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = baseUsername + Math.floor(Math.random() * 10000);

      // Create new user for social login (no password)
      const insertQuery = `
        INSERT INTO users (first_name, last_name, name, username, email, password_hash, created_at)
        VALUES ($1, $2, $3, $4, $5, 'OAUTH_USER', NOW())
        RETURNING id, username, email, first_name, last_name, name
      `;
      const insertResult = await db.query(insertQuery, [firstName, lastName, name, username, email]);
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  syncUser
};
