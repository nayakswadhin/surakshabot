# WhatsApp Bot Flow Documentation

## 🤖 SurakshaBot - Complete User Journey

### Initial Greeting

**Trigger Words**: Hello, Hi, Hey, Help, Hii, Start, Menu

**Bot Response**:

```
Welcome to 1930, Cyber Helpline, Odisha. How can I help you?

[A- New Complaint] [B- Status Check] [C- Account Unfreeze]
[D- Other Queries] [🏠 Main Menu] [❌ Exit]
```

---

## 📋 Flow A: New Complaint Registration

### Step 1: Initial Selection

User clicks **"A- New Complaint"**

**Bot Response**:

```
📋 New Complaint Registration

I need to collect some information to register your complaint.

Let me check if you're already registered with us.

Please provide your phone number (the one you're messaging from):

[Continue →] [🏠 Main Menu] [⬅️ Back] [❌ Exit]
```

### Step 2: Phone Number Check

User provides phone number

**Case A - Existing User**:

```
✅ Welcome back, [User Name]!

Your details are already in our system.

Let's proceed with your complaint registration.

Please provide a brief description of the incident:

[⬅️ Back] [❌ Exit]
```

**Case B - New User**:

```
📝 New User Detected

I don't find your phone number in our records.

Let's register you first to proceed with the complaint.

[📝 Start Registration] [🏠 Main Menu] [❌ Exit]
```

### Step 3: User Registration Flow (for new users)

#### Step 3.1: Name

```
📝 User Registration

Let's start with your details:

Please enter your Full Name:

[⬅️ Back] [❌ Exit]
```

#### Step 3.2: Father/Spouse/Guardian Name

```
👨‍👩‍👧‍👦 Please enter your Father/Spouse/Guardian Name:

[⬅️ Back] [❌ Exit]
```

#### Step 3.3: Date of Birth

```
📅 Please enter your Date of Birth (DD/MM/YYYY):

[⬅️ Back] [❌ Exit]
```

#### Step 3.4: Phone Number

```
📱 Please enter your Phone Number:

[⬅️ Back] [❌ Exit]
```

#### Step 3.5: Email ID

```
📧 Please enter your Email ID:

[⬅️ Back] [❌ Exit]
```

#### Step 3.6: Gender Selection

```
⚧ Please select your Gender:

[Male] [Female] [Others]
[⬅️ Back] [❌ Exit]
```

#### Step 3.7: Village/Area

```
🏘️ Please enter your Village/Area:

[⬅️ Back] [❌ Exit]
```

#### Step 3.8: Pin Code

```
📮 Please enter your Pin Code (6 digits):

[⬅️ Back] [❌ Exit]
```

#### Step 3.9: Aadhar Number

```
🆔 Please enter your Aadhar Number (12 digits):

[⬅️ Back] [❌ Exit]
```

#### Step 3.10: Confirmation

```
✅ Registration Details Confirmation

👤 Name: [User Name]
👨‍👩‍👧‍👦 Father/Spouse/Guardian: [Name]
📅 Date of Birth: [DD/MM/YYYY]
📱 Phone: [Phone Number]
📧 Email: [Email]
⚧ Gender: [Gender]
🏘️ Village: [Village]
📮 Pin Code: [Pin Code]
🆔 Aadhar: [Aadhar Number]

Please confirm to save these details:

[✅ Confirm] [⬅️ Edit] [❌ Cancel]
```

#### Step 3.11: Registration Success

```
🎉 Registration Successful!

Welcome [User Name]!

Your details have been saved securely.

You can now proceed with filing your complaint or checking status anytime.

[🏠 Main Menu] [⬅️ Back] [❌ Exit]
```

---

## 🔍 Flow B: Status Check

### Step 1: Initial Request

User clicks **"B- Status Check"**

**Bot Response**:

```
🔍 Complaint Status Check

To check your complaint status, please provide your Aadhar Number (12 digits):

[⬅️ Back] [❌ Exit]
```

### Step 2: Status Display

User provides Aadhar number

**Case A - Complaints Found**:

