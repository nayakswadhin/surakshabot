"""
Quick test script to send POST request to local API
"""
import requests
import json
import time

# Wait for server to start
print("⏳ Waiting for server to start...")
time.sleep(15)

# Test endpoint
url = "http://127.0.0.1:8000/query"
payload = {
    "query": "How to report cybercrime in India?",
    "top_k": 8
}

print(f"\n🔍 Sending query: {payload['query']}\n")
print("=" * 80)

try:
    response = requests.post(url, json=payload, timeout=60)
    
    if response.status_code == 200:
        result = response.json()
        
        print("\n✅ SUCCESS! Got response from API\n")
        print("=" * 80)
        print("\n📝 ANSWER:")
        print("-" * 80)
        print(result.get("answer", "No answer"))
        print("-" * 80)
        
        print(f"\n📊 Retrieved {len(result.get('sources', []))} sources")
        print(f"⏱️  Processing time: {result.get('processing_time_ms', 0):.0f}ms")
        
        # Save full response to file
        with open("test_response.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print("\n💾 Full response saved to: test_response.json")
        
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to server. Is it running on port 8000?")
except requests.exceptions.Timeout:
    print("❌ Request timed out after 60 seconds")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 80)
