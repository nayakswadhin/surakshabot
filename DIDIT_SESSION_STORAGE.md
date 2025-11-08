# 📦 Didit Session ID Storage & Data Retrieval

## Overview

When a user registers via Didit verification, we store the `diditSessionId` in the MongoDB Users collection. This allows us to retrieve the complete verification data from Didit at any time in the future.

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  aadharNumber: "123456789012",
  phoneNumber: "9876543210",
  emailid: "john@example.com",
  gender: "Male",
  dob: ISODate("1990-01-15"),
  fatherSpouseGuardianName: "Father Name",
  address: {
    village: "Village Name",
    district: "District Name",
    state: "Odisha",
    pincode: "751001",
    area: "Village Name",
    postOffice: "TBD",
    policeStation: "TBD"
  },
  verifiedVia: "didit",                    // ✅ Indicates Didit verification
  diditSessionId: "abc-123-xyz-456",       // ✅ Stored Didit session ID
  createdAt: ISODate("2025-11-08"),
  updatedAt: ISODate("2025-11-08"),
  freeze: false,
  caseIds: []
}
```

---

## 🔄 Data Flow

### 1. Registration Flow

```
User starts verification
  ↓
Didit session created → sessionId = "abc-123-xyz"
  ↓
sessionId stored in session.data.diditSessionId
  ↓
User completes verification
  ↓
Data extracted from Didit
  ↓
User provides additional info (pincode, village, etc.)
  ↓
All data saved to MongoDB with diditSessionId
```

### 2. Session ID Storage

**Location in Code:** `services/whatsappService.js`

```javascript
// When creating verification session (line 1171)
this.sessionManager.updateSession(to, {
  data: {
    diditSessionId: sessionResult.sessionId, // ✅ Stored here
    diditSessionToken: sessionResult.sessionToken,
    diditVerificationUrl: sessionResult.url,
    phone: phoneNumber,
  },
});

// When extracting data (line 1330)
this.sessionManager.updateSession(to, {
  data: {
    ...session.data, // ✅ Preserves diditSessionId
    name: userData.name,
    aadharNumber: userData.aadharNumber,
    // ... other fields
  },
});

// When saving to database (line 1757)
const newUser = new Users({
  // ... other fields
  verifiedVia: data.diditSessionId ? "didit" : "manual",
  diditSessionId: data.diditSessionId || null, // ✅ Saved to MongoDB
});
```

---

## 📥 Retrieving Verification Data

### Method 1: Fetch Complete Verification Data

Use this to get **all** verification details including ID verification, phone verification, liveness check, face match, etc.

```javascript
const DiditService = require("./services/diditService");
const diditService = new DiditService();

// Get user from database
const user = await Users.findOne({ phoneNumber: "9876543210" });

if (user.diditSessionId) {
  const verificationData = await diditService.fetchUserVerificationData(
    user.diditSessionId
  );

  if (verificationData.success) {
    console.log("Status:", verificationData.status);
    console.log("ID Verification:", verificationData.idVerification);
    console.log("Phone:", verificationData.phone);
    console.log("Email:", verificationData.email);
    console.log("Liveness:", verificationData.liveness);
    console.log("Face Match:", verificationData.faceMatch);
  }
}
```

**Returns:**

```javascript
{
  success: true,
  sessionId: "abc-123-xyz",
  status: "Approved",
  workflowId: "workflow-id",
  createdAt: "2025-11-08T10:30:00Z",

  idVerification: {
    status: "Approved",
    documentType: "Aadhar Card",
    documentNumber: "123456789012",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    dateOfBirth: "1990-01-15",
    gender: "M",
    nationality: "IND",
    address: "123 Main St, City",
    portraitImage: "https://...",
    frontImage: "https://...",
    backImage: "https://...",
    warnings: []
  },

  phone: {
    status: "Approved",
    phoneNumber: "9876543210",
    fullNumber: "+919876543210",
    verifiedAt: "2025-11-08T10:32:00Z"
  },

  email: {
    status: "Approved",
    email: "john@example.com",
    verifiedAt: "2025-11-08T10:33:00Z"
  },

  liveness: {
    status: "Approved",
    score: 89.5,
    method: "ACTIVE_3D"
  },

  faceMatch: {
    status: "Approved",
    score: 95.2
  },

  reviews: []
}
```

---

### Method 2: Get Simplified User Info

Use this for quick access to essential user information only.

```javascript
const userInfo = await diditService.getUserInfoFromSession(user.diditSessionId);

if (userInfo.success) {
  console.log("Name:", userInfo.name);
  console.log("Document Number:", userInfo.documentNumber);
  console.log("Date of Birth:", userInfo.dateOfBirth);
  console.log("Gender:", userInfo.gender);
}
```

**Returns:**

```javascript
{
  success: true,
  name: "John Doe",
  documentNumber: "123456789012",
  documentType: "Aadhar Card",
  dateOfBirth: "1990-01-15",
  gender: "M",
  nationality: "IND",
  address: "123 Main St, City",
  verificationStatus: "Approved",
  verifiedAt: "2025-11-08T10:30:00Z"
}
```

---

## 🎯 Use Cases

### Use Case 1: Re-verification

If you need to re-verify a user's identity:

```javascript
const user = await Users.findById(userId);

