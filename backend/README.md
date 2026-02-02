# Beeminor Backend API

Express.js + MongoDB backend for the Beeminor application.

## 🚀 Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Mongoose** - MongoDB object modeling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🔧 Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

Or from the root directory:
```bash
npm run backend:install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3001
NODE_ENV=development

# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/beeminor

# OR MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beeminor?retryWrites=true&w=majority
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Or use MongoDB Atlas (Cloud):**
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string
- Add it to `.env` as `MONGODB_URI`

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Or from the root directory:
```bash
npm run backend:dev    # Development
npm run backend:start  # Production
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── models/                # MongoDB models
│   ├── User.js
│   ├── GameState.js
│   └── Transaction.js
└── routes/                # API routes
    ├── auth.js            # Authentication routes
    ├── users.js           # User management routes
    ├── game.js            # Game state routes
    ├── leaderboard.js     # Leaderboard routes
    ├── transactions.js    # Transaction routes
    └── referrals.js       # Referral system routes
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/check-email/:email` - Check if email exists

### Users

- `GET /api/users/:id` - Get user by ID
- `GET /api/users/referral/:code` - Get user by referral code
- `PUT /api/users/:id` - Update user

### Game

- `GET /api/game/:userId` - Get game state
- `PUT /api/game/:userId` - Update game state

### Leaderboard

- `GET /api/leaderboard/top-diamonds?limit=10` - Get top users by diamonds
- `GET /api/leaderboard/top-honey?limit=10` - Get top users by honey

### Transactions

- `GET /api/transactions/:userId` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id/status` - Update transaction status
- `GET /api/transactions/pending/all` - Get all pending transactions (admin)

### Referrals

- `GET /api/referrals/:userId` - Get user referrals
- `POST /api/referrals/check` - Check if referral code is valid

## 📝 API Examples

### Register User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "sponsorCode": "ABC12345"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Game State

```bash
curl http://localhost:3001/api/game/USER_ID
```

## 🔐 Security Notes

⚠️ **Important**: This is a development setup. For production:

- ✅ Implement password hashing (bcrypt/argon2)
- ✅ Add JWT authentication
- ✅ Implement rate limiting
- ✅ Add input validation middleware
- ✅ Use HTTPS
- ✅ Add CORS restrictions
- ✅ Implement session management
- ✅ Add API key authentication for admin routes

## 🗄️ Database Models

### User
- email (unique)
- password (plain text - for development only)
- referralCode (unique)
- sponsorCode
- createdAt
- lastLogin

### GameState
- userId (reference to User)
- honey, flowers, diamonds, tickets, bvrCoins
- bees (Map)
- alveoles (Map)
- referrals
- transactions
- etc.

### Transaction
- userId (reference to User)
- type, amount, currency
- status
- address, cryptoAddress
- notes, adminNotes

## 🐛 Troubleshooting

### MongoDB Connection Error

1. Make sure MongoDB is running:
   ```bash
   # Check if MongoDB is running
   mongosh
   ```

2. Verify connection string in `.env`

3. Check firewall settings

### Port Already in Use

Change the PORT in `.env`:
```env
PORT=3002
```

### Module Not Found

Make sure dependencies are installed:
```bash
npm install
```

## 📚 Next Steps

1. Implement password hashing
2. Add JWT authentication
3. Implement game logic endpoints
4. Add validation middleware
5. Add error logging
6. Set up database migrations
7. Add API documentation (Swagger)

## 📄 License

ISC
