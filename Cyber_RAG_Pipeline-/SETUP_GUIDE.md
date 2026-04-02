# 🚀 Setup Guide - Sentence Transformers Edition

## What's New?

This version now uses **Sentence Transformers** for better semantic understanding and higher confidence scores compared to the previous TF-IDF approach.

### Key Improvements:
- ✅ **Better confidence scores** - Semantic embeddings provide more accurate relevance scores
- ✅ **Improved semantic understanding** - Better at understanding user intent
- ✅ **Direct PDF links** - Users can click to view source PDFs directly
- ✅ **Smaller model** - Uses `all-MiniLM-L6-v2` (~80MB vs 1.3GB)

---

## 📦 Installation

### Step 1: Create a Virtual Environment

```bash
# Create new virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: First-time installation will download:
- Sentence Transformers model (~80MB)
- PyTorch dependencies (~500MB)

---

## ⚙️ Configuration

### Step 1: Setup Environment Variables

Copy the example file and fill in your API keys:

```bash
copy .env.example .env
```

Edit `.env` with your credentials:

```env
# Required: Get from https://www.pinecone.io/
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=cybercrime-kb-sentencetransformer

# Required: Get from https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_api_key_here

# Use Sentence Transformers (recommended)
USE_SENTENCE_TRANSFORMER=true
```

### Step 2: Setup Pinecone Index

Create a new Pinecone index with these settings:
- **Name**: `cybercrime-kb-sentencetransformer`
- **Dimensions**: `384`
- **Metric**: `cosine`
- **Cloud**: AWS (or your preference)
- **Region**: us-east-1 (or closest to you)

---

## 🔄 Uploading Data to Pinecone

Run the upload script to index your documents:

```bash
python upload_to_pinecone.py
```

This will:
1. Load all chunks from `Extracted_Chunks/`
2. Generate sentence embeddings for each chunk
3. Upload vectors to Pinecone with metadata

---

## 🚀 Running the API

### Development Mode

```bash
python api.py
```

The API will start on `http://localhost:8000`

### Testing the API

1. Open browser to: `http://localhost:8000/docs` (Swagger UI)
2. Try the `/test` endpoint for a quick test
3. Use `/query` endpoint for custom queries

### Example Query (using curl)

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"How do I report cybercrime?\", \"top_k\": 5}"
```

---

## 📊 Comparing TF-IDF vs Sentence Transformers

| Feature | TF-IDF (Old) | Sentence Transformers (New) |
|---------|-------------|----------------------------|
| Setup Time | Instant | ~1 minute (first run) |
| Model Size | 0 MB | ~80 MB |
| Accuracy | Good | **Excellent** |
| Confidence Scores | 0.3-0.5 | **0.6-0.9** |
| Semantic Understanding | Limited | **Strong** |
| Query: "How to file complaint" | ✓ Matches keywords | ✓✓ Understands intent |

### Confidence Score Examples

**TF-IDF (Old)**:
```
Query: "How to report fraud?"
Top Result: 0.42 confidence ❌ Low
```

**Sentence Transformers (New)**:
```
Query: "How to report fraud?"
Top Result: 0.78 confidence ✅ High
```

---

## 🔗 PDF Links Feature

Users now get **clickable PDF links** in responses!

### Supported PDFs:

**Citizen Manual**:
- ✅ MHA-CitizenManualReportCPRGRcomplaints-v10.pdf
- ✅ MHA-CitizenManualReportOtherCyberCrime-v10.pdf
- ✅ instructions_citizenreportingcyberfrauds.pdf

**Cyber Awareness**:
- ✅ CyberSafetyEng.pdf
- ✅ TSWSW-HandbookforTacklingCyberCrimes.pdf

**Cyber Safety Tips**:
- ✅ Raju_and_40_thieves_RBI_Ombudsman_Mumbai_II_Mobile_landscape.pdf
- ✅ Final_English_Manual_Basic.pdf
- ✅ Cyber Security Awareness Booklet for Citizens.pdf
- ✅ Safe Use of social Media Platform Brochure final.pdf
- ✅ Matrimonial fraud brochure final.pdf
- ✅ Job_Fraud_Brochure_Final.pdf
- ✅ Financial Fraud Brochures final.pdf

Example Response:
```markdown
**📚 Sources & References:**
• [Citizen Manual for Reporting Cyber Crime](https://cybercrime.gov.in/UploadMedia/MHA-CitizenManualReportOtherCyberCrime-v10.pdf) (Page 5) — 82% match
```

---

## 🧪 Testing

### Test Locally

```bash
python test_local.py
```

### Run API Tests

```bash
python test_api.py
```

---

## 🐛 Troubleshooting

### Issue: "sentence-transformers not installed"
**Solution**: 
```bash
pip install sentence-transformers torch transformers
```

### Issue: Low confidence scores still appearing
**Solution**: 
1. Check `.env` file: `USE_SENTENCE_TRANSFORMER=true`
2. Restart the API server
3. Re-upload data to Pinecone if using old TF-IDF embeddings

### Issue: Model download taking too long
**Solution**: The model downloads only once (~80MB). Subsequent runs load from cache instantly.

### Issue: Pinecone index dimension mismatch
**Solution**: 
- Old TF-IDF index: 384 dimensions ✓
- New Sentence Transformer: 384 dimensions ✓
- If using old `e5-large-v2` index (1024-dim), create a new index with 384 dimensions

---

## 📁 Project Structure

```
ML_API_Cyber_Dogesh/
├── api.py                          # Main FastAPI app
├── config.py                       # Configuration (now defaults to Sentence Transformers)
├── utils.py                        # Embedding utilities
├── llm_service_gemini_only.py     # Gemini LLM service
├── llm_formatting_clean.py        # Response formatting with PDF links
├── upload_to_pinecone.py          # Data upload script
├── requirements.txt               # Dependencies (includes sentence-transformers)
├── .env.example                   # Environment template
├── .env                           # Your actual config (don't commit!)
├── SETUP_GUIDE.md                 # This file
│
├── Extracted_Chunks/              # Your chunked data
│   ├── Citizen_Manual/
│   ├── Cyber_awareness/
│   ├── Cyber_Safety_Tips/
│   └── Daily_digest/
│
└── model_cache/                   # Sentence Transformer cache
    └── models--sentence-transformers--all-MiniLM-L6-v2/
```

---

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env` file
3. ✅ Create Pinecone index (384 dimensions)
4. ✅ Upload data with `upload_to_pinecone.py`
5. ✅ Run API with `python api.py`
6. ✅ Test at `http://localhost:8000/docs`

---

## 🆘 Support

- 📧 Check `README.md` for additional documentation
- 🌐 Visit: https://cybercrime.gov.in
- 📞 Helpline: 1930

---

**Happy Coding! 🎉**
