# 🔧 Pinecone Setup Instructions

## Why Create a New Index?

The sentence transformers model generates **different embeddings** than TF-IDF, so you need a fresh index with the correct dimensions.

---

## 📋 Quick Setup

### Step 1: Login to Pinecone

Go to: https://www.pinecone.io/

---

### Step 2: Create New Index

**Settings:**
```
Index Name:     cybercrime-kb-sentencetransformer
Dimensions:     384
Metric:         cosine
Cloud:          AWS (or GCP)
Region:         us-east-1 (or closest to you)
```

**Important**: 
- ✅ Dimensions MUST be `384`
- ✅ Metric MUST be `cosine`
- ✅ Use serverless (recommended) or pod-based

---

### Step 3: Update .env File

```env
PINECONE_API_KEY=your_actual_api_key_here
PINECONE_INDEX_NAME=cybercrime-kb-sentencetransformer
USE_SENTENCE_TRANSFORMER=true
```

---

### Step 4: Upload Data

Run the upload script:

```bash
python upload_to_pinecone.py
```

**Expected output:**
```
🔍 Loading Sentence Transformer model: sentence-transformers/all-MiniLM-L6-v2
   This may take a minute on first run (downloads ~80MB model)...
   ✓ Model loaded successfully (384 dimensions)

Loading chunks from: Citizen Manual
  ✓ Loaded 245 chunks from Citizen_Manual/...
Loading chunks from: Cyber Awareness
  ✓ Loaded 389 chunks from Cyber_awareness/...
...

Total chunks loaded: 1234

Generating embeddings for 1234 chunks...
100%|████████████████████| 39/39 [00:25<00:00,  1.53batch/s]

Uploading to Pinecone in batches...
Progress: 100%
✅ Upload complete! 1234 vectors uploaded.
```

---

## 🔍 Verify Upload

### Check via API:

```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "pinecone_connected": true,
  "pinecone_index": "cybercrime-kb-sentencetransformer",
  "total_vectors": 1234,
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
  "embedding_dimension": 384,
  "embedding_type": "Sentence Transformer"
}
```

### Check via Pinecone Dashboard:

1. Go to Pinecone dashboard
2. Select your index
3. Check "Total vectors" count matches your chunks

---

## 🧪 Test the API

### Test Query:

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"How to report cybercrime?\", \"top_k\": 3}"
```

### Expected Confidence Scores:

**Good query match:**
- Top result: 0.70 - 0.85 ✅ (Excellent)
- 2nd result: 0.60 - 0.75 ✅ (Good)
- 3rd result: 0.50 - 0.65 ✅ (Moderate)

**Vague query:**
- Top result: 0.50 - 0.65 ⚠️ (Moderate)
- Lower results: 0.35 - 0.50 ⚠️ (Lower confidence)

---

## ⚠️ Troubleshooting

### Issue: "Index not found"
**Solution**: Make sure index name in `.env` matches Pinecone dashboard

### Issue: "Dimension mismatch"
**Solution**: Ensure Pinecone index has 384 dimensions

### Issue: "No vectors uploaded"
**Solution**: Check that `upload_to_pinecone.py` completed successfully

### Issue: "Low confidence scores"
**Solutions**:
1. Check `.env`: `USE_SENTENCE_TRANSFORMER=true`
2. Restart API server
3. Verify embeddings were uploaded with sentence transformers

---

## 📊 Old vs New Index

### ❌ Old TF-IDF Index (`quickstart`)
- Dimensions: 384
- Embeddings: TF-IDF (keyword-based)
- Confidence: 0.3 - 0.5 range
- Status: Can be deleted

### ✅ New Sentence Transformer Index
- Name: `cybercrime-kb-sentencetransformer`
- Dimensions: 384
- Embeddings: Sentence Transformers (semantic)
- Confidence: 0.6 - 0.9 range
- Status: **Active**

---

## 🗑️ Clean Up Old Index (Optional)

Once the new index is working:

1. Go to Pinecone dashboard
2. Select old index (`quickstart` or `cybercrime-kb-1024`)
3. Click "Delete Index"
4. Confirm deletion

This will free up your Pinecone quota.

---

## 🔄 Migration Checklist

- [ ] Create new Pinecone index (384 dimensions, cosine metric)
- [ ] Update `.env` with new index name
- [ ] Set `USE_SENTENCE_TRANSFORMER=true` in `.env`
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run upload script: `python upload_to_pinecone.py`
- [ ] Verify upload via `/health` endpoint
- [ ] Test query via `/query` endpoint
- [ ] Check confidence scores (should be 0.6+)
- [ ] Delete old index (optional)

---

## 🆘 Need Help?

Check these files:
- `SETUP_GUIDE.md` - Full setup instructions
- `CHANGES_SUMMARY.md` - What changed
- `README.md` - Original documentation

---

**Happy indexing! 🎉**
