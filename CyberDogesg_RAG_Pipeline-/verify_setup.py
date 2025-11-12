"""
Quick verification script to check if Sentence Transformers setup is working
Run this after installing dependencies to verify everything is configured correctly
"""
import sys

def check_dependencies():
    """Check if all required packages are installed"""
    print("🔍 Checking dependencies...\n")
    
    required_packages = [
        ('sentence_transformers', 'Sentence Transformers'),
        ('torch', 'PyTorch'),
        ('transformers', 'Hugging Face Transformers'),
        ('pinecone', 'Pinecone'),
        ('google.generativeai', 'Google Gemini AI'),
        ('fastapi', 'FastAPI'),
    ]
    
    missing = []
    for package, name in required_packages:
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name} - NOT INSTALLED")
            missing.append(name)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("\nInstall with: pip install -r requirements.txt")
        return False
    
    print("\n✅ All dependencies installed!\n")
    return True


def check_env_config():
    """Check if .env file is configured correctly"""
    print("⚙️  Checking environment configuration...\n")
    
    try:
        from dotenv import load_dotenv
        import os
        
        load_dotenv()
        
        required_vars = {
            'PINECONE_API_KEY': 'Pinecone API Key',
            'GOOGLE_API_KEY': 'Google Gemini API Key',
            'USE_SENTENCE_TRANSFORMER': 'Sentence Transformer Mode'
        }
        
        missing = []
        for var, name in required_vars.items():
            value = os.getenv(var)
            if value:
                if var == 'USE_SENTENCE_TRANSFORMER':
                    is_enabled = value.lower() == 'true'
                    status = '✅ ENABLED' if is_enabled else '⚠️  DISABLED (will use TF-IDF)'
                    print(f"  {status} {name}: {value}")
                else:
                    # Mask sensitive data
                    masked = value[:8] + '...' if len(value) > 8 else '***'
                    print(f"  ✅ {name}: {masked}")
            else:
                print(f"  ❌ {name}: NOT SET")
                missing.append(name)
        
        if missing:
            print(f"\n❌ Missing environment variables: {', '.join(missing)}")
            print("\nCopy .env.example to .env and fill in your API keys")
            return False
        
        print("\n✅ Environment configured!\n")
        return True
        
    except Exception as e:
        print(f"\n❌ Error checking environment: {e}\n")
        return False


def test_sentence_transformer():
    """Test if Sentence Transformer model loads and works"""
    print("🤖 Testing Sentence Transformer model...\n")
    
    try:
        from sentence_transformers import SentenceTransformer
        
        print("  Loading model: sentence-transformers/all-MiniLM-L6-v2")
        print("  (First time will download ~80MB...)")
        
        model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        
        print("  ✅ Model loaded successfully!")
        
        # Test embedding
        test_text = "How to report cybercrime in India?"
        embedding = model.encode(test_text, normalize_embeddings=True)
        
        print(f"\n  Testing embedding generation:")
        print(f"    Input: '{test_text}'")
        print(f"    Output dimension: {len(embedding)}")
        print(f"    Expected dimension: 384")
        
        if len(embedding) == 384:
            print(f"    ✅ Dimension matches!")
        else:
            print(f"    ❌ Dimension mismatch!")
            return False
        
        # Check embedding values
        non_zero = sum(1 for x in embedding if abs(x) > 0.01)
        print(f"    Non-zero values: {non_zero}/384")
        
        if non_zero > 100:
            print(f"    ✅ Embedding looks good!")
        else:
            print(f"    ⚠️  Embedding might be problematic")
        
        print("\n✅ Sentence Transformer working!\n")
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing Sentence Transformer: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def test_pinecone_connection():
    """Test Pinecone connection"""
    print("📊 Testing Pinecone connection...\n")
    
    try:
        from config import Config
        from pinecone import Pinecone
        
        print(f"  Connecting to index: {Config.PINECONE_INDEX_NAME}")
        
        pc = Pinecone(api_key=Config.PINECONE_API_KEY)
        index = pc.Index(Config.PINECONE_INDEX_NAME)
        
        stats = index.describe_index_stats()
        
        print(f"  ✅ Connected successfully!")
        print(f"\n  Index Statistics:")
        print(f"    Total vectors: {stats.total_vector_count}")
        print(f"    Dimension: {Config.EMBEDDING_DIMENSION}")
        
        if stats.total_vector_count == 0:
            print(f"\n  ⚠️  No vectors in index yet")
            print(f"     Run: python upload_to_pinecone.py")
        else:
            print(f"  ✅ Index populated with vectors!")
        
        print("\n✅ Pinecone connection working!\n")
        return True
        
    except Exception as e:
        print(f"\n❌ Error connecting to Pinecone: {e}")
        print("\nPossible issues:")
        print("  1. Check PINECONE_API_KEY in .env")
        print("  2. Check PINECONE_INDEX_NAME matches your index")
        print("  3. Ensure index dimensions = 384")
        print()
        return False


def main():
    """Run all verification checks"""
    print("\n" + "="*60)
    print("🚀 SENTENCE TRANSFORMERS SETUP VERIFICATION")
    print("="*60 + "\n")
    
    results = []
    
    # Check 1: Dependencies
    results.append(("Dependencies", check_dependencies()))
    
    # Check 2: Environment
    if results[0][1]:  # Only if dependencies are OK
        results.append(("Environment", check_env_config()))
    else:
        results.append(("Environment", False))
    
    # Check 3: Sentence Transformer
    if results[0][1]:  # Only if dependencies are OK
        results.append(("Sentence Transformer", test_sentence_transformer()))
    else:
        results.append(("Sentence Transformer", False))
    
    # Check 4: Pinecone
    if results[1][1]:  # Only if environment is OK
        results.append(("Pinecone Connection", test_pinecone_connection()))
    else:
        results.append(("Pinecone Connection", False))
    
    # Summary
    print("="*60)
    print("📋 VERIFICATION SUMMARY")
    print("="*60 + "\n")
    
    for check, status in results:
        icon = "✅" if status else "❌"
        print(f"  {icon} {check}")
    
    all_passed = all(status for _, status in results)
    
    print("\n" + "="*60)
    if all_passed:
        print("🎉 ALL CHECKS PASSED!")
        print("="*60)
        print("\n✅ Your setup is ready!")
        print("\nNext steps:")
        print("  1. If vectors = 0, run: python upload_to_pinecone.py")
        print("  2. Start API: python api.py")
        print("  3. Test: http://localhost:8000/docs")
    else:
        print("❌ SOME CHECKS FAILED")
        print("="*60)
        print("\n⚠️  Please fix the issues above before proceeding")
        print("\nHelp:")
        print("  • Check SETUP_GUIDE.md for detailed instructions")
        print("  • Check PINECONE_SETUP.md for Pinecone configuration")
        sys.exit(1)
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Verification cancelled by user\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)
