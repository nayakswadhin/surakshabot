# Didit Verification Integration - Documentation

## Overview

This document describes the integration of Didit identity verification service into the SurakshaBot WhatsApp chatbot for user registration.

## What Changed?

### Before (Manual Registration)
- User had to manually enter all details:
  - Name
  - Father/Spouse/Guardian Name
  - Date of Birth
  - Phone Number
  - Email
  - Gender
  - Village
  - Pincode
  - Aadhar Number

### After (Didit Verification)
- User verifies identity using Government ID via Didit
- System automatically extracts:
  - Name
  - Aadhar Number
  - Gender
  - Date of Birth
  - Phone Number (from WhatsApp)
- User only needs to provide:
  - Pincode
  - Village
  - Father/Spouse/Guardian Name
  - Email

## Complete Flow

### 1. User Sends Greeting
- User sends: `Hello`, `Hi`, `Help`, `Start`, `Menu`, etc.
- Bot displays Main Menu with options:
  - New Complaint
  - Status Check
  - More Options

### 2. User Clicks "New Complaint"
- Bot checks if user exists in MongoDB (by phone number)

### 3A. Existing User Path
- Bot displays user details
- Provides "Next" button to proceed to complaint filing

### 3B. New User Path
- Bot shows "New User Detected" message
- Provides "Start Verification" button

### 4. Start Didit Verification
- Bot creates Didit verification session via API
- Sends verification link to user
- Buttons:
  - "Yes I'm Done" - Check verification status
  - "Retry" - Create new verification session
  - "Exit" - Cancel process

### 5. User Completes Verification
- User clicks verification link
- Completes identity verification (2-3 minutes)
- Uploads Government ID
- Takes selfie for liveness check

### 6. User Clicks "Yes I'm Done"
- Bot checks verification status via Didit API

### 7A. Verification Status: Pending/In Review
- Bot shows current status message
- Buttons:
  - "Check Status" - Re-check verification
  - "Retry" - Start new verification
  - "Exit" - Cancel

### 7B. Verification Status: Approved ✅
- Bot extracts user data from verification
- Shows extracted data for confirmation:
  - Name
  - Aadhar Number
  - Gender
  - Date of Birth
  - Phone Number
- Buttons:
  - "Correct" - Proceed
  - "Incorrect" - Retry verification
  - "Exit" - Cancel

### 8. Collect Additional Information

#### Step 1: Pincode
- User enters 6-digit pincode
- Bot validates and fetches location (district, state)

#### Step 2: Village
- User enters village/town name

#### Step 3: Father/Spouse/Guardian Name
- User enters parent/guardian name

#### Step 4: Email
- User enters email address
- Bot validates email format

### 9. Final Confirmation
- Bot shows all collected data
- User confirms or edits
- Buttons:
  - "Confirm & Save" - Save to database
  - "Edit" - Go back to edit
  - "Cancel" - Cancel registration

### 10. Save to Database
- Bot saves user to MongoDB
- Shows success message
- Automatically proceeds to complaint filing

## Technical Implementation

### New Files Created

#### 1. `services/diditService.js`
Handles all Didit API interactions:
- `createVerificationSession()` - Create new verification
- `getSessionDecision()` - Check verification status
- `extractUserData()` - Extract verified user data
- `getStatusMessage()` - Get user-friendly status messages
- Helper methods for status checks

#### 2. `test-didit-service.js`
Tests Didit service functionality:
- Environment variable checks
- API connection tests
- Session creation tests
- Data extraction tests

#### 3. `test-integration.js`
Comprehensive integration tests:
- Session manager tests
- Didit service tests
- Data validation tests
- Flow state tests

### Modified Files

#### 1. `services/sessionManager.js`
Added new states and steps:
```javascript
STATES: {
  DIDIT_VERIFICATION: "DIDIT_VERIFICATION",
  DIDIT_DATA_CONFIRMATION: "DIDIT_DATA_CONFIRMATION",
  DIDIT_ADDITIONAL_INFO: "DIDIT_ADDITIONAL_INFO",
  // ... existing states
}

DIDIT_STEPS: {
  VERIFICATION_PENDING: "VERIFICATION_PENDING",
  DATA_CONFIRMATION: "DATA_CONFIRMATION",
  ASK_PINCODE: "ASK_PINCODE",
  ASK_VILLAGE: "ASK_VILLAGE",
  ASK_FATHER_SPOUSE_GUARDIAN: "ASK_FATHER_SPOUSE_GUARDIAN",
  ASK_EMAIL: "ASK_EMAIL",
  FINAL_CONFIRMATION: "FINAL_CONFIRMATION",
}
```

