const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.get('/stats', requireRole('admin'), dashboardController.getStats);

module.exports = router;
