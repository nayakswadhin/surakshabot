# Dynamic Document Collection Feature

## Overview

Implemented smart document collection that requests only relevant documents based on the specific type of financial fraud, reducing user burden and improving efficiency.

## Implementation Date

November 9, 2025

## What Was Changed

### 1. **sessionManager.js** - Document Requirements Mapping

#### Added New Constant: `FINANCIAL_FRAUD_DOCUMENT_REQUIREMENTS`

Maps each fraud type to its specific required documents:

```javascript
static FINANCIAL_FRAUD_DOCUMENT_REQUIREMENTS = {
  'investment_fraud': ['aadhar_pan', 'bank_front_page', 'bank_statement', 'beneficiary_details'],
  'customer_care_fraud': ['aadhar_pan', 'bank_front_page', 'bank_statement', 'upi_screenshots'],
  'upi_fraud': ['aadhar_pan', 'bank_front_page', 'upi_screenshots', 'beneficiary_details'],
  'apk_fraud': ['aadhar_pan', 'bank_front_page', 'bank_statement', 'upi_screenshots'],
  // ... 19 more fraud types
}
```

#### Added Helper Method: `getRequiredDocumentsForFraudType(fraudType)`

- Returns array of required documents for a specific fraud type
- Falls back to `['aadhar_pan', 'bank_statement']` for unknown types

#### Updated Document Display Names

Enhanced descriptions with more specific instructions:

- "Aadhaar Card / PAN Card (Identity proof)"
- "Bank Statement (highlighting fraudulent transaction with transaction reference number)"
- "UPI Transaction Screenshot (showing UTR number, date and time)"
- etc.

### 2. **whatsappService.js** - Document Collection Flow

#### Modified `startDocumentCollection(from)`

**Before:** Always requested 8 documents for all financial fraud cases

**After:**

- Retrieves fraud type from session (`selectedFraudType` or `fraudType`)
- Gets required documents using `SessionManager.getRequiredDocumentsForFraudType()`
- Stores required documents list in session
- Shows correct document count in initial message
- Example: "Based on your fraud type, we need 4 documents from you"

#### Modified `requestNextDocument(from)`

**Before:** Showed progress as "X of 8" always

**After:**

- Reads dynamic document count from session (`totalRequiredDocuments`)
- Shows accurate progress: "Document Upload (2/4)" instead of "(2/8)"
- Uses stored `requiredDocuments` array from session

#### Modified `processDocumentUpload(from, uploadResult)`

**Before:** Used `SessionManager.getNextDocumentStep()` which followed fixed flow

**After:**

- Gets next document from session's `requiredDocuments` array
- Uses `currentDocumentIndex` to track position
- Completes complaint after all required documents are collected (not after 8)

#### Updated `getFraudTypeDisplay(fraudType)`

**Before:** Only had social media fraud types

**After:**

- Added all 23 financial fraud types
- Maintains social media fraud types
- Returns user-friendly display names

## Document Requirements by Fraud Type

| Fraud Type                   | Documents Required                                               | Count |
| ---------------------------- | ---------------------------------------------------------------- | ----- |
| Investment/Trading/IPO Fraud | Aadhaar/PAN, Bank Front, Bank Statement, Beneficiary Details     | 4     |
| Customer Care Fraud          | Aadhaar/PAN, Bank Front, Bank Statement, UPI Screenshot          | 4     |
| UPI Fraud                    | Aadhaar/PAN, Bank Front, UPI Screenshot, Beneficiary Details     | 4     |
| APK Fraud                    | Aadhaar/PAN, Bank Front, Bank Statement, UPI Screenshot          | 4     |
| Franchisee Fraud             | Aadhaar/PAN, Bank Statement, Beneficiary Details                 | 3     |
| Job Fraud                    | Aadhaar/PAN, Bank Statement, Beneficiary Details                 | 3     |
| Debit Card Fraud             | Aadhaar/PAN, Card Photo, Bank Front, Bank Statement              | 4     |
| Credit Card Fraud            | Aadhaar/PAN, Card Photo, Credit Card Statement                   | 3     |
| E-Commerce Fraud             | Aadhaar/PAN, Bank Statement                                      | 2     |
| Loan App Fraud               | Aadhaar/PAN, Bank Statement, Beneficiary Details                 | 3     |
| Sextortion Fraud             | Aadhaar/PAN                                                      | 1     |
| OLX Fraud                    | Aadhaar/PAN, Bank Statement, UPI Screenshot, Beneficiary Details | 4     |
| Lottery Fraud                | Aadhaar/PAN, Bank Statement, Beneficiary Details                 | 3     |
| Hotel Booking Fraud          | Aadhaar/PAN, Bank Statement                                      | 2     |
| Gaming App Fraud             | Aadhaar/PAN, Bank Statement, UPI Screenshot                      | 3     |
| AEPS Fraud                   | Aadhaar/PAN, Bank Front, Bank Statement                          | 3     |
| Tower Installation Fraud     | Aadhaar/PAN, Bank Statement, Beneficiary Details                 | 3     |
| E-Wallet Fraud               | Aadhaar/PAN, UPI Screenshot, Beneficiary Details                 | 3     |
| Digital Arrest Fraud         | Aadhaar/PAN, Bank Statement, UPI Screenshot                      | 3     |
| Fake Website Fraud           | Aadhaar/PAN, Bank Statement, Beneficiary Details                 | 3     |
| Ticket Booking Fraud         | Aadhaar/PAN, Bank Statement                                      | 2     |
| Insurance Fraud              | Aadhaar/PAN, Bank Statement, Beneficiary Details                 | 3     |
| Other Financial Fraud        | Aadhaar/PAN, Bank Statement                                      | 2     |

