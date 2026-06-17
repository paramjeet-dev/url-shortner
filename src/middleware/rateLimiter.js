const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs = 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.'
    }
  });
};

module.exports = { createLimiter };