# 🚀 Quick Start Guide

## Setup in 3 Steps (Windows)

### Step 1: Create Virtual Environment
```cmd
python -m venv .venv
.venv\Scripts\activate
```

### Step 2: Install Dependencies
```cmd
pip install --upgrade pip
pip install -r requirements.txt
```

**First-time setup**: Downloads ~250MB of models (DistilBERT + spaCy). Requires internet. Cached after first run.

### Step 3: Run Server
```cmd
python main.py
```

✅ Server running at **http://127.0.0.1:8000**

---

## Test the API

### Option 1: Using curl (Windows cmd)

**UPI Fraud Example:**
```cmd
curl -X POST http://127.0.0.1:8000/classify -H "Content-Type: application/json" -d "{\"complaint_text\":\"I lost ₹15000 via PhonePe to scammer@paytm. Contact +91-9876543210\"}"
```

**Sextortion Example:**
```cmd
curl -X POST http://127.0.0.1:8000/classify -H "Content-Type: application/json" -d "{\"complaint_text\":\"Someone is blackmailing me with intimate photos and demanding ₹50000\"}"
```

**Instagram Impersonation Example:**
```cmd
curl -X POST http://127.0.0.1:8000/classify -H "Content-Type: application/json" -d "{\"complaint_text\":\"Fake Instagram profile impersonating me is messaging my friends asking for money\"}"
```

### Option 2: Using Python requests

```python
import requests
import json

response = requests.post(
    "http://127.0.0.1:8000/classify",
    json={"complaint_text": "I lost ₹5000 via UPI fraud"}
)

print(json.dumps(response.json(), indent=2))
```

### Option 3: Run Test Suite

```cmd
REM In new terminal (keep server running)
python test_examples.py
```

---

## Expected Response Format

```json
{
  "primary_category": "Financial Fraud",
  "subcategory": "UPI Fraud",
  "extracted_entities": {
    "amount": "₹15000",
    "phone_numbers": ["+91-9876543210"],
    "upi_id": "scammer@paytm",
    "urls": [],
    "platform": "phonepe",
    "account_numbers": [],
    "transaction_ids": [],
    "dates": [],
    "bank_names": [],
    "other": {}
  },
  "confidence_scores": {
    "primary_category": 0.96,
    "subcategory": 0.88
  },
  "suggested_action": "URGENT: 1) Call bank immediately..."
}
```

---

## All Categories Supported

### ✅ Financial Fraud (23)
UPI, Debit Card, Credit Card, E-Commerce, Loan App, Sextortion, Digital Arrest, Investment, Customer Care, OLX, Lottery, Online Job, APK, Gaming App, AEPS, Hotel Booking, Ticket Booking, Insurance, E-Wallet, Franchisee, Tower Installation, Fake Website, Others

### ✅ Social Media Fraud (28 = 7×4)
**Platforms**: Facebook, Instagram, X, WhatsApp, Telegram, Gmail, Fraud Call  
**Issues**: Impersonation, Fake Account, Hack, Obscene Content

---

## Troubleshooting

**Issue**: Server won't start  
**Fix**: Check if port 8000 is free: `netstat -ano | findstr :8000`

**Issue**: Models not downloading  
**Fix**: Check internet connection. Manually download spaCy model:
```cmd
python -m spacy download en_core_web_sm
```

**Issue**: Import errors  
**Fix**: Ensure virtual environment is activated (you should see `(.venv)` in prompt)

**Issue**: Classification seems wrong  
**Fix**: First run downloads models - wait for complete download. Restart server after first run.

---

## File Structure

```
Cyber_Dogesh_Classification/
├── main.py                 # FastAPI app (run this)
├── classifier.py           # Classification logic
├── entity_extractor.py     # Entity extraction
├── schema.py               # Request/response models
├── requirements.txt        # Dependencies
├── test_examples.py        # Test suite
├── README.md              # Full documentation
├── VERIFICATION.md        # Technical verification report
└── QUICKSTART.md          # This file
```

---

## Next Steps

1. ✅ Review `VERIFICATION.md` for complete technical details
2. ✅ Run `test_examples.py` to see all 31 test cases
3. ✅ Read `README.md` for architecture and customization
4. 🔧 Integrate with your WhatsApp bot frontend
5. 🔧 Add authentication for production
6. 🔧 Connect to database for complaint storage

---

## API Documentation

Once server is running, visit:
- **Interactive docs**: http://127.0.0.1:8000/docs
- **Alternative docs**: http://127.0.0.1:8000/redoc

---

## Performance

- **Cold start**: 5-10 seconds (model loading)
- **Warm requests**: 100-300ms per classification
- **Accuracy**: 85-95% on test cases
- **RAM usage**: ~1.5GB (with models loaded)

---

## Production Checklist

Before deploying to production:

- [ ] Add authentication (API keys)
- [ ] Add rate limiting
- [ ] Set up database for complaint storage
- [ ] Add logging and monitoring
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Add health check endpoint
- [ ] Configure CORS properly
- [ ] Add input sanitization
- [ ] Set up backup/recovery
- [ ] Load test the API
- [ ] Document API for consumers

---

**Ready to go!** 🎉

For questions, check the comprehensive docs in `README.md` and `VERIFICATION.md`.
