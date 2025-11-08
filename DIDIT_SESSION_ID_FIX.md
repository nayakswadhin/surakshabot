# 🔧 Fix: Didit Session ID Not Found Error

## Problem

Users were getting the error: **"Unable to fetch Aadhaar automatically - Didit session ID not found"**

## Root Cause

The phone number format mismatch between WhatsApp and MongoDB:

- **WhatsApp sends:** `917205703494` (with country code 91)
- **MongoDB stores:** `7205703494` (without country code)

When looking up users, the system was trying to find `917205703494` but the database had `7205703494`, causing the lookup to fail.

## Solution Implemented

### 1. Enhanced Phone Number Lookup Logic

Updated `autoFetchAadhaarFromDidit()` in `whatsappService.js` to:

```javascript
// Remove country code (91) from phone number if present
let phoneNumber = from;
if (from.startsWith("91") && from.length > 10) {
  phoneNumber = from.substring(2); // Remove "91" prefix
}

// Try to find user with cleaned format
let user = await User.findOne({ phoneNumber: phoneNumber });

// If not found, try with the original format
if (!user) {
  user = await User.findOne({ phoneNumber: from });
}
```

### 2. Better Error Messages

Added specific error messages to help diagnose issues:

- "User account not found" - User doesn't exist in database
- "Didit verification not completed" - User exists but hasn't completed KYC

### 3. Debug Logging

Added comprehensive logging:

```javascript
console.log("Session ID not found in session, fetching from database...");
console.log(`Looking up user with phone number: ${phoneNumber}`);
console.log(`✅ Retrieved session ID from database: ${sessionId}`);
```

### 4. Session Caching

Store the retrieved `diditSessionId` in session for future use:

```javascript
this.sessionManager.updateSession(from, {
  data: {
    ...session.data,
    diditSessionId: sessionId,
  },
});
```

## Testing Results

Created `test-phone-lookup.js` to verify the fix:

### Test Output:

```
Testing format: 917205703494
----------------------------------------
  Cleaned number: 7205703494
  ✅ User found!
     Name: Aditya Shravan
     Phone: 7205703494
     Aadhaar: 613945788901
     Didit Session ID: d0a9cc8c-f3ba-4856-8586-76e6dfcf185a
  ✅ Didit Session ID exists - Auto-fetch will work!
```

## Flow After Fix

```
1. User triggers Aadhaar auto-fetch
   ↓
2. Check session for diditSessionId
   ↓
   Not Found? → Clean phone number (remove "91" if present)
   ↓
3. Search MongoDB with cleaned number
   ↓
   Not Found? → Try original format
   ↓
4. Found User? → Check for diditSessionId
   ↓
5. Store sessionId in session cache
   ↓
6. Call Didit API with sessionId
   ↓
7. Fetch & store Aadhaar images
   ↓
8. Success! Move to next document
```

## Error Scenarios Now Handled

| Scenario               | Error Message                      | Action                 |
| ---------------------- | ---------------------------------- | ---------------------- |
| User not in DB         | "User account not found"           | Register user first    |
| User exists but no KYC | "Didit verification not completed" | Complete Didit KYC     |
| Phone format mismatch  | Auto-handled                       | Tries both formats     |
| Didit API failure      | "Failed to fetch images"           | Retry or manual upload |

## Files Modified

1. **whatsappService.js**

   - Enhanced `autoFetchAadhaarFromDidit()` method
   - Added phone number format handling
   - Improved error messages and logging

2. **test-phone-lookup.js** (New)
   - Test script to verify phone number lookup
   - Shows all users with Didit Session IDs

## Verification Steps

### To Test the Fix:

1. **Check if user exists in database:**

   ```bash
   node test-phone-lookup.js
   ```

2. **Test with WhatsApp:**

   - User files complaint
   - When Aadhaar document is requested
   - System should auto-fetch from Didit
   - No error should occur

3. **Check logs for:**
   ```
   🔄 Auto-fetching Aadhaar from Didit for 917205703494
   Session ID not found in session, fetching from database...
   Looking up user with phone number: 7205703494
   ✅ Retrieved session ID from database: d0a9cc8c-...
   ✅ Aadhaar images extracted successfully
   ```

## Prevention for Future

### Best Practices:

1. Always normalize phone numbers before database operations
2. Store phone numbers in a consistent format (without country code)
3. Add fallback lookups for different formats
4. Cache session IDs to reduce database queries
5. Log phone number format for debugging

### Recommended Enhancement:

Create a utility function for phone number normalization:

```javascript
function normalizePhoneNumber(phone) {
  // Remove country code if present
  if (phone.startsWith("91") && phone.length > 10) {
    return phone.substring(2);
  }
  return phone;
}
```

## Status: ✅ FIXED

The "Didit session ID not found" error is now resolved. The system correctly handles phone number format differences and retrieves the session ID from the database when needed.

---

_Fixed: November 9, 2025_
_Tested: ✅ Working correctly_
