const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { createLimiter } = require('../middleware/rateLimiter');

const authLimiter = createLimiter(15 * 60 * 1000, 10); // 10 attempts per 15 min

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh); 
router.post('/logout', authController.logout);

module.exports = router;