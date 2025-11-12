"""
Comprehensive API Test - Tests query refinement, detailed answers, and formatting
"""
import requests
import json
import time

def test_api():
    url = "http://localhost:8000/query"
    
    # Wait for API to be ready
    print("⏳ Waiting for API to be ready...")
    max_retries = 10
    for i in range(max_retries):
        try:
            health = requests.get("http://localhost:8000/health", timeout=2)
            if health.status_code == 200:
                print("✅ API is ready!\n")
                break
        except:
            if i < max_retries - 1:
                print(f"   Attempt {i+1}/{max_retries}... waiting")
                time.sleep(2)
            else:
                print("❌ API not responding. Make sure api.py is running!")
                return
    
    # Test multiple queries
    test_queries = [
        "What are cyber safety tips?",
        "How to report cybercrime online?",
        "What is financial fraud?",
    ]
    
    print("=" * 80)
    print("🧪 TESTING API WITH MULTIPLE QUERIES")
    print("=" * 80)
    
    for query_text in test_queries:
        payload = {
            "query": query_text,
            "top_k": 8
        }
        
        print(f"\n{'='*80}")
        print(f"📝 Query: {query_text}")
        print(f"{'='*80}\n")
        
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            answer = result['answer']
            
            # Extract main answer (before footer)
            main_answer = answer.split("━━━")[0].strip()
            word_count = len(main_answer.split())
            
            print(f"📊 Stats:")
            print(f"   - Word count: {word_count} words")
            print(f"   - Sources: {len(result['sources'])} documents")
            print(f"\n📋 Answer Preview (first 600 chars):")
            print("-" * 80)
            print(main_answer[:600] + "...")
            print("-" * 80)
            
            print(f"\n� Top 3 Sources:")
            for i, src in enumerate(result['sources'][:3], 1):
                print(f"   {i}. {src['section']} (Page {src['page']}) - {src['relevance_score']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
        
        print("\n")
    
    print("=" * 80)
    print("🎉 Test Complete!")
    print("=" * 80)

if __name__ == "__main__":
    test_api()
