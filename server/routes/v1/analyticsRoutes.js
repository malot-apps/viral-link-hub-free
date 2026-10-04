const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analyticsController');

// POST /api/v1/analytics/ping - Ping endpoint to record active online users and update real-time metrics
router.post('/ping', analyticsController.ping);

// POST /api/v1/analytics/ad-click - Record ad interaction
router.post('/ad-click', analyticsController.trackAdClick);

module.exports = router;
