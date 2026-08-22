const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateSignup, validateLogin } = require('../validators/authValidator');

/**
 * Register a new user
 * Method: POST
 * Route: /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { valid, errors } = validateSignup(req.body);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const {
      username,
      first_name,
      last_name,
      email,
      phone,
      city,
      country,
      additional_info,
      password
    } = req.body;

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const fullName = `${first_name.trim()} ${last_name.trim()}`;

    // Check for existing username or email
    const checkQuery = `
      SELECT id, username, email FROM users
      WHERE (username IS NOT NULL AND LOWER(username) = LOWER($1)) 
         OR (email IS NOT NULL AND LOWER(email) = LOWER($2));
    `;
    const checkResult = await db.query(checkQuery, [trimmedUsername, trimmedEmail]);

    if (checkResult.rows.length > 0) {
      const existing = checkResult.rows[0];
      if (existing.username && existing.username.toLowerCase() === trimmedUsername.toLowerCase()) {
        return res.status(409).json({ error: 'Username is already taken.' });
      }
      return res.status(409).json({ error: 'Email address is already registered.' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO users (username, name, first_name, last_name, email, phone, city, country, additional_info, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, username, name, first_name, last_name, email, phone, city, country, additional_info, created_at;
    `;

    const values = [
      trimmedUsername,
      fullName,
      first_name.trim(),
      last_name.trim(),
      trimmedEmail,
      phone ? phone.trim() : null,
      city ? city.trim() : null,
      country ? country.trim() : null,
      additional_info ? additional_info.trim() : null,
      password_hash
    ];

    const result = await db.query(insertQuery, values);
    const user = result.rows[0];

    // Sign JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 * Method: POST
 * Route: /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { valid, errors } = validateLogin(req.body);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const { username, password } = req.body;
    const trimmedUsername = username.trim();

    // Query user by username or email
    const query = `
      SELECT id, username, name, first_name, last_name, email, phone, city, country, additional_info, password_hash, created_at
      FROM users
      WHERE (username IS NOT NULL AND LOWER(username) = LOWER($1))
         OR (email IS NOT NULL AND LOWER(email) = LOWER($1));
    `;
    const result = await db.query(query, [trimmedUsername]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Exclude password_hash from response
    delete user.password_hash;

    // Sign JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user profile
 * Method: GET
 * Route: /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.userId;

    const query = `
      SELECT id, username, name, first_name, last_name, email, phone, city, country, additional_info, created_at
      FROM users
      WHERE id = $1;
    `;
    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user profile
 * Method: GET
 * Route: /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await db.query(
      'SELECT id, username, name, first_name, last_name, email, phone, city, country, additional_info, role, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update current authenticated user profile
 * Method: PUT
 * Route: /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      username,
      name,
      first_name,
      last_name,
      email,
      phone,
      city,
      country,
      additional_info,
      currentPassword,
      newPassword
    } = req.body;

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const existingUser = userResult.rows[0];

    const updates = [];
    const values = [];
    let idx = 1;

    let updatedFirstName = first_name !== undefined ? first_name : existingUser.first_name;
    let updatedLastName = last_name !== undefined ? last_name : existingUser.last_name;
    let updatedName = name;

    if (!updatedName && (updatedFirstName || updatedLastName)) {
      updatedName = `${updatedFirstName || ''} ${updatedLastName || ''}`.trim();
    }

    if (username !== undefined) { updates.push(`username = $${idx}`); values.push(username); idx++; }
    if (updatedName !== undefined) { updates.push(`name = $${idx}`); values.push(updatedName); idx++; }
    if (first_name !== undefined) { updates.push(`first_name = $${idx}`); values.push(first_name); idx++; }
    if (last_name !== undefined) { updates.push(`last_name = $${idx}`); values.push(last_name); idx++; }
    if (email !== undefined) { updates.push(`email = $${idx}`); values.push(email); idx++; }
    if (phone !== undefined) { updates.push(`phone = $${idx}`); values.push(phone); idx++; }
    if (city !== undefined) { updates.push(`city = $${idx}`); values.push(city); idx++; }
    if (country !== undefined) { updates.push(`country = $${idx}`); values.push(country); idx++; }
    if (additional_info !== undefined) { updates.push(`additional_info = $${idx}`); values.push(additional_info); idx++; }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required to change password.' });
      }
      const match = await bcrypt.compare(currentPassword, existingUser.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
      const saltRounds = 10;
      const hashed = await bcrypt.hash(newPassword, saltRounds);
      updates.push(`password_hash = $${idx}`);
      values.push(hashed);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, username, name, first_name, last_name, email, phone, city, country, additional_info, role, created_at`;
    values.push(userId);

    const updated = await db.query(query, values);
    res.json({ user: updated.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  getProfile,
  updateProfile
};
