# 🚀 Quick Reference Card - Classification API Integration

## 📦 Files Changed Summary

### New Files (4):

```
✅ services/classificationService.js
✅ CLASSIFICATION_API_INTEGRATION.md
✅ CLASSIFICATION_WORKFLOW_DIAGRAM.md
✅ CLASSIFICATION_TESTING_GUIDE.md
✅ IMPLEMENTATION_SUMMARY.md
```

### Modified Files (3):

```
✅ controllers/whatsappController.js
✅ services/sessionManager.js
✅ .env
```

---

## 🔑 Key Changes at a Glance

### 1. New API Call

```javascript
POST http://localhost:8000/classify
Body: { "complaint_text": "..." }
```

### 2. New Session States

```javascript
AUTO_CLASSIFICATION;
CLASSIFICATION_CONFIRMATION;
```

### 3. New Button Handlers

```javascript
confirm_classification  → User accepts AI classification
reject_classification   → User rejects, wants manual
```

### 4. New Methods

```javascript
classifyAndConfirm(); // Call API and show results
handleClassificationResponse(); // Handle user confirmation
```

---

## 🎯 Flow in 3 Steps

1. **User Input** → Bot analyzes with AI
2. **Show Results** → User confirms/rejects
3. **Route** → Documents (if yes) or Manual (if no)

---

## 🧪 Quick Test

### Start Services:

```powershell
# Terminal 1: Classification API
python app.py

# Terminal 2: WhatsApp Bot
npm start
```

### Test Message:

```
I lost 40000 rupees in a credit card fraud.
Someone called claiming to be from SBI bank
and asked for my CVV and OTP.
```

### Expected Result:

```
🤖 AI Classification Result
📌 Category: Financial Fraud
📂 Sub-category: Credit Card Fraud
✅ Confidence: 89.9%
💰 Amount: ₹40,000
🏦 Bank: sbi
```

---

## ⚠️ Troubleshooting

### API Not Working?

```powershell
# Check if API is running
netstat -ano | findstr :8000

# Test API directly
curl -X POST http://localhost:8000/classify -H "Content-Type: application/json" -d '{"complaint_text":"test fraud"}'
```

### Bot Not Responding?

```powershell
# Check bot logs
# Look for: "Calling classification API..."

# Check if port 3000 is free
netstat -ano | findstr :3000
```

### Classification Failed?

- ✅ Bot automatically falls back to manual selection
- ✅ User sees: "Please select the fraud category manually"
- ✅ No disruption to user flow

---

## 📊 What Gets Stored

```javascript
session.data = {
  incident: "User's description",
  classificationResult: { /* Full API response */ },
  category: "financial",
  fraudType: "Credit Card Fraud",
  extractedEntities: { amount, bank, ... },
  caseId: "CC1731023456789"
}
```

---

## 🎨 User Journey

```
1. "Hello" → Menu
2. "New Complaint" → Registration
3. Describe incident → AI analyzing...
4. See classification → Confirm/Reject
5. Upload documents → Submit
6. Get Case ID → Done!
```

---

## 🔄 Fallback Flow

```
API Fails → Show error → Manual selection → Continue normal flow
           (User never stuck)
```

---

## ✅ Success Checklist

- [ ] API returns classification in <5 seconds
- [ ] Classification shows on WhatsApp with emojis
- [ ] Buttons work (Yes/No/Back)
- [ ] "Yes" goes to document collection
- [ ] "No" goes to manual selection
- [ ] API failure shows fallback message
- [ ] Manual selection works after rejection
- [ ] Case ID generated correctly
- [ ] Data saved to MongoDB

---

## 📞 Quick Commands

### Check Services:

```powershell
# All ports
netstat -ano | findstr "3000 8000 27017"
```

### View Logs:

```powershell
# Bot logs in terminal
# API logs in API terminal
```

### Kill Process:

```powershell
# Find PID
netstat -ano | findstr :3000
# Kill it
taskkill /PID <PID> /F
```

---

## 🎯 What to Monitor

1. ✅ Classification API response time
2. ✅ User confirmation rate (Yes vs No)
3. ✅ Fallback usage frequency
4. ✅ Classification accuracy
5. ✅ Overall user satisfaction

---

## 📚 Documentation Links

- **Implementation Details** → CLASSIFICATION_API_INTEGRATION.md
- **Visual Workflow** → CLASSIFICATION_WORKFLOW_DIAGRAM.md
- **Testing Guide** → CLASSIFICATION_TESTING_GUIDE.md
- **Complete Summary** → IMPLEMENTATION_SUMMARY.md

---

## 🎉 You're All Set!

**The system is ready to use AI-powered classification with intelligent fallback!**

---

## 🆘 Need Help?

1. Check logs for errors
2. Verify API is running
3. Test API independently
4. Review documentation files
5. Check session data in MongoDB

**Happy Testing! 🚀**
