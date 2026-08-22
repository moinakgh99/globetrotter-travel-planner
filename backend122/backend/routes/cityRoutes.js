const express = require('express');
const router = express.Router();
const { getCities, getRegions } = require('../controllers/cityController');

// Public city search and region endpoints
router.get('/', getCities);
router.get('/regions', getRegions);

module.exports = router;
