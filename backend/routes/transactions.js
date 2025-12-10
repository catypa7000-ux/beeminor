const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const GameState = require('../models/GameState');
const User = require('../models/User');
const { 
  sendWithdrawalSubmittedNotification
} = require('../services/notificationService');

// @route   GET /api/transactions/:userId
// @desc    Get transactions for user
// @access  Public (should be protected in production)
router.get('/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        address: t.address,
        cryptoAddress: t.cryptoAddress,
        notes: t.notes,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

// @route   POST /api/transactions/withdraw
// @desc    Create withdrawal request and deduct flowers or BVR
// @access  Public (should be protected in production)
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, currency, address, cryptoAddress, type } = req.body;

    if (!userId || !amount || !currency || (!address && !cryptoAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (userId, amount, currency, and address/cryptoAddress)'
      });
    }

    // Get game state to check balance and deduct resources
    const gameState = await GameState.findOne({ userId });
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: 'Game state not found'
      });
    }

    // Determine what to deduct based on currency
    if (currency === 'BVR') {
      // For BVR withdrawals, deduct bvrCoins
      if (gameState.bvrCoins < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient BVR coins',
          current: gameState.bvrCoins,
          required: amount
        });
      }
      gameState.bvrCoins -= amount;
    } else {
      // For USD/crypto withdrawals, deduct flowers
      if (gameState.flowers < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient flowers',
          current: gameState.flowers,
          required: amount
        });
      }
      gameState.flowers -= amount;
    }

    await gameState.save();

    // Create withdrawal transaction
    const transaction = new Transaction({
      userId,
      type: type || 'withdrawal',
      amount,
      currency,
      address: address || null,
      cryptoAddress: cryptoAddress || null,
      status: 'pending'
    });

    await transaction.save();

    // Send email notification to admin (not user)
    try {
      const user = await User.findById(userId);
      const adminEmail = process.env.ADMIN_EMAIL || 'martinremy100@gmail.com'; // Admin email from env or default
      
      if (user && user.email) {
        await sendWithdrawalSubmittedNotification(adminEmail, transaction, user.email);
        console.log('📧 Withdrawal notification email sent to admin:', adminEmail);
        console.log('📧 For user:', user.email);
      }
    } catch (emailError) {
      console.error('📧 Failed to send withdrawal notification email:', emailError.message);
      // Don't fail the withdrawal if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      transaction: {
        id: transaction._id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        address: transaction.address,
        cryptoAddress: transaction.cryptoAddress,
        createdAt: transaction.createdAt
      },
      remainingFlowers: gameState.flowers
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating withdrawal request',
      error: error.message
    });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Public (should be protected in production)
