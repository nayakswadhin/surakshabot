"""
Test script to verify priority classification feature
"""
import requests
import json

def test_priority_classification():
    url = "http://127.0.0.1:8000/classify"
    
    test_cases = [
        {
            "text": "I lost ₹50,000 from my credit card in an online fraud",
            "expected_priority": "HIGH",
            "expected_primary": "Financial Fraud",
            "description": "High priority - Financial fraud with amount ≥ ₹15,000"
        },
        {
            "text": "Someone withdrew ₹100,000 from my bank account without permission",
            "expected_priority": "HIGH",
            "expected_primary": "Financial Fraud",
            "description": "High priority - Financial fraud with large amount"
        },
        {
            "text": "I was scammed ₹5000 in a UPI fraud",
            "expected_priority": "MEDIUM",
            "expected_primary": "Financial Fraud",
            "description": "Medium priority - Financial fraud with amount < ₹15,000"
        },
        {
            "text": "Lost Rs.10000 via PhonePe scam",
            "expected_priority": "MEDIUM",
            "expected_primary": "Financial Fraud",
            "description": "Medium priority - Financial fraud with ₹10,000"
        },
        {
            "text": "I was scammed in an investment fraud but didn't specify the amount",
            "expected_priority": "MEDIUM",
            "expected_primary": "Financial Fraud",
            "description": "Medium priority - Financial fraud without amount"
        },
        {
            "text": "Someone created a fake Instagram profile impersonating me",
            "expected_priority": "LOW",
            "expected_primary": "Social Media Fraud",
            "description": "Low priority - Social Media fraud"
        },
        {
            "text": "My Facebook account was hacked",
            "expected_priority": "LOW",
            "expected_primary": "Social Media Fraud",
            "description": "Low priority - Social Media fraud (account hack)"
        },
        {
            "text": "I received obscene messages on WhatsApp",
            "expected_priority": "LOW",
            "expected_primary": "Social Media Fraud",
            "description": "Low priority - Social Media fraud (obscene content)"
        },
        {
            "text": "Credit card fraud of 2 lakh rupees",
            "expected_priority": "HIGH",
            "expected_primary": "Financial Fraud",
            "description": "High priority - Financial fraud with 2 lakhs"
        },
        {
            "text": "Lost 1 crore in investment scam",
            "expected_priority": "HIGH",
            "expected_primary": "Financial Fraud",
            "description": "High priority - Financial fraud with 1 crore"
        },
        {
            "text": "Paid ₹14,999 in an online shopping scam",
            "expected_priority": "MEDIUM",
            "expected_primary": "Financial Fraud",
            "description": "Medium priority - Just below ₹15,000 threshold"
        },
        {
            "text": "Lost exactly ₹15,000 in a loan app fraud",
            "expected_priority": "HIGH",
            "expected_primary": "Financial Fraud",
            "description": "High priority - Exactly at ₹15,000 threshold"
        },
    ]
    
    print("=" * 100)
    print("PRIORITY CLASSIFICATION TEST SUITE")
    print("=" * 100)
    print("\nTesting priority assignment based on fraud type and amount...")
    print("\nRules:")
    print("  🔴 HIGH   : Financial Fraud with amount ≥ ₹15,000")
    print("  🟡 MEDIUM : Financial Fraud with amount < ₹15,000 OR no amount specified")
    print("  🟢 LOW    : Social Media Fraud")
    print("=" * 100)
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'=' * 100}")
        print(f"Test Case {i}: {test_case['description']}")
        print(f"{'=' * 100}")
        print(f"\nInput Text:")
        print(f"  {test_case['text']}")
        print(f"\nExpected:")
        print(f"  Primary Category: {test_case['expected_primary']}")
        print(f"  Priority: {test_case['expected_priority']}")
        
        try:
            response = requests.post(url, json={"complaint_text": test_case['text']}, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                actual_primary = result.get('primary_category', 'N/A')
                actual_priority = result.get('priority', 'N/A')
                actual_subcategory = result.get('subcategory', 'N/A')
                amount = result.get('extracted_entities', {}).get('amount', 'N/A')
                
                print(f"\nActual Result:")
                print(f"  Primary Category: {actual_primary}")
                print(f"  Subcategory: {actual_subcategory}")
                print(f"  Extracted Amount: {amount}")
                print(f"  Priority: {actual_priority}")
                
                # Verify priority
                priority_match = actual_priority == test_case['expected_priority']
                primary_match = actual_primary == test_case['expected_primary']
                
                if priority_match and primary_match:
                    print(f"\n✅ PASSED - Correct priority assignment!")
                    passed += 1
                else:
                    print(f"\n❌ FAILED - Incorrect classification!")
                    if not primary_match:
                        print(f"   Primary category mismatch: expected '{test_case['expected_primary']}', got '{actual_primary}'")
                    if not priority_match:
                        print(f"   Priority mismatch: expected '{test_case['expected_priority']}', got '{actual_priority}'")
                    failed += 1
            else:
                print(f"\n❌ ERROR: Server returned status code {response.status_code}")
                print(f"Response: {response.text}")
                failed += 1
                
        except requests.exceptions.ConnectionError:
            print(f"\n❌ ERROR: Cannot connect to server at {url}")
            print("Make sure the server is running: python main.py")
            failed += 1
            break
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            failed += 1
    
    # Summary
    print(f"\n{'=' * 100}")
    print("SUMMARY")
    print(f"{'=' * 100}")
    print(f"Total Tests: {len(test_cases)}")
    print(f"Passed: {passed} ({passed/len(test_cases)*100:.1f}%)")
    print(f"Failed: {failed} ({failed/len(test_cases)*100:.1f}%)")
    
    if passed == len(test_cases):
        print("\n🎉 ALL TESTS PASSED! Priority classification is working correctly!")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please review the results above.")
    
    print(f"{'=' * 100}\n")
    
    return passed, failed

if __name__ == "__main__":
    import sys
    try:
        passed, failed = test_priority_classification()
        sys.exit(0 if failed == 0 else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
