# 🚀 Quick Start Guide - Classification API Testing

## Prerequisites Checklist

- [ ] MongoDB running (connection string in .env)
- [ ] Classification API running on port 8000
- [ ] WhatsApp Bot configured with valid tokens
- [ ] All npm dependencies installed
- [ ] .env file properly configured

---

## Step 1: Start Classification API

### Option A: Python Flask API

```bash
cd path/to/classification-api
python app.py
```

### Option B: FastAPI

```bash
cd path/to/classification-api
uvicorn main:app --reload --port 8000
```

**Expected Output:**

```
 * Running on http://localhost:8000
```

**Test API is Working:**

```powershell
# PowerShell
$body = @{
    complaint_text = "I lost 50000 rupees in a credit card fraud"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/classify" -Method POST -Body $body -ContentType "application/json"
```

---

## Step 2: Start WhatsApp Bot

```powershell
cd "C:\Users\nayak\OneDrive\Desktop\cyber security hackathon\SurakshaBot-Chatbot"
npm start
```

**Expected Output:**

```
Server running on port 3000
MongoDB connected successfully
WhatsApp service initialized
```

---

## Step 3: Test the Complete Flow

### 🧪 Test Case 1: Text Input with Classification

1. **Send greeting to WhatsApp bot:**

   ```
   Hello
   ```

2. **Select "New Complaint"**

3. **Complete registration/verification** (if first time)

4. **When asked for incident description, select:**

   ```
   ⌨️ Text Input
   ```

5. **Type incident description:**

   ```
   I have been scammed in an online SBI credit card fraud.
   The caller asked me to give the OTP for a limit increase
   on my credit card. This happened yesterday, on November 6th,
   2025, around 3:00 PM. From my credit card, around ₹40,000
   was taken away by the fraudster.
   ```

6. **Wait for AI classification** (5-10 seconds)

7. **You should see:**

   ```
   🤖 AI Classification Result

   📌 Category: Financial Fraud
   📂 Sub-category: Credit Card Fraud
   ✅ Confidence: 89.9%

   📊 Extracted Information:
   💰 Amount: ₹40,000
   🏦 Bank: sbi

   💡 Suggested Action: [...]

   ❓ Is this classification correct?
   ```

8. **Test both paths:**
   - Click "✅ Yes, Correct" → Should go to document collection
   - Click "❌ No, Wrong" → Should show manual category selection

---

### 🧪 Test Case 2: Voice Input with Classification

1. **Start new complaint**

2. **When asked for incident description, select:**

   ```
   🎤 Voice Input
   ```

3. **Record voice message** describing fraud incident

4. **Wait for transcription and improvement**

5. **Confirm transcription:**

   ```
   ✅ Correct
   ```

6. **Wait for AI classification**

7. **Verify classification results appear**

8. **Test confirmation**

---

### 🧪 Test Case 3: API Failure Fallback

1. **Stop the classification API** (Ctrl+C)

2. **Start new complaint with incident description**

3. **You should see:**

   ```
   ⚠️ We couldn't automatically classify your complaint.

   Please select the fraud category manually.
   ```

4. **Verify manual selection appears:**

   ```
   [Financial Fraud] [Social Media Fraud]
   ```

5. **Complete complaint using manual flow**

---

## 📝 Monitoring & Debugging

### Check WhatsApp Bot Logs:

```powershell
# In the terminal where bot is running, watch for:
Calling classification API with text: ...
Classification API response: { ... }
User confirmed classification, proceeding to document collection
```

### Check Classification API Logs:

```bash
# In the API terminal, watch for:
POST /classify 200 OK
Request body: { "complaint_text": "..." }
Response: { "primary_category": "...", ... }
```

### Common Issues:

#### Issue: "API not reachable"

**Solution:**

```powershell
# Check if API is running
netstat -ano | findstr :8000

# If not running, start it:
python app.py
```

#### Issue: "Classification takes too long"

**Solution:**

- API has 30-second timeout
- Check API server logs for errors
- Verify ML model is loaded properly

#### Issue: "Wrong classification"

**Solution:**

- User can click "❌ No, Wrong"
- Will fall back to manual selection
- Track these cases for ML model improvement

---

## 🎯 What to Verify

### ✅ Successful Test Checklist:

