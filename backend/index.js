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

// Routes
app.use('/api/trips', tripRoutes);

// Error Handling Middleware (must be applied last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
