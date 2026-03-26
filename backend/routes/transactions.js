const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Transaction = require('../models/Transaction');
const GameState = require('../models/GameState');
const User = require('../models/User');
const {
  sendWithdrawalSubmittedNotification
} = require('../services/notificationService');

// --- Specific routes first so they are not matched by GET /:userId ---

// @route   GET /api/transactions/pending/all
// @desc    Get all pending transactions (admin)
router.get('/pending/all', async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('userId', 'email referralCode')
      .limit(100);

    res.json({
      success: true,
      transactions: transactions.map(t => {
        const uid = t.userId;
        const userIdStr = uid && uid._id ? uid._id.toString() : (t.userId ? String(t.userId) : '');
        const userEmail = (uid && uid.email) ? uid.email : '';
        return {
          id: t._id.toString(),
          userId: userIdStr,
          userEmail,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          address: t.address,
          cryptoAddress: t.cryptoAddress,
          notes: t.notes,
          createdAt: t.createdAt
        };
      })
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
// @desc    Get all processed transactions (admin)
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

// @route   PUT /api/transactions/:id/status
// @desc    Update transaction status (admin)
router.put('/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    const { status, adminNotes } = req.body || {};
    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Status is required in request body'
      });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // If deposit is being approved, award flowers and tickets
    if (transaction.type === 'deposit_crypto' &&
        transaction.status === 'pending' &&
        status === 'completed') {
      let gameState = await GameState.findOne({ userId: transaction.userId });

      if (!gameState) {
        gameState = new GameState({
          userId: transaction.userId,
          honey: 0,
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
        await gameState.save();
      }

      let flowersToAward = 0;
      let ticketsToAward = 0;
      let usdAmount = transaction.amount || 0;

      if (transaction.notes) {
        try {
          const depositInfo = JSON.parse(transaction.notes);
          usdAmount = depositInfo.usdAmount || transaction.amount || 0;
          flowersToAward = depositInfo.flowersAmount ?? Math.floor(Math.max(0, usdAmount - 1) * 1000);
        } catch (_) {
          flowersToAward = Math.floor(Math.max(0, usdAmount - 1) * 1000);
        }
      } else {
        flowersToAward = Math.floor(Math.max(0, usdAmount - 1) * 1000);
      }
      ticketsToAward = Math.floor(usdAmount / 10);

      gameState.flowers = (gameState.flowers || 0) + flowersToAward;
      gameState.tickets = (gameState.tickets || 0) + ticketsToAward;
      await gameState.save();
    }

    // If withdrawal is being cancelled/failed, refund
    if ((transaction.type === 'withdrawal' || transaction.type === 'withdrawal_diamond' || transaction.type === 'withdrawal_bvr') &&
        transaction.status === 'pending' &&
        (status === 'cancelled' || status === 'failed')) {
      const gameState = await GameState.findOne({ userId: transaction.userId });
      if (gameState) {
        if (transaction.type === 'withdrawal_bvr' || transaction.currency === 'BVR') {
          const coinsToRefund = transaction.amount * 100;
          gameState.bvrCoins = (gameState.bvrCoins || 0) + coinsToRefund;
        } else if (transaction.type === 'withdrawal_diamond' || transaction.currency === 'Diamond' || transaction.currency === 'DIAMOND') {
          gameState.diamonds = (gameState.diamonds || 0) + transaction.amount;
        } else {
          gameState.flowers = (gameState.flowers || 0) + transaction.amount;
        }
        await gameState.save();
      }
    }

    transaction.status = status;
    transaction.adminNotes = adminNotes || null;
    if (status === 'completed' || status === 'cancelled') {
      transaction.processedAt = new Date();
    }
    await transaction.save();

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

// @route   GET /api/transactions/:userId
// @desc    Get transactions for user
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

    const MS_24H = 24 * 60 * 60 * 1000;

    const pendingWithdrawal = await Transaction.findOne({
      userId,
      type: { $in: ['withdrawal_diamond', 'withdrawal_bvr', 'withdrawal'] },
      status: 'pending',
    });
    if (pendingWithdrawal) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending withdrawal. Wait until it is processed.',
      });
    }

    const lastCompletedWithdrawal = await Transaction.findOne({
      userId,
      type: { $in: ['withdrawal_diamond', 'withdrawal_bvr', 'withdrawal'] },
      status: 'completed',
    }).sort({ processedAt: -1 });

    if (lastCompletedWithdrawal && lastCompletedWithdrawal.processedAt) {
      const elapsed = Date.now() - new Date(lastCompletedWithdrawal.processedAt).getTime();
      if (elapsed < MS_24H) {
        const waitMs = MS_24H - elapsed;
        return res.status(429).json({
          success: false,
          message: 'You can submit a new withdrawal request 24 hours after the last one was validated.',
          retryAfterMs: waitMs,
        });
      }
    }

    // Get game state to check balance and deduct resources
    const gameState = await GameState.findOne({ userId });
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: 'Game state not found'
      });
    }

    // Determine what to deduct based on transaction type and currency
    if (type === 'withdrawal_diamond' || currency === 'Diamond' || currency === 'DIAMOND') {
      // Min withdrawal: 2 diamonds ($2) — 1 diamond = $1
      const MIN_DIAMOND_WITHDRAWAL = 2;
      if (amount < MIN_DIAMOND_WITHDRAWAL) {
        return res.status(400).json({
          success: false,
          message: `Minimum withdrawal is ${MIN_DIAMOND_WITHDRAWAL} diamonds ($2)`,
          minimum: MIN_DIAMOND_WITHDRAWAL
        });
      }
      // For diamond withdrawals, deduct diamonds
      if (gameState.diamonds < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient diamonds',
          current: gameState.diamonds,
          required: amount
        });
      }
      gameState.diamonds -= amount;
      console.log(`💎 Deducted ${amount} diamonds from user ${userId}. Remaining: ${gameState.diamonds}`);
    } else if (currency === 'BVR' || type === 'withdrawal_bvr') {
      // For BVR withdrawals: 100 BVR coins = 1 BVR token
      // amount is in coins, we need to deduct coins but store token amount
      if (gameState.bvrCoins < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient BVR coins',
          current: gameState.bvrCoins,
          required: amount
        });
      }
      gameState.bvrCoins -= amount;
      // Convert coins to tokens: 100 coins = 1 token
      const tokenAmount = amount / 100;
      console.log(`🪙 Deducted ${amount} BVR coins from user ${userId}. Converting to ${tokenAmount} BVR tokens. Remaining: ${gameState.bvrCoins}`);
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
      console.log(`🌸 Deducted ${amount} flowers from user ${userId}. Remaining: ${gameState.flowers}`);
    }

    await gameState.save();

    // Create withdrawal transaction
    // For BVR withdrawals, store token amount (what will actually be sent)
    // For other withdrawals, store the amount as-is
    const transactionAmount = (currency === 'BVR' || type === 'withdrawal_bvr') ? (amount / 100) : amount;
    const transaction = new Transaction({
      userId,
      type: type || 'withdrawal',
      amount: transactionAmount,
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
      remainingFlowers: gameState.flowers,
      remainingDiamonds: gameState.diamonds,
      remainingBvrCoins: gameState.bvrCoins
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

    if (type === 'deposit_crypto') {
      const MS_1H = 60 * 60 * 1000;
      const lastDeposit = await Transaction.findOne({
        userId,
        type: 'deposit_crypto',
      }).sort({ createdAt: -1 });

      if (lastDeposit && lastDeposit.createdAt) {
        const elapsed = Date.now() - new Date(lastDeposit.createdAt).getTime();
        if (elapsed < MS_1H) {
          return res.status(429).json({
            success: false,
            message: 'Please wait at least 1 hour between fund transfer (deposit) requests.',
            retryAfterMs: MS_1H - elapsed,
          });
        }
      }
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

module.exports = router;

