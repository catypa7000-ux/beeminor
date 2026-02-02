# Quick Setup - MongoDB Atlas Connection

## ✅ Your MongoDB Atlas Connection String

Copy this into your `backend/.env` file:

```env
PORT=3001
NODE_ENV=development

MONGODB_URI=mongodb+srv://abhipatel8675_db_user:HBZ52Jv74nAIa3Yc@cluster0.r3ihxch.mongodb.net/beeminor?retryWrites=true&w=majority
```

## 🚀 Quick Start

1. **Create `.env` file** in the `backend/` folder:
   ```bash
   cd backend
   ```

2. **Copy the connection string above** into a new file called `.env`

3. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

4. **Start the backend:**
   ```bash
   npm run dev
   ```

   Or from root directory:
   ```bash
   npm run backend:dev
   ```

5. **You should see:**
   ```
   ✅ MongoDB Connected: cluster0-shard-00-XX.r3ihxch.mongodb.net
   🚀 Backend server running on port 3001
   ```

## ⚠️ Important Checklist

Before starting, make sure:

1. ✅ **Network Access**: Your IP is whitelisted in MongoDB Atlas
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add your current IP or `0.0.0.0/0` for development (less secure)

2. ✅ **Database User**: User has read/write permissions
   - Go to MongoDB Atlas → Database Access
   - Verify user `abhipatel8675_db_user` exists and has read/write access

3. ✅ **Database Name**: Will be created automatically as `beeminor`

## 🔍 Test Connection

Once the backend starts, you can test it:

```bash
curl http://localhost:3001/
```

Should return:
```json
{
  "status": "ok",
  "message": "Beeminor API is running",
  "version": "1.0.0"
}
```

## 🐛 Troubleshooting

**Connection Error?**
- Check MongoDB Atlas Network Access settings
- Verify credentials are correct
- Check if MongoDB Atlas cluster is running

**Still having issues?**
- Check backend logs for detailed error messages
- Verify `.env` file is in the `backend/` directory
- Make sure no spaces in the connection string

---

**Ready to go!** 🎉

