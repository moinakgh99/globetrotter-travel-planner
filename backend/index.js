require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin for hackathon/development ease
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Error Handling Middleware (must be applied last)
// Debug health check — to diagnose Render deploy issues
app.get('/api/health', async (req, res) => {
  const checks = {
    jwt_secret: !!process.env.JWT_SECRET,
    database_url: !!process.env.DATABASE_URL,
    node_env: process.env.NODE_ENV || 'not set',
  };
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    checks.db_connection = 'OK';
  } catch (e) {
    checks.db_connection = 'FAILED: ' + e.message;
  }
  try {
    require('bcrypt');
    checks.bcrypt = 'OK';
  } catch (e) {
    checks.bcrypt = 'FAILED: ' + e.message;
  }
  res.json(checks);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
