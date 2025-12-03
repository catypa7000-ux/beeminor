const express = require('express');
const router = express.Router();
const GameState = require('../models/GameState');
const User = require('../models/User');

// @route   GET /api/game/:userId
// @desc    Get game state for user
// @access  Public (should be protected in production)
router.get('/:userId', async (req, res) => {
  try {
    let gameState = await GameState.findOne({ userId: req.params.userId });
    
    // Create default game state if doesn't exist
    if (!gameState) {
      gameState = new GameState({
        userId: req.params.userId
      });
      await gameState.save();
    }

    res.json({
      success: true,
      gameState: {
        userId: gameState.userId.toString(),
        honey: gameState.honey,
        flowers: gameState.flowers,
        diamonds: gameState.diamonds,
        tickets: gameState.tickets,
        bvrCoins: gameState.bvrCoins,
        bees: Object.fromEntries(gameState.bees),
        alveoles: Object.fromEntries(gameState.alveoles),
        invitedFriends: gameState.invitedFriends,
        claimedMissions: gameState.claimedMissions,
        referrals: gameState.referrals,
        totalReferralEarnings: gameState.totalReferralEarnings,
        hasPendingFunds: gameState.hasPendingFunds,
        transactions: gameState.transactions,
        diamondsThisYear: gameState.diamondsThisYear,
        yearStartDate: gameState.yearStartDate
      }
    });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game state',
      error: error.message
    });
  }
});

// @route   PUT /api/game/:userId
// @desc    Update game state
// @access  Public (should be protected in production)
router.put('/:userId', async (req, res) => {
  try {
    const updates = req.body;
    
    const gameState = await GameState.findOneAndUpdate(
      { userId: req.params.userId },
      { 
        ...updates,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Game state updated successfully',
      gameState: {
        userId: gameState.userId.toString(),
        honey: gameState.honey,
        flowers: gameState.flowers,
        diamonds: gameState.diamonds,
        tickets: gameState.tickets,
        bvrCoins: gameState.bvrCoins,
        bees: Object.fromEntries(gameState.bees),
        alveoles: Object.fromEntries(gameState.alveoles),
        invitedFriends: gameState.invitedFriends,
        claimedMissions: gameState.claimedMissions,
        referrals: gameState.referrals,
        totalReferralEarnings: gameState.totalReferralEarnings,
        hasPendingFunds: gameState.hasPendingFunds,
        transactions: gameState.transactions,
        diamondsThisYear: gameState.diamondsThisYear,
        yearStartDate: gameState.yearStartDate
      }
    });
  } catch (error) {
    console.error('Update game state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating game state',
      error: error.message
    });
  }
});

// @route   POST /api/game/:userId/buy-bee
// @desc    Buy a bee (placeholder)
// @access  Public
router.post('/:userId/buy-bee', async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Buy bee feature not implemented yet'
  });
});

// @route   POST /api/game/:userId/upgrade-alveole
// @desc    Upgrade alveole (placeholder)
// @access  Public
router.post('/:userId/upgrade-alveole', async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Upgrade alveole feature not implemented yet'
  });
});

// @route   POST /api/game/:userId/collect-honey
// @desc    Collect honey (placeholder)
// @access  Public
router.post('/:userId/collect-honey', async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Collect honey feature not implemented yet'
  });
});

module.exports = router;

