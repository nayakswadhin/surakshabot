"""
Configuration file for the Cybercrime Bot API
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration"""
    
    # Pinecone settings
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    
    # Google Gemini API settings
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    
    # Embedding Configuration
    # Toggle between "tfidf" (384-dim) and "sentence-transformer" (1024-dim)
    USE_SENTENCE_TRANSFORMER = os.getenv("USE_SENTENCE_TRANSFORMER", "true").lower() == "true"
    
    # Embedding model settings
    if USE_SENTENCE_TRANSFORMER:
        EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"  # Semantic embeddings (384-dim)
        EMBEDDING_DIMENSION = 384
        PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "cybercrime-kb-sentencetransformer")
    else:
        EMBEDDING_MODEL = "tfidf"  # TF-IDF vectorizer (384-dim)
        EMBEDDING_DIMENSION = 384
        PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "quickstart")
    
    # API settings
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8000))
    
    # Search settings
    TOP_K_RESULTS = 5  # Number of chunks to retrieve
    SIMILARITY_THRESHOLD = 0.3  # Minimum similarity score
    
    # LLM settings
    LLM_MODEL = "gemini-2.0-flash-exp"  # Gemini model for answer generation
    
    # Paths
    EXTRACTED_CHUNKS_DIR = "Extracted_Chunks"
    PDF_RESOURCES_DIR = "PDF_RESOURCES"
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY not set in environment variables")
        if not cls.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not set in environment variables")
        return True

# Validate config on import
Config.validate()
