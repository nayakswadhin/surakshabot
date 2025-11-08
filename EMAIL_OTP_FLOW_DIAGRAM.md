# Email OTP Verification - Flow Diagram

## Complete User Journey with OTP Verification

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER SENDS MESSAGE                           │
│                  "Hello" / "Help" / "Hii"                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WELCOME MESSAGE                              │
│                                                                 │
│  "Welcome to 1930, Cyber Helpline, India."                     │
│  "How can I help you?"                                         │
│                                                                 │
│  [New Complaint]  [Status Check]  [More Options]              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ User clicks "New Complaint"
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              CHECK USER IN DATABASE                             │
│         (Search by WhatsApp phone number)                       │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
     Found   │                                │   Not Found
             ▼                                ▼
    ┌────────────────┐            ┌────────────────────────────┐
    │ EXISTING USER  │            │   DiDit VERIFICATION      │
    │                │            │                            │
    │ Go to Complaint│            │  User scans QR code       │
    │ Filing         │            │  DiDit returns:           │
    │                │            │  - Name                   │
    └────────────────┘            │  - DOB                    │
                                  │  - Gender                 │
                                  │  - Aadhar Number          │
                                  └──────────┬─────────────────┘
                                             │
                                             ▼
                            ┌─────────────────────────────────┐
                            │ DiDit DATA CONFIRMATION        │
                            │                                 │
                            │ "Verify your details:"          │
                            │ Name: [from DiDit]             │
                            │ DOB: [from DiDit]              │
                            │ Gender: [from DiDit]           │
                            │                                 │
                            │ [Confirm] [Retry]              │
                            └──────────┬──────────────────────┘
                                       │ User confirms
                                       ▼
                            ┌─────────────────────────────────┐
                            │ COLLECT MISSING INFO           │
                            │                                 │
                            │ 1. Ask Pincode ────────────┐  │
                            │    ▼                        │  │
                            │    Validate & get location  │  │
                            │    ▼                        │  │
                            │ 2. Ask Village ────────────┤  │
                            │    ▼                        │  │
                            │ 3. Ask Father/Spouse/       │  │
                            │    Guardian Name ──────────┤  │
                            │    ▼                        │  │
                            │ 4. Ask Email ══════════════╡  │
                            └──────────┬──────────────────┴──┘
                                       │
                                       ▼
                    ╔══════════════════════════════════════════╗
                    ║    EMAIL OTP VERIFICATION (NEW!)        ║
                    ╚══════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│                   USER ENTERS EMAIL                             │
