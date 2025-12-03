# MongoDB Atlas Setup

## Your MongoDB Atlas Credentials

**Username:** `abhipatel8675_db_user`  
**Password:** `HBZ52Jv74nAIa3Yc`  
**Cluster:** `cluster0.r3ihxch.mongodb.net`  
**Database Name:** `beeminor`

## Connection String

```
mongodb+srv://abhipatel8675_db_user:HBZ52Jv74nAIa3Yc@cluster0.r3ihxch.mongodb.net/beeminor?retryWrites=true&w=majority
```

## Setup Instructions

1. **Create `.env` file** in the `backend/` directory:

```env
PORT=3001
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://abhipatel8675_db_user:HBZ52Jv74nAIa3Yc@cluster0.r3ihxch.mongodb.net/beeminor?retryWrites=true&w=majority
```

2. **Make sure `.env` is in `.gitignore`** (should already be there)

3. **Start the backend:**
   ```bash
   npm run backend:dev
   ```

4. **Check connection:**
   - You should see: `✅ MongoDB Connected: cluster0-shard-00-XX.r3ihxch.mongodb.net`

## Important Notes

- ✅ Database name: `beeminor`
- ✅ Collections will be created automatically when you create users/game states
- ✅ Make sure your IP is whitelisted in MongoDB Atlas Network Access
- ✅ Make sure your database user has read/write permissions

## Troubleshooting

### Connection Error?
1. Check MongoDB Atlas → Network Access → Add your IP (or 0.0.0.0/0 for development)
2. Check MongoDB Atlas → Database Access → Verify user credentials
3. Verify connection string is correct

### Database Not Found?
- The database will be created automatically when you create the first document
- Or create it manually in MongoDB Atlas dashboard

