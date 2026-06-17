const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { createLimiter } = require('../middleware/rateLimiter');

// Rate limiting for create endpoint
const createLimiter = createLimiter(60 * 1000, 20); // 20 per minute

router.post('/api/urls', createLimiter, urlController.createShortUrl);
router.get('/:code', urlController.redirectToUrl);
router.get('/api/urls/:code/analytics', urlController.getAnalytics);

module.exports = router;