│              e.g., "john.doe@example.com"                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                ┌─────────────────────┐
                │ VALIDATE EMAIL      │
                │ Format Check        │
                └────┬──────────┬─────┘
                     │          │
              Valid  │          │  Invalid
                     │          │
                     ▼          ▼
                     │     ┌──────────────────────┐
                     │     │ "Invalid email       │
                     │     │  address. Please     │
                     │     │  enter a valid       │
                     │     │  Email ID:"          │
                     │     └──────┬───────────────┘
                     │            │
                     │            └──────┐
                     │                   │
                     ▼                   │
        ┌─────────────────────────┐     │
        │ GENERATE 6-DIGIT OTP    │     │
        │ e.g., "385927"          │     │
        └────────┬────────────────┘     │
                 │                      │
                 ▼                      │
        ┌─────────────────────────┐     │
        │ SEND EMAIL WITH OTP     │     │
        │                         │     │
        │ To: user@example.com    │     │
        │ Subject: OTP Verification│    │
        │ OTP: 385927             │     │
        │ Valid: 10 minutes       │     │
        └────────┬────────────────┘     │
                 │                      │
                 ▼                      │
        ┌─────────────────────────────────────────────┐
        │ STORE OTP IN MEMORY                         │
        │ {                                           │
        │   phone: "9876543210",                      │
        │   otp: "385927",                           │
        │   email: "user@example.com",               │
        │   expiresAt: Date + 10 minutes,            │
        │   attempts: 0,                              │
        │   maxAttempts: 3                            │
        │ }                                           │
        └────────┬────────────────────────────────────┘
                 │
                 ▼
        ┌─────────────────────────────────────────────┐
        │ SEND WHATSAPP MESSAGE                       │
        │                                             │
        │ "Email Verification                         │
        │                                             │
        │  A 6-digit OTP has been sent to:           │
        │  user@example.com                          │
        │                                             │
        │  The OTP is valid for 10 minutes.          │
        │                                             │
        │  Please enter the OTP to verify your       │
        │  email:"                                    │
        │                                             │
        │  [Re-enter Email]                          │
        └────────┬────────────────────────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ USER ENTERS OTP         │
        │ e.g., "385927"          │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ VALIDATE OTP FORMAT     │
        │ (Must be 6 digits)      │
        └────┬──────────┬─────────┘
             │          │
      Valid  │          │  Invalid format
             │          │
             ▼          ▼
             │     ┌──────────────────────┐
             │     │ "Invalid OTP format. │
             │     │  Please enter a      │
             │     │  6-digit OTP:"       │
             │     └──────┬───────────────┘
             │            │
             │            └──────┐
             │                   │
             ▼                   │
    ┌─────────────────────┐     │
    │ VERIFY OTP          │     │
    │ Compare with stored │     │
    └────┬─────────┬──────┘     │
         │         │            │
  Correct│         │Incorrect   │
         │         │            │
         ▼         ▼            │
         │    ┌────────────────────────────────────┐
         │    │ INCORRECT OTP                      │
         │    │                                     │
         │    │ Increment attempt counter           │
         │    │ Remaining: maxAttempts - attempts   │
         │    └────┬──────────────┬─────────────────┘
         │         │              │
         │    Attempts│            │ Max attempts
         │    < 3    │            │ reached
         │         │              │
         │         ▼              ▼
         │    ┌────────────────────────────────────┐
         │    │ "Incorrect OTP.                    │
         │    │  X attempt(s) remaining.          │
         │    │                                     │
         │    │  Please enter the correct OTP or   │
         │    │  choose an option:"                │
         │    │                                     │
         │    │  [Resend OTP] [Re-enter Email]    │
         │    └────┬──────────────┬─────────────────┘
         │         │              │
         │         │              └─────────────┐
         │         │                            │
         │    User clicks                 ┌────▼──────────────────┐
         │    "Resend OTP"                │ "Maximum verification │
         │         │                      │  attempts exceeded.    │
         │         ▼                      │  Please request a new  │
         │    ┌──────────────────┐       │  OTP."                │
         │    │ CLEAR OLD OTP    │       │                        │
         │    │ GENERATE NEW OTP │       │ [Re-enter Email]      │
         │    │ SEND NEW EMAIL   │       └────┬──────────────────┘
         │    │                  │            │
         │    │ "New OTP sent to │            │
         │    │  user@example.com"│           │
         │    │                  │            │
         │    │ "Please enter the│            │
         │    │  6-digit OTP:"   │            │
         │    └──────┬───────────┘            │
         │           │                        │
         │           └────────┐               │
         │                    │               │
         ▼                    │               │
    ┌──────────────────────┐ │               │
    │ OTP CORRECT!         │ │               │
    │                      │ │               │
    │ Remove OTP from store│ │               │
    │ Save email to session│ │               │
    └────────┬─────────────┘ │               │
             │               │               │
             ▼               │               │
    ┌──────────────────────────────┐        │
    │ "Email verified              │        │
    │  successfully!               │        │
    │                              │        │
    │  Proceeding with             │        │
    │  registration..."            │        │
    └────────┬─────────────────────┘        │
             │                               │
             ▼                               │
    ┌──────────────────────────────┐        │
    │ FINAL CONFIRMATION           │        │
    │                              │        │
    │ Show all collected data:     │        │
    │ - Name (DiDit)               │        │
    │ - Aadhar (DiDit)             │        │
    │ - Gender (DiDit)             │        │
    │ - DOB (DiDit)                │        │
    │ - Phone (auto)               │        │
    │ - Pincode (manual)           │        │
    │ - Village (manual)           │        │
    │ - Father/Spouse (manual)     │        │
    │ - Email (verified ✓)         │        │
    │                              │        │
    │ [Confirm] [Edit]             │        │
    └────────┬─────────────────────┘        │
             │                               │
             │ User confirms                 │
             ▼                               │
    ┌──────────────────────────────┐        │
    │ SAVE TO DATABASE             │        │
    │ (Users collection)           │        │
    └────────┬─────────────────────┘        │
             │                               │
             ▼                               │
    ┌──────────────────────────────┐        │
    │ PROCEED TO COMPLAINT FILING  │        │
    └──────────────────────────────┘        │
                                             │
                                             │
    ┌────────────────────────────────────────┘
    │
    │ User clicks "Re-enter Email"
    │
    ▼
┌─────────────────────────────────┐
│ CLEAR OTP                       │
│ RESET TO EMAIL INPUT            │
│                                 │
│ "Contact Details                │
│                                 │
│  Please enter your Email ID:"   │
└─────────────────────────────────┘
    │
    └───────► Back to "USER ENTERS EMAIL"