```
📋 Your Complaints Status:

1. Investment/Trading/IPO Fraud
   Status: 🟡 Pending
   Date: 05/11/2025

2. UPI Fraud
   Status: ✅ Solved
   Date: 03/11/2025

[⬅️ Back] [❌ Exit]
```

**Case B - No Complaints**:

```
❌ No complaints found for this Aadhar number.

[⬅️ Back] [❌ Exit]
```

---

## 🔓 Flow C: Account Unfreeze

### Step 1: Initial Request

User clicks **"C- Account Unfreeze"**

**Bot Response**:

```
🔓 Account Unfreeze Support

For account unfreeze queries, please provide your Aadhar Number (12 digits):

[⬅️ Back] [❌ Exit]
```

### Step 2: Unfreeze Response

User provides Aadhar number

**Case A - User Found**:

```
✅ Account Unfreeze Request

Hello [User Name],

Your account unfreeze request has been initiated.

📞 Please call 1930 for immediate assistance
📧 Or email: cybercrime.odisha@gov.in

Our team will contact you within 24 hours.

[⬅️ Back] [❌ Exit]
```

**Case B - User Not Found**:

```
❌ User not found. Please register first or contact 1930.

[⬅️ Back] [❌ Exit]
```

---

## ❓ Flow D: Other Queries

### Response

User clicks **"D- Other Queries"**

**Bot Response**:

```
❓ Other Queries

For other cyber crime related queries:

📞 Call our helpline: 1930
🏛️ Visit nearest police station
📧 Email: cybercrime.odisha@gov.in

Or describe your query here and our team will assist you.

[⬅️ Back] [❌ Exit]
```

---

## 🎮 Navigation Features

### Back Button (⬅️ Back)

- Available on every message except main menu
- Takes user to previous step in the flow
- Maintains data entered in previous steps
- Can go back multiple steps if needed

### Exit Button (❌ Exit)

- Available on every message
- Terminates current session completely
- Clears all session data
- Returns user to greeting state

### Main Menu Button (🏠 Main Menu)

- Available in appropriate contexts
- Returns to main menu with all 4 options
- Clears current flow but maintains registration if completed

---

## 🔄 Session Management

### Session States

- **MENU**: Main menu display
- **NEW_COMPLAINT**: New complaint flow
- **STATUS_CHECK**: Status checking flow
- **ACCOUNT_UNFREEZE**: Account unfreeze flow
- **OTHER_QUERIES**: Other queries flow
- **REGISTRATION**: User registration flow

### Session Cleanup

- Sessions auto-expire after 30 minutes of inactivity
- Manual cleanup on exit button
- History maintained for back navigation

---

## ✅ Validation Rules

### Phone Number

- Must be 10 digits
- Must start with 6, 7, 8, or 9
- Format: Indian mobile number

### Aadhar Number

- Must be exactly 12 digits
- Only numeric characters allowed

### Email

- Must be valid email format
- Converted to lowercase

### Date of Birth

- Format: DD/MM/YYYY
- Must be valid date

### Pin Code

- Must be exactly 6 digits
- Only numeric characters allowed

### Names

- Minimum 2 characters
- No special validation (allows all characters)

---

## 📊 Database Schema

### Users Collection

```javascript
{
  aadharNumber: "123456789012",
  name: "John Doe",
  fatherSpouseGuardianName: "Father Name",
  gender: "Male",
  emailid: "john@example.com",
  dob: Date,
  phoneNumber: "9876543210",
  caseIds: [], // Initially empty
  address: {
    pincode: "751001",
    area: "Bhubaneswar",
    village: "Bhubaneswar",
    district: "TBD"
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Technical Implementation

### Key Components

1. **SessionManager**: Handles conversation state
2. **WhatsAppService**: Manages WhatsApp API interactions
3. **WhatsAppController**: Processes incoming messages
4. **Models**: MongoDB schemas for data storage

### Error Handling

- Graceful error responses to users
- Comprehensive logging for debugging
- Automatic session cleanup on errors
- Fallback to main menu on unknown states

### Security Features

- Input validation on all user inputs
- Session isolation per phone number
- Automatic session timeouts
- No sensitive data in logs
