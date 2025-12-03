# Frontend-Backend Connection Guide

## ✅ What Was Updated

### 1. AuthContext - Connected to Backend ✅

The `AuthContext` now uses the backend API for:
- **User Registration** - Calls `/api/auth/register`
- **User Login** - Calls `/api/auth/login`
- **Fallback** - Uses local storage if backend is unavailable

### 2. API Service Created ✅

Created `lib/api.ts` with complete API service functions for:
- Authentication (register, login, checkEmail)
- Users (getUser, updateUser)
- Game state (getGameState, updateGameState)
- Transactions
- Leaderboard
- Referrals

## 🔄 How It Works

### Authentication Flow

1. **User registers** → Calls backend API → Saves to local storage as cache
2. **User logs in** → Calls backend API → Saves to local storage as cache
3. **Backend unavailable** → Falls back to local storage (offline mode)

### Game State (Still Local - Can Be Connected)

Currently, `GameContext` still uses local storage. To connect it to backend:

1. Get current user ID from `AuthContext`
2. Load game state from backend when user logs in
3. Save game state to backend when changes occur

## 📝 Next Steps to Complete Connection

### Step 1: Update GameContext to Use Backend

You'll need to:
1. Import `useAuth` to get current user ID
2. Import `gameAPI` from `lib/api`
3. Load game state from backend when user is authenticated
4. Save game state to backend when state changes

### Step 2: Update Leaderboard

Connect leaderboard to backend API endpoints.

### Step 3: Update Transactions

Connect transaction management to backend API.

## 🚀 Testing the Connection

1. **Start Backend:**
   ```bash
   npm run backend:dev
   ```

2. **Start Frontend:**
   ```bash
   npm run start-web
   ```

3. **Test Registration:**
   - Register a new user
   - Check backend logs to see API call
   - Check MongoDB to see user created

4. **Test Login:**
   - Login with registered user
   - Check backend logs

## 🔍 Current Status

- ✅ AuthContext connected to backend
- ✅ API service created and ready
- ⏳ GameContext still uses local storage (needs update)
- ⏳ Leaderboard can be connected
- ⏳ Transactions can be connected

## 📚 API Usage Examples

### In Your Components

```typescript
import { authAPI, gameAPI } from '@/lib/api';

// Register
const result = await authAPI.register(email, password, sponsorCode);
if (result.success) {
  console.log('User registered:', result.user);
}

// Login
const result = await authAPI.login(email, password);
if (result.success) {
  console.log('User logged in:', result.user);
}

// Get game state
const gameState = await gameAPI.getGameState(userId);
console.log('Game state:', gameState.gameState);

// Update game state
await gameAPI.updateGameState(userId, {
  honey: 500,
  diamonds: 100
});
```

## 🔧 Configuration

Make sure your `.env` file (or environment) has:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

Or it will default to `http://localhost:3001` in development mode.