══════════════════════════════════════════════════════════════════
                    SPECIAL CASES HANDLED
══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│ 1. OTP EXPIRED (after 10 minutes)                              │
│    ├─ Check: expiresAt < current time                          │
│    ├─ Action: Remove OTP from store                            │
│    ├─ Message: "OTP has expired. Please request a new OTP."    │
│    └─ Buttons: [Resend OTP] [Re-enter Email]                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. EMAIL SEND FAILURE                                           │
│    ├─ Catch: nodemailer error                                  │
│    ├─ Log: Error details                                        │
│    ├─ Message: "Failed to send OTP: [error]"                   │
│    └─ Action: Ask to re-enter email                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. OTP NOT FOUND                                                │
│    ├─ Scenario: User waited too long, OTP cleaned up           │
│    ├─ Message: "No OTP found. Please request a new OTP."       │
│    └─ Action: Reset to email input step                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 4. AUTOMATIC CLEANUP (every 10 minutes)                         │
│    ├─ Check: All OTPs in store                                 │
│    ├─ Remove: OTPs with expiresAt < current time               │
│    └─ Log: "Cleaned up expired OTP for [phone]"                │
└─────────────────────────────────────────────────────────────────┘


══════════════════════════════════════════════════════════════════
                    BUTTON CLICK HANDLERS
══════════════════════════════════════════════════════════════════

[Resend OTP] Button Click
    ↓
handleResendOtp(phoneNumber)
    ↓
Get email from session.data.tempEmail
    ↓
Clear old OTP: emailService.clearOtp(phoneNumber)
    ↓
Generate new OTP: emailService.sendOtp(email, phoneNumber)
    ↓
Send WhatsApp message: "New OTP sent to [email]"


[Re-enter Email] Button Click
    ↓
handleReenterEmail(phoneNumber)
    ↓
Clear OTP: emailService.clearOtp(phoneNumber)
    ↓
Clear temp email from session
    ↓
Update session step to ASK_EMAIL
    ↓
Send WhatsApp message: "Please enter your Email ID:"


══════════════════════════════════════════════════════════════════
                    DATA FLOW SUMMARY
══════════════════════════════════════════════════════════════════

Session Data Evolution:

Initial DiDit Data:
{
  name: "John Doe",
  aadharNumber: "1234 5678 9012",
  gender: "Male",
  dob: "01/01/1990",
  phone: "9876543210"
}

After Manual Collection (before OTP):
{
  ...diditData,
  pincode: "751001",
  locationData: { district: "Khordha", state: "Odisha" },
  village: "Bhubaneswar",
  fatherSpouseGuardianName: "Father's Name",
  tempEmail: "john.doe@example.com"  ← Temporary
}

After OTP Verification:
{
  ...previousData,
  tempEmail: null,  ← Cleared
  emailid: "john.doe@example.com"  ← Verified ✓
}

Final Save to Database:
{
  name: "John Doe",
  aadharNumber: "1234 5678 9012",
  gender: "Male",
  dob: Date("1990-01-01"),
  phone: "9876543210",
  pincode: "751001",
  district: "Khordha",
  state: "Odisha",
  village: "Bhubaneswar",
  fatherSpouseGuardianName: "Father's Name",
  emailid: "john.doe@example.com"
}
```

## Technical Implementation

### Files Involved:

1. `services/emailService.js` - OTP generation, sending, verification
2. `services/whatsappService.js` - WhatsApp message handling
3. `services/sessionManager.js` - Session state management
4. `controllers/whatsappController.js` - Request routing

### Key Methods:

- `emailService.sendOtp(email, phoneNumber)`
- `emailService.verifyOtp(phoneNumber, enteredOtp)`
- `whatsappService.handleEmailInput(to, email)`
- `whatsappService.handleEmailOtpInput(to, otpInput)`
- `whatsappService.handleResendOtp(to)`
- `whatsappService.handleReenterEmail(to)`

### Session States:

- `DIDIT_ADDITIONAL_INFO` - Collecting missing info
- Step: `ASK_EMAIL` - Asking for email
- Step: `EMAIL_OTP_VERIFICATION` - Waiting for OTP
- Step: `FINAL_CONFIRMATION` - All data collected

---

**Status**: ✅ Implemented and Tested  
**User Experience**: Seamless with retry options  
**Security**: 10-min expiry, 3 max attempts  
**Backward Compatible**: 100%
