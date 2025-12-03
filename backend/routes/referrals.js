const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GameState = require('../models/GameState');

// @route   GET /api/referrals/:userId
// @desc    Get referrals for a user
// @access  Public (should be protected in production)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find all users who used this user's referral code
    const referrals = await User.find({ sponsorCode: user.referralCode })
      .select('email referralCode createdAt');

    const gameState = await GameState.findOne({ userId: req.params.userId });
    const totalEarnings = gameState?.totalReferralEarnings || 0;

    res.json({
      success: true,
      referrals: referrals.map(r => ({
        email: r.email,
        referralCode: r.referralCode,
        joinedAt: r.createdAt
      })),
      totalReferrals: referrals.length,
      totalEarnings: totalEarnings
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referrals',
      error: error.message
    });
  }
});

// @route   POST /api/referrals/check
// @desc    Check if referral code is valid
// @access  Public
router.post('/check', async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    const user = await User.findOne({ referralCode: referralCode.toUpperCase() })
      .select('email referralCode');

    res.json({
      success: true,
      valid: !!user,
      user: user ? {
        email: user.email,
        referralCode: user.referralCode
      } : null
    });
  } catch (error) {
    console.error('Check referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking referral code',
      error: error.message
    });
  }
});

// @route   POST /api/referrals/calculate
// @desc    Calculate referral earnings (placeholder)
// @access  Public
router.post('/calculate', async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Referral calculation feature not implemented yet'
  });
});

module.exports = router;

