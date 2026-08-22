const db = require('../config/db');
const { validateCreateTrip, validateUpdateTrip } = require('../validators/tripValidator');

/**
 * Create a new trip
 * Method: POST
 * Route: /api/trips
 */
const createTrip = async (req, res, next) => {
  try {
    const { valid, errors } = validateCreateTrip(req.body);
    
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const { name, description, start_date, end_date, cover_photo_url, is_public } = req.body;
    const user_id = req.userId;

    const insertQuery = `
      INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [
      user_id, 
      name, 
      description || null, 
      start_date, 
      end_date, 
      cover_photo_url || null, 
      is_public || false
    ];

    const result = await db.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all trips for the authenticated user, or public trips
 * Method: GET
 * Route: /api/trips
 */
const getTrips = async (req, res, next) => {
  try {
    const { public } = req.query;
    let query, values;

    if (public === 'true') {
      // Return public trips
      query = `SELECT * FROM trips WHERE is_public = $1 ORDER BY created_at DESC`;
      values = [true];
    } else {
      // Return user's trips
      const user_id = req.userId;
      query = `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC`;
      values = [user_id];
    }

    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a trip by ID
 * Method: GET
 * Route: /api/trips/:id
 */
const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    const query = `SELECT * FROM trips WHERE id = $1`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const trip = result.rows[0];

    // Check ownership or public visibility
    if (!trip.is_public && trip.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.status(200).json(trip);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a trip
 * Method: PUT
 * Route: /api/trips/:id
 */
const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    // Check if trip exists and belongs to user
    const checkQuery = `SELECT * FROM trips WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const existingTrip = checkResult.rows[0];

    if (existingTrip.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    // Validate request body
    const { valid, errors } = validateUpdateTrip(req.body);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const { name, description, start_date, end_date, cover_photo_url, is_public } = req.body;
    
    // Check dates consistency if only one date is updated
    const newStartDate = start_date || existingTrip.start_date;
    const newEndDate = end_date || existingTrip.end_date;
    
    // Re-validate dates with the mixed existing/new data
    if (new Date(newEndDate) < new Date(newStartDate)) {
       return res.status(400).json({ errors: { end_date: 'End date cannot be before start date.' }});
    }

    // Partial update
    const updateQuery = `
      UPDATE trips
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        cover_photo_url = COALESCE($5, cover_photo_url),
        is_public = COALESCE($6, is_public)
      WHERE id = $7
      RETURNING *;
    `;

    const values = [
      name !== undefined ? name : null,
      description !== undefined ? description : null,
      start_date !== undefined ? start_date : null,
      end_date !== undefined ? end_date : null,
      cover_photo_url !== undefined ? cover_photo_url : null,
      is_public !== undefined ? is_public : null,
      id
    ];

    const result = await db.query(updateQuery, values);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a trip
 * Method: DELETE
 * Route: /api/trips/:id
 */
const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    // Check if trip exists and belongs to user
    const checkQuery = `SELECT * FROM trips WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const trip = checkResult.rows[0];

    if (trip.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    const deleteQuery = `DELETE FROM trips WHERE id = $1`;
    await db.query(deleteQuery, [id]);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
};
