const db = require('../config/db');

/**
 * Get cities with search, filter, and sort options
 * Method: GET
 * Route: /api/cities
 */
const getCities = async (req, res, next) => {
  try {
    const { q, region, sort, popular, limit, cost_index } = req.query;

    let conditions = [];
    let values = [];
    let paramIndex = 1;

    // Search query parameter q (matches city name or activity tags)
    if (q && typeof q === 'string' && q.trim().length > 0) {
      const searchTerm = `%${q.trim().toLowerCase()}%`;
      conditions.push(`(LOWER(name) LIKE $${paramIndex} OR LOWER(country) LIKE $${paramIndex} OR LOWER(array_to_string(tags, ',')) LIKE $${paramIndex})`);
      values.push(searchTerm);
      paramIndex++;
    }

    // Filter by Region
    if (region && typeof region === 'string' && region.trim().length > 0 && region !== 'All') {
      conditions.push(`LOWER(region) = LOWER($${paramIndex})`);
      values.push(region.trim());
      paramIndex++;
    }

    // Filter by Cost Index
    if (cost_index !== undefined && !isNaN(parseInt(cost_index))) {
      conditions.push(`cost_index = $${paramIndex}`);
      values.push(parseInt(cost_index));
      paramIndex++;
    }

    // Filter for popular cities
    if (popular === 'true') {
      conditions.push(`popularity >= 90`);
    }

    let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderByClause = 'ORDER BY popularity DESC, name ASC';
    if (sort === 'name') {
      orderByClause = 'ORDER BY name ASC';
    } else if (sort === 'cost' || sort === 'cost_asc') {
      orderByClause = 'ORDER BY cost_index ASC, name ASC';
    } else if (sort === 'cost_desc') {
      orderByClause = 'ORDER BY cost_index DESC, name ASC';
    } else if (sort === 'popularity') {
      orderByClause = 'ORDER BY popularity DESC, name ASC';
    }

    // Limit
    const parsedLimit = limit && !isNaN(parseInt(limit)) ? Math.min(parseInt(limit), 100) : 50;
    values.push(parsedLimit);
    const limitClause = `LIMIT $${paramIndex}`;

    const query = `
      SELECT id, name, country, region, cost_index, popularity, tags, image_url
      FROM cities
      ${whereClause}
      ${orderByClause}
      ${limitClause};
    `;

    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Get distinct list of regions for filter dropdown
 * Method: GET
 * Route: /api/cities/regions
 */
const getRegions = async (req, res, next) => {
  try {
    const query = `
      SELECT DISTINCT region 
      FROM cities 
      WHERE region IS NOT NULL AND TRIM(region) != ''
      ORDER BY region ASC;
    `;
    const result = await db.query(query);
    const regions = result.rows.map(row => row.region);
    res.status(200).json(regions);
  } catch (err) {
    next(err);
  }
};

/**
 * Attach a city to a trip
 * Method: POST
 * Route: /api/trips/:tripId/cities
 */
const attachCityToTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { city_id } = req.body;
    const userId = req.userId;

    if (!city_id) {
      return res.status(400).json({ error: 'city_id is required.' });
    }

    // Verify trip existence and ownership
    const tripCheckQuery = `SELECT * FROM trips WHERE id = $1;`;
    const tripCheckResult = await db.query(tripCheckQuery, [tripId]);

    if (tripCheckResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const trip = tripCheckResult.rows[0];
    if (String(trip.user_id) !== String(userId)) {
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    // Verify city existence
    const cityCheckQuery = `SELECT * FROM cities WHERE id = $1;`;
    const cityCheckResult = await db.query(cityCheckQuery, [city_id]);

    if (cityCheckResult.rows.length === 0) {
      return res.status(404).json({ error: 'City not found.' });
    }

    // Insert into trip_cities
    const insertQuery = `
      INSERT INTO trip_cities (trip_id, city_id, sort_order)
      VALUES ($1, $2, COALESCE((SELECT MAX(sort_order) + 1 FROM trip_cities WHERE trip_id = $1), 1))
      RETURNING *;
    `;
    const insertResult = await db.query(insertQuery, [tripId, city_id]);

    res.status(201).json({
      message: 'City attached to trip successfully.',
      attachment: insertResult.rows[0],
      city: cityCheckResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCities,
  getRegions,
  attachCityToTrip
};
