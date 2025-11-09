# 🚀 Quick Start Guide - Status Notifications & High Priority Alerts

## 🎯 What's New?

1. **🚨 Financial Fraud = HIGH PRIORITY**
   - All financial fraud cases automatically marked as high priority
   - Users receive special alert messages
   - Fast-track processing timeline

2. **📢 Automatic WhatsApp Notifications**
   - Users receive WhatsApp alerts when case status changes
   - Professional, detailed messages
   - Includes next steps and helpline info

---

## ⚡ Quick Test (5 Minutes)

### Step 1: Test High Priority Alert

```bash
# Edit test file first
# Replace TEST_PHONE with your WhatsApp number (with country code)
nano test-status-notifications.js

# Run tests
node test-status-notifications.js
```

**Expected Result:**
- ✅ You receive 3 WhatsApp messages
- ✅ Test case created in database
- ✅ All tests pass

---

### Step 2: Test Via WhatsApp Bot

**File a Financial Fraud Case:**

1. Send "Hello" to bot
2. Click "New Complaint"
3. Complete registration
4. Choose "Financial Fraud"
5. Choose any fraud type (e.g., "UPI Fraud")
6. Complete the flow

**Expected Messages:**
- ✅ Success message with "🚨 HIGH PRIORITY" badge
- ✅ Priority level shown as "HIGH"
- ✅ After 3 seconds: High priority alert message

---

### Step 3: Test Status Change Notification

**Update Case Status from Frontend:**

1. Go to http://localhost:3001/complaints
2. Click on any case
3. Click "Update Status" button
4. Change status (e.g., "Pending" → "Under Review")
5. Add remarks
6. Save

**Expected Result:**
- ✅ User receives WhatsApp notification
- ✅ Message includes old status, new status, remarks
- ✅ Professional formatting with next steps

---

## 📊 Check Priority Cases

### Query Database:

```javascript
// Connect to MongoDB
mongo "your_mongodb_uri"

// Find high priority cases
db.cases.find({ priority: "high" }).pretty()

// Find high alert cases
db.cases.find({ isHighAlert: true }).pretty()

// Count by priority
db.cases.aggregate([
  { $group: { _id: "$priority", count: { $sum: 1 } } }
])
```

---

## 🔧 Manual Notification Test

### Send Test Notification:

```javascript
// Create test-manual-notification.js
const StatusNotificationService = require("./services/statusNotificationService");

const service = new StatusNotificationService();

service.sendStatusUpdateNotification(
  "919876543210", // Your WhatsApp number
  "CC1731123456789",
  "pending",
  "under_review",
  "This is a test notification"
).then(result => {
  console.log("Result:", result);
  process.exit(0);
});
```

```bash
node test-manual-notification.js
```

---

## 📱 What Users Will See

### Message 1: Case Filed (Financial Fraud)
```
✅ Complaint Filed Successfully!

🚨 HIGH PRIORITY - IMMEDIATE ACTION REQUIRED

📋 Case ID: CC1731123456789

📊 Case Summary:
• Incident: [their description]
• Category: Financial Fraud
• Fraud Type: UPI Fraud
• Priority Level: HIGH
• Documents Submitted: 5/8

⚠️ This case has been marked as HIGH PRIORITY...

📞 Response Timeline:
• Initial Review: Within 24 hours
• Team Assignment: Within 48 hours
...
```

### Message 2: High Priority Alert (3 seconds later)
```
🚨 HIGH PRIORITY CASE ALERT

Dear valued user,

Your complaint has been registered and marked as 
HIGH PRIORITY due to its financial nature.

📋 Case Details:
• Case ID: CC1731123456789
• Type: UPI Fraud
• Priority: HIGH ⚠️
...
```

### Message 3: Status Changed (when admin updates)
```
📢 Case Status Update Notification

Dear valued user,

Your complaint status has been updated:

📋 Case ID: CC1731123456789

━━━━━━━━━━━━━━━━━━━━━━

📊 Status Change:
Previous: Pending Review
Current: 🔍 UNDER REVIEW

Your case is being reviewed by our team
...
```

---

## 🎨 Priority Levels

| Priority | Use Case | Response Time | Alert |
|----------|----------|---------------|-------|
| 🚨 **Critical** | Life-threatening cases | Immediate | Yes |
| 🔴 **High** | Financial fraud | 12-24 hours | Yes |
| 🟡 **Medium** | Social media fraud | 24-48 hours | No |
| 🟢 **Low** | General inquiries | 3-5 days | No |

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Financial fraud case shows "HIGH PRIORITY" badge
- [ ] User receives 2 messages (success + alert)
- [ ] Status check shows priority level
- [ ] Status change sends WhatsApp notification
- [ ] Notification includes remarks from admin
- [ ] Database has `priority` and `isHighAlert` fields
- [ ] All bot messages are professional
- [ ] Error messages are user-friendly
- [ ] Test suite passes all tests

---

## 🐛 Common Issues

### Issue: Notification not sent

**Solution:**
```javascript
// Check user phone number format
const user = await Users.findOne({ aadharNumber: "123456789012" });
console.log("Phone:", user.phoneNumber);
// Should be: 9876543210 (without country code in DB)
// Will be sent as: 919876543210 (with country code)
```

### Issue: Priority not showing

**Solution:**
```javascript
// Update existing cases
await Cases.updateMany(
  { caseCategory: "Financial" },
  { $set: { priority: "high", isHighAlert: true } }
);
```

### Issue: WhatsApp error "Invalid phone number"

**Solution:**
- Ensure phone number starts with country code (91 for India)
- Format: 919876543210 (no spaces, no +, no dashes)
- Check WhatsApp Business API sandbox settings

---

## 📞 Emergency Contacts

**Bot Not Working?**
1. Check server logs: `npm start`
2. Verify MongoDB connection
3. Check WhatsApp API credentials

**Database Issues?**
1. Verify MongoDB URI in .env
2. Check database permissions
3. Verify schema updates applied

**Notification Issues?**
1. Test phone number format
2. Verify WhatsApp token
3. Check API rate limits

---

## 🚀 Go Live Checklist

Before production deployment:

1. **Environment**
   - [ ] Update WHATSAPP_TOKEN
   - [ ] Update PHONE_NUMBER_ID
   - [ ] Update MONGODB_URI

2. **Testing**
   - [ ] Run test suite: `node test-status-notifications.js`
   - [ ] File test case via WhatsApp
   - [ ] Update test case status
   - [ ] Verify notifications received

3. **Database**
   - [ ] Backup existing data
   - [ ] Apply schema updates
   - [ ] Update existing cases (optional)

4. **Monitoring**
   - [ ] Set up error logging
   - [ ] Monitor notification success rate
   - [ ] Track high priority case resolution time

5. **Documentation**
   - [ ] Train support team
   - [ ] Update user documentation
   - [ ] Create admin guide

---

## 📚 Related Documentation

- **Full Documentation:** `HIGH_PRIORITY_STATUS_NOTIFICATION_FEATURE.md`
- **Test Suite:** `test-status-notifications.js`
- **Service Code:** `services/statusNotificationService.js`
- **Controller:** `controllers/whatsappController.js`

---

**Implementation Complete! ✅**  
**Ready for Testing! 🧪**  
**Ready for Production! 🚀**

**Date:** November 9, 2025  
**Version:** 1.0.0
