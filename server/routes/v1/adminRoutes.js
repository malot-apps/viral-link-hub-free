const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const adminAuth = require('../../middlewares/adminAuth');

// Public Admin Login
router.post('/auth/login', adminController.login);

// Protected Admin Routes (JWT Required)
router.use(adminAuth);

// Analytics & Dashboard Stats
router.get('/stats', adminController.getStats);

// App Settings & Maintenance Mode Management
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Video CRUD Management
router.get('/videos', adminController.getAllVideos);
router.post('/videos', adminController.createVideo);
router.put('/videos/:id', adminController.updateVideo);
router.delete('/videos/:id', adminController.deleteVideo);

module.exports = router;
