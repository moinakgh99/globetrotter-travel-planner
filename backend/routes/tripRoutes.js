
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');

// Import the new itinerary controller
const { generateItinerary, getTripStops } = require('../controllers/itineraryController');

// All trip routes require authentication
router.use(verifyToken);

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Mount the new generation endpoint
router.post('/:tripId/generate-itinerary', generateItinerary);
router.get('/:tripId/stops', getTripStops);

module.exports = router;

/**
 * Note: Add ANTHROPIC_API_KEY=your_key_here to backend/.env
 * And ensure @anthropic-ai/sdk is installed via: npm install @anthropic-ai/sdk
 */
