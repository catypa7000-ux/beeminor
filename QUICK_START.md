# 🚀 Quick Start Guide

## ✅ MongoDB Atlas Configured!

Your MongoDB Atlas connection is now set up with:
- **Username**: `abhipatel8675_db_user`
- **Cluster**: `cluster0.r3ihxch.mongodb.net`
- **Database**: `beeminor`

The `.env` file has been created in the `backend/` directory.

## 📋 Before You Start

### 1. MongoDB Atlas Network Access ⚠️ IMPORTANT

You need to whitelist your IP address:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Either:
   - Add your current IP address, OR
   - Add `0.0.0.0/0` for development (allows all IPs - less secure but convenient)

### 2. Verify Database User

Make sure the database user has read/write permissions:
1. Go to **Database Access** in MongoDB Atlas
2. Verify `abhipatel8675_db_user` exists
3. Make sure it has **Atlas Admin** or **Read and write to any database** role

## 🚀 Start the Backend

1. **Install dependencies** (if not done):
   ```bash
   cd backend
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

   Or from root directory:
   ```bash
   npm run backend:dev
   ```

3. **You should see**:
   ```
   ✅ MongoDB Connected: cluster0-shard-00-XX.r3ihxch.mongodb.net
   🚀 Backend server running on port 3001
   📍 API endpoint: http://localhost:3001/api
   ```

## 🧪 Test the Connection

Once the backend is running, test it:

```bash
curl http://localhost:3001/
```

Or open in browser: `http://localhost:3001/`

Should return:
```json
{
  "status": "ok",
  "message": "Beeminor API is running",
  "version": "1.0.0"
}
```

## 🎯 Next Steps

1. ✅ Backend is configured
2. ✅ MongoDB connection is set up
3. 🔄 **Start the backend**: `npm run backend:dev`
4. 🔄 **Start the frontend**: `npm run start-web`
5. 🔄 **Test registration/login** → Check MongoDB Atlas to see data

## 📁 Your Configuration

The `.env` file is located at:
```
backend/.env
```

**⚠️ IMPORTANT**: The `.env` file contains sensitive credentials and is in `.gitignore` - it won't be committed to git.

## 🐛 Troubleshooting

### "MongoDB connection error"
- Check MongoDB Atlas → Network Access → Add your IP
- Verify credentials in the `.env` file
- Check if MongoDB Atlas cluster is running

### "Authentication failed"
- Verify username and password in MongoDB Atlas
- Check Database Access permissions

### "Network timeout"
- Check your internet connection
- Verify MongoDB Atlas cluster is accessible

---

**Ready to start?** Run `npm run backend:dev` and you're good to go! 🎉

