"""
Script to upload all chunks to Pinecone vector database
Run this once to populate your Pinecone index
"""
import os
from pinecone import Pinecone
from tqdm import tqdm
from config import Config
from utils import get_embedding_manager, load_all_chunks

def upload_chunks_to_pinecone():
    """Upload all chunks to Pinecone with embeddings"""
    
    print("="*60, flush=True)
    print("UPLOADING CHUNKS TO PINECONE", flush=True)
    print("="*60, flush=True)
    
    # Initialize Pinecone
    print("\n1. Connecting to Pinecone...", flush=True)
    pc = Pinecone(api_key=Config.PINECONE_API_KEY)
    index = pc.Index(Config.PINECONE_INDEX_NAME)
    
    # Get index stats
    stats = index.describe_index_stats()
    print(f"   ✓ Connected to index: {Config.PINECONE_INDEX_NAME}", flush=True)
    print(f"   Current vectors in index: {stats.total_vector_count}", flush=True)
    
    # Initialize embedding manager
    print(f"\n2. Loading embedding model ({Config.EMBEDDING_MODEL})...", flush=True)
    print(f"   Mode: {'Sentence Transformer' if Config.USE_SENTENCE_TRANSFORMER else 'TF-IDF'}", flush=True)
    print(f"   Dimension: {Config.EMBEDDING_DIMENSION}D", flush=True)
    embedding_manager = get_embedding_manager()
    
    # Load all chunks
    print("\n3. Loading all chunks from files...", flush=True)
    all_chunks = load_all_chunks()
    
    if not all_chunks:
        print("   ✗ No chunks found! Please check your Extracted_Chunks folder.")
        return
    
    # Prepare vectors for upload
    print("\n4. Filtering and generating embeddings for all chunks...")
    vectors_to_upload = []
    skipped_count = 0
    
    # Filter out empty or very short chunks first
    valid_chunks = []
    for chunk in all_chunks:
        text = chunk.get('text', '').strip()
        if len(text) >= 10:  # At least 10 characters
            valid_chunks.append(chunk)
        else:
            skipped_count += 1
    
    print(f"   ✓ Valid chunks: {len(valid_chunks)} (skipped {skipped_count} empty chunks)")
    
    # Process in batches for efficiency
    batch_size = 32
    
    # For TF-IDF, fit on all texts first
    if not Config.USE_SENTENCE_TRANSFORMER:
        print("   Fitting TF-IDF on all texts...")
        all_texts = [chunk.get('text', '').strip() for chunk in valid_chunks]
        embedding_manager.fit(all_texts)
        print("   ✓ TF-IDF fitted!")
    
    for i in tqdm(range(0, len(valid_chunks), batch_size), desc="Processing batches"):
        batch_chunks = valid_chunks[i:i + batch_size]
        
        # Get texts and generate embeddings
        texts = [chunk.get('text', '').strip() for chunk in batch_chunks]
        embeddings = embedding_manager.get_embeddings_batch(texts)
        
        # Prepare vectors - skip if embedding is all zeros
        for j, (chunk, embedding) in enumerate(zip(batch_chunks, embeddings)):
            # Check if embedding has at least one non-zero value
            if sum(abs(x) for x in embedding) > 0:
                vector_id = chunk.get('chunk_id', f"chunk_{i+j}")
                
                metadata = {
                    'text': chunk.get('text', '')[:1000],  # Pinecone metadata limit
                    'filename': chunk.get('filename', 'Unknown'),
                    'page': chunk.get('page', 0),
                    'section': chunk.get('section', 'Unknown'),
                    'chunk_id': chunk.get('chunk_id', ''),
                    'full_text': chunk.get('text', '')  # Store full text
                }
                
                vectors_to_upload.append({
                    'id': vector_id,
                    'values': embedding,
                    'metadata': metadata
                })
            else:
                skipped_count += 1
    
    # Upload to Pinecone in batches
    print(f"\n5. Uploading {len(vectors_to_upload)} vectors to Pinecone...")
    
    upload_batch_size = 100  # Pinecone batch limit
    
    for i in tqdm(range(0, len(vectors_to_upload), upload_batch_size), desc="Uploading"):
        batch = vectors_to_upload[i:i + upload_batch_size]
        index.upsert(vectors=batch)
    
    # Verify upload
    print("\n6. Verifying upload...")
    final_stats = index.describe_index_stats()
    print(f"   ✓ Vectors in index: {final_stats.total_vector_count}")
    
    print("\n" + "="*60)
    print("✅ UPLOAD COMPLETE!")
    print("="*60)
    print(f"Total chunks uploaded: {len(vectors_to_upload)}")
    print(f"Sections covered: Citizen Manual, Cyber Awareness, Cyber Safety Tips, Daily Digest")
    print("\nYou can now run the API server with: python api.py")
    print("="*60)


if __name__ == "__main__":
    try:
        upload_chunks_to_pinecone()
    except Exception as e:
        print(f"\n❌ Error during upload: {e}")
        import traceback
        traceback.print_exc()
