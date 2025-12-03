# 🔗 MongoDB Connection Quick Reference

## Test Your Connection

Run the test script:
```bash
cd backend
node test-connection.js
```

## Current Configuration

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE?options
```

**Your Configuration:**
- Username: `abhipatel8675_db_user`
- Password: `HBZ52Jv74nAIa3Yc`
- Cluster: `cluster0.r3ihxch.mongodb.net`
- Database: `beeminor`

## Common Fixes

1. **Authentication Error** → Whitelist IP in Network Access
2. **Connection Timeout** → Check cluster is running
3. **Permission Denied** → Verify user has "Atlas Admin" role

## Files

- `.env` - Contains connection string (NOT in git)
- `test-connection.js` - Test script for debugging
- `FIX_AUTH_NOW.md` - Detailed fix instructions
- `TROUBLESHOOTING.md` - Complete troubleshooting guide

## Quick Links

- MongoDB Atlas Dashboard: https://cloud.mongodb.com/
- Network Access: https://cloud.mongodb.com/v2#/security/network/whitelist
- Database Access: https://cloud.mongodb.com/v2#/security/database/users

