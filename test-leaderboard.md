# Leaderboard & Analytics Test Guide

## Test All Leaderboard Endpoints

### 1. Top Diamonds Leaderboard
```
GET http://localhost:3001/api/leaderboard/top-diamonds?limit=10
```
Expected:
- List of top 10 users sorted by diamonds
- Each entry shows: rank, userId, email, referralCode, diamonds

### 2. Top Honey Leaderboard
```
GET http://localhost:3001/api/leaderboard/top-honey?limit=10
```
Expected:
- List of top 10 users sorted by honey
- Each entry shows: rank, userId, email, referralCode, honey

### 3. Top Referrers Leaderboard
```
GET http://localhost:3001/api/leaderboard/top-referrers?limit=10
```
Expected:
- List of top 10 users sorted by referral earnings
- Each entry shows: rank, userId, email, referralCode, totalReferralEarnings, invitedFriends

### 4. User Rank (Your Position)
```
GET http://localhost:3001/api/leaderboard/user-rank/6930a425b2468df4e5b54e4e
```
Expected:
- Your rank in diamonds category (e.g., "rank: 1, total: 5, value: 150")
- Your rank in honey category
- Your rank in referrals category
- Shows your position out of total users

### 5. Global Statistics
```
GET http://localhost:3001/api/leaderboard/stats
```
Expected:
- Total users in the game
- Total diamonds across all users
- Total honey across all users
- Total flowers across all users
- Total bees across all users
- Total referrals (invited friends)
- Total referral earnings

## Test Scenarios

### Scenario 1: Verify Your Rank
1. Get your game state to see your stats:
   ```
   GET http://localhost:3001/api/game/6930a425b2468df4e5b54e4e
   ```
2. Get your rank:
   ```
   GET http://localhost:3001/api/leaderboard/user-rank/6930a425b2468df4e5b54e4e
   ```
3. Compare your diamonds/honey values with leaderboard position

### Scenario 2: Check if Rankings Update
1. Note your current diamond rank
2. Sell honey to get more diamonds:
   ```
   POST http://localhost:3001/api/game/6930a425b2468df4e5b54e4e/sell-honey
   Body: {"amount": 1000}
   ```
3. Check rank again - it should update:
   ```
   GET http://localhost:3001/api/leaderboard/user-rank/6930a425b2468df4e5b54e4e
   ```

### Scenario 3: Global Stats Match
1. Get global stats:
   ```
   GET http://localhost:3001/api/leaderboard/stats
   ```
2. Get top diamonds leaderboard:
   ```
   GET http://localhost:3001/api/leaderboard/top-diamonds?limit=100
   ```
3. Manually add up top users' diamonds - should be close to global total

### Scenario 4: Referral Leaderboard
1. Check current referral ranking:
   ```
   GET http://localhost:3001/api/leaderboard/top-referrers?limit=10
   ```
2. Process a referral bonus:
   ```
   POST http://localhost:3001/api/game/6930a425b2468df4e5b54e4e/process-referral
   Body: {"amount": 10000}
   ```
3. Check if totalReferralEarnings increased:
   ```
   GET http://localhost:3001/api/leaderboard/user-rank/6930a425b2468df4e5b54e4e
   ```

## Expected Results Summary

✅ All leaderboards return properly formatted data
✅ Rankings are sorted correctly
✅ User rank shows correct position
✅ Global stats aggregate correctly
✅ Rankings update in real-time after game actions
✅ Limit parameter works (test with ?limit=5, ?limit=20)

## Notes

- Leaderboards are calculated in real-time from database
- Rankings update immediately after any game action
- User rank API shows your position in all three categories
- Global stats show the entire game economy at a glance
