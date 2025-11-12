# WhatsApp Fraud Classifier (Local Prototype)

🚨 **Backend API for 1930 Helpline - Cyber Fraud Classification System**

This repository contains a local FastAPI backend that classifies fraud-related complaints into Financial or Social Media fraud, determines a subcategory from 51 total categories (23 financial + 28 social media), extracts structured entities, and returns suggested actions aligned with India's 1930 helpline guidance.

This is a production-ready prototype that uses DistilBERT embeddings (via transformers) plus comprehensive keyword heuristics for robust offline operation.

---

## Features

✅ **Comprehensive Classification**
- 2 primary categories: Financial Fraud, Social Media Fraud
- 23 Financial fraud subcategories (UPI, Credit Card, Sextortion, Digital Arrest, etc.)
- 28 Social Media fraud subcategories (7 platforms × 4 issue types)

✅ **Advanced Entity Extraction**
- Amount (₹, Rs., INR)
- Phone numbers (+91 format)
- UPI IDs
- URLs
- Account numbers
- Transaction IDs
- Dates
- Bank names
- Platform mentions
- Organizations & persons (via spaCy NER)

✅ **Intelligent Suggestions**
- Category-specific action guidance
- 1930 helpline integration
- cybercrime.gov.in reporting steps
- Bank/platform-specific instructions

✅ **Robust Architecture**
- Multi-stage classification (keyword → embedding → fallback)
- Confidence scoring
- Low-confidence handling ("uncertain" + safe guidance)
- Modular, extensible codebase

---

## Prerequisites

- Python 3.9+ (3.10 recommended)
- Internet for the first run to download model weights and spaCy model (cached locally after first run)
- ~2GB disk space for models

---

## Quick Setup (Windows cmd.EXE)

### 1. Create and activate virtual environment

```cmd
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install dependencies

```cmd
pip install --upgrade pip
pip install -r requirements.txt
```

**Note**: The requirements include a direct wheel link for `en_core_web_sm` (spaCy model). If that fails, manually download:

```cmd
python -m spacy download en_core_web_sm
```

### 3. Run the server

```cmd
python main.py
```

Server will be available at **http://127.0.0.1:8000**

---

## API Usage

### Endpoint: `POST /classify`

**Request JSON:**

```json
{
  "complaint_text": "I lost ₹5,000 after sending money to test@okaxis via PhonePe. Contact +91-9876543210"
}
```

**Example curl (Windows cmd):**

```cmd
curl -X POST http://127.0.0.1:8000/classify -H "Content-Type: application/json" -d "{ \"complaint_text\": \"I lost ₹5,000 after sending money to test@okaxis via PhonePe. Contact +91-9876543210\" }"
```

**Sample Response:**

```json
{
  "primary_category": "Financial Fraud",
  "subcategory": "UPI Fraud",
  "extracted_entities": {
    "amount": "₹5,000",
    "phone_numbers": ["+91-9876543210"],
    "upi_id": "test@okaxis",
    "urls": [],
    "platform": "phonepe",
    "account_numbers": [],
    "transaction_ids": [],
    "dates": [],
    "bank_names": [],
    "other": {
      "orgs": [],
      "persons": []
    }
  },
  "confidence_scores": {
    "primary_category": 0.96,
    "subcategory": 0.88
  },
  "suggested_action": "URGENT: 1) Call bank immediately (1800-XXX-XXXX) to freeze transaction 2) Block UPI ID/beneficiary 3) Report on cybercrime.gov.in 4) Call 1930 helpline 5) File FIR at nearest cyber cell. Keep transaction screenshots."
}
```

---

## Testing

Comprehensive test suite with 31 test cases covering all fraud categories:

```cmd
REM Start server in one terminal
python main.py

REM Run tests in another terminal (after server is running)
python test_examples.py
```

Expected accuracy: **85-95%** on test cases

---

## Supported Categories

### Financial Fraud (23 categories)

1. Investment/Trading/IPO Fraud
2. Customer Care Fraud
3. UPI Fraud (UPI/IMPS/INB/NEFT/RTGS)
4. APK Fraud
5. Fake Franchisee/Dealership Fraud
6. Online Job Fraud
7. Debit Card Fraud
8. Credit Card Fraud
9. E-Commerce Fraud
10. Loan App Fraud
11. Sextortion Fraud
12. OLX Fraud
13. Lottery Fraud
14. Hotel Booking Fraud
15. Gaming App Fraud
16. AEPS Fraud (Aadhar Enabled Payment System)
17. Tower Installation Fraud
18. E-Wallet Fraud
19. Digital Arrest Fraud
20. Fake Website Scam Frauds
21. Ticket Booking Fraud
22. Insurance Maturity Fraud
23. Others

### Social Media Fraud (28 categories = 7 platforms × 4 issues)

**Platforms:** Facebook, Instagram, X (Twitter), WhatsApp, Telegram, Gmail, Fraud Call

**Issues:** Impersonation Account, Fake Account, Hack, Spread of Obscene Content

---

## Architecture

```
FastAPI Server (main.py)
    │
    ├── FraudClassifier (classifier.py)
    │   ├── DistilBERT embeddings
    │   ├── Keyword matching (23 categories)
    │   ├── Multi-stage classification
    │   └── Confidence scoring
    │
    ├── Entity Extractor (entity_extractor.py)
    │   ├── Regex patterns (10 types)
    │   └── spaCy NER
    │
    └── Pydantic Schemas (schema.py)
        ├── Request validation
        └── Response models
