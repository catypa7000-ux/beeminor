# Backend Setup Summary

## ✅ What Was Created

### Express.js Backend Structure

```
backend/
├── server.js                    # Main Express server
├── package.json                 # Backend dependencies (Express, MongoDB, etc.)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── README.md                    # Backend documentation
├── models/                      # MongoDB Models
│   ├── User.js                  # User schema
│   ├── GameState.js             # Game state schema
│   └── Transaction.js           # Transaction schema
└── routes/                      # API Routes
    ├── auth.js                  # Authentication endpoints
    ├── users.js                 # User management endpoints
    ├── game.js                  # Game state endpoints
    ├── leaderboard.js           # Leaderboard endpoints
    ├── transactions.js          # Transaction endpoints
    └── referrals.js             # Referral system endpoints
```

### Frontend API Service

- `lib/api.ts` - Complete API service for connecting to Express backend

### Documentation

- `BACKEND_GUIDE.md` - Complete setup guide
- `backend/README.md` - Backend-specific documentation

## 🎯 Implementation Status

### ✅ Fully Implemented

1. **User Authentication**
   - User registration (plain text password)
   - User login (plain text password)
   - Email checking

2. **User Management**
   - Get user by ID
   - Get user by referral code
   - Update user information

3. **Game State**
   - Get game state for user
   - Update game state
   - Auto-create default game state if missing

4. **Transactions**
   - Create transactions
   - Get user transactions
   - Update transaction status
   - Get all pending transactions (admin)

5. **Leaderboard**
   - Top users by diamonds
   - Top users by honey

6. **Referrals**
   - Get user referrals
   - Check referral code validity

### 🚧 Prepared (Not Implemented)

These endpoints are set up but return "not implemented" messages:
- Password reset
- Buy bee logic
- Upgrade alveole logic
- Collect honey logic
- Referral earnings calculation

## 🚀 How to Get Started

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

Or from root:
```bash
npm run backend:install
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB (varies by OS)
brew services start mongodb-community  # macOS
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string

### Step 3: Configure Environment

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/beeminor
```

### Step 4: Start Backend

```bash
npm run backend:dev
```

You should see:
```
✅ MongoDB Connected
🚀 Backend server running on port 3001
```

### Step 5: Test the API

```bash
# Health check
curl http://localhost:3001/

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔗 Connecting Frontend to Backend

The frontend is ready to connect! You have two options:

### Option 1: Use the New API Service (Recommended)

Use `lib/api.ts` which provides all API functions:

```typescript
import { authAPI } from '@/lib/api';

// Register
const result = await authAPI.register(email, password, sponsorCode);

// Login
const result = await authAPI.login(email, password);

// Get game state
import { gameAPI } from '@/lib/api';
const gameState = await gameAPI.getGameState(userId);
```

### Option 2: Direct Fetch Calls

```typescript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## 📋 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check-email/:email` - Check email exists

### Users
- `GET /api/users/:id` - Get user
- `GET /api/users/referral/:code` - Get user by referral code
- `PUT /api/users/:id` - Update user

### Game
- `GET /api/game/:userId` - Get game state
- `PUT /api/game/:userId` - Update game state

### Transactions
- `GET /api/transactions/:userId` - Get transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id/status` - Update status

### Leaderboard
- `GET /api/leaderboard/top-diamonds?limit=10`
- `GET /api/leaderboard/top-honey?limit=10`

### Referrals
- `GET /api/referrals/:userId` - Get referrals
- `POST /api/referrals/check` - Check referral code

## 🔐 Security Notes

**Current Setup (Development Only):**
- ✅ Plain text passwords (as requested)
- ✅ No JWT authentication (as requested)
- ✅ No session management (as requested)
- ✅ CORS enabled for all origins

**For Production, You Must Add:**
- ⚠️ Password hashing (bcrypt/argon2)
- ⚠️ JWT authentication
- ⚠️ Session management
- ⚠️ Rate limiting
- ⚠️ Input validation
- ⚠️ HTTPS
- ⚠️ CORS restrictions

## 🗄️ Database Models

### User
- `email` (unique)
- `password` (plain text)
- `referralCode` (unique)
- `sponsorCode` (optional)
- `createdAt`, `lastLogin`

### GameState
- `userId` (reference)
- `honey`, `flowers`, `diamonds`, `tickets`, `bvrCoins`
- `bees` (Map)
- `alveoles` (Map)
- `referrals`, `transactions`, etc.

### Transaction
- `userId` (reference)
- `type`, `amount`, `currency`, `status`
- `address`, `cryptoAddress`
- `notes`, `adminNotes`

## 📝 Next Steps

1. ✅ Backend server created
2. ✅ Database models created
3. ✅ API endpoints created
4. ✅ Frontend API service created
5. 🔄 **Update AuthContext** to use backend API
6. 🔄 **Update GameContext** to use backend API
7. 🔄 **Test all endpoints**
8. 🔄 **Implement missing features**

## 🔄 Migrating from tRPC to Express

The old tRPC setup (`lib/trpc.ts`) is still there. To fully migrate:

1. Update `AuthContext.tsx` to use `lib/api.ts` instead of local storage
2. Update `GameContext.tsx` to use `lib/api.ts` for game state
3. Remove tRPC dependencies (optional - can keep for now)

The new Express backend is independent and ready to use!

## 📚 Documentation

- **Quick Start**: See `BACKEND_GUIDE.md`
- **Detailed Docs**: See `backend/README.md`
- **API Examples**: See `BACKEND_GUIDE.md#api-usage-examples`

---

**Everything is set up and ready!** 🎉

Start the backend with `npm run backend:dev` and begin connecting your frontend!

