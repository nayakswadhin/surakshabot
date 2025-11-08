# Aadhaar Auto-Fetch from Didit - Implementation Complete ✅

## Overview

This feature automatically retrieves Aadhaar card images from Didit verification session when collecting documents for financial fraud complaints, eliminating the need for users to manually upload their identity proof again.

---

## 🎯 Key Features

### 1. **Automatic Aadhaar Retrieval**

- Fetches front and back images of Aadhaar card from Didit API
- Uses existing `diditSessionId` stored during registration
- Retrieves additional data: document number, full name, DOB, address

### 2. **Smart Document Collection**

- Fraud-type-specific document requirements
- Only asks for relevant documents based on fraud category
- Reduces user burden (e.g., 4 docs instead of 8 for UPI Fraud)

### 3. **Fallback Mechanism**

- Manual upload option if auto-fetch fails
- Retry functionality
- User-friendly error messages

---

## 📋 Document Requirements by Fraud Type

| Fraud Type          | Required Documents                                          | Total |
| ------------------- | ----------------------------------------------------------- | ----- |
| UPI Fraud           | Aadhaar, Bank Account, UPI Transaction, Beneficiary Details | 4     |
| Investment Fraud    | Aadhaar, Bank Account, Bank Statement, Beneficiary Details  | 4     |
| Credit Card Fraud   | Aadhaar, Card Photo, Credit Card Statement                  | 3     |
| Debit Card Fraud    | Aadhaar, Card Photo, Bank Account, Bank Statement           | 4     |
| E-Commerce Fraud    | Aadhaar, Bank Statement                                     | 2     |
| Customer Care Fraud | Aadhaar, Bank Account, Bank Statement, UPI/Beneficiary      | 4     |
| Others              | Varies by fraud type                                        | 2-4   |

---

## 🔄 Workflow

```
1. User Registration
   ├─> Completes Didit KYC verification
   └─> diditSessionId stored in MongoDB Users collection

2. Complaint Filing
   ├─> User describes incident
   ├─> Classifier identifies fraud type (e.g., "upi_fraud")
   ├─> User confirms or manually selects fraud type
   └─> System determines required documents

3. Document Collection Starts
   ├─> System gets fraud-type-specific document list
   ├─> First document is AADHAR_PAN
   └─> Auto-fetch triggered

4. Aadhaar Auto-Fetch Process
   ├─> Retrieves diditSessionId from session or MongoDB
   ├─> Calls Didit API: GET /v2/session/{sessionId}/decision/
   ├─> Extracts front_image and back_image URLs
   ├─> Stores in session documents with verification flag
   └─> Shows success message with user details

5. Next Steps
   ├─> If more documents needed → Request next document
   └─> If all collected → Create complaint
```

---

## 🛠️ Technical Implementation

### Files Modified

#### 1. **diditService.js**

Added new method:

```javascript
async getAadhaarImages(sessionId) {
  // Fetches Didit session decision
  // Extracts ID verification data
  // Returns front/back image URLs + document details
}
```

**Returns:**

- `frontImage` - Front side Aadhaar image URL
- `backImage` - Back side Aadhaar image URL
- `portraitImage` - Portrait extracted from Aadhaar
- `fullFrontImage` - Full resolution front image
- `fullBackImage` - Full resolution back image
- `documentNumber` - Aadhaar number
- `fullName` - Name on Aadhaar
- `documentType` - Type of document verified
- `dateOfBirth` - DOB from Aadhaar
- `address` - Address from Aadhaar

#### 2. **whatsappService.js**

**Modified Methods:**

- `requestNextDocument()` - Detects AADHAR_PAN step and triggers auto-fetch
- `handleButtonPress()` - Added handlers for manual upload and retry

**New Method:**

```javascript
async autoFetchAadhaarFromDidit(from) {
  // 1. Get diditSessionId from session or MongoDB
  // 2. Call DiditService.getAadhaarImages()
  // 3. Store images in session documents
  // 4. Show success message
  // 5. Move to next document or complete complaint
  // 6. On error: offer manual upload or retry
}
```

#### 3. **sessionManager.js**

**Already implemented:**

- `FINANCIAL_FRAUD_DOCUMENT_REQUIREMENTS` - Mapping of fraud types to documents
- `getRequiredDocumentsForFraudType()` - Returns document list for fraud type

---

## 📊 Data Flow

### Didit API Response Structure

```json
{
  "session_id": "d0a9cc8c-f3ba-4856-8586-76e6dfcf185a",
  "status": "Approved",
  "id_verification": {
    "document_number": "613945788901",
    "full_name": "Aditya Shravan",
    "date_of_birth": "2003-11-29",
    "address": "Khordha Maitri Vihar...",
    "front_image": "https://service-didit-verification...jpg",
    "back_image": "https://service-didit-verification...jpg",
    "portrait_image": "https://...",
    "full_front_image": "https://...",
    "full_back_image": "https://..."
  }
}
```

