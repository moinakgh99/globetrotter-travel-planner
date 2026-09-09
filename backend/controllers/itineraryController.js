const { validateGenerateRequest } = require('../validators/itineraryValidator');
const { callGeminiForItinerary } = require('../services/aiItineraryService');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: { rejectUnauthorized: false }
});

/**
 * Generates an itinerary using Gemini AI and persists it atomically in the database.
 * Method: POST
 * Route: /api/trips/:tripId/generate-itinerary
 */
const generateItinerary = async (req, res, next) => {
  const { tripId } = req.params;
  const user_id = req.userId;

  // 1. Validate request body
  const { valid, errors } = validateGenerateRequest(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }

  let client;

  try {
    client = await pool.connect();

    // 2. Verify trip ownership
    const checkTripQuery = 'SELECT * FROM trips WHERE id = $1';
    const checkTripRes = await client.query(checkTripQuery, [tripId]);
    
    if (checkTripRes.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Trip not found.' });
    }
    const trip = checkTripRes.rows[0];
    if (trip.user_id !== user_id) {
      client.release();
      return res.status(403).json({ error: 'Access denied. You do not own this trip.' });
    }

    // 3. Call AI Service
    let aiResponse;
    try {
      aiResponse = await callGeminiForItinerary(req.body);
    } catch (aiErr) {
      if (client) client.release();
      if (aiErr.name === 'TimeoutError') {
        return res.status(504).json({ error: 'AI generation timed out. Please try again.' });
      }
      return res.status(502).json({ error: 'Failed to generate itinerary with AI.' });
    }

    // 4. Atomic Persistence Transaction
    await client.query('BEGIN');

    const resultItinerary = {
      stops: [],
      budget_summary: aiResponse.budget_summary
    };

    let stopOrder = 1;
    for (const stop of aiResponse.stops) {
      
      // 5. Find or create city
      let cityId;
      const cityCheckQuery = 'SELECT id FROM cities WHERE name = $1 AND country = $2';
      const cityCheck = await client.query(cityCheckQuery, [stop.city_name, stop.country]);
      
      if (cityCheck.rows.length > 0) {
        cityId = cityCheck.rows[0].id;
      } else {
        // Map budget_tier to cost_index dynamically
        let costIndex = 3;
        const tier = req.body.budget_tier.toLowerCase();
        if (tier === 'budget') costIndex = 2;
        if (tier === 'luxury') costIndex = 5;

        const cityInsertQuery = `
          INSERT INTO cities (name, country, cost_index, popularity) 
          VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const cityInsert = await client.query(cityInsertQuery, [stop.city_name, stop.country, costIndex, 50]);
        cityId = cityInsert.rows[0].id;
      }

      // Insert trip stop
      const stopInsertQuery = `
        INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `;
      const stopInsert = await client.query(stopInsertQuery, [
        tripId, cityId, stopOrder, stop.arrival_date, stop.departure_date
      ]);
      const tripStopId = stopInsert.rows[0].id;
      
      const currentStopResult = {
        ...stopInsert.rows[0],
        city_name: stop.city_name,
        country: stop.country,
        activities: []
      };

      // 6. Insert activities and link them
      if (stop.activities && Array.isArray(stop.activities)) {
        for (const act of stop.activities) {
          // Normalize category against CHECK constraint to prevent transaction crash
          let category = (act.category || '').toLowerCase();
          const validCategories = ['sightseeing', 'food', 'adventure', 'transport', 'stay', 'other'];
          if (!validCategories.includes(category)) {
            category = 'other';
          }

          const actInsertQuery = `
            INSERT INTO activities (city_id, name, category, estimated_cost, duration_hours, description) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
          `;
          const actInsert = await client.query(actInsertQuery, [
            cityId, act.name, category, act.estimated_cost, act.duration_hours, act.notes || ''
          ]);
          const newAct = actInsert.rows[0];

          const linkInsertQuery = `
            INSERT INTO trip_activities (trip_stop_id, activity_id, scheduled_date, scheduled_time, actual_cost, notes) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
          `;
          const linkInsert = await client.query(linkInsertQuery, [
            tripStopId, newAct.id, act.scheduled_date, act.scheduled_time, null, ''
          ]);
          
          currentStopResult.activities.push({
            ...newAct,
            ...linkInsert.rows[0]
          });
        }
      }

      resultItinerary.stops.push(currentStopResult);
      stopOrder++;
    }

    await client.query('COMMIT');
    client.release();
    
    // 8. Respond with fully assembled itinerary
    res.status(201).json(resultItinerary);

  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    next(err);
  }
};

/**
 * Fetches all stops and nested activities for a specific trip.
 * Method: GET
 * Route: /api/trips/:tripId/stops
 */
const getTripStops = async (req, res, next) => {
  const { tripId } = req.params;
  const user_id = req.userId;
  
  try {
    // 1. Check trip ownership
    const checkTrip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (checkTrip.rows.length === 0) return res.status(404).json({ error: 'Trip not found.' });
    if (checkTrip.rows[0].user_id !== user_id && !checkTrip.rows[0].is_public) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // 2. Fetch stops and cities
    const stopsQuery = `
      SELECT ts.*, c.name as "cityName", c.country as "countryName"
      FROM trip_stops ts
      JOIN cities c ON c.id = ts.city_id
      WHERE ts.trip_id = $1
      ORDER BY ts.stop_order ASC
    `;
    const stopsRes = await pool.query(stopsQuery, [tripId]);
    const stops = stopsRes.rows;

    // 3. Fetch activities for these stops
    const activitiesQuery = `
      SELECT ta.*, a.name, a.category, a.estimated_cost, a.duration_hours, a.description
      FROM trip_activities ta
      JOIN activities a ON a.id = ta.activity_id
      JOIN trip_stops ts ON ts.id = ta.trip_stop_id
      WHERE ts.trip_id = $1
      ORDER BY ta.scheduled_date ASC, ta.scheduled_time ASC
    `;
    const activitiesRes = await pool.query(activitiesQuery, [tripId]);
    const activities = activitiesRes.rows;

    // Helper to format JS Date to YYYY-MM-DD safely
    const formatDate = (dateObj) => {
      if (!dateObj) return null;
      if (typeof dateObj === 'string') return dateObj.split('T')[0];
      return dateObj.toISOString().split('T')[0];
    };

    // 4. Assemble and format dates
    stops.forEach(stop => {
      stop.arrival_date = formatDate(stop.arrival_date);
      stop.departure_date = formatDate(stop.departure_date);
      
      stop.activities = activities
        .filter(act => act.trip_stop_id === stop.id)
        .map(act => ({
          ...act,
          scheduled_date: formatDate(act.scheduled_date),
          // UI expects capitalized categories like 'Food', 'Sightseeing'
          category: act.category ? act.category.charAt(0).toUpperCase() + act.category.slice(1) : 'Other'
        }));
    });

    res.status(200).json(stops);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateItinerary,
  getTripStops
};

/**
 * TESTING HOOK / CURL CHEATSHEET
 * 
 * curl -X POST http://localhost:5001/api/trips/1/generate-itinerary \
 * -H "Authorization: Bearer <token>" \
 * -H "Content-Type: application/json" \
 * -d '{
 *   "destinations": "Jaipur, Goa",
 *   "traveler_count": 2,
 *   "budget": 50000,
 *   "currency": "INR",
 *   "budget_tier": "mid-range",
 *   "interests": ["sightseeing", "food", "adventure"],
 *   "pace": "balanced",
 *   "start_date": "2026-12-10",
 *   "duration_days": 8,
 *   "notes": "vegetarian food only, no early mornings"
 * }'
 * 
 * EXPECTED RESPONSE (201):
 * {
 *   "stops": [ ... ],
 *   "budget_summary": { ... }
 * }
 */
