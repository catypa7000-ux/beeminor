const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Generate unique referral code
const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { email, password, sponsorCode } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let isUnique = false;
    while (!isUnique) {
      const exists = await User.findOne({ referralCode });
      if (!exists) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // If no sponsor code provided, automatically associate with admin account
    let finalSponsorCode = sponsorCode
      ? sponsorCode.toUpperCase().trim()
      : null;
    if (!finalSponsorCode) {
      const adminUser = await User.findOne({
        email: "martinremy100@gmail.com",
      });
      if (adminUser) {
        finalSponsorCode = adminUser.referralCode;
        console.log(
          `[REGISTRATION] No sponsor code provided, auto-associating with admin: ${adminUser.email} (${adminUser.referralCode})`
        );
      } else {
        console.warn(
          "[REGISTRATION] Admin account (martinremy100@gmail.com) not found. User will have no sponsor."
        );
      }
    }

    // Create new user (plain text password as per requirements)
    const user = new User({
      email: email.toLowerCase(),
      password, // Stored as plain text
      referralCode,
      sponsorCode: finalSponsorCode || null,
    });

    await user.save();

    // Automatically link referral if sponsor code exists
    if (finalSponsorCode) {
      try {
        const GameState = require("../models/GameState");
        // Find the sponsor
        const sponsor = await User.findOne({ referralCode: finalSponsorCode });
        if (sponsor) {
          let sponsorGameState = await GameState.findOne({
            userId: sponsor._id,
          });
          if (!sponsorGameState) {
            // Logic to create default game state (simplified here or just wait for them to log in)
            // But better to create it so we can push the referral
            sponsorGameState = new GameState({
              userId: sponsor._id,
              honey: 100,
              flowers: 100,
              bees: { baby: 0, worker: 0, elite: 0, royal: 0, queen: 0 },
              virtualBees: { virtual1: 1, virtual2: 0, virtual3: 0 },
              alveoles: {
                1: true,
                2: false,
                3: false,
                4: false,
                5: false,
                6: false,
              },
            });
          }

          // Check if already linked (for safety)
          const alreadyLinked = sponsorGameState.referrals.some(
            (r) => r.email === user.email
          );
          if (!alreadyLinked) {
            const invitationBonus = 100;
            sponsorGameState.referrals.push({
              email: user.email,
              referralCode: user.referralCode,
              joinedAt: user.createdAt,
              earnings: invitationBonus,
            });
            sponsorGameState.invitedFriends += 1;
            sponsorGameState.flowers += invitationBonus;
            sponsorGameState.totalReferralEarnings += invitationBonus;
            sponsorGameState.lastUpdated = new Date();
            await sponsorGameState.save();
            console.log(
              `[REGISTRATION] Automatically linked user ${user.email} to sponsor ${sponsor.email}`
            );
          }
        }
      } catch (linkError) {
        console.error("[REGISTRATION] Error auto-linking referral:", linkError);
        // Don't fail registration if linking fails
      }
    }

    // Return user data (without password for security)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id.toString(),
        email: user.email,
        referralCode: user.referralCode,
        sponsorCode: user.sponsorCode,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password (plain text comparison as per requirements)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user data (without password)
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        referralCode: user.referralCode,
        sponsorCode: user.sponsorCode,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
});

// @route   GET /api/auth/check-email
// @desc    Check if email exists
// @access  Public
router.get("/check-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });

    res.json({
      success: true,
      exists: !!user,
    });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking email",
      error: error.message,
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password (placeholder - not implemented)
// @access  Public
router.post("/reset-password", async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Password reset not implemented yet",
  });
});

module.exports = router;