### MongoDB Storage

```javascript
// In session.data.documents
{
  AADHAR_PAN: {
    frontImage: "https://...",
    backImage: "https://...",
    documentNumber: "613945788901",
    fullName: "Aditya Shravan",
    documentType: "Identity Card",
    dateOfBirth: "2003-11-29",
    address: "...",
    source: "didit",
    verified: true,
    uploadedAt: "2025-11-09T..."
  }
}
```

---

## 🎮 User Experience

### Success Flow

```
Bot: "🔄 Fetching your Aadhaar details from verification...
      Please wait..."

Bot: "✅ Aadhaar Details Retrieved Successfully!

      📄 Name: Aditya Shravan
      🔢 Number: 613945788901
      📅 DOB: 2003-11-29

      Your verified Aadhaar has been added to your complaint."

Bot: "Preparing next document request..."

Bot: "📷 Document Upload (2/4)
      Please upload: Bank Account Front Page..."
```

### Error Flow with Fallback

```
Bot: "❌ Unable to fetch Aadhaar automatically

      Error: Didit session ID not found

      Would you like to upload Aadhaar manually or retry?"

      [Upload Manually] [Retry] [Main Menu]
```

---

## 🔐 Security Features

1. **Verified Source**: Documents marked with `source: "didit"` and `verified: true`
2. **Session Validation**: Checks session status before fetching
3. **Error Handling**: Graceful fallback to manual upload
4. **Data Privacy**: Only stores image URLs, not actual images
5. **Audit Trail**: Timestamps and verification metadata stored

---

## 🧪 Testing

### Test File: `test-aadhaar-auto-fetch.js`

Run the test:

```bash
node test-aadhaar-auto-fetch.js
```

**Tests:**

1. ✅ Aadhaar image extraction from Didit session
2. ✅ Document requirements mapping for different fraud types
3. ✅ AADHAR_PAN detection in document flow
4. ✅ Error handling and fallback options

---

## 📱 Button Handlers

### New Buttons Added

1. **`upload_manually`**

   - Triggered when auto-fetch fails
   - Allows user to manually upload Aadhaar
   - Shows clear instructions for manual upload

2. **`retry_fetch`**
   - Retries the Didit API call
   - Useful for temporary network issues
   - Calls `autoFetchAadhaarFromDidit()` again

---

## 🚀 Benefits

### For Users

- ✅ No need to upload Aadhaar again (already verified)
- ✅ Faster complaint filing process
- ✅ Reduced manual errors
- ✅ Only relevant documents requested

### For System

- ✅ Reuses existing KYC data
- ✅ Higher quality documents (from Didit verification)
- ✅ Better data consistency
- ✅ Reduced storage needs (URLs instead of uploads)

---

## 📝 Configuration

### Environment Variables Required

```env
DIDIT_API_KEY=your_api_key_here
DIDIT_WORKFLOW_ID=your_workflow_id_here
```

### Database Requirements

- MongoDB Users collection must have `diditSessionId` field
- Already implemented in `models/Users.js`

---

## 🔍 Error Scenarios Handled

| Error                   | Handling                                 |
| ----------------------- | ---------------------------------------- |
| No diditSessionId found | Prompt for registration or manual upload |
| Didit API failure       | Retry button + manual upload option      |
| Session expired         | Prompt to re-verify or manual upload     |
| No images in session    | Manual upload fallback                   |
| Network timeout         | Retry with timeout message               |

---

## 🎯 Future Enhancements

1. **Cache Aadhaar images**: Store in Cloudinary for faster access
2. **Offline mode**: Download images during registration
3. **Multiple ID support**: PAN card, Voter ID, etc.
4. **Image quality check**: Validate fetched images before use
5. **Compression**: Optimize image URLs before storage

---

## 📞 Support

For issues or questions:

1. Check `diditSessionId` exists in MongoDB
2. Verify Didit API key is valid
3. Test with `test-aadhaar-auto-fetch.js`
4. Check logs for detailed error messages

---

## ✅ Implementation Checklist

- [x] Add `getAadhaarImages()` to DiditService
- [x] Modify `requestNextDocument()` to detect AADHAR_PAN
- [x] Add `autoFetchAadhaarFromDidit()` method
- [x] Add button handlers for manual upload & retry
- [x] Update Users model with diditSessionId field
- [x] Add error handling and fallback mechanism
- [x] Create test script
- [x] Document the feature

---

## 🎉 Status: IMPLEMENTATION COMPLETE

The Aadhaar auto-fetch feature is now fully integrated and ready for testing!

**Next Steps:**

1. Run `node test-aadhaar-auto-fetch.js` to verify
2. Test with real WhatsApp flow
3. Monitor for any edge cases
4. Deploy to production

---

_Last Updated: November 9, 2025_
