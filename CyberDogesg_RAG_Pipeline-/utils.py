"""
Utility functions for embeddings and text processing
"""
import os
import json
import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from tqdm import tqdm
from config import Config


class SentenceTransformerEmbedding:
    """Manages text embeddings using Sentence Transformers (semantic, 384-dim)"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize Sentence Transformer model
        
        Args:
            model_name: HuggingFace model identifier (default: all-MiniLM-L6-v2)
        """
        print(f"🔍 Loading Sentence Transformer model: {model_name}")
        print("   This may take a minute on first run (downloads ~80MB model)...")
        
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
            print(f"   ✓ Model loaded successfully ({Config.EMBEDDING_DIMENSION} dimensions)")
        except ImportError:
            raise ImportError(
                "sentence-transformers not installed. Run: pip install sentence-transformers"
            )
        except Exception as e:
            raise RuntimeError(f"Failed to load Sentence Transformer model: {e}")
    
    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Input text string
            
        Returns:
            List of floats (384-dimensional normalized embedding)
        """
        if isinstance(text, list):
            text = " ".join(text)
        
        text = text.strip()
        if not text:
            # Return zero vector for empty text
            return [0.0] * Config.EMBEDDING_DIMENSION
        
        # Generate semantic embedding
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()
    
    def get_embeddings_batch(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (optimized batch processing)
        
        Args:
            texts: List of text strings
            batch_size: Number of texts to process at once
            
        Returns:
            List of embeddings (each 384-dimensional)
        """
        if not texts:
            return []
        
        print(f"   Generating embeddings for {len(texts)} chunks (batch_size={batch_size})...")
        
        # Clean texts
        cleaned_texts = [text.strip() if text else "" for text in texts]
        
        # Batch encode with progress bar
        all_embeddings = []
        for i in tqdm(range(0, len(cleaned_texts), batch_size), desc="Embedding batches"):
            batch = cleaned_texts[i:i + batch_size]
            embeddings = self.model.encode(
                batch, 
                normalize_embeddings=True,
                show_progress_bar=False
            )
            all_embeddings.extend(embeddings.tolist())
        
        return all_embeddings
    
    def embed_chunks(self, chunks: List[Dict[str, Any]], text_key: str = "text") -> np.ndarray:
        """
        Generate embeddings for a list of chunk dictionaries
        
        Args:
            chunks: List of chunk dictionaries
            text_key: Key to extract text from each chunk
            
        Returns:
            NumPy array of embeddings
        """
        texts = [chunk.get(text_key, "") for chunk in chunks]
        embeddings = self.get_embeddings_batch(texts)
        return np.array(embeddings)


class EmbeddingManager:
    """Manages text embeddings using TF-IDF (works immediately, no downloads!)"""
    
    def __init__(self):
        print("✓ Using TF-IDF embeddings (384 dimensions)")
        self.vectorizer = TfidfVectorizer(max_features=384, ngram_range=(1, 2))
        self.is_fitted = False
    
    def fit(self, texts: List[str]):
        """Fit the vectorizer on all texts"""
        print("  Fitting TF-IDF vectorizer on all texts...")
        self.vectorizer.fit(texts)
        self.is_fitted = True
        print("  ✓ Vectorizer fitted!")
    
    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        if not self.is_fitted:
            # Fit on single text if not fitted
            self.vectorizer.fit([text])
            self.is_fitted = True
        
        vec = self.vectorizer.transform([text])
        dense = vec.toarray()[0]
        if len(dense) < 384:
            dense = np.pad(dense, (0, 384 - len(dense)))
        else:
            dense = dense[:384]
        return dense.tolist()
    
    def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if not self.is_fitted:
            self.fit(texts)
        
        vecs = self.vectorizer.transform(texts)
        embeddings = []
        
        for i in tqdm(range(vecs.shape[0]), desc="Generating embeddings"):
            dense = vecs[i].toarray()[0]
            if len(dense) < 384:
                dense = np.pad(dense, (0, 384 - len(dense)))
            else:
                dense = dense[:384]
            embeddings.append(dense.tolist())
        
        return embeddings


def get_embedding_manager():
    """
    Factory function to create the appropriate embedding manager based on config
    
    Returns:
        EmbeddingManager (TF-IDF) or SentenceTransformerEmbedding based on Config.USE_SENTENCE_TRANSFORMER
    """
    if Config.USE_SENTENCE_TRANSFORMER:
        print(f"📊 Using Sentence Transformer embeddings ({Config.EMBEDDING_DIMENSION}D)")
        return SentenceTransformerEmbedding(Config.EMBEDDING_MODEL)
    else:
        print(f"📊 Using TF-IDF embeddings ({Config.EMBEDDING_DIMENSION}D)")
        return EmbeddingManager()


