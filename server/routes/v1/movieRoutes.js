const express = require('express');
const router = express.Router();
const movieController = require('../../controllers/movieController');

// GET /api/v1/movies - Fetch categories and video lists
router.get('/', movieController.getMovies);

// GET /api/v1/movies/:id - Fetch single video
router.get('/:id', movieController.getMovieById);

// POST /api/v1/movies/:id/view - Record video view
router.post('/:id/view', movieController.recordMovieView);

// POST /api/v1/movies/:id/click-ad - Track ad click for unlocking
router.post('/:id/click-ad', movieController.recordMovieAdClick);

module.exports = router;
