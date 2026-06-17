require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const redisClient = require('./src/config/redis');
const urlRoutes = require('./src/routes/urlRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/', urlRoutes);

// Error handler
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});