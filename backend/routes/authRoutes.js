const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  // Dummy login endpoint to bypass the frontend form
  res.status(200).json({
    token: 'dummy-dev-token-12345',
    user: {
      id: 1,
      username: req.body.username || 'testuser',
      email: 'test@example.com'
    }
  });
});

router.post('/register', (req, res) => {
  res.status(200).json({
    token: 'dummy-dev-token-12345',
    user: {
      id: 1,
      username: req.body.username || 'testuser',
      email: req.body.email || 'test@example.com'
    }
  });
});

module.exports = router;