if (user.diditSessionId) {
  const data = await diditService.fetchUserVerificationData(
    user.diditSessionId
  );

  // Check if verification is still valid
  if (data.status === "Approved") {
    console.log("✅ User verification is still valid");
  } else {
    console.log("⚠️ User needs to re-verify");
  }
}
```

### Use Case 2: Audit Trail

For compliance and security audits:

```javascript
// Get all users verified via Didit
const diditUsers = await Users.find({ verifiedVia: "didit" });

for (const user of diditUsers) {
  const verificationData = await diditService.fetchUserVerificationData(
    user.diditSessionId
  );

  console.log(`User: ${user.name}`);
  console.log(`Verified: ${verificationData.createdAt}`);
  console.log(`Status: ${verificationData.status}`);
  console.log(`Warnings: ${verificationData.idVerification.warnings.length}`);
}
```

### Use Case 3: Enhanced User Profile

Display additional verified information:

```javascript
router.get("/api/users/:userId/verification", async (req, res) => {
  const user = await Users.findById(req.params.userId);

  if (!user.diditSessionId) {
    return res.json({ verified: false });
  }

  const verificationData = await diditService.fetchUserVerificationData(
    user.diditSessionId
  );

  res.json({
    verified: true,
    verificationStatus: verificationData.status,
    documentType: verificationData.idVerification.documentType,
    verifiedAt: verificationData.createdAt,
    livenessScore: verificationData.liveness?.score,
    faceMatchScore: verificationData.faceMatch?.score,
  });
});
```

---

## 🧪 Testing

Run the test script to see how it works:

```bash
node test-fetch-didit-data.js
```

This will:

1. ✅ Find all users verified via Didit
2. ✅ Fetch complete verification data for the first user
3. ✅ Display all verification details
4. ✅ Show usage examples

---

## 🔒 Security Considerations

### 1. **Session ID Storage**

- ✅ Session IDs are stored securely in MongoDB
- ✅ Only accessible through authenticated API calls
- ✅ Never exposed in public endpoints

### 2. **Data Privacy**

```javascript
// ❌ Don't expose full verification data publicly
router.get("/api/public/user/:id", async (req, res) => {
  const user = await Users.findById(req.params.id);
  res.json({
    name: user.name,
    // ❌ Don't send diditSessionId
    // ❌ Don't send verification images
  });
});

// ✅ Only expose verification data to authorized users
router.get("/api/admin/user/:id/verification", isAdmin, async (req, res) => {
  const user = await Users.findById(req.params.id);

  if (user.diditSessionId) {
    const data = await diditService.fetchUserVerificationData(
      user.diditSessionId
    );
    res.json(data);
  }
});
```

### 3. **Rate Limiting**

```javascript
// Limit API calls to Didit
const verificationCache = new Map();

async function getCachedVerificationData(sessionId) {
  if (verificationCache.has(sessionId)) {
    return verificationCache.get(sessionId);
  }

  const data = await diditService.fetchUserVerificationData(sessionId);
  verificationCache.set(sessionId, data);

  // Cache for 1 hour
  setTimeout(() => verificationCache.delete(sessionId), 3600000);

  return data;
}
```

---

## 📊 Console Logs

When saving a user, you'll see:

```
Saving registration to database for +919876543210
✅ Didit Session ID: abc-123-xyz-456
✅ User saved successfully: 6543210abc123def456
✅ Verified via: didit
✅ Didit Session ID stored: abc-123-xyz-456
```

---

## 🎯 Summary

### What's Stored:

- ✅ `diditSessionId` - Unique session identifier
- ✅ `verifiedVia` - Indicates "didit" or "manual"
- ✅ User data extracted from verification
- ✅ Additional manually entered info (village, guardian, email)

### What Can Be Retrieved:

- ✅ Complete ID verification data
- ✅ Phone verification status
- ✅ Email verification status
- ✅ Liveness check results
- ✅ Face match scores
- ✅ Document images (portrait, front, back)
- ✅ Verification warnings
- ✅ Verification timestamp

### Why It's Useful:

- ✅ **Audit Trail** - Track all verifications
- ✅ **Re-verification** - Check if user needs to verify again
- ✅ **Compliance** - Meet legal requirements
- ✅ **Enhanced Security** - Verify identity when needed
- ✅ **Analytics** - Monitor verification success rates
- ✅ **User Support** - Help users with verification issues

---

## 🚀 Next Steps

1. **Restart your backend server** to apply changes
2. **Register a new user** via WhatsApp with Didit verification
3. **Run the test script** to see the stored data
4. **Access verification data** in your application

```bash
# Restart server
npm start

# Test data retrieval
node test-fetch-didit-data.js
```

---

**Status:** ✅ **IMPLEMENTED AND READY TO USE**
