# 🔧 MongoDB Connection Troubleshooting

## ❌ Error: "Authentication failed"

This error means MongoDB Atlas is rejecting your credentials. Here's how to fix it:

### Step 1: Verify Database User Credentials

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **Database Access** (left sidebar)
3. Find user: `abhipatel8675_db_user`
4. Verify:
   - ✅ User exists
   - ✅ Password matches: `HBZ52Jv74nAIa3Yc`
   - ✅ User has **Atlas Admin** or **Read and write to any database** role

**If password is different:**
- Reset the password or update the `.env` file

### Step 2: Whitelist Your IP Address (CRITICAL)

**This is the most common issue!**

1. Go to MongoDB Atlas → **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Choose one:
   - **Option A**: Add your current IP (more secure)
     - Click "Add Current IP Address"
   - **Option B**: Allow all IPs (for development only)
     - IP Address: `0.0.0.0/0`
     - Comment: "Development - allow all"
     - Click "Confirm"
4. Wait 1-2 minutes for changes to propagate

### Step 3: Verify Connection String

Check your `.env` file at `backend/.env`:

```env
MONGODB_URI=mongodb+srv://abhipatel8675_db_user:HBZ52Jv74nAIa3Yc@cluster0.r3ihxch.mongodb.net/beeminor?retryWrites=true&w=majority
```

**Important:**
- No spaces in the connection string
- Password should NOT be URL-encoded (unless it has special characters)
- Database name is `beeminor`

### Step 4: Test Connection

After making changes, restart the backend:

```bash
npm run backend:dev
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-XX.r3ihxch.mongodb.net
📊 Database: beeminor
🚀 Backend server running on port 3001
```

### Step 5: Verify Database User Permissions

1. Go to MongoDB Atlas → **Database Access**
2. Click on `abhipatel8675_db_user`
3. Under **Database User Privileges**, make sure:
   - Built-in Role: **Atlas Admin** OR
   - Custom Role: **Read and write to any database**

### Still Having Issues?

**Check MongoDB Atlas Dashboard:**
1. Go to **Database** → **Browse Collections**
2. See if you can access the database
3. If not, the user doesn't have permissions

**Verify Cluster Status:**
1. Go to **Database** → **Deployments**
2. Make sure cluster is **RUNNING** (not paused)
3. If paused, click "Resume"

**Check Connection String Format:**
- Should start with `mongodb+srv://`
- Format: `mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE?options`
- No spaces or line breaks

## ✅ Quick Fix Checklist

- [ ] IP address whitelisted in Network Access
- [ ] Database user exists and password is correct
- [ ] User has read/write permissions
- [ ] Cluster is running (not paused)
- [ ] Connection string in `.env` is correct (no spaces)
- [ ] Wait 1-2 minutes after IP whitelisting

## 🆘 Still Stuck?

1. **Reset Database User Password:**
   - MongoDB Atlas → Database Access
   - Edit user → Reset password
   - Update `.env` file with new password

2. **Create New Database User:**
   - MongoDB Atlas → Database Access → Add New Database User
   - Username: (choose one)
   - Password: (choose one)
   - Role: Atlas Admin
   - Update `.env` file

3. **Check MongoDB Atlas Status:**
   - Go to https://status.mongodb.com/
   - Verify no outages

---

**After fixing, restart the backend server!**