#### 2. `services/whatsappService.js`
Added methods:
- `startDiditVerification()` - Initiate verification
- `retryDiditVerification()` - Retry verification
- `checkVerificationStatus()` - Check status
- `handleApprovedVerification()` - Handle approved status
- `handlePendingVerification()` - Handle pending status
- `handleDeclinedVerification()` - Handle declined status
- `handleDiditDataConfirmation()` - Confirm extracted data
- `handleDiditAdditionalInfo()` - Handle additional info input
- `handlePincodeInput()` - Process pincode
- `handleVillageInput()` - Process village
- `handleFatherSpouseGuardianInput()` - Process guardian name
- `handleEmailInput()` - Process email
- `showFinalConfirmation()` - Show final confirmation
- `saveFinalRegistration()` - Save to database

Updated methods:
- `checkUserAndProceed()` - Triggers Didit instead of manual registration
- `handleButtonPress()` - Added Didit button handlers

#### 3. `controllers/whatsappController.js`
Added handler for Didit text inputs:
```javascript
else if (session.state === SessionManager.STATES.DIDIT_ADDITIONAL_INFO) {
  await this.whatsappService.handleDiditAdditionalInfo(from, text);
}
```

#### 4. `models/Users.js`
Added fields:
```javascript
verifiedVia: {
  type: String,
  enum: ["manual", "didit"],
  default: "manual",
},
diditSessionId: {
  type: String,
  default: null,
}
```

### Environment Variables

Add to `.env`:
```bash
DIDIT_API_KEY=your_didit_api_key_here
DIDIT_WORKFLOW_ID=your_didit_workflow_id_here
```

## Button IDs Reference

### Didit Verification Buttons
- `start_verification` - Start Didit verification
- `verification_done` - Check verification status
- `retry_verification` - Retry verification
- `confirm_didit_data` - Confirm extracted data
- `retry_didit` - Retry verification (from confirmation)
- `confirm_final_registration` - Final save confirmation

### Existing Buttons (Still Used)
- `new_complaint` - Start new complaint
- `proceed_complaint` - Proceed to complaint filing
- `main_menu` - Return to main menu
- `exit_session` - Exit session
- `back_step` - Go back one step

## Testing

### 1. Test Didit Service
```bash
node test-didit-service.js
```

This tests:
- Environment variables
- Didit API connectivity
- Session creation
- Status checking
- Data extraction

### 2. Test Integration
```bash
node test-integration.js
```

This tests:
- All environment variables
- Session manager functionality
- Didit service methods
- Data validation
- Flow states and transitions

### 3. Manual Testing Checklist

#### New User Registration
- [ ] Send "Hello" to bot
- [ ] Click "New Complaint"
- [ ] Verify "New User Detected" message appears
- [ ] Click "Start Verification"
- [ ] Receive verification link
- [ ] Click link and complete verification
- [ ] Click "Yes I'm Done"
- [ ] Verify extracted data is displayed
- [ ] Click "Correct"
- [ ] Enter pincode (e.g., 751001)
- [ ] Verify district/state auto-filled
- [ ] Enter village name
- [ ] Enter father/spouse/guardian name
- [ ] Enter email address
- [ ] Review final confirmation
- [ ] Click "Confirm & Save"
- [ ] Verify success message
- [ ] Verify redirection to complaint filing

#### Existing User
- [ ] Send "Hello" to bot
- [ ] Click "New Complaint"
- [ ] Verify existing user details displayed
- [ ] Click "Next"
- [ ] Verify complaint filing starts

#### Error Handling
- [ ] Test with invalid pincode
- [ ] Test with invalid email
- [ ] Test clicking "Yes I'm Done" before verification
- [ ] Test "Retry" button functionality
- [ ] Test "Exit" button at each stage

