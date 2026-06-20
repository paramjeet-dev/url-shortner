const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { createLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');

router.get('/:code', urlController.redirectToUrl);

router.post('/api/urls', authMiddleware, createLimiter(60 * 1000, 20), urlController.createShortUrl);
router.put('/api/urls/:code/title', authMiddleware, urlController.updateTitle);
router.get('/api/urls', authMiddleware, urlController.getUserUrls);
router.get('/api/urls/:code/analytics', authMiddleware, urlController.getAnalytics);
router.delete('/api/urls/:code', authMiddleware, urlController.deleteUrl);
router.get('/:code', urlController.redirectToUrl);
router.post('/:code/verify', urlController.verifyPassword);
router.get('/api/urls/:code/qr', authMiddleware, urlController.generateQR);

module.exports = router;