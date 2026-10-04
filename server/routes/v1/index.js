const express = require('express');
const router = express.Router();

const appConfigRoutes = require('./appConfigRoutes');
const movieRoutes = require('./movieRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const adminRoutes = require('./adminRoutes');

// Mount routes
router.use('/app-config', appConfigRoutes);
router.use('/movies', movieRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VIRAL LINK HUB API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
