const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { createLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');

router.get('/:code', urlController.redirectToUrl);

router.post('/api/urls', authMiddleware, createLimiter(60 * 1000, 20), urlController.createShortUrl);
router.get('/api/urls', authMiddleware, urlController.getUserUrls);
router.get('/api/urls/:code/analytics', authMiddleware, urlController.getAnalytics); // optionally protect
router.delete('/api/urls/:code', authMiddleware, urlController.deleteUrl);

module.exports = router;