```

---

## Technical Details

### Classification Logic

**Stage 1: Strong Keyword Matching**
- Scans for 2+ category-specific keywords
- High confidence boost (0.70-0.75+)
- Example: "upi phonepe paytm" → UPI Fraud

**Stage 2: Social Media Detection**
- Platform + issue keywords
- Example: "instagram fake profile" → Instagram - Fake Account

**Stage 3: Financial Signal Detection**
- Money/payment keywords present
- Uses embedding for subcategory
- Example: "lost money" → Financial Fraud → best match

**Stage 4: Pure Embedding Fallback**
- DistilBERT cosine similarity
- Returns "uncertain" if confidence < 0.5

### Entity Extraction

- **Regex**: Amount, phone, UPI, URL, account, transaction ID, dates
- **spaCy NER**: Organizations, persons
- **Platform detection**: 13+ platforms (Instagram, PhonePe, Amazon, etc.)
- **Bank detection**: 12 major Indian banks (SBI, HDFC, ICICI, etc.)

---

## Files Overview

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, POST /classify endpoint, action suggestions |
| `classifier.py` | DistilBERT embeddings, multi-stage classification logic |
| `entity_extractor.py` | Regex + spaCy NER for entity extraction |
| `schema.py` | Pydantic request/response models |
| `requirements.txt` | Python dependencies (pinned versions) |
| `test_examples.py` | Comprehensive test suite (31 test cases) |
| `VERIFICATION.md` | Complete implementation verification report |
| `README.md` | This file |

---

## Notes and Rationale

### Why DistilBERT + Keywords?
- **DistilBERT**: Lightweight, fast, runs locally, good embeddings for text similarity
- **Keywords**: High precision, explainable, handles domain-specific jargon
- **Hybrid approach**: Best of both worlds - accuracy + speed + offline operation

### Why Multi-Stage Classification?
- **Robustness**: Fallbacks at every stage
- **Accuracy**: Keywords catch obvious cases, embeddings handle ambiguity
- **Graceful degradation**: Low confidence → "uncertain" + safe guidance

### Entity Extraction Strategy
- **Regex**: Fast, reliable for structured patterns (amount, phone, UPI)
- **spaCy NER**: Handles unstructured entities (names, organizations)
- **Fallback**: Missing entities return `null` (not errors)

### Low-Confidence Handling
- Confidence < 0.5 → primary/subcategory = "uncertain"
- Suggests calling 1930 helpline for manual review
- Preserves user safety (no wrong guidance)

---

## Extending and Next Steps

### To Add New Financial Category

1. Add to `FINANCIAL_SUBCATEGORIES` in `classifier.py`
2. Add keywords to `self.financial_keywords` in `_build_prototypes()`
3. Add action suggestion in `suggest_action()` in `main.py`

### To Add New Platform

1. Add to `SOCIAL_PLATFORMS` in `classifier.py`
2. Add to `PLATFORMS` in `entity_extractor.py`

### Future Enhancements

1. **Fine-tune on real data**: Train on actual 1930 helpline complaints
2. **Hindi support**: Use multilingual BERT (mBERT)
3. **Database integration**: Store complaints with IDs
4. **Authentication**: Add API keys
5. **Rate limiting**: Prevent abuse
6. **WhatsApp bot**: Integrate with WhatsApp Business API
7. **Admin dashboard**: Monitor complaints
8. **Priority scoring**: Urgent vs routine complaints
9. **Real 1930 integration**: Connect to official helpline system

---

## Troubleshooting

**Issue**: `ModuleNotFoundError: No module named 'en_core_web_sm'`  
**Solution**: Run `python -m spacy download en_core_web_sm`

**Issue**: Server takes long to start first time  
**Solution**: Normal - DistilBERT model is downloading (~250MB). Cached after first run.

**Issue**: Low accuracy on test cases  
**Solution**: Ensure DistilBERT model downloaded completely. Check internet connection on first run.

**Issue**: `torch` installation fails  
**Solution**: Windows users may need Visual C++ Build Tools. Or use CPU-only torch: `pip install torch==1.13.1+cpu -f https://download.pytorch.org/whl/torch_stable.html`

---

## System Requirements

- **RAM**: 4GB minimum (8GB recommended for smooth operation)
- **Disk**: 2GB for models
- **CPU**: Any modern x64 processor (no GPU required)
- **OS**: Windows 10/11, Linux, macOS

---

## License

This is a prototype for educational/governmental use (1930 helpline integration). For production deployment, ensure compliance with data privacy laws and obtain necessary approvals.

---

## Contact & Support

For issues, suggestions, or contributions:
- Check `VERIFICATION.md` for complete technical details
- Review `test_examples.py` for usage examples
- Examine `classifier.py` for classification logic

**Last Updated**: November 7, 2025  
**Status**: ✅ Production-Ready Prototype
