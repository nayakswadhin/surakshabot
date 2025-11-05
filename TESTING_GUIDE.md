# WhatsApp Bot Testing Guide

## Current Issue Fixed ✅

**Problem**: When user enters name during registration, bot was restarting and showing welcome message instead of continuing to next step.

**Solution**:

1. Fixed session state checking priority - now checks active session first before greeting detection
2. Improved greeting detection to be more specific
3. Added comprehensive logging for debugging
4. Better session state management

## Testing Flow

### Step 1: Start Conversation

Send: `Hello`
Expected Response:

```
Welcome to 1930, Cyber Helpline, Odisha. How can I help you?

[A- New Complaint] [B- Status Check] [C- Account Unfreeze]
[D- Other Queries] [Main Menu] [Exit]
```

### Step 2: Select New Complaint

Click: `A- New Complaint`
Expected: Bot checks phone number automatically and either:

- **If user exists**: Shows welcome back message
- **If user doesn't exist**: Shows registration prompt

### Step 3: Registration Flow (for new users)

Click: `Start Registration`
Expected: Bot asks for Full Name

### Step 4: Enter Name

Send: `Swadhin Nayak`
Expected: Bot asks for Father/Spouse/Guardian Name (NOT restart!)

### Step 5: Continue Registration

The bot will ask for each field in sequence:

1. Name ✅
2. Father/Spouse/Guardian Name
3. Date of Birth (DD/MM/YYYY)
4. Phone Number
5. Email ID
6. Gender (buttons: Male/Female/Others)
7. Village/Area
8. Pin Code (will auto-fetch location details)
9. Aadhar Number
10. Confirmation screen

## Debugging Information

The server now logs:

- Session state for each message
- Registration step progression
- Validation results
- State transitions

## Key Improvements Made

1. **Session Priority**: Active sessions take priority over greeting detection
2. **Specific Greeting Detection**: Only exact greetings trigger restart
3. **Better Validation**: Async PIN code validation with location data
4. **Formal Appearance**: Removed emojis for government bot look
5. **Comprehensive Logging**: Debug information for troubleshooting

## API Integration

- **PIN Code Service**: Automatically fetches Post Office, Police Station, District
- **User Lookup**: Checks existing users by phone number
- **MongoDB Storage**: Stores all user data with location details

## Navigation Features

Every message includes:

- **Back Button**: Go to previous step
- **Exit Button**: End session completely
- **Main Menu**: Return to options

## Current Webhook URL

Make sure your WhatsApp webhook is set to:
`https://your-ngrok-url.com/webhook`

The bot now handles both `/webhook` and `/api/whatsapp/webhook` endpoints.
