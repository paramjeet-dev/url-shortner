const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

const createLimiter = (windowMs = 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    keyGenerator: (req) =>
      req.user?._id?.toString() || ipKeyGenerator(req),
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