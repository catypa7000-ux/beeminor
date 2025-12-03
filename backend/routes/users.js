const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public (should be protected in production)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        referralCode: user.referralCode,
        sponsorCode: user.sponsorCode,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   GET /api/users/referral/:code
// @desc    Get user by referral code
// @access  Public
router.get('/referral/:code', async (req, res) => {
  try {
    const user = await User.findOne({ referralCode: req.params.code.toUpperCase() }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Referral code not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Get user by referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Public (should be protected in production)
router.put('/:id', async (req, res) => {
  try {
    const { email, sponsorCode } = req.body;
    const updates = {};
    
    if (email) updates.email = email.toLowerCase();
    if (sponsorCode !== undefined) updates.sponsorCode = sponsorCode;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        referralCode: user.referralCode,
        sponsorCode: user.sponsorCode
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

module.exports = router;