## Workflow

### Previous Flow:

1. User describes incident → Classifier identifies fraud type
2. User confirms fraud type
3. System asks for **ALL 8 documents** regardless of fraud type
4. User uploads 8 documents
5. Complaint created

### New Flow:

1. User describes incident → Classifier identifies fraud type
2. User confirms fraud type
3. **System determines required documents based on fraud type** ✨
4. System asks for **ONLY relevant documents** (e.g., 3-4 documents)
5. User uploads only required documents
6. Complaint created

## Benefits

### For Users:

- ✅ **Reduced Upload Burden**: Upload only 2-4 relevant documents instead of 8
- ✅ **Clear Instructions**: Each document has detailed requirements
- ✅ **Accurate Progress**: Shows "2 of 4" instead of misleading "2 of 8"
- ✅ **Faster Process**: Less time spent uploading irrelevant documents

### For System:

- ✅ **Smarter Collection**: Only collects necessary evidence
- ✅ **Better Data Quality**: Users focus on relevant documents
- ✅ **Fraud-Type Aware**: Tailored document requirements per fraud type
- ✅ **Flexible**: Easy to add/modify document requirements

## How It Works

### Session Data Structure:

```javascript
session: {
  state: "DOCUMENT_COLLECTION",
  step: "aadhar_pan",  // Current document being collected
  data: {
    selectedFraudType: "upi_fraud",  // From classifier
    requiredDocuments: ["aadhar_pan", "bank_front_page", "upi_screenshots", "beneficiary_details"],
    totalRequiredDocuments: 4,
    currentDocumentIndex: 0,
    documents: {
      aadhar_pan: "cloudinary_url_1",
      // ... other uploaded documents
    }
  }
}
```

### Key Logic:

1. When document collection starts, system calls `SessionManager.getRequiredDocumentsForFraudType(fraudType)`
2. Required documents list is stored in `session.data.requiredDocuments`
3. System iterates through required documents array using `currentDocumentIndex`
4. After each upload, moves to next document in required array
5. Completes complaint when `currentDocumentIndex >= requiredDocuments.length`

## Testing

### Test Cases:

#### Test 1: UPI Fraud (4 documents)

1. User reports UPI fraud → Classifier identifies `upi_fraud`
2. User confirms
3. System asks for 4 documents:
   - Aadhaar/PAN Card
   - Bank Account Front Page
   - UPI Transaction Screenshot
   - Beneficiary Account Details
4. Progress shows: 1/4, 2/4, 3/4, 4/4
5. Complaint created after 4th document

#### Test 2: E-Commerce Fraud (2 documents)

1. User reports e-commerce fraud → Classifier identifies `ecommerce_fraud`
2. User confirms
3. System asks for 2 documents:
   - Aadhaar/PAN Card
   - Bank Statement
4. Progress shows: 1/2, 2/2
5. Complaint created after 2nd document

#### Test 3: Sextortion Fraud (1 document)

1. User reports sextortion → Classifier identifies `sextortion_fraud`
2. User confirms
3. System asks for 1 document:
   - Aadhaar/PAN Card
4. Progress shows: 1/1
5. Complaint created immediately after

## Files Modified

1. **services/sessionManager.js**

   - Added `FINANCIAL_FRAUD_DOCUMENT_REQUIREMENTS` mapping
   - Added `getRequiredDocumentsForFraudType()` method
   - Updated document display names

2. **services/whatsappService.js**
   - Modified `startDocumentCollection()` - fraud-type-aware initialization
   - Modified `requestNextDocument()` - dynamic progress tracking
   - Modified `processDocumentUpload()` - custom document flow
   - Updated `getFraudTypeDisplay()` - added all financial fraud types
   - Added `getFraudTypeDisplayName()` - alias for backward compatibility

## Backward Compatibility

- ✅ If fraud type is unknown, falls back to minimal document set (Aadhaar + Bank Statement)
- ✅ Old session data still works (uses fallback to 8 documents)
- ✅ All existing methods preserved
- ✅ No breaking changes to API or database structure

## Future Enhancements

1. **Optional Documents**: Allow users to skip non-mandatory documents
2. **Document Validation**: Check if uploaded document matches expected type using AI
3. **Payment-Based Logic**: For sextortion, ask for bank statement only if payment occurred
4. **Admin Configuration**: Allow admins to modify document requirements without code changes
5. **Smart Suggestions**: Suggest document types based on incident description

## Conclusion

The dynamic document collection feature successfully reduces user burden while maintaining compliance with fraud-type-specific evidence requirements. The implementation is flexible, maintainable, and user-friendly.

---

**Status**: ✅ Implemented and Ready for Testing
**Impact**: High - Significantly improves user experience
**Risk**: Low - Backward compatible with fallback mechanisms
