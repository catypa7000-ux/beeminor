# Quick Start Guide - Frontend & Admin Panel

## Step 1: Start Backend Server

Open a **PowerShell terminal** in the backend directory:

```powershell
cd backend
npm start
```

Wait for: `🚀 Backend server running on 0.0.0.0:3001`

---

## Step 2: Start Frontend (Web)

Open a **NEW PowerShell terminal** in the main project directory:

```powershell
# For web browser (recommended for admin panel)
npm run start-web

# OR for mobile app (Expo Go)
npm start
```

Wait for the app to compile and open in your browser.

---

## Step 3: Access Admin Panel

### Method 1: Direct URL (Web)
Once the frontend is running, navigate to:
```
http://localhost:8081/admin
```

Or click on the **Admin** tab in the app navigation.

### Method 2: From App Navigation
1. Open the app in your browser
2. Look for the tab bar at the bottom
3. Click on the **"Admin"** or **"Panel Admin"** tab

---

## Step 4: Login to Admin Panel

**Default Admin Credentials:**
- **Email:** `martinremy100@gmail.com`
- **PIN:** `123456`

1. Enter the email
2. Enter the PIN (6 digits)
3. Click "Se connecter" (Connect)

---

## Admin Panel Features

Once logged in, you'll see tabs:

### 📊 Stats Tab
- Total diamonds, honey, flowers
- Total bees count
- User statistics

### 💎 Resources Tab
- Award resources to users
- Adjust honey, flowers, diamonds, tickets, BVR coins
- Set invited friends count

### ⚙️ Config Tab
- Set crypto addresses (TON, Solana)
- Configure support email
- Change admin PIN
- Toggle language

### 💳 Transactions Tab
- **View pending withdrawals**
- **Approve transactions** → Backend marks as completed
- **Reject transactions** → Backend auto-refunds flowers
- View transaction history

### 📧 Messages Tab
- View support messages from users
- Mark messages as read

---

## Testing Withdrawal Flow

### Test as User:
1. Navigate to **Menu → Retrait** (Withdrawal)
2. Select withdrawal type (diamonds/BVR)
3. Choose network (TON/SOL/BNB)
4. Enter amount and wallet address
5. Click Submit

### Test as Admin:
1. Navigate to **Admin Panel → Transactions Tab**
2. See pending withdrawal
3. Click **"Approuver"** (Approve) or **"Rejeter"** (Reject)
4. Rejection automatically refunds flowers to user

---

## Troubleshooting

### Backend not connecting?
Check `lib/api.ts` - make sure `API_BASE_URL` is:
```typescript
const API_BASE_URL = 'https://960wd305-3001.inc1.devtunnels.ms';
```

### Admin panel not showing?
Make sure you're logged into the app first:
1. Go to Auth screen
2. Login or register
3. Then navigate to Admin tab

### Can't see transactions?
Make sure:
- Backend is running on port 3001
- MongoDB is running on localhost:27017
- You've created at least one transaction

---

## Running Both Servers

**Terminal 1 (Backend):**
```powershell
cd backend
npm start
```

**Terminal 2 (Frontend):**
```powershell
npm run start-web
```

**Your App:**
- Frontend: http://localhost:8081
- Backend API: https://960wd305-3001.inc1.devtunnels.ms/api
- Admin Panel: http://localhost:8081/admin

---

## Default Admin Credentials

**Email:** martinremy100@gmail.com  
**PIN:** 123456

Change these in production!

---

## Quick Commands Reference

```powershell
# Install dependencies (first time)
npm install
cd backend && npm install && cd ..

# Start backend only
npm run backend:start

# Start backend in dev mode (auto-reload)
npm run backend:dev

# Start frontend (web)
npm run start-web

# Start frontend (mobile)
npm start

# Both servers
# Terminal 1: npm run backend:start
# Terminal 2: npm run start-web
```

---

## Admin Panel URL Structure

```
Main App:       http://localhost:8081/
Home Screen:    http://localhost:8081/(tabs)/(home)
Admin Panel:    http://localhost:8081/(tabs)/admin
Withdrawal:     http://localhost:8081/(tabs)/menu/retrait
Shop:           http://localhost:8081/(tabs)/shop
```

Just navigate using the tab bar at the bottom of the app!
