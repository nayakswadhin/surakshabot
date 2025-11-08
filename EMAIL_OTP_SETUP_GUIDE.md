# Email OTP Setup Guide

## 🔧 Gmail App Password Configuration

The Email OTP feature requires Gmail App Password (not your regular Gmail password). Follow these steps:

### Prerequisites

- Gmail account
- 2-Step Verification enabled

### Step 1: Enable 2-Step Verification (if not already enabled)

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left menu
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to set it up (you'll need your phone)

### Step 2: Generate App Password

1. Go to App Passwords page: https://myaccount.google.com/apppasswords

   OR

   - Go to https://myaccount.google.com/
   - Click **Security**
   - Scroll to "Signing in to Google"
   - Click **2-Step Verification**
   - Scroll down to **App passwords**

2. Sign in again if prompted

3. In the "Select app" dropdown, choose **Mail**

4. In the "Select device" dropdown, choose **Other (Custom name)**

5. Enter a name: `SurakshaBot OTP Service`

6. Click **Generate**

7. You'll see a 16-character password like: `abcd efgh ijkl mnop`

8. **Copy this password** (you won't be able to see it again)

### Step 3: Update .env File

Open your `.env` file and update these lines:

```env
# Email Configuration (for OTP verification)
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Important Notes:**

- Remove spaces from the App Password (use: `abcdefghijklmnop`)
- Use your full Gmail address for EMAIL_USER
- Keep these credentials secure and never commit them to Git

### Step 4: Test the Configuration

Run the test script:

```bash
node test-email-otp-complete.js
```

This will:

- ✓ Verify email credentials are configured
- ✓ Test connection to Gmail servers
- ✓ Send a real OTP to your email
- ✓ Test OTP verification logic
- ✓ Test error handling

## 🔍 Troubleshooting

### Error: "Authentication failed" (EAUTH)

**Causes:**

- Wrong App Password
- Using regular Gmail password instead of App Password
- 2-Step Verification not enabled

**Solutions:**

1. Verify 2-Step Verification is enabled
2. Generate a new App Password
3. Remove all spaces from the password in .env
4. Make sure you're using the App Password, not your regular password

### Error: "Connection timeout" (ETIMEDOUT)

**Causes:**

- No internet connection
- Firewall blocking SMTP
- Network proxy issues

**Solutions:**

1. Check your internet connection
2. Try disabling firewall temporarily
3. Check if your network allows SMTP connections (port 587)

### Error: "Invalid email address"

**Causes:**

- Typo in the email address
- Email format is incorrect

**Solutions:**

1. Verify email address has correct format: `name@domain.com`
2. Check for extra spaces or special characters

## 📱 WhatsApp Testing Flow

Once configured, test in WhatsApp:

1. **Send**: `Hello`
2. **Bot**: Shows welcome menu
3. **Click**: "New Complaint"
4. **Bot**: Checks if user exists
5. **Bot**: Starts DiDit verification (if new user)
6. **Bot**: Asks for missing info (pincode, village, father name, **email**)
7. **Enter**: Your email address
8. **Bot**: "Sending OTP to your email... Please wait."
9. **Bot**: "A 6-digit OTP has been sent to: your@email.com"
10. **Check**: Your email inbox/spam for OTP
11. **Enter**: The 6-digit OTP
12. **Bot**: "Email verified successfully! Proceeding with registration..."

### OTP Verification Options

If OTP verification fails, you'll see buttons:

- **Resend OTP**: Get a new OTP (previous one is invalidated)
- **Re-enter Email**: Start over with a different email

### OTP Rules

- ✓ Valid for **10 minutes**
- ✓ Maximum **3 attempts** to enter correct OTP
- ✓ After 3 wrong attempts, must request new OTP
- ✓ Only one active OTP per user at a time

## 🛡️ Security Features

1. **OTP Expiration**: Automatically expires after 10 minutes
2. **Rate Limiting**: Maximum 3 attempts per OTP
3. **Secure Storage**: OTPs stored in memory, not database
4. **Auto Cleanup**: Expired OTPs are automatically removed
5. **Professional Email**: Uses official government formatting

## 📧 Email Template

The OTP email includes:

- Official 1930 Cyber Helpline header
- 6-digit OTP in large, clear text
- Validity period (10 minutes)
- Security warning (don't share OTP)
- Government branding
- Professional footer

## 🎯 Production Deployment

For production use:

1. **Use a dedicated email account** (not personal)
2. **Create organization-specific App Password**
3. **Set up email monitoring** to track delivery rates
4. **Configure backup SMTP** service for redundancy
5. **Enable logging** for audit trail
6. **Test thoroughly** before going live

## 📞 Support

If you encounter issues:

1. Check the logs for detailed error messages
2. Run `node test-email-otp-complete.js` for diagnostics
3. Verify all environment variables are set correctly
4. Check Gmail account security settings
5. Contact system administrator if problems persist

---

**Last Updated**: November 9, 2025
**Feature Version**: 1.0.0
**Status**: Production Ready