def clean_pdf_text(text: str) -> str:
    """Clean PDF text from formatting artifacts"""
    import re
    
    # Remove header/footer patterns
    text = re.sub(r'Page \d+ of \d+', '', text)
    text = re.sub(r'USER MANUAL FOR NATIONAL CYBERCRIME REPORTING PORTAL', '', text, flags=re.IGNORECASE)
    text = re.sub(r'MINISTRY OF HOME AFFAIRS', '', text, flags=re.IGNORECASE)
    
    # Remove page numbers
    text = re.sub(r'\bPage\s*\d+\b', '', text, flags=re.IGNORECASE)
    
    # Remove excessive newlines and whitespace
    text = re.sub(r'\n\s*\n', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    
    # Remove bullet formatting artifacts
    text = re.sub(r'^\s*[\•\-\*\▪]\s*', '', text)
    
    # Remove social media footers
    text = re.sub(r'Follow on twitter.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'lR;eso t;rs.*', '', text)
    
    # Remove common PDF artifacts
    text = re.sub(r'\(cid:\d+\)', '', text)
    
    # Clean up multiple spaces
    text = ' '.join(text.split())
    
    return text.strip()


def deduplicate_chunks(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove duplicate chunks based on text similarity"""
    seen_texts = set()
    unique_chunks = []
    
    for chunk in chunks:
        # Use first 100 chars as fingerprint
        fingerprint = chunk['text'][:100].strip().lower()
        if fingerprint not in seen_texts and len(fingerprint) > 20:
            seen_texts.add(fingerprint)
            unique_chunks.append(chunk)
    
    return unique_chunks


def create_structured_context(chunks: List[Dict[str, Any]], max_length: int = 1500) -> str:
    """Create well-structured context from chunks for LLM"""
    context_parts = []
    current_length = 0
    
    for i, chunk in enumerate(chunks, 1):
        text = clean_pdf_text(chunk.get('text', ''))
        
        if not text or len(text) < 30:
            continue
        
        # Add context marker
        source_info = f"[Source {i}: {chunk.get('filename', 'Unknown')}, Page {chunk.get('page', 'N/A')}]"
        chunk_text = f"{source_info}\n{text}\n"
        
        if current_length + len(chunk_text) > max_length:
            break
        
        context_parts.append(chunk_text)
        current_length += len(chunk_text)
    
    return "\n".join(context_parts)


def load_all_chunks() -> List[Dict[str, Any]]:
    """Load all chunked data from the Extracted_Chunks folder"""
    all_chunks = []
    base_path = Config.EXTRACTED_CHUNKS_DIR
    
    # Section mapping for better metadata
    section_mapping = {
        "Citizen_Manual": "Citizen Manual",
        "Cyber_awareness": "Cyber Awareness",
        "Cyber_Safety_Tips": "Cyber Safety Tips",
        "Daily_digest": "Daily Digest"
    }
    
    for section_folder in os.listdir(base_path):
        section_path = os.path.join(base_path, section_folder)
        
        if not os.path.isdir(section_path):
            continue
        
        section_name = section_mapping.get(section_folder, section_folder)
        print(f"\nLoading chunks from: {section_name}")
        
        for json_file in os.listdir(section_path):
            if not json_file.endswith('.json'):
                continue
            
            file_path = os.path.join(section_path, json_file)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    chunks = json.load(f)
                
                # Add section metadata to each chunk
                for chunk in chunks:
                    chunk['section'] = section_name
                    chunk['section_folder'] = section_folder
                    # Clean empty text chunks
                    if chunk.get('text', '').strip():
                        all_chunks.append(chunk)
                
                print(f"  ✓ Loaded {len(chunks)} chunks from {json_file}")
            
            except Exception as e:
                print(f"  ✗ Error loading {json_file}: {e}")
    
    print(f"\n{'='*50}")
    print(f"Total chunks loaded: {len(all_chunks)}")
    print(f"{'='*50}\n")
    
    return all_chunks


def format_sources(chunks: List[Dict[str, Any]]) -> str:
    """Format source citations from retrieved chunks"""
    sources = []
    seen = set()
    
    for chunk in chunks:
        filename = chunk.get('filename', 'Unknown')
        page = chunk.get('page', 'N/A')
        section = chunk.get('section', 'Unknown')
        
        source_key = f"{filename}_{page}"
        
        if source_key not in seen:
            sources.append({
                'filename': filename,
                'page': page,
                'section': section
            })
            seen.add(source_key)
    
    if not sources:
        return "No sources found."
    
    # Format as readable text
    formatted = "\n\n📚 **Sources:**\n"
    for i, src in enumerate(sources, 1):
        formatted += f"{i}. **{src['filename']}** (Page {src['page']}) - Section: {src['section']}\n"
    
    return formatted


def create_context_from_chunks(chunks: List[Dict[str, Any]], max_length: int = 2000) -> str:
    """Create context string from retrieved chunks for LLM"""
    context_parts = []
    current_length = 0
    
    for chunk in chunks:
        text = chunk.get('text', '').strip()
        if not text:
            continue
        
        # Add source info to context
        source_info = f"[From: {chunk.get('filename', 'Unknown')}, Page {chunk.get('page', 'N/A')}]\n"
        chunk_text = source_info + text + "\n\n"
        
        if current_length + len(chunk_text) > max_length:
            break
        
        context_parts.append(chunk_text)
        current_length += len(chunk_text)
    
    return "".join(context_parts)
