# 🛡️ Cybercrime Knowledge Base API

AI-powered API for India's National Cybercrime Reporting Portal knowledge base. Provides detailed, comprehensive answers about cyber safety, fraud reporting, and online security.

## ✨ Features

- **Intelligent Query Refinement** - Expands vague queries for better search results
- **Detailed Answers** - 200-350 word comprehensive responses with structured format
- **Clean Markdown Output** - WhatsApp/chatbot-friendly formatting
- **Smart Retrieval** - TF-IDF embeddings with Pinecone vector database
- **LLM-Powered** - Gemini 2.0 Flash for answer generation
- **Source Attribution** - Clickable links to original documents

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` file:
```env
PINECONE_API_KEY=your_pinecone_api_key
GOOGLE_API_KEY=your_gemini_api_key
```

### 3. Upload Data (First Time Only)
```bash
python upload_to_pinecone.py
```

### 4. Start API Server
```bash
python api.py
```

Server runs on `http://localhost:8000`

### 5. Test API
```bash
python test_api.py
```

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:8000/health
```

### Query Knowledge Base
```bash
POST http://localhost:8000/query
Content-Type: application/json

{
  "query": "What are cyber safety tips?",
  "top_k": 8
}
```

**Response Format:**
```json
{
  "query": "What are cyber safety tips?",
  "answer": "📋 **National Cybercrime Reporting Portal**\n\n1. Brief Overview...",
  "sources": [
    {
      "filename": "Cyber Security Awareness Booklet.pdf",
      "page": 10,
      "section": "Cyber Safety Tips",
      "relevance_score": 0.116
    }
  ]
}
```

## 📊 How It Works

1. **Query Refinement** - Gemini expands vague queries into specific search terms
2. **Embedding** - TF-IDF converts refined query to 384-dim vector
3. **Retrieval** - Pinecone finds top 8 most relevant chunks
4. **Answer Generation** - Gemini generates detailed, structured response
5. **Formatting** - Clean Markdown with source attribution

## 🏗️ Project Structure

```
ML_API_Cyber_Dogesh/
├── api.py                          # FastAPI server
├── config.py                       # Configuration
├── utils.py                        # Embedding utilities
├── llm_service_gemini_only.py     # Query refinement & answer generation
├── llm_formatting_clean.py        # Response formatting
├── upload_to_pinecone.py          # Data upload script
├── test_api.py                    # Comprehensive API tests
├── requirements.txt               # Dependencies
├── README.md                      # This file
├── PDF_RESOURCES/                 # Original PDF files
└── Extracted_Chunks/              # Processed JSON chunks
```

## 🔧 Configuration

### API Parameters
```python
# In api.py
top_k: int = 8              # Number of results to retrieve
retrieval_multiplier = 4x   # Get 4x candidates (max 20)
chunks_used = 8             # Chunks for answer generation
sentences_per_chunk = 5     # Sentences per chunk
```

### LLM Parameters
```python
# In llm_service_gemini_only.py
max_output_tokens = 800     # Detailed answers
temperature = 0.3           # Natural language
context_window = 4000       # Characters of context
```

## 📚 Answer Structure

Every response follows this format:

1. **Brief Overview** - 1-2 sentences explaining the topic
2. **Detailed Steps/Tips** - 5-10 actionable points with explanations
3. **Important Warnings** - What to avoid or be careful about
4. **Contact Information** - Helpline 1930, cybercrime.gov.in

## 🎯 Example Queries

- "What are cyber safety tips?"
- "How to report cybercrime online?"
- "What is financial fraud?"
- "How to stay safe on social media?"
- "What is phishing?"
- "How to file online complaint?"

## 📦 Dependencies

- **FastAPI** - API framework
- **Pinecone** - Vector database
- **Google Generative AI** - Gemini LLM
- **scikit-learn** - TF-IDF embeddings
- **uvicorn** - ASGI server
- **python-dotenv** - Environment management

## 🌐 Data Sources

Knowledge base covers resources from **India's National Cybercrime Reporting Portal**:

**Main Portal:** https://cybercrime.gov.in/Default.aspx

**Four Knowledge Sections:**

1. **📖 Citizen Manual** - https://cybercrime.gov.in/Webform/Citizen_Manual.aspx
   - Contains 3 PDFs on reporting procedures and complaint filing
   - Step-by-step guides for citizens

2. **🛡️ Online Safety Tips** - https://cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx
   - PDFs and text on cyber safety best practices
   - Prevention tips and security measures

3. **🧠 Cyber Awareness** - https://cybercrime.gov.in/Webform/CyberAware.aspx
   - PDFs and educational content
   - Awareness about cyber threats and protection

4. **📰 Daily Digest** - https://cybercrime.gov.in/Webform/dailyDigest.aspx
   - Updated daily with latest cybercrime news
   - Recent alerts and updates

**All API responses include clickable links** to these portal pages where users can view the original PDFs and resources.

## 📝 License

This project is for educational purposes. Data sourced from cybercrime.gov.in.

---

**Built with ❤️ for safer cyberspace in India** 🇮🇳
