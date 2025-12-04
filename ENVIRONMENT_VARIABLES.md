# 🔐 Environment Variables Configuration

## Overview
This document lists all environment variables needed for Beeminor deployment.

---

## 📱 Frontend (Netlify Environment Variables)

Configure these in **Netlify Dashboard → Site Settings → Environment Variables**:

```env
# Backend API URL (REQUIRED)
EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com

# Frontend App URL for referral links (REQUIRED)
EXPO_PUBLIC_APP_URL=https://your-app.netlify.app

# Node environment (auto-set by Netlify)
NODE_ENV=production
```

### How to Set in Netlify:
1. Go to your site in Netlify Dashboard
2. Click "Site settings" → "Environment variables"
3. Click "Add a variable"
4. Enter key and value
5. Click "Create variable"
6. Redeploy site after adding variables

---

## 🖥️ Backend (Server .env file)

Create/update `backend/.env` on your backend server:

```env
# ===========================
# Database Configuration
# ===========================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beeminor?retryWrites=true&w=majority
# Local development: mongodb://localhost:27017/beeminor

# ===========================
# Server Configuration
# ===========================
PORT=3001
NODE_ENV=production

# ===========================
# Frontend URL Configuration
# ===========================
# Used for email notification links (admin panel)
# Use either FRONTEND_URL or APP_URL (both work)
FRONTEND_URL=https://your-app.netlify.app
# Alternative:
# APP_URL=https://your-app.netlify.app

# ===========================
# Email Configuration (Gmail)
# ===========================
EMAIL_USER=saifmoazam9@gmail.com
EMAIL_PASSWORD=aixueogdhyktpycj
EMAIL_FROM=Beeminor <noreply@beeminor.com>
ADMIN_EMAIL=saifmoazam2@gmail.com

# ===========================
# Security (IMPORTANT!)
# ===========================
# Generate a strong random string for JWT
# Example: openssl rand -base64 32
JWT_SECRET=your_super_secret_random_string_here_change_this

# ===========================
# Optional: Crypto Wallets
# ===========================
# USDT_WALLET_ADDRESS=your_usdt_address
# BTC_WALLET_ADDRESS=your_btc_address
```

---

## 🔒 Security Notes

### ⚠️ Never Commit .env Files!

Ensure your `.gitignore` includes:
```gitignore
# Environment variables
.env
.env.local
.env.production
backend/.env
```

### 🔑 Generating Secure Secrets

**JWT Secret:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Gmail App Password:**
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → 2-Step Verification
3. Scroll down → App passwords
4. Select app: "Mail", device: "Other" (name it "Beeminor")
5. Copy the 16-character password (no spaces)

---

## 📋 Variable Usage Reference

### Frontend Variables

| Variable | Where It's Used | Default (Dev) |
|----------|----------------|---------------|
| `EXPO_PUBLIC_API_BASE_URL` | `lib/api.ts` getBaseUrl() | `http://localhost:3001` |
| `EXPO_PUBLIC_APP_URL` | `app/(tabs)/taches/index.tsx` referral links | `https://beegame.app` |

### Backend Variables

| Variable | Where It's Used | Default (Dev) |
|----------|----------------|---------------|
| `FRONTEND_URL` or `APP_URL` | `backend/services/notificationService.js` | `http://localhost:8081` |
| `MONGODB_URI` | All backend routes | `mongodb://localhost:27017/beeminor` |
| `EMAIL_USER` | `backend/config/email.js` | Required |
| `EMAIL_PASSWORD` | `backend/config/email.js` | Required |
| `ADMIN_EMAIL` | `backend/routes/transactions.js` | `martinremy100@gmail.com` |
| `JWT_SECRET` | Authentication middleware | Required |

---

## 🧪 Testing Environment Variables

### Frontend (Local Test)

Create `.env.local` in project root:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
EXPO_PUBLIC_APP_URL=http://localhost:8081
```

Run:
```bash
npx expo start --web
```

### Backend (Local Test)

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/beeminor
PORT=3001
EMAIL_USER=saifmoazam9@gmail.com
EMAIL_PASSWORD=aixueogdhyktpycj
EMAIL_FROM=Beeminor <noreply@beeminor.com>
ADMIN_EMAIL=saifmoazam2@gmail.com
FRONTEND_URL=http://localhost:8081
JWT_SECRET=dev_secret_key_change_in_production
```

Run:
```bash
cd backend
node server.js
```

---

## ✅ Validation Checklist

Before deploying, verify:

### Frontend
- [ ] `EXPO_PUBLIC_API_BASE_URL` points to production backend
- [ ] `EXPO_PUBLIC_APP_URL` matches Netlify URL
- [ ] No localhost URLs in environment variables
- [ ] Variables set in Netlify Dashboard

### Backend
- [ ] `MONGODB_URI` points to production database (not localhost)
- [ ] `FRONTEND_URL` or `APP_URL` matches Netlify URL
- [ ] `EMAIL_USER` and `EMAIL_PASSWORD` are valid Gmail credentials
- [ ] `ADMIN_EMAIL` is correct recipient
- [ ] `JWT_SECRET` is a strong random string (not "dev_secret")
- [ ] `.env` file exists and is loaded by server
- [ ] Server restarted after changing `.env`

---

## 🔄 Updating Variables

### Frontend (Netlify)
1. Netlify Dashboard → Environment Variables
2. Find variable → Click "..." → Edit
3. Update value → Save
4. **Redeploy site** (variables aren't applied until redeploy)

### Backend (Server)
1. SSH into server or edit file
2. Update `backend/.env`
3. **Restart server** (variables aren't reloaded until restart)

```bash
# Restart examples:
# PM2
pm2 restart beeminor-backend

# Systemd
sudo systemctl restart beeminor-backend

# Docker
docker-compose restart backend

# Manual
pkill node
node backend/server.js
```

---

## 🐛 Troubleshooting

### "No base url found" Error

**Problem:** Frontend can't find backend URL

**Solution:**
```bash
# Check Netlify environment variables
# Ensure EXPO_PUBLIC_API_BASE_URL is set
# Redeploy after adding variable
```

### Email Links Go to Localhost

**Problem:** Backend `FRONTEND_URL` not set

**Solution:**
```bash
# Edit backend/.env
FRONTEND_URL=https://your-app.netlify.app

# Restart backend server
pm2 restart beeminor-backend
```

### Referral Links Use Localhost

**Problem:** Frontend `EXPO_PUBLIC_APP_URL` not set

**Solution:**
```bash
# Add to Netlify environment variables
EXPO_PUBLIC_APP_URL=https://your-app.netlify.app

# Redeploy frontend
netlify deploy --prod
```

### Database Connection Failed

**Problem:** MongoDB URI incorrect or database unreachable

**Solution:**
```bash
# Verify MONGODB_URI format
mongodb+srv://username:password@cluster.mongodb.net/dbname

# Check:
# - Username and password are correct
# - IP address whitelisted in MongoDB Atlas
# - Database name exists
```

---

## 📞 Quick Reference

### Development URLs
```
Frontend: http://localhost:8081
Backend: http://localhost:3001
MongoDB: mongodb://localhost:27017/beeminor
```

### Production URLs (Replace with yours)
```
Frontend: https://beeminor.netlify.app
Backend: https://api.beeminor.com
MongoDB: mongodb+srv://[cluster]/beeminor
```

---

**Last Updated:** {{ DATE }}  
**Version:** 1.0.0
