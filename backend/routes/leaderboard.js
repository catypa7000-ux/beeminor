const express = require('express');
const router = express.Router();
const GameState = require('../models/GameState');
const User = require('../models/User');

// @route   GET /api/leaderboard
// @desc    Get leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Placeholder - implement actual leaderboard logic
    res.status(501).json({
      success: false,
      message: 'Leaderboard feature not implemented yet'
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/top-diamonds
// @desc    Get top users by diamonds
// @access  Public
router.get('/top-diamonds', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topUsers = await GameState.find()
      .sort({ diamonds: -1 })
      .limit(limit)
      .populate('userId', 'email referralCode')
      .select('userId diamonds');

    res.json({
      success: true,
      leaderboard: topUsers.map((state, index) => ({
        rank: index + 1,
        userId: state.userId._id.toString(),
        email: state.userId.email,
        referralCode: state.userId.referralCode,
        diamonds: state.diamonds
      }))
    });
  } catch (error) {
    console.error('Get top diamonds error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/top-honey
// @desc    Get top users by honey
// @access  Public
router.get('/top-honey', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topUsers = await GameState.find()
      .sort({ honey: -1 })
      .limit(limit)
      .populate('userId', 'email referralCode')
      .select('userId honey');

    res.json({
      success: true,
      leaderboard: topUsers.map((state, index) => ({
        rank: index + 1,
        userId: state.userId._id.toString(),
        email: state.userId.email,
        referralCode: state.userId.referralCode,
        honey: state.honey
      }))
    });
  } catch (error) {
    console.error('Get top honey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

module.exports = router;

