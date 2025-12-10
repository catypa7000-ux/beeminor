# 🔧 Fix Backend Connection Errors

## Problem
You're seeing these errors:
- `API Error [/api/game/user_xxx]: TypeError: Failed to fetch`
- `Failed to sync game state from backend: TypeError: Failed to fetch`
- `Error adding tickets: TypeError: Failed to fetch`

## Root Cause
The **backend server is not running**. The frontend is trying to connect to `http://localhost:3001` but nothing is listening on that port.

## ✅ Solution

### Step 1: Check if backend is running

Run this diagnostic script:
```bash
node check-backend.js
```

If you see ❌ errors, the backend is not running. Continue to Step 2.

### Step 2: Install backend dependencies (if not done yet)

```bash
npm run backend:install
```

### Step 3: Setup MongoDB connection

The backend needs a MongoDB database. You have two options:

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. The app is already configured with MongoDB Atlas
2. Check if `backend/.env` exists with your MongoDB connection string
3. If not, create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beeminor?retryWrites=true&w=majority
PORT=3001
NODE_ENV=development
```

#### Option B: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/beeminor
PORT=3001
NODE_ENV=development
```

### Step 4: Start the backend server

**In a separate terminal window**, run:

```bash
npm run backend:dev
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Backend server running on 0.0.0.0:3001
📍 API endpoint: http://localhost:3001/api
```

### Step 5: Verify connection

In another terminal, run:
```bash
node check-backend.js
```

You should see:
```
✅ Backend is running! Status: 200
✅ API is responding! Status: 200
```

### Step 6: Restart your Expo app

Stop and restart your Expo development server:
```bash
npm start
```

## 🎯 Quick Start (All-in-one)

If you just want to get it working quickly:

1. **Terminal 1** - Start backend:
```bash
npm run backend:dev
```

2. **Terminal 2** - Start frontend:
```bash
npm start
```

## 🔍 Troubleshooting

### "Cannot connect to MongoDB"
- Check your internet connection (if using MongoDB Atlas)
- Verify MongoDB Atlas network access allows your IP (0.0.0.0/0)
- Check database credentials in backend/.env

### "Port 3001 is already in use"
```bash
# Find and kill process using port 3001
# On Mac/Linux:
lsof -ti:3001 | xargs kill -9

# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### "Module not found" errors
```bash
npm run backend:install
```

### Backend starts but frontend still shows errors
1. Check if `EXPO_PUBLIC_API_BASE_URL` is set correctly
2. Make sure it's `http://localhost:3001` (not https, not different port)
3. Clear Expo cache: `npx expo start -c`

## 📚 Additional Resources

- Backend setup guide: `backend/SETUP_ENV.md`
- Troubleshooting: `backend/TROUBLESHOOTING.md`
- MongoDB setup: `backend/MONGODB_SETUP.md`
- Environment variables: `ENVIRONMENT_VARIABLES.md`

## 🆘 Still Having Issues?

1. Check backend logs for specific error messages
2. Run `node check-backend.js` for diagnostic info
3. Verify MongoDB connection with: `cd backend && node test-connection.js`
4. Make sure no firewall is blocking port 3001

## ✨ Success Checklist

- [ ] Backend dependencies installed (`npm run backend:install`)
- [ ] MongoDB connection configured (backend/.env exists)
- [ ] Backend server running (`npm run backend:dev`)
- [ ] Backend responds to health check (`node check-backend.js`)
- [ ] Frontend connected (no more "Failed to fetch" errors)
- [ ] Game loads and syncs properly

---

**Note:** The backend MUST be running for the app to work properly. The app syncs game state, handles authentication, processes transactions, and manages the leaderboard through the backend API.
