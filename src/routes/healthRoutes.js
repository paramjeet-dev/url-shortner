const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const redisClient = require('../config/redis');

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: false,
      redis: false
    }
  };

  // Check MongoDB
  try {
    await mongoose.connection.db.admin().ping();
    health.services.mongodb = true;
  } catch (err) {
    health.services.mongodb = false;
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redisClient.ping();
    health.services.redis = true;
  } catch (err) {
    health.services.redis = false;
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;