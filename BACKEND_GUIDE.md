# Backend Setup Guide - Express.js + MongoDB

Complete guide for setting up and running the Beeminor backend API.

## 📋 Overview

The backend is built with:
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Node.js** - Runtime

## 🚀 Quick Start

### 1. Install Dependencies

From the root directory:
```bash
npm run backend:install
```

Or manually:
```bash
cd backend
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**

1. Install MongoDB:
   ```bash
   # macOS
   brew install mongodb-community
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install mongodb
   
   # Windows - Download from mongodb.com
   ```

2. Start MongoDB:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

**Option B: MongoDB Atlas (Cloud - Recommended)**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Use it in `.env` file

### 3. Configure Environment

Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=development

# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/beeminor

# For MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beeminor?retryWrites=true&w=majority
```

### 4. Start the Backend

**Development mode (auto-reload):**
```bash
npm run backend:dev
```

**Production mode:**
```bash
npm run backend:start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Backend server running on port 3001
📍 API endpoint: http://localhost:3001/api
📍 Health check: http://localhost:3001/
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/check-email/:email` | Check if email exists |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/referral/:code` | Get user by referral code |
| PUT | `/api/users/:id` | Update user |

### Game

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/game/:userId` | Get game state |
| PUT | `/api/game/:userId` | Update game state |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/:userId` | Get user transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id/status` | Update transaction status |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/top-diamonds` | Top users by diamonds |
| GET | `/api/leaderboard/top-honey` | Top users by honey |

### Referrals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referrals/:userId` | Get user referrals |
| POST | `/api/referrals/check` | Check referral code |

## 📝 API Usage Examples

### Register a User

```javascript
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    sponsorCode: 'ABC12345' // optional
  })
});

const data = await response.json();
console.log(data);
// {
//   success: true,
//   message: "User registered successfully",
//   user: { id, email, referralCode, sponsorCode, createdAt }
// }
```

### Login

```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

### Get Game State

```javascript
const response = await fetch(`http://localhost:3001/api/game/${userId}`);
const data = await response.json();
```

## 🔗 Connect Frontend

The frontend is already configured to connect to the backend. Make sure:

1. Backend is running on port 3001
2. Frontend has access to `EXPO_PUBLIC_API_BASE_URL` environment variable (or defaults to `http://localhost:3001`)

The frontend uses the API service in `lib/api.ts` to communicate with the backend.

## 🗄️ Database Schema

### User Collection
```javascript
{
  email: String (unique),
  password: String (plain text - development only),
  referralCode: String (unique),
  sponsorCode: String (optional),
  createdAt: Date,
  lastLogin: Date
}
```

### GameState Collection
```javascript
{
  userId: ObjectId (reference to User),
  honey: Number,
  flowers: Number,
  diamonds: Number,
  tickets: Number,
  bvrCoins: Number,
  bees: Map<String, Number>,
  alveoles: Map<Number, Boolean>,
  referrals: Array,
  transactions: Array,
  // ... more fields
}
```

### Transaction Collection
```javascript
{
  userId: ObjectId (reference to User),
  type: String (deposit/withdrawal/exchange),
  amount: Number,
  currency: String,
  status: String (pending/completed/failed),
  address: String,
  cryptoAddress: String,
  // ... more fields
}
```

## ✅ Current Implementation Status

### ✅ Implemented
- User registration (plain text password)
- User login (plain text password)
- User management
- Game state storage
- Transaction management (basic)
- Referral system (basic)
- Leaderboard (basic)

### 🚧 Prepared (Not Implemented)
- Password reset
- Buy bee logic
- Upgrade alveole logic
- Collect honey logic
- Referral earnings calculation
- Advanced game features

## 🔐 Security Notes

⚠️ **This is a development setup. For production you MUST:**

1. **Hash passwords** using bcrypt or argon2
2. **Add JWT authentication** for protected routes
3. **Implement rate limiting** to prevent abuse
4. **Add input validation** middleware
5. **Use HTTPS** for all connections
6. **Add CORS restrictions** to specific domains
7. **Implement session management**
8. **Add API authentication** for admin routes
9. **Sanitize user inputs** to prevent injection attacks
10. **Add logging** and monitoring

## 🐛 Troubleshooting

### MongoDB Connection Failed

1. Check if MongoDB is running:
   ```bash
   mongosh
   # or
   mongo
   ```

2. Verify connection string in `.env`

3. Check MongoDB logs

### Port Already in Use

Change PORT in `backend/.env`:
```env
PORT=3002
```

Don't forget to update frontend `EXPO_PUBLIC_API_BASE_URL` accordingly.

### Module Not Found

```bash
cd backend
rm -rf node_modules
npm install
```

### CORS Errors

CORS is enabled for all origins in development. For production, restrict it to your frontend domain.

## 📚 Next Steps

1. ✅ Backend is set up and running
2. ✅ Database is connected
3. ✅ Basic API endpoints are working
4. 🔄 Connect frontend to use backend APIs
5. 🔄 Test all endpoints
6. 🔄 Implement missing features
7. 🔄 Add authentication (JWT)
8. 🔄 Add password hashing

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)

---

**Need help?** Check the backend README.md or server logs for more details.

