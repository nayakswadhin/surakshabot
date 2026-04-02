# ⚡ Quick Start Guide

Get up and running with Sentence Transformers in 5 minutes!

---

## 🎯 Prerequisites

- Python 3.8 or higher
- Pinecone account (free tier works!)
- Google Gemini API key (free tier works!)

---

## 🚀 5-Minute Setup

### 1️⃣ Create Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate
venv\Scripts\activate
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: First install downloads ~500MB (PyTorch + model). Subsequent runs are instant.

### 3️⃣ Configure Environment

```bash
# Copy template
copy .env.example .env

# Edit .env with your API keys
notepad .env
```

**Required settings:**
```env
PINECONE_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
USE_SENTENCE_TRANSFORMER=true
PINECONE_INDEX_NAME=cybercrime-kb-sentencetransformer
```

### 4️⃣ Create Pinecone Index

Go to: https://www.pinecone.io/

**Create index with:**
- Name: `cybercrime-kb-sentencetransformer`
- Dimensions: `384`
- Metric: `cosine`

### 5️⃣ Verify Setup

```bash
python verify_setup.py
```

**Expected output:**
```
✅ All dependencies installed!
✅ Environment configured!
✅ Sentence Transformer working!
✅ Pinecone connection working!
🎉 ALL CHECKS PASSED!
```

### 6️⃣ Upload Data

```bash
python upload_to_pinecone.py
```

**Takes ~2-5 minutes**. You'll see:
```
Processing batches: 100%
Uploading: 100%
✅ UPLOAD COMPLETE!
```

### 7️⃣ Start API

```bash
python api.py
```

**API runs at:** `http://localhost:8000`

---

## ✅ Test It!

### Web Browser

Open: http://localhost:8000/docs

Try the `/test` endpoint or `/query` with:
```json
{
  "query": "How to report cybercrime?",
  "top_k": 5
}
```

### Command Line

```bash
curl -X POST "http://localhost:8000/query" ^
  -H "Content-Type: application/json" ^
  -d "{\"query\": \"How to report fraud?\", \"top_k\": 3}"
```

---

## 📊 What to Expect

### Good Response:
```json
{
  "query": "How to report cybercrime?",
  "answer": "To report cybercrime in India, visit...",
  "sources": [
    {
      "filename": "MHA-CitizenManualReportOtherCyberCrime-v10",
      "page": 5,
      "relevance_score": 0.782  // ✅ High confidence!
    }
  ]
}
```

### With PDF Links:
```markdown
📚 Sources & References:
• [Citizen Manual](https://cybercrime.gov.in/.../MHA-CitizenManualReportOtherCyberCrime-v10.pdf) 
  (Page 5) — 78% match
```

---

## 🔧 Troubleshooting

### ❌ "sentence-transformers not installed"
```bash
pip install sentence-transformers torch transformers
```

### ❌ "Index not found"
- Check index name in `.env` matches Pinecone dashboard
- Verify index was created with 384 dimensions

### ❌ Low confidence scores
- Ensure `USE_SENTENCE_TRANSFORMER=true` in `.env`
- Restart API server
- Re-run `upload_to_pinecone.py` if you switched from TF-IDF

### ❌ "Module not found"
```bash
# Ensure venv is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📚 Additional Resources

- **Full Setup**: `SETUP_GUIDE.md`
- **Pinecone Help**: `PINECONE_SETUP.md`
- **What Changed**: `CHANGES_SUMMARY.md`
- **API Docs**: http://localhost:8000/docs (when running)

---

## 🎯 Success Checklist

- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file configured with API keys
- [ ] Pinecone index created (384 dimensions, cosine metric)
- [ ] `verify_setup.py` passes all checks
- [ ] Data uploaded via `upload_to_pinecone.py`
- [ ] API running at `http://localhost:8000`
- [ ] Test query returns high confidence scores (0.6+)

---

## 💡 Pro Tips

1. **First Run**: Model downloads ~80MB, takes 1-2 minutes
2. **Confidence Scores**: 0.7+ is excellent, 0.5-0.7 is good
3. **Response Time**: ~1-2 seconds per query (after model loads)
4. **Batch Uploads**: Use `upload_to_pinecone.py` for bulk data
5. **API Testing**: Swagger UI at `/docs` is your friend!

---

## 🆘 Still Having Issues?

1. Run `python verify_setup.py` to diagnose
2. Check `.env` file for correct API keys
3. Verify Pinecone index dimensions = 384
4. Ensure virtual environment is activated
5. Try reinstalling: `pip install --force-reinstall -r requirements.txt`

---

**You're all set! 🎉**

Happy querying! 🚀
