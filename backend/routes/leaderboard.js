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

// @route   GET /api/leaderboard/top-referrers
// @desc    Get top users by referral earnings
// @access  Public
router.get('/top-referrers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topReferrers = await GameState.find()
      .sort({ totalReferralEarnings: -1, invitedFriends: -1 })
      .limit(limit)
      .populate('userId', 'email referralCode')
      .select('userId totalReferralEarnings invitedFriends');

    res.json({
      success: true,
      leaderboard: topReferrers.map((state, index) => ({
        rank: index + 1,
        userId: state.userId._id.toString(),
        email: state.userId.email,
        referralCode: state.userId.referralCode,
        totalReferralEarnings: state.totalReferralEarnings,
        invitedFriends: state.invitedFriends
      }))
    });
  } catch (error) {
    console.error('Get top referrers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referrers leaderboard',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/user-rank/:userId
// @desc    Get user's rank in different categories
// @access  Public
router.get('/user-rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's game state
    const userState = await GameState.findOne({ userId });
    if (!userState) {
      return res.status(404).json({
        success: false,
        message: 'User game state not found'
      });
    }

    // Calculate diamond rank
    const diamondRank = await GameState.countDocuments({
      diamonds: { $gt: userState.diamonds }
    }) + 1;

    // Calculate honey rank
    const honeyRank = await GameState.countDocuments({
      honey: { $gt: userState.honey }
    }) + 1;

    // Calculate referral rank
    const referralRank = await GameState.countDocuments({
      $or: [
        { totalReferralEarnings: { $gt: userState.totalReferralEarnings } },
        {
          totalReferralEarnings: userState.totalReferralEarnings,
          invitedFriends: { $gt: userState.invitedFriends }
        }
      ]
    }) + 1;

    // Get total users
    const totalUsers = await GameState.countDocuments();

    res.json({
      success: true,
      ranks: {
        diamonds: {
          rank: diamondRank,
          total: totalUsers,
          value: userState.diamonds
        },
        honey: {
          rank: honeyRank,
          total: totalUsers,
          value: userState.honey
        },
        referrals: {
          rank: referralRank,
          total: totalUsers,
          totalEarnings: userState.totalReferralEarnings,
          invitedFriends: userState.invitedFriends
        }
      }
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user rank',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/stats
// @desc    Get global statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await GameState.countDocuments();
    
    const stats = await GameState.aggregate([
      {
        $group: {
          _id: null,
          totalDiamonds: { $sum: '$diamonds' },
          totalHoney: { $sum: '$honey' },
          totalFlowers: { $sum: '$flowers' },
          totalBees: {
            $sum: {
              $sum: {
                $map: {
                  input: { $objectToArray: '$bees' },
                  as: 'bee',
                  in: '$$bee.v'
                }
              }
            }
          },
          totalReferrals: { $sum: '$invitedFriends' },
          totalReferralEarnings: { $sum: '$totalReferralEarnings' }
        }
      }
    ]);

    const globalStats = stats[0] || {
      totalDiamonds: 0,
      totalHoney: 0,
      totalFlowers: 0,
      totalBees: 0,
      totalReferrals: 0,
      totalReferralEarnings: 0
    };

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDiamonds: globalStats.totalDiamonds,
        totalHoney: globalStats.totalHoney,
        totalFlowers: globalStats.totalFlowers,
        totalBees: globalStats.totalBees,
        totalReferrals: globalStats.totalReferrals,
        totalReferralEarnings: globalStats.totalReferralEarnings
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;

