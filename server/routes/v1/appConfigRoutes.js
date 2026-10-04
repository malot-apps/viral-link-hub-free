const express = require('express');
const router = express.Router();
const appConfigController = require('../../controllers/appConfigController');

// GET /api/v1/app-config
router.get('/', appConfigController.getAppConfig);

module.exports = router;
