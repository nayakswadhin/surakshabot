# Email Configuration Troubleshooting Guide

## Current Issue

Gmail is rejecting the app password with error: `Username and Password not accepted`

## Steps to Fix

### Step 1: Verify 2-Step Verification is Enabled

1. Go to https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Make sure it's **turned ON**
4. If it's OFF, turn it ON first

### Step 2: Generate New App Password

1. Go to https://myaccount.google.com/apppasswords
2. You might need to re-login
3. Select:
   - **App**: Mail
   - **Device**: Other (Custom name) - Enter "SurakshaBot OTP"
4. Click **Generate**
5. You'll get a 16-character password (like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File

1. Open `.env` file
2. Update the following lines:
   ```
   SMTP_EMAIL=adityashravan2003@gmail.com
   SMTP_PASSWORD=your-16-character-app-password-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   ```
3. Replace `your-16-character-app-password-here` with the password from Step 2
4. You can keep the spaces or remove them - the code will handle both

### Step 4: Test Again

Run the test script:

```powershell
node test-email-sending.js
```

## Common Issues

### Issue 1: "Less secure app access"

- This is deprecated by Google
- You MUST use App Passwords instead
- Regular Gmail password won't work

### Issue 2: App Password Not Available

- Make sure 2-Step Verification is enabled first
- Some accounts (work/school) might have this disabled by admin

### Issue 3: Still Not Working

- Try logging out and logging back in to Google Account
- Generate a fresh app password
- Make sure you're using the account: adityashravan2003@gmail.com

## Alternative: Use a Different Gmail Account

If the above doesn't work, you can:

1. Create a new Gmail account specifically for this bot
2. Enable 2-Step Verification
3. Generate App Password
4. Update SMTP_EMAIL and SMTP_PASSWORD in .env

## Questions to Answer

1. Is 2-Step Verification enabled on adityashravan2003@gmail.com?
2. Did you copy the app password correctly (all 16 characters)?
3. Can you try generating a new app password?
