"""
FastAPI endpoint for cybercrime query answering with source citations
SIMPLE VERSION - No LLM downloads needed!
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from pinecone import Pinecone
import uvicorn
from config import Config
from utils import (
    get_embedding_manager,
    load_all_chunks, 
    clean_pdf_text, 
    deduplicate_chunks, 
    create_structured_context
)
from llm_service_gemini_only import get_llm_service, rerank_chunks
from llm_formatting_clean import format_clean_answer

# Initialize FastAPI app
app = FastAPI(
    title="Cybercrime Knowledge Base API",
    description="Query cybercrime information with source citations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models (loaded once at startup)
embedding_manager = None
pinecone_index = None


class QueryRequest(BaseModel):
    """Request model for queries"""
    query: str
    top_k: Optional[int] = 8  # Increased default for more comprehensive answers


class QueryResponse(BaseModel):
    """Response model with answer and sources"""
    query: str
    answer: str
    sources: List[Dict[str, Any]]
    context_chunks: List[str]


@app.on_event("startup")
async def startup_event():
    """Initialize models and connections on startup"""
    global embedding_manager, pinecone_index
    
    print("🚀 Starting Cybercrime Knowledge Base API...")
    
    # Initialize embedding manager (TF-IDF or Sentence Transformer based on config)
    print(f"📊 Embedding Mode: {'Sentence Transformer' if Config.USE_SENTENCE_TRANSFORMER else 'TF-IDF'}")
    embedding_manager = get_embedding_manager()
    
    # For TF-IDF, fit on all chunks
    if not Config.USE_SENTENCE_TRANSFORMER:
        print("📚 Loading all chunks to fit TF-IDF...")
        all_chunks = load_all_chunks()
        all_texts = [chunk.get('text', '') for chunk in all_chunks]
        embedding_manager.fit(all_texts)
        print(f"   ✓ Fitted on {len(all_texts)} chunks")
    
    # Initialize Pinecone
    print("🔗 Connecting to Pinecone...")
    pc = Pinecone(api_key=Config.PINECONE_API_KEY)
    pinecone_index = pc.Index(Config.PINECONE_INDEX_NAME)
    
    stats = pinecone_index.describe_index_stats()
    print(f"✅ Connected to Pinecone - Index: {Config.PINECONE_INDEX_NAME}")
    print(f"   Vectors: {stats.total_vector_count}, Dimension: {Config.EMBEDDING_DIMENSION}")
    
    print("🎉 API is ready to accept requests!")
    print(f"   Embedding Model: {Config.EMBEDDING_MODEL}")
    print(f"   Embedding Dimension: {Config.EMBEDDING_DIMENSION}D")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Cybercrime Knowledge Base API",
        "status": "running",
        "endpoints": {
            "/query": "POST - Ask questions about cybercrime",
            "/health": "GET - Check API health",
            "/stats": "GET - Get database statistics"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if pinecone_index is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    stats = pinecone_index.describe_index_stats()
    
    return {
        "status": "healthy",
        "pinecone_connected": True,
        "pinecone_index": Config.PINECONE_INDEX_NAME,
        "total_vectors": stats.total_vector_count,
        "embedding_model": Config.EMBEDDING_MODEL,
        "embedding_dimension": Config.EMBEDDING_DIMENSION,
        "embedding_type": "Sentence Transformer" if Config.USE_SENTENCE_TRANSFORMER else "TF-IDF",
        "llm_model": Config.LLM_MODEL
    }


@app.get("/stats")
async def get_stats():
    """Get database statistics"""
    if pinecone_index is None:
        raise HTTPException(status_code=503, detail="Service not initialized")
    
    stats = pinecone_index.describe_index_stats()
    
    return {
        "total_vectors": stats.total_vector_count,
        "index_name": Config.PINECONE_INDEX_NAME,
        "dimension": Config.EMBEDDING_DIMENSION,
        "sections": [
            "Citizen Manual",
            "Cyber Awareness", 
            "Cyber Safety Tips",
            "Daily Digest"
        ]
    }


@app.post("/query", response_model=QueryResponse)
async def query_knowledge_base(request: QueryRequest):
    """
    Query the cybercrime knowledge base
    
    Args:
        request: QueryRequest with query and optional top_k
        
    Returns:
        QueryResponse with answer and source citations
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        # 1. Refine query for better retrieval (expand vague queries into detailed questions)
        llm_service = get_llm_service()
        refined_query = llm_service.refine_query(request.query)
        
        # 2. Generate embedding for the refined query
        query_embedding = embedding_manager.get_embedding(refined_query)
        
        # 3. Search Pinecone for similar chunks (get more candidates with detailed query)
        search_results = pinecone_index.query(
            vector=query_embedding,
            top_k=min(request.top_k * 5, 25),  # Get 5x more candidates with detailed queries
            include_metadata=True
        )
        
        # 3. Extract relevant chunks and filter out low-quality ones
        relevant_chunks = []
        context_texts = []
        
        # Keywords that indicate actionable content (how-to, steps, etc.)
        query_lower = request.query.lower()
        wants_howto = any(word in query_lower for word in ['how', 'report', 'file', 'complaint', 'steps', 'what to do'])
        
        for match in search_results.matches:
            chunk_text = match.metadata.get('full_text', match.metadata.get('text', ''))
            
            # Skip chunks that are just titles, page numbers, or table of contents
            if len(chunk_text.strip()) < 100:  # Too short
                continue
            if 'Page' in chunk_text and 'of' in chunk_text and len(chunk_text) < 200:  # Likely page header
                continue
            if chunk_text.count('\n') > 20 and len(chunk_text) < 500:  # Table of contents
                continue
            
            # Boost chunks that have actionable content if user wants how-to
            chunk_lower = chunk_text.lower()
            has_steps = any(word in chunk_lower for word in ['step', 'click', 'select', 'navigate', 'fill', 'submit', 'enter'])
            has_howto = any(word in chunk_lower for word in ['how to', 'to report', 'reporting', 'file a complaint'])
            
            # Adjust score based on content quality
            adjusted_score = match.score
            if wants_howto and (has_steps or has_howto):
                adjusted_score += 0.15  # Boost procedural content
            
            chunk_data = {
                'text': chunk_text,
                'filename': match.metadata.get('filename', 'Unknown'),
                'page': match.metadata.get('page', 'N/A'),
                'section': match.metadata.get('section', 'Unknown'),
                'score': adjusted_score,
                'original_score': match.score
            }
            relevant_chunks.append(chunk_data)
        
        # Re-sort by adjusted score and deduplicate
        relevant_chunks.sort(key=lambda x: x['score'], reverse=True)
        relevant_chunks = deduplicate_chunks(relevant_chunks)
        
        # Simple reranking inline (no function call)
        query_words = set(request.query.lower().split())
        for chunk in relevant_chunks:
            text = chunk.get('text', '').lower()
            overlap = sum(1 for word in query_words if word in text)
            chunk['rerank_score'] = overlap
        
        relevant_chunks.sort(key=lambda x: x.get('rerank_score', 0), reverse=True)
        relevant_chunks = relevant_chunks[:request.top_k]
        
        for chunk in relevant_chunks:
            context_texts.append(chunk['text'][:300])
        
        if not relevant_chunks:
            return QueryResponse(
                query=request.query,
                answer="I couldn't find relevant information about this in the cybercrime knowledge base. Please try rephrasing your question or visit https://cybercrime.gov.in for more help.",
                sources=[],
                context_chunks=[]
            )
        
        # 4. Create clean, structured answer using improved prompting
        if not relevant_chunks:
            answer = "I couldn't find specific information about this in the cybercrime knowledge base.\n\n"
            answer += "📞 **For immediate help:**\n"
            answer += "• Visit: https://cybercrime.gov.in\n"
            answer += "• Call: 1930 (Cyber Crime Helpline)\n"
            answer += "• Report online at the National Cyber Crime Reporting Portal"
            
            return QueryResponse(
                query=request.query,
                answer=answer,
                sources=[],
                context_chunks=[]
            )
        
        # 4. Generate answer with Gemini rephrasing
        llm_service = get_llm_service()
        
        # Create raw answer from chunks (using more chunks for detailed, comprehensive answers)
        raw_answer = ""
        for chunk in relevant_chunks[:8]:  # Increased from 6 to 8 chunks for more detailed context
            text = clean_pdf_text(chunk['text'])
            if len(text) > 50:
                sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20][:5]  # Increased from 4 to 5 sentences
                if sentences:
                    raw_answer += f"• {'. '.join(sentences)}.\n\n"
        
        # Rephrase with Gemini to generate detailed answer
        if raw_answer:
            answer = llm_service.rephrase_answer(raw_answer, user_query=request.query)
        else:
            answer = "I couldn't find specific information about this."
        
        # 5. Format sources
        sources = []
        seen = set()
        for chunk in relevant_chunks:
            key = f"{chunk['filename']}_{chunk['page']}"
            if key not in seen:
                sources.append({
                    'filename': chunk['filename'],
                    'page': chunk['page'],
                    'section': chunk['section'],
                    'relevance_score': round(chunk['score'], 3)
                })
                seen.add(key)
        
        # Format with footer (using clean Markdown for chatbot compatibility)
        answer = format_clean_answer(answer, sources)
        
        # 5. Format sources
        sources = []
        seen = set()
        for chunk in relevant_chunks:
            key = f"{chunk['filename']}_{chunk['page']}"
            if key not in seen:
                sources.append({
                    'filename': chunk['filename'],
                    'page': chunk['page'],
                    'section': chunk['section'],
                    'relevance_score': round(chunk['score'], 3)
                })
                seen.add(key)
        
        return QueryResponse(
            query=request.query,
            answer=answer.strip(),
            sources=sources,
            context_chunks=context_texts
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.get("/test")
async def test_query():
    """Quick test endpoint"""
    request = QueryRequest(query="How do I report cybercrime?", top_k=3)
    response = await query_knowledge_base(request)
    return response


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", Config.API_PORT))
    host = os.environ.get("HOST", Config.API_HOST)
    
    print("\n" + "="*60)
    print("🚀 Starting Cybercrime Knowledge Base API Server")
    print("="*60)
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"📚 Index: {Config.PINECONE_INDEX_NAME}")
    print("="*60 + "\n")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
