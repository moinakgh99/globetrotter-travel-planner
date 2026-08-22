require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDb = require('./config/initDb');

const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const tripRoutes = require('./routes/tripRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5175","https://globetrotter-nyxo.onrender.com"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/trips', tripRoutes);

// Error Handling Middleware (must be applied last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDb();
});