## API Integration Details

### Didit API Endpoints

#### 1. Create Session
```bash
POST https://verification.didit.me/v2/session/
Headers:
  - x-api-key: {DIDIT_API_KEY}
  - content-type: application/json
Body:
{
  "workflow_id": "{DIDIT_WORKFLOW_ID}",
  "vendor_data": "Government ID"
}

Response:
{
  "session_id": "abc-123-xyz",
  "session_number": 1234,
  "session_token": "token123",
  "url": "https://verify.didit.me/session/token123",
  "status": "Not Started",
  "workflow_id": "workflow-id",
  "vendor_data": "Government ID"
}
```

#### 2. Get Session Decision
```bash
GET https://verification.didit.me/v2/session/{sessionId}/decision/
Headers:
  - x-api-key: {DIDIT_API_KEY}

Response:
{
  "session_id": "abc-123-xyz",
  "status": "Approved",
  "id_verification": {
    "status": "Approved",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "document_number": "123456789012",
    "gender": "M",
    "date_of_birth": "1990-01-01",
    // ... more fields
  },
  // ... more data
}
```

### Status Values
- `Not Started` - User hasn't opened link
- `In Progress` - User is completing verification
- `In Review` - Verification under review
- `Approved` - Verification successful ✅
- `Declined` - Verification failed ❌
- `Expired` - Session expired

## Data Mapping

| Didit Field | Bot Field | Transformation |
|-------------|-----------|----------------|
| first_name + last_name | name | Concatenate |
| document_number | aadharNumber | Direct |
| gender ("M"/"F") | gender | "M" → "Male", "F" → "Female" |
| date_of_birth | dob | Direct |
| WhatsApp number | phoneNumber | Extract 10 digits |
| User input | pincode | Validate 6 digits |
| User input | village | Direct |
| User input | fatherSpouseGuardianName | Direct |
| User input | emailid | Validate format |

## Error Handling

### 1. Didit API Errors
- Connection failures → Retry or fallback message
- Invalid credentials → Log error, show user-friendly message
- Session not found → Clear session, start over

### 2. Validation Errors
- Invalid pincode → Ask again with error message
- Invalid email → Ask again with validation message
- Missing data → Request data again

### 3. Database Errors
- Duplicate Aadhar → Inform user already registered
- Connection error → Show retry message
- Save failure → Log error, allow retry

## Security Considerations

1. **API Keys**: Store in environment variables, never commit to Git
2. **Session Data**: Temporary storage, cleared after completion
3. **User Data**: Encrypted in transit (HTTPS/TLS)
4. **Aadhar Storage**: Only store hash if required by regulations
5. **Access Control**: Validate all inputs before database operations

## Monitoring and Logging

### Log Events
- Verification session created
- Verification status checked
- Data extracted successfully
- User saved to database
- Errors at each step

### Log Format
```javascript
console.log(`✅ Verification approved for ${phoneNumber}`);
console.log(`📝 User saved: ${userId}`);
console.error(`❌ Didit API error: ${error.message}`);
```

## Troubleshooting

### Issue: Verification link not received
**Solution**: Check DIDIT_API_KEY and DIDIT_WORKFLOW_ID in .env

### Issue: "Yes I'm Done" shows pending status
**Solution**: User needs to complete verification in Didit portal

### Issue: Data extraction returns null
**Solution**: Verify verification status is "Approved"

### Issue: Database save fails
**Solution**: Check MongoDB connection and Aadhar uniqueness

### Issue: Pincode not validating
**Solution**: Check pincode service API availability

## Future Enhancements

1. **Multi-language Support**: Localize messages
2. **Document Upload**: Store verified document images
3. **OTP Verification**: Additional security layer
4. **Admin Dashboard**: View verification statistics
5. **Webhook Integration**: Real-time verification updates
6. **Retry Limits**: Prevent abuse with max retry count
7. **Session Timeout**: Auto-expire old sessions

## Support

For issues or questions:
- Check logs in console
- Run test scripts
- Review Didit API documentation
- Contact development team

---

**Last Updated**: November 8, 2025
**Version**: 1.0.0
