const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../config/redis');

const createLimiter = (windowMs = 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    store: new RedisStore({
      client: redisClient,
    }),
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = { createLimiter };