const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getUsers);
router.get('/links', adminController.getLinks);
router.delete('/links/:code', adminController.deleteLink);
router.get('/stats', adminController.getStats);
router.put('/users/:userId/promote', adminController.promoteUser);

module.exports = router;