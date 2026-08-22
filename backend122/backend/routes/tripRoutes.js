
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

// Mount the itinerary generation & stops endpoints
router.post('/:tripId/generate-itinerary', generateItinerary);
router.get('/:tripId/stops', getTripStops);

// Attach city to trip endpoint
const { attachCityToTrip } = require('../controllers/cityController');
router.post('/:tripId/cities', attachCityToTrip);

module.exports = router;
