# Didit Integration - Quick Start Guide

## Prerequisites

1. Node.js installed
2. MongoDB running
3. WhatsApp Business API configured
4. Didit API credentials

## Setup Steps

### 1. Add Environment Variables

Add these to your `.env` file:

```bash
# Didit Verification API
DIDIT_API_KEY=3bjJbdb44yy9Ddu5VG7rWzOHPGnsj6Y5mriBHWX4ams
DIDIT_WORKFLOW_ID=6365ba38-decf-4223-b377-55404b62fd6b
```

### 2. Install Dependencies

```bash
npm install
```

All required dependencies are already in package.json (axios, mongoose, etc.)

### 3. Run Tests

#### Test Didit Service
```bash
npm run test:didit
```

Expected output:
- ✅ Environment variables found
- ✅ Didit Service initialized
- ✅ Verification session created
- ✅ Session decision retrieved

#### Test Complete Integration
```bash
npm test
```

Expected output:
- ✅ All required environment variables present
- ✅ Session manager working
- ✅ Didit service functional
- ✅ Data validation correct
- ✅ Flow states properly configured

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Testing the Flow

### Step-by-Step Test

1. **Send greeting to WhatsApp bot**
   ```
   Hello
   ```
   Expected: Main menu with "New Complaint" button

2. **Click "New Complaint"**
   Expected (New User): "New User Detected" with "Start Verification" button
   Expected (Existing User): User details with "Next" button

3. **Click "Start Verification"** (New User only)
   Expected: Verification link sent with buttons:
   - Yes I'm Done
   - Retry
   - Exit

4. **Open verification link and complete verification**
   - Upload Government ID (Aadhar/Passport/etc.)
   - Take selfie for liveness check
   - Complete all verification steps

5. **Click "Yes I'm Done"**
   Expected (Pending): "Verification Status: In Progress" message
   Expected (Approved): Extracted data shown for confirmation

6. **Click "Correct"** (if data is correct)
   Expected: "Please enter your 6-digit Pincode"

7. **Enter pincode** (e.g., 751001)
   Expected: District and state auto-filled, asking for village

8. **Enter village name**
   Expected: "Please enter your Father's/Spouse's/Guardian's name"

9. **Enter guardian name**
   Expected: "Please enter your Email ID"

10. **Enter email**
    Expected: Final confirmation with all details

11. **Click "Confirm & Save"**
    Expected: 
    - "Registration Successful!"
    - Automatic redirect to complaint filing

## Verification Status Handling

### Not Started
- User hasn't opened the link yet
- Action: Wait or retry

### In Progress
- User is completing verification
- Action: Wait and check status again

### In Review
- Verification under manual review
- Action: Wait for approval

### Approved ✅
- Verification successful
- Action: Extract data and continue

### Declined ❌
- Verification failed
- Action: Offer retry option

## Common Issues & Solutions

### Issue 1: "DIDIT_API_KEY not found"
**Solution**: Add DIDIT_API_KEY to .env file

### Issue 2: "Failed to create verification session"
**Solution**: 
- Check internet connection
- Verify API key is correct
- Check Didit API status

### Issue 3: "Verification pending" after completing
**Solution**: 
- Wait a few minutes for processing
- Click "Check Status" button
- Verify you completed all steps in Didit portal

### Issue 4: "Invalid pincode"
**Solution**: Enter valid 6-digit Indian pincode

### Issue 5: "This Aadhar number is already registered"
**Solution**: User is already in system, use main menu to file complaint

## Files Modified/Created

### New Files
- `services/diditService.js` - Didit API integration
- `test-didit-service.js` - Didit service tests
- `test-integration.js` - Integration tests
- `DIDIT_INTEGRATION.md` - Complete documentation
- `DIDIT_QUICK_START.md` - This file

### Modified Files
- `services/sessionManager.js` - Added Didit states/steps
- `services/whatsappService.js` - Added Didit methods
- `controllers/whatsappController.js` - Added Didit handler
- `models/Users.js` - Added verification fields
- `.env.example` - Added Didit variables
- `package.json` - Added test scripts

## Button Reference

### Main Flow Buttons (without emojis as requested)
- `Start Verification` - Initiates Didit verification
- `Yes I'm Done` - Check verification status
- `Retry` - Create new verification session
- `Correct` - Confirm extracted data
- `Incorrect` - Retry verification
- `Confirm & Save` - Save registration to database
- `Edit` - Edit registration details
- `Exit` - Cancel and exit
- `Main Menu` - Return to main menu
- `Back` - Go to previous step

## Validation Rules

### Pincode
- Format: 6 digits
- Example: 751001
- Regex: `/^[0-9]{6}$/`

### Email
- Format: Standard email
- Example: user@example.com
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Phone Number
- Format: 10-digit Indian mobile
- Example: 9876543210
- Regex: `/^[6-9]\d{9}$/`
- Auto-detected from WhatsApp

### Aadhar Number
- Format: 12 digits
- Example: 123456789012
- Regex: `/^[0-9]{12}$/`
- Extracted from Didit verification

## Data Flow Diagram

```
User sends "Hello"
    ↓
Main Menu displayed
    ↓
User clicks "New Complaint"
    ↓
Check user in MongoDB
    ↓
    ├─→ User exists → Show details → Proceed to complaint
    │
    └─→ User doesn't exist → Start Didit verification
            ↓
        Create Didit session
            ↓
        Send verification link
            ↓
        User completes verification
            ↓
        Check verification status
            ↓
            ├─→ Pending/In Review → Show status → Retry/Wait
            │
            └─→ Approved → Extract data
                    ↓
                Show extracted data
                    ↓
                User confirms
                    ↓
                Collect additional info:
                    - Pincode
                    - Village
                    - Father/Spouse/Guardian
                    - Email
                    ↓
                Final confirmation
                    ↓
                Save to MongoDB
                    ↓
                Proceed to complaint filing
```

## API Credentials

### Didit API
- **Base URL**: https://verification.didit.me/v2
- **API Key**: Get from Didit dashboard
- **Workflow ID**: Get from Didit dashboard
- **Documentation**: https://docs.didit.me/

### Getting Credentials
1. Sign up at Didit
2. Create a workflow for ID verification
3. Copy API key and workflow ID
4. Add to .env file

## Next Steps After Setup

1. ✅ Run all tests
2. ✅ Test with WhatsApp (use test number first)
3. ✅ Complete a full verification flow
4. ✅ Verify data saved to MongoDB
5. ✅ Test error scenarios
6. ✅ Deploy to production

## Monitoring

### Check Logs
```bash
# Watch logs in real-time
npm run dev

# Look for these log messages:
# ✅ Verification session created
# ✅ Verification approved
# ✅ User saved successfully
# ❌ Any error messages
```

### Database Check
```javascript
// Connect to MongoDB and check users
use surakshabot
db.users.find({ verifiedVia: "didit" })
```

## Support

- Documentation: `DIDIT_INTEGRATION.md`
- Test Issues: Run `npm test` for diagnostics
- API Issues: Check Didit dashboard logs
- Database Issues: Check MongoDB connection

---

**Ready to test?** Run `npm test` first, then test with WhatsApp!

**Need help?** Check `DIDIT_INTEGRATION.md` for detailed documentation.
