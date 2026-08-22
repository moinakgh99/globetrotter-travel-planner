const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { signup, login, getMe, getProfile, updateProfile } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
