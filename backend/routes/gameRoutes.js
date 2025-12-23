const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const gameController = require('../controllers/gameController');

// @route   GET api/user/profile
// @desc    Get user profile and stats
// @access  Private
router.get('/user/profile', auth, gameController.getUserProfile);

// @route   POST api/game/result
// @desc    Save game result
// @access  Private
router.post('/game/result', auth, gameController.saveGameResult);

module.exports = router;