router.post('/', async (req, res) => {
  try {
    const { userId, type, amount, currency, address, cryptoAddress, notes } = req.body;

    if (!userId || !type || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const transaction = new Transaction({
      userId,
      type,
      amount,
      currency,
      address: address || null,
      cryptoAddress: cryptoAddress || null,
      notes: notes || null,
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction: {
        id: transaction._id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        address: transaction.address,
        cryptoAddress: transaction.cryptoAddress,
        notes: transaction.notes,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
});

// @route   PUT /api/transactions/:id/status
// @desc    Update transaction status (admin function)
// @access  Public (should be protected and admin-only in production)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Note: refund tracking could be used for future email notifications

    // If deposit is being approved, award flowers and tickets
    if (transaction.type === 'deposit_crypto' && 
        transaction.status === 'pending' && 
        status === 'completed') {
      console.log('=== DEPOSIT APPROVAL DEBUG ===');
      console.log('Transaction ID:', transaction._id);
      console.log('Transaction type:', transaction.type);
      console.log('Transaction userId:', transaction.userId);
      console.log('Transaction amount:', transaction.amount);
      console.log('Transaction notes:', transaction.notes);
      
      let gameState = await GameState.findOne({ userId: transaction.userId });
      
      // Create game state if it doesn't exist (e.g., new user depositing before playing)
      if (!gameState) {
        console.log('⚠️  GameState not found for userId:', transaction.userId);
        console.log('✓ Creating new GameState for user...');
        
        gameState = new GameState({
          userId: transaction.userId,
          honey: 100,
          flowers: 0,
          diamonds: 0,
          tickets: 0,
          bvrCoins: 0,
          bees: new Map(),
          alveoles: new Map([[1, true]]),
          invitedFriends: 0,
          claimedMissions: [],
          referrals: [],
          totalReferralEarnings: 0,
          hasPendingFunds: false,
          transactions: [],
          diamondsThisYear: 0,
          yearStartDate: new Date().getFullYear().toString()
        });
        
        try {
          await gameState.save();
          console.log('✅ New GameState created successfully!');
        } catch (createError) {
          console.error('❌ ERROR creating GameState:', createError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create game state for user',
            error: createError.message
          });
        }
      }
      
      console.log('✓ GameState found for user:', transaction.userId);
      
      let flowersToAward = 0;
      let ticketsToAward = 0;
      let usdAmount = transaction.amount || 0;
      
      // Try to parse notes for detailed deposit information
      if (transaction.notes) {
        try {
          const depositInfo = JSON.parse(transaction.notes);
          usdAmount = depositInfo.usdAmount || transaction.amount || 0;
          
          // Use pre-calculated flowers amount if available
          if (depositInfo.flowersAmount) {
            flowersToAward = depositInfo.flowersAmount;
          } else {
            // Fallback calculation: 1000 flowers per $1 USD, minus $1 fee
            const netAmount = Math.max(0, usdAmount - 1);
            flowersToAward = Math.floor(netAmount * 1000);
          }
          
          console.log('✓ Parsed deposit info from notes:', depositInfo);
        } catch (_parseError) {
          console.log('⚠️  Could not parse notes, using default calculation');
          // Fallback calculation
          const netAmount = Math.max(0, usdAmount - 1);
          flowersToAward = Math.floor(netAmount * 1000);
        }
      } else {
        console.log('⚠️  No notes found, using default calculation');
        // No notes, use default calculation
        const netAmount = Math.max(0, usdAmount - 1);
        flowersToAward = Math.floor(netAmount * 1000);
      }
      
      // Calculate tickets (1 ticket per $10 spent)
      ticketsToAward = Math.floor(usdAmount / 10);
      
      console.log('📊 Before approval:');
      console.log('   - Flowers:', gameState.flowers);
      console.log('   - Tickets:', gameState.tickets);
      console.log('📊 Processing:');
      console.log('   - USD Amount:', usdAmount);
      console.log('   - Flowers to award:', flowersToAward);
      console.log('   - Tickets to award:', ticketsToAward);
      
      // Award flowers and tickets
      gameState.flowers = (gameState.flowers || 0) + flowersToAward;
      gameState.tickets = (gameState.tickets || 0) + ticketsToAward;
      
      try {
        await gameState.save();
        console.log('✅ GameState saved successfully!');
        console.log('📊 After approval:');
        console.log('   - Flowers:', gameState.flowers);
        console.log('   - Tickets:', gameState.tickets);
        console.log('=== DEPOSIT APPROVAL COMPLETE ===');
      } catch (saveError) {
        console.error('❌ ERROR saving GameState:', saveError);
        return res.status(500).json({
          success: false,
          message: 'Failed to save game state after awarding flowers',
          error: saveError.message
        });
      }
    }

    // If withdrawal is being cancelled/failed, refund the resources
    if ((transaction.type === 'withdrawal' || transaction.type === 'withdrawal_diamond' || transaction.type === 'withdrawal_bvr') && 
        transaction.status === 'pending' && 
        (status === 'cancelled' || status === 'failed')) {
      console.log('=== REFUND DEBUG ===');
      console.log('Transaction type:', transaction.type);
      console.log('Transaction currency:', transaction.currency);
      console.log('Transaction amount:', transaction.amount);
      
      const gameState = await GameState.findOne({ userId: transaction.userId });
      if (gameState) {
        console.log('Before refund - bvrCoins:', gameState.bvrCoins, 'flowers:', gameState.flowers);
        
        // Refund based on currency type
        if (transaction.currency === 'BVR') {
          gameState.bvrCoins += transaction.amount;
          console.log('Refunding BVR:', transaction.amount);
        } else {
          gameState.flowers += transaction.amount;
          console.log('Refunding flowers:', transaction.amount);
        }
        
        await gameState.save();
        console.log('After refund - bvrCoins:', gameState.bvrCoins, 'flowers:', gameState.flowers);
        console.log('=== REFUND COMPLETE ===');
      } else {
        console.log('ERROR: GameState not found for refund');
      }
    }

    transaction.status = status;
    transaction.adminNotes = adminNotes || null;
    // Set processedAt when transaction is completed or cancelled
    if (status === 'completed' || status === 'cancelled') {
      transaction.processedAt = new Date();
    }
    await transaction.save();

    // No email notifications on approval/rejection - only on withdrawal request submission

    res.json({
      success: true,
      message: 'Transaction status updated',
      transaction: {
        id: transaction._id.toString(),
        status: transaction.status,
        adminNotes: transaction.adminNotes
      }
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
});

// @route   GET /api/transactions/pending/all
// @desc    Get all pending transactions (admin)
// @access  Public (should be protected and admin-only in production)
router.get('/pending/all', async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('userId', 'email referralCode')
      .limit(100);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id.toString(),
        userId: t.userId._id.toString(),
        userEmail: t.userId.email,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        address: t.address,
        cryptoAddress: t.cryptoAddress,
        notes: t.notes,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending transactions',
      error: error.message
    });
  }
});

// @route   GET /api/transactions/history/all
// @desc    Get all processed transactions (completed/cancelled) (admin)
// @access  Public (should be protected and admin-only in production)
router.get('/history/all', async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      status: { $in: ['completed', 'cancelled'] } 
    })
      .sort({ updatedAt: -1 })
      .populate('userId', 'email referralCode')
      .limit(100);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id.toString(),
        userId: t.userId ? t.userId._id.toString() : 'Unknown',
        userEmail: t.userId ? t.userId.email : 'Unknown',
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        address: t.address,
        cryptoAddress: t.cryptoAddress,
        notes: t.notes,
        processedAt: t.processedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history',
      error: error.message
    });
  }
});

module.exports = router;

