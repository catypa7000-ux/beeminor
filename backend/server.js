const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");
require("dotenv").config();

const app = express();

// Middleware - CORS configuration for cross-origin requests
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);


    const allowedOrigins = [
      "http://localhost:8081",
      "exp://localhost:8081",
      "https://www.beeminor.live",
      "https://beeminor.live",
      process.env.FRONTEND_URL,
      /\.vercel\.app$/,
    ].filter(Boolean);

    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    // Allow all origins in production (you can restrict this later)
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Enable gzip compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9, 6 is default)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with caching for serverless
let cachedDb = null;

// Database connection
const connectDB = async () => {
  try {
    // Use cached connection if available
    if (cachedDb && mongoose.connection.readyState === 1) {
      console.log("✅ Using cached database connection");
      return cachedDb;
    }
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://admin:admin123@localhost:27017/beeminor?authSource=admin";

    // if (!process.env.MONGODB_URI) {
    //   console.warn(
    //     "⚠️  No MONGODB_URI found in .env, using default localhost connection"
    //   );
    // } else {
    //   // Mask password in logs for security
    //   const maskedURI = mongoURI.replace(
    //     /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    //     "mongodb+srv://$1:****@"
    //   );
    //   console.log(`📡 Connecting to MongoDB: ${maskedURI}`);
    // }

    if (!process.env.MONGODB_URI) {
      console.warn("⚠️  No MONGODB_URI found in .env");
    }

    // Connection options optimized for serverless
    const options = {
      serverSelectionTimeoutMS: 5000, // Reduced from 10s for faster failures
      socketTimeoutMS: 30000, // Reduced from 45s
      maxPoolSize: 5, // Reduced from 10 (better for serverless)
      minPoolSize: 0, // Changed from 1 (no minimum for serverless)
      maxIdleTimeMS: 10000, // Reduced from 30s (close idle connections faster)
      retryWrites: true, // Added: retry failed writes
      retryReads: true, // Added: retry failed reads
    };

    // // Connection options for MongoDB Atlas
    // const options = {
    //   serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    //   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    // };

    // const conn = await mongoose.connect(mongoURI, options);
    // console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // console.log(`📊 Database: ${conn.connection.name}`);
    // console.log(`🌐 Ready to accept connections\n`);
    const conn = await mongoose.connect(mongoURI, options);
    cachedDb = conn;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return cachedDb;
  }

  catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }

    throw error;
  }


  // catch (error) {
  //   console.error("\n❌ MongoDB connection error:", error.message);
  //   console.error("Error details:", error.name);

  //   if (
  //     error.message.includes("Authentication failed") ||
  //     error.message.includes("bad auth")
  //   ) {
  //     console.error("\n🔐 AUTHENTICATION FAILED - Troubleshooting steps:\n");
  //     console.error("1. ✅ Check MongoDB Atlas Network Access:");
  //     console.error("   → Go to: https://cloud.mongodb.com/");
  //     console.error('   → Click "Network Access" → "Add IP Address"');
  //     console.error("   → Add 0.0.0.0/0 (Allow from anywhere) for development");
  //     console.error("   → Wait 2 minutes after adding IP\n");

  //     console.error("2. ✅ Verify Database User Credentials:");
  //     console.error('   → Go to MongoDB Atlas → "Database Access"');
  //     console.error("   → Find user: abhipatel8675_db_user");
  //     console.error("   → Verify password matches: HBZ52Jv74nAIa3Yc");
  //     console.error('   → Check user has "Atlas Admin" role\n');

  //     console.error("3. ✅ Check Connection String in backend/.env:");
  //     console.error("   → Make sure MONGODB_URI is correct");
  //     console.error("   → No spaces or special characters");
  //     console.error(
  //       "   → Format: mongodb+srv://USERNAME:PASSWORD@cluster/database\n"
  //     );

  //     console.error("4. ✅ Test Connection:");
  //     console.error(
  //       "   → Try connecting via MongoDB Compass or Atlas dashboard"
  //     );
  //     console.error("   → Verify cluster is running (not paused)\n");
  //   } else if (
  //     error.message.includes("ENOTFOUND") ||
  //     error.message.includes("getaddrinfo")
  //   ) {
  //     console.error("\n🌐 NETWORK ERROR - Troubleshooting:\n");
  //     console.error("1. Check your internet connection");
  //     console.error("2. Verify MongoDB Atlas cluster is running");
  //     console.error("3. Check if firewall is blocking connections\n");
  //   }

  //   console.error("💡 For detailed help, see: backend/TROUBLESHOOTING.md\n");
  //   process.exit(1);
  // }
};

// Initialize database connection
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
})

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/game", require("./routes/game"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/referrals", require("./routes/referrals"));

// API base route
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Beeminor API is running",
    version: "1.0.0",
    endpoints: [
      "/api/auth",
      "/api/users",
      "/api/game",
      "/api/leaderboard",
      "/api/transactions",
      "/api/referrals",
    ],
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Beeminor API is running",
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;

  const startServer = async () => {
    await connectDB();

    // Verify email configuration (optional, comment out if causing issues)
    try {
      const { verifyEmailConfig } = require('./config/email');
      await verifyEmailConfig();
    } catch (err) {
      console.warn('⚠️  Email verification skipped:', err.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend server running on 0.0.0.0:${PORT}`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`📍 Health check: http://localhost:${PORT}/`);
    });
  };

  startServer();
}

// Export for Vercel
module.exports = app;

// const PORT = process.env.PORT || 3001;

// // Start server
// const startServer = async () => {
//   await connectDB();

//   // Verify email configuration
//   const { verifyEmailConfig } = require("./config/email");
//   await verifyEmailConfig();

//   app.listen(PORT, "0.0.0.0", () => {
//     console.log(`🚀 Backend server running on 0.0.0.0:${PORT}`);
//     console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
//     console.log(`📍 Health check: http://localhost:${PORT}/`);
//   });
// };

// startServer();

// module.exports = app;
