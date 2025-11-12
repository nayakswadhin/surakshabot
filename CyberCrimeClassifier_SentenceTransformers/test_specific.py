"""Quick test for specific failing cases"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

# Wait for server to start
print("Waiting for server to start...")
time.sleep(12)

test_cases = [
    {
        "name": "Instagram Impersonation",
        "complaint": "Someone created fake Instagram profile using my photos and name. They are messaging my friends asking for money",
        "expected_sub": "Instagram - Impersonation"
    },
    {
        "name": "Telegram Fake Account",
        "complaint": "Fake Telegram account impersonating me is running investment scam group and collecting money from people",
        "expected_sub": "Telegram - Impersonation"
    },
    {
        "name": "Fraud Call Impersonation",
        "complaint": "Getting fraud calls from +91-9999999999 claiming to be bank manager and asking for OTP",
        "expected_sub": "Fraud Call - Impersonation"
    },
]

print("\n" + "="*80)
print("TESTING SPECIFIC FAILING CASES")
print("="*80 + "\n")

for i, test in enumerate(test_cases, 1):
    print(f"\nTest {i}: {test['name']}")
    print(f"Complaint: {test['complaint'][:80]}...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/classify",
            json={"complaint_text": test["complaint"]},
            timeout=30
        )
        result = response.json()
        
        primary = result["primary_category"]
        subcategory = result["subcategory"]
        primary_conf = result["confidence_scores"]["primary_category"]
        sub_conf = result["confidence_scores"]["subcategory"]
        
        # Check if classification is correct
        expected_match = test["expected_sub"] == subcategory
        
        status = "✓ PASS" if expected_match else "✗ FAIL"
        
        print(f"Result: {status}")
        print(f"  Expected: {test['expected_sub']}")
        print(f"  Got: {subcategory}")
        print(f"  Primary: {primary} (confidence: {primary_conf:.2f})")
        print(f"  Subcategory confidence: {sub_conf:.2f}")
        
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")

print("\n" + "="*80)
