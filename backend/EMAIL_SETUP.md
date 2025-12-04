# Email Notification Setup Guide

## Overview
Email notifications have been integrated into the Beeminor backend. Users will receive emails when they:
- Submit a withdrawal request
- Get their withdrawal approved by admin
- Get their withdrawal rejected (with refund confirmation)

## Gmail Setup Instructions

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Under "How you sign in to Google", enable **2-Step Verification**
4. Follow the prompts to set up 2FA (you'll need your phone)

### Step 2: Generate App Password
1. After enabling 2FA, go to: https://myaccount.google.com/apppasswords
2. Or: Google Account → Security → 2-Step Verification → App passwords
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other (custom name)**
5. Enter name: `Beeminor Backend`
6. Click **Generate**
7. **IMPORTANT**: Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
   - You won't be able to see it again!
   - Save it somewhere safe

### Step 3: Configure Backend
1. Navigate to `backend/` folder
2. Create a `.env` file (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your email credentials:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=Beeminor <noreply@beeminor.com>
   ```

   **Example:**
   ```env
   EMAIL_USER=martinremy100@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   EMAIL_FROM=Beeminor <noreply@beeminor.com>
   ```

### Step 4: Restart Backend
```bash
cd backend
npm start
```

Look for these log messages:
- ✅ `Email transporter configured successfully`
- ✅ `Email server is ready to send messages`

If you see warnings about email not being configured, check your `.env` file.

## Email Types

### 1. Withdrawal Submitted
**Sent when:** User submits a withdrawal request
**Contains:**
- Transaction details (amount, currency, type)
- Transaction ID
- Expected processing time
- What happens next

### 2. Withdrawal Approved
**Sent when:** Admin approves a withdrawal
**Contains:**
- Approval confirmation
- Payment processing information
- Transaction details
- Admin notes (if any)
- Expected payment timeline

### 3. Withdrawal Rejected
**Sent when:** Admin rejects a withdrawal
**Contains:**
- Rejection notification
- Reason for rejection (admin notes)
- **Automatic refund confirmation**
- Refunded amount and currency
- What user can do next

## Testing Email Notifications

### Test 1: Withdrawal Submission
1. Open user frontend: http://localhost:8081/menu/retrait
2. Enter amount (e.g., 1000 BVR)
3. Click withdraw button
4. Check email inbox for "Withdrawal Request Received" email

### Test 2: Withdrawal Approval
1. Open admin panel: http://localhost:8081/admin
2. Go to "Transactions" tab
3. Find a pending withdrawal
4. Click "Approve"
5. Check email for "Withdrawal Approved" email

### Test 3: Withdrawal Rejection (with Refund)
1. Open admin panel
2. Find a pending withdrawal
3. Click "Reject" and add a reason
4. Check email for "Withdrawal Rejected - Funds Refunded" email
5. Verify refund is mentioned in the email

## Troubleshooting

### "Email credentials not configured" Warning
**Problem:** Backend starts but emails aren't being sent
**Solution:**
- Check `.env` file exists in `backend/` folder
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Make sure there are no spaces or typos
- Restart the backend after editing `.env`

### "Invalid login" or "Authentication failed"
**Problem:** Gmail rejects the connection
**Solution:**
- Verify 2FA is enabled on your Google Account
- Make sure you're using an **App Password** (not your regular Gmail password)
- Check the App Password is copied correctly (16 characters, may include spaces)
- Try removing spaces from the password: `abcdefghijklmnop`

### "ECONNECTION" or Network Errors
**Problem:** Can't connect to Gmail servers
**Solution:**
- Check your internet connection
- Verify firewall isn't blocking port 587
- Try using a different network
- Check if Gmail SMTP is accessible from your location

### Emails Going to Spam
**Problem:** Emails are received but in spam folder
**Solution:**
- This is normal for new senders
- Users should mark as "Not Spam"
- For production, use a verified domain with SPF/DKIM records
- Consider using SendGrid or Mailgun for better deliverability

### "Email service not configured" in Console
**Problem:** Backend says emails are skipped
**Solution:**
- This means `.env` doesn't have EMAIL_USER/EMAIL_PASSWORD
- Add the credentials as shown in Step 3 above
- Restart the backend server

## Files Created

### Backend Files
```
backend/
├── config/
│   └── email.js                 # Email transporter configuration
├── services/
│   └── notificationService.js   # Email templates and sending logic
├── .env.example                 # Example environment variables
└── .env                         # Your actual credentials (not in git)
```

### Modified Files
- `backend/routes/transactions.js` - Added email notifications
- `backend/server.js` - Added email verification on startup

## Security Notes

1. **Never commit `.env` file to git** - It contains sensitive credentials
2. `.env` is already in `.gitignore`
3. Use **App Passwords**, not your main Gmail password
4. App Passwords are safer because you can revoke them anytime
5. For production, consider using dedicated email services:
   - SendGrid (100 emails/day free)
   - Mailgun (5,000 emails/month free)
   - AWS SES (62,000 emails/month free)

## Gmail Sending Limits

**Free Gmail Account:**
- 500 emails per day
- 100 recipients per email

This should be sufficient for testing and small-scale use. For production with many users, consider upgrading to:
- Google Workspace (2,000 emails/day)
- Dedicated email service (SendGrid, Mailgun, etc.)

## Production Recommendations

When moving to production:
1. ✅ Use a dedicated email service (SendGrid/Mailgun)
2. ✅ Set up SPF and DKIM records for your domain
3. ✅ Use a custom domain email (e.g., noreply@beeminor.com)
4. ✅ Implement email queue system for reliability
5. ✅ Add email logging and monitoring
6. ✅ Handle bounces and unsubscribe requests
7. ✅ Test email rendering across different clients (Gmail, Outlook, etc.)

## Support

If you encounter issues:
1. Check backend console logs for error messages
2. Verify `.env` file configuration
3. Test Gmail login manually at mail.google.com
4. Ensure 2FA and App Password are set up correctly
5. Check spam folder for test emails

---

**Status:** ✅ Email notifications fully implemented and ready to use!
