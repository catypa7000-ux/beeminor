const { sendEmail } = require('../config/email');

/**
 * Notification Service
 * Handles all email notifications for the Beeminor application
 */

/**
 * Format currency for display
 */
const formatCurrency = (amount, currency) => {
  if (currency === 'BVR') {
    return `${amount.toLocaleString()} BVR`;
  } else if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'Diamond' || currency === 'DIAMOND') {
    return `${amount.toLocaleString()} Diamond${amount !== 1 ? 's' : ''}`;
  } else {
    return `${amount} ${currency}`;
  }
};

/**
 * Format transaction type for display
 */
const formatTransactionType = (type) => {
  const typeMap = {
    'withdrawal': 'Withdrawal',
    'withdrawal_bvr': 'BVR Withdrawal',
    'withdrawal_diamond': 'Diamond Withdrawal',
    'deposit': 'Deposit',
    'deposit_crypto': 'Crypto Deposit',
    'exchange': 'Exchange',
    'flower_purchase': 'Flower Purchase'
  };
  return typeMap[type] || type;
};

/**
 * Send withdrawal submission notification to admin
 */
const sendWithdrawalSubmittedNotification = async (adminEmail, transaction, userEmail) => {
  // Get frontend URL from environment variable
  const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:8081';
  const adminPanelUrl = `${frontendUrl}/admin`;
  
  const subject = '🔔 New Withdrawal Request - Beeminor Admin';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #f39c12; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #e74c3c; margin: 20px 0; border-radius: 5px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: bold; color: #e74c3c; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Withdrawal Request</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Action Required - Admin Panel</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #856404;">
              ⚠️ A user has submitted a new withdrawal request that requires your approval.
            </p>
          </div>

          <p><strong>Hello Admin,</strong></p>
          <p>A withdrawal request has been submitted and is awaiting your review in the admin panel.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #e74c3c;">Transaction Details</h3>
            <div class="info-row">
              <span class="info-label">User Email:</span>
              <span style="font-weight: bold;">${userEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Type:</span>
              <span>${formatTransactionType(transaction.type)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Amount:</span>
              <span style="font-weight: bold; font-size: 18px; color: #e74c3c;">${formatCurrency(transaction.amount, transaction.currency)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span style="color: #f39c12; font-weight: bold;">⏳ Pending Review</span>
            </div>
            ${transaction.address ? `
            <div class="info-row">
              <span class="info-label">Payment Address:</span>
              <span style="font-size: 12px;">${transaction.address}</span>
            </div>
            ` : ''}
            ${transaction.cryptoAddress ? `
            <div class="info-row">
              <span class="info-label">Crypto Address:</span>
              <span style="font-size: 12px;">${transaction.cryptoAddress}</span>
            </div>
            ` : ''}
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Transaction ID:</span>
              <span style="font-size: 12px; color: #999;">${transaction._id}</span>
            </div>
          </div>

          <p><strong>Required Actions:</strong></p>
          <ul>
            <li><strong>Review</strong> the transaction details above</li>
            <li><strong>Verify</strong> the user's account and payment address</li>
            <li><strong>Approve or Reject</strong> the request in the admin panel</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${adminPanelUrl}" class="button">
              Open Admin Panel →
            </a>
          </div>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            <em>💡 Tip: Go to Admin Panel → Transactions Tab to process this request.</em>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated admin notification from Beeminor.</p>
          <p>&copy; 2025 Beeminor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
🔔 New Withdrawal Request - Admin Action Required

Hello Admin,

A withdrawal request has been submitted and is awaiting your review in the admin panel.

Transaction Details:
- User Email: ${userEmail}
- Type: ${formatTransactionType(transaction.type)}
- Amount: ${formatCurrency(transaction.amount, transaction.currency)}
- Status: ⏳ Pending Review
${transaction.address ? `- Payment Address: ${transaction.address}` : ''}
${transaction.cryptoAddress ? `- Crypto Address: ${transaction.cryptoAddress}` : ''}
- Transaction ID: ${transaction._id}

Required Actions:
- Review the transaction details above
- Verify the user's account and payment address
- Approve or Reject the request in the admin panel

Admin Panel: ${adminPanelUrl}

💡 Tip: Go to Admin Panel → Transactions Tab to process this request.

This is an automated admin notification from Beeminor.
© 2025 Beeminor. All rights reserved.
  `;

  return await sendEmail({
    to: adminEmail,
    subject: subject,
    html: html,
    text: text
  });
};

/**
 * Send withdrawal approval notification to user
 */
const sendWithdrawalApprovedNotification = async (userEmail, transaction) => {
  const subject = '✅ Withdrawal Approved - Payment Processing';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: bold; color: #28a745; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .checkmark { font-size: 48px; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="checkmark">✅</div>
          <h1>Withdrawal Approved!</h1>
        </div>
        <div class="content">
          <div class="success-box">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #155724;">
              Great news! Your withdrawal request has been approved and is now being processed.
            </p>
          </div>

          <p>Hello,</p>
          <p>Your withdrawal request has been reviewed and approved by our admin team. Payment processing has begun.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #28a745;">Transaction Details</h3>
            <div class="info-row">
              <span class="info-label">Type:</span>
              <span>${formatTransactionType(transaction.type)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Amount:</span>
              <span style="font-weight: bold; font-size: 18px; color: #28a745;">${formatCurrency(transaction.amount, transaction.currency)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span style="color: #28a745; font-weight: bold;">✅ Approved</span>
            </div>
            ${transaction.address ? `
            <div class="info-row">
              <span class="info-label">Payment To:</span>
              <span style="font-size: 12px;">${transaction.address}</span>
            </div>
            ` : ''}
            ${transaction.cryptoAddress ? `
            <div class="info-row">
              <span class="info-label">Crypto Address:</span>
              <span style="font-size: 12px;">${transaction.cryptoAddress}</span>
            </div>
            ` : ''}
            ${transaction.adminNotes ? `
            <div class="info-row">
              <span class="info-label">Admin Notes:</span>
              <span>${transaction.adminNotes}</span>
            </div>
            ` : ''}
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Transaction ID:</span>
              <span style="font-size: 12px; color: #999;">${transaction._id}</span>
            </div>
          </div>

          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Payment is being processed to your provided address</li>
            <li>Depending on the payment method, it may take 1-5 business days to receive funds</li>
            <li>You can track your transaction history in your account dashboard</li>
          </ul>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            <em>Thank you for using Beeminor! If you have any questions, please contact our support team.</em>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from Beeminor. Please do not reply to this email.</p>
          <p>&copy; 2025 Beeminor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
✅ Withdrawal Approved - Payment Processing

Great news! Your withdrawal request has been approved and is now being processed.

Hello,

Your withdrawal request has been reviewed and approved by our admin team. Payment processing has begun.

Transaction Details:
- Type: ${formatTransactionType(transaction.type)}
- Amount: ${formatCurrency(transaction.amount, transaction.currency)}
- Status: ✅ Approved
${transaction.address ? `- Payment To: ${transaction.address}` : ''}
${transaction.cryptoAddress ? `- Crypto Address: ${transaction.cryptoAddress}` : ''}
${transaction.adminNotes ? `- Admin Notes: ${transaction.adminNotes}` : ''}
- Transaction ID: ${transaction._id}

What happens next?
- Payment is being processed to your provided address
- Depending on the payment method, it may take 1-5 business days to receive funds
- You can track your transaction history in your account dashboard

Thank you for using Beeminor!

This is an automated message from Beeminor.
© 2025 Beeminor. All rights reserved.
  `;

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
    text: text
  });
};

/**
 * Send withdrawal rejection notification to user
 */
const sendWithdrawalRejectedNotification = async (userEmail, transaction, refundedAmount, refundedCurrency) => {
  const subject = '❌ Withdrawal Request Rejected - Funds Refunded';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .refund-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #dc3545; margin: 20px 0; border-radius: 5px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: bold; color: #dc3545; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Withdrawal Request Rejected</h1>
        </div>
        <div class="content">
          <div class="warning-box">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #856404;">
              Your withdrawal request has been rejected by our admin team.
            </p>
          </div>

          <p>Hello,</p>
          <p>Unfortunately, your withdrawal request could not be approved at this time.</p>

          ${transaction.adminNotes ? `
          <div style="background: white; padding: 15px; border-left: 3px solid #dc3545; margin: 20px 0;">
            <strong style="color: #dc3545;">Rejection Reason:</strong>
            <p style="margin: 10px 0 0 0;">${transaction.adminNotes}</p>
          </div>
          ` : ''}
          
          <div class="refund-box">
            <h3 style="margin-top: 0; color: #0c5460;">💰 Automatic Refund Processed</h3>
            <p style="margin: 0;">
              <strong style="font-size: 18px; color: #17a2b8;">${formatCurrency(refundedAmount, refundedCurrency)}</strong> 
              has been automatically refunded to your account.
            </p>
          </div>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #dc3545;">Transaction Details</h3>
            <div class="info-row">
              <span class="info-label">Type:</span>
              <span>${formatTransactionType(transaction.type)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Requested Amount:</span>
              <span>${formatCurrency(transaction.amount, transaction.currency)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Refunded Amount:</span>
              <span style="font-weight: bold; color: #17a2b8;">${formatCurrency(refundedAmount, refundedCurrency)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span style="color: #dc3545; font-weight: bold;">❌ Rejected</span>
            </div>
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Transaction ID:</span>
              <span style="font-size: 12px; color: #999;">${transaction._id}</span>
            </div>
          </div>

          <p><strong>What can you do?</strong></p>
          <ul>
            <li>Your ${refundedCurrency === 'BVR' ? 'BVR coins' : refundedCurrency === 'USD' ? 'flowers' : 'funds'} have been returned to your account</li>
            <li>You can check your balance in your account dashboard</li>
            <li>You can submit a new withdrawal request if you'd like to try again</li>
            <li>If you have questions about this rejection, please contact our support team</li>
          </ul>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            <em>We apologize for any inconvenience. Please ensure all withdrawal details are correct before submitting a new request.</em>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from Beeminor. Please do not reply to this email.</p>
          <p>&copy; 2025 Beeminor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
❌ Withdrawal Request Rejected - Funds Refunded

Your withdrawal request has been rejected by our admin team.

Hello,

Unfortunately, your withdrawal request could not be approved at this time.

${transaction.adminNotes ? `Rejection Reason: ${transaction.adminNotes}\n` : ''}

💰 AUTOMATIC REFUND PROCESSED
${formatCurrency(refundedAmount, refundedCurrency)} has been automatically refunded to your account.

Transaction Details:
- Type: ${formatTransactionType(transaction.type)}
- Requested Amount: ${formatCurrency(transaction.amount, transaction.currency)}
- Refunded Amount: ${formatCurrency(refundedAmount, refundedCurrency)}
- Status: ❌ Rejected
- Transaction ID: ${transaction._id}

What can you do?
- Your ${refundedCurrency === 'BVR' ? 'BVR coins' : refundedCurrency === 'USD' ? 'flowers' : 'funds'} have been returned to your account
- You can check your balance in your account dashboard
- You can submit a new withdrawal request if you'd like to try again
- If you have questions about this rejection, please contact our support team

We apologize for any inconvenience.

This is an automated message from Beeminor.
© 2025 Beeminor. All rights reserved.
  `;

  return await sendEmail({
    to: userEmail,
    subject: subject,
    html: html,
    text: text
  });
};

module.exports = {
  sendWithdrawalSubmittedNotification,
  sendWithdrawalApprovedNotification,
  sendWithdrawalRejectedNotification
};
