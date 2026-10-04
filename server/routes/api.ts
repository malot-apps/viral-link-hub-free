import { Router } from 'express';
import {
  getAppConfig,
  getMovies,
  getMovieById,
  incrementMovieView,
  registerMovieAdClick,
} from '../controllers/movieController';
import { pingAnalytics, getAdminStats } from '../controllers/analyticsController';
import {
  loginAdmin,
  getSettings,
  updateSettings,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/adminController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

// ================= PUBLIC CLIENT ENDPOINTS =================
// 1. App configuration & dynamic settings
router.get('/app-config', getAppConfig);

// 2. Video catalog endpoints
router.get('/movies', getMovies);
router.get('/movies/:id', getMovieById);
router.post('/movies/:id/view', incrementMovieView);
router.post('/movies/:id/click-ad', registerMovieAdClick);

// 3. Real-time visitor analytics ping (5-minute sliding window)
router.post('/analytics/ping', pingAnalytics);

// ================= ADMINISTRATIVE ENDPOINTS =================
// 4. Admin authentication
router.post('/admin/auth/login', loginAdmin);

// 5. Admin live analytics
router.get('/admin/stats', requireAdminAuth, getAdminStats);

// 6. Admin system settings CRUD
router.get('/admin/settings', requireAdminAuth, getSettings);
router.put('/admin/settings', requireAdminAuth, updateSettings);

// 7. Admin video catalog CRUD
router.get('/admin/videos', requireAdminAuth, getMovies);
router.post('/admin/videos', requireAdminAuth, createVideo);
router.put('/admin/videos/:id', requireAdminAuth, updateVideo);
router.delete('/admin/videos/:id', requireAdminAuth, deleteVideo);

export default router;
