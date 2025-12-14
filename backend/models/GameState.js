const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  honey: {
    type: Number,
    default: 100
  },
  flowers: {
    type: Number,
    default: 100
  },
  diamonds: {
    type: Number,
    default: 0
  },
  tickets: {
    type: Number,
    default: 0
  },
  bvrCoins: {
    type: Number,
    default: 0
  },
  bees: {
    type: Map,
    of: Number,
    default: {
      baby: 0,
      worker: 0,
      elite: 0,
      royal: 0,
      queen: 0
    }
  },
  virtualBees: {
    type: Map,
    of: Number,
    default: {
      virtual1: 1,
      virtual2: 0,
      virtual3: 0
    }
  },
  alveoles: {
    type: Map,
    of: Boolean,
    default: {
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false
    }
  },
  invitedFriends: {
    type: Number,
    default: 0
  },
  claimedMissions: {
    type: [Number],
    default: []
  },
  referrals: [{
    email: String,
    referralCode: String,
    joinedAt: Date,
    earnings: Number
  }],
  totalReferralEarnings: {
    type: Number,
    default: 0
  },
  hasPendingFunds: {
    type: Boolean,
    default: false
  },
  transactions: [{
    id: String,
    type: String,
    amount: Number,
    currency: String,
    status: String,
    createdAt: Date,
    address: String
  }],
  diamondsThisYear: {
    type: Number,
    default: 0
  },
  yearStartDate: {
    type: String,
    default: () => new Date().getFullYear().toString()
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index is automatically created by unique: true and index: true
// No need to manually add it again

const GameState = mongoose.model('GameState', gameStateSchema);

module.exports = GameState;