- [ ] Bot responds to "Hello"
- [ ] Can complete registration/verification
- [ ] Incident description page shows voice/text choice
- [ ] Text input triggers classification API
- [ ] Voice input → transcription → classification
- [ ] Classification results display correctly
- [ ] Confidence score shows as percentage
- [ ] Extracted entities appear (amount, bank, etc.)
- [ ] Suggested action is displayed
- [ ] "Yes, Correct" proceeds to document collection
- [ ] "No, Wrong" falls back to manual selection
- [ ] Manual selection works after rejection
- [ ] API failure triggers fallback gracefully
- [ ] Case ID is generated correctly
- [ ] Correct document collection based on category

---

## 🔍 Testing Different Fraud Types

### Financial Fraud Examples:

**Credit Card Fraud:**

```
I got a call from someone claiming to be from my bank.
They asked for my credit card CVV and OTP. I shared it
and lost ₹50,000 from my account.
```

**UPI Fraud:**

```
I received a payment request on PhonePe for ₹25,000.
I accidentally clicked accept instead of decline.
The money was transferred to an unknown account.
```

**Investment Fraud:**

```
I invested ₹2 lakhs in a fake trading app promising
high returns. The app is now not working and I can't
withdraw my money.
```

### Social Media Fraud Examples:

**Facebook Fraud:**

```
Someone created a fake Facebook profile using my photos
and is messaging my friends asking for money. They have
already scammed 5 people.
```

**WhatsApp Fraud:**

```
I received a WhatsApp message claiming I won a lottery.
They asked me to pay ₹5000 as processing fee. I paid
but never received anything.
```

---

## 📊 Expected API Response Format

```json
{
  "primary_category": "Financial Fraud",
  "subcategory": "Credit Card Fraud",
  "extracted_entities": {
    "amount": "₹40,000",
    "phone_numbers": [],
    "upi_id": null,
    "urls": [],
    "platform": null,
    "other": {
      "account_numbers": [],
      "transaction_ids": [],
      "dates": ["November 6th, 2025", "3:00 PM"],
      "bank_names": ["sbi"],
      "orgs": ["OTP"],
      "persons": []
    }
  },
  "confidence_scores": {
    "primary_category": 0.8998458683490753,
    "subcategory": 0.8756192326545715
  },
  "suggested_action": "URGENT: 1) Block card immediately via bank app/hotline 2) Report unauthorized transactions 3) Request chargeback 4) File complaint on cybercrime.gov.in 5) Call 1930. Do not share CVV/PIN/OTP with anyone."
}
```

---

## 🐛 Troubleshooting Commands

### Check if services are running:

```powershell
# Check WhatsApp Bot (port 3000)
netstat -ano | findstr :3000

# Check Classification API (port 8000)
netstat -ano | findstr :8000

# Check MongoDB (port 27017)
netstat -ano | findstr :27017
```

### Restart services:

```powershell
# Kill process on port (if stuck)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Restart bot
npm start
```

### View detailed logs:

```powershell
# Add DEBUG mode in .env
DEBUG=true

# Then restart
npm start
```

---

## 🎉 Success Indicators

### You know it's working when:

1. ✅ **API Call Successful:**

   ```
   Calling classification API with text: I have been scammed...
   Classification API response: { "primary_category": "Financial Fraud", ... }
   ```

2. ✅ **User Sees Results:**

   - Classification message appears in WhatsApp
   - Confidence score is displayed
   - Extracted entities are shown
   - User gets confirmation buttons

3. ✅ **Flow Continues:**

   - After confirmation, moves to document collection
   - Case ID is generated
   - Correct documents are requested

4. ✅ **Fallback Works:**
   - If API fails, manual selection appears
   - No error messages to user
   - Flow continues smoothly

---

## 📞 Next Steps After Testing

1. **Verify Data in Database:**

   ```javascript
   // Check MongoDB for saved case
   db.cases.findOne({ caseId: "CC..." });
   ```

2. **Review Logs:**

   - Check for any errors or warnings
   - Monitor classification accuracy
   - Track fallback usage

3. **User Acceptance Testing:**

   - Have real users test the flow
   - Collect feedback on classification accuracy
   - Adjust confidence thresholds if needed

4. **Performance Monitoring:**
   - Measure average classification time
   - Track API success rate
   - Monitor user confirmation rate

---

## 🚀 Ready to Go Live!

Once all tests pass, the system is ready for production use. The AI classification will help users file complaints faster while maintaining the option to manually correct any misclassifications.

**Happy Testing! 🎉**
