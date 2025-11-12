"""
Quick API test script
Run this in a separate terminal while main.py is running
"""
import requests
import json

def test_api():
    url = "http://127.0.0.1:8000/classify"
    
    # Test case 1: UPI Fraud
    test1 = {
        "complaint_text": "I lost Rs.15000 via PhonePe to scammer@paytm. Contact +91-9876543210"
    }
    
    print("=" * 80)
    print("Testing UPI Fraud Classification")
    print("=" * 80)
    print(f"\nInput: {test1['complaint_text']}\n")
    
    try:
        response = requests.post(url, json=test1, timeout=10)
        result = response.json()
        print("✅ SUCCESS! Server is working!\n")
        print(json.dumps(result, indent=2))
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to server at http://127.0.0.1:8000")
        print("Make sure the server is running: python main.py")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_api()
