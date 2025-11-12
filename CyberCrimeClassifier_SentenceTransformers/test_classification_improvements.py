"""
Test script to verify improved classification logic
"""
import sys
sys.path.insert(0, '.')

from classifier import FraudClassifier

def test_classifier():
    print("=" * 80)
    print("Testing Improved Cyber Crime Classifier")
    print("=" * 80)
    
    classifier = FraudClassifier()
    
    # Test cases with expected results
    test_cases = [
        {
            "text": "I have been scammed in an online SBI credit card fraud. The caller asked me to give the OTP for a limit increase on my credit card. This happened just yesterday, on November 6th, 2025, around 3:00 PM. From my credit card, around ₹40,000 was taken away by the fraudster.",
            "expected_primary": "Financial Fraud",
            "expected_sub": "Credit Card Fraud",
            "description": "Credit Card Fraud with OTP and Amount"
        },
        {
            "text": "I lost Rs.15000 via PhonePe to scammer@paytm. Contact +91-9876543210",
            "expected_primary": "Financial Fraud",
            "expected_sub": "UPI Fraud",
            "description": "UPI Fraud with amount and UPI ID"
        },
        {
            "text": "Someone created a fake Instagram profile impersonating me and posting my photos",
            "expected_primary": "Social Media Fraud",
            "expected_sub": "Instagram - Impersonation",
            "description": "Instagram Impersonation"
        },
        {
            "text": "I received a fraud call claiming to be from my bank asking for my debit card details",
            "expected_primary": "Social Media Fraud",
            "expected_sub": "Fraud Call - Impersonation",
            "description": "Fraud Call without financial transaction"
        },
        {
            "text": "My HDFC debit card was cloned and ₹25,000 was withdrawn from ATM without my permission",
            "expected_primary": "Financial Fraud",
            "expected_sub": "Debit Card Fraud",
            "description": "Debit Card Fraud with amount"
        },
        {
            "text": "I invested ₹50,000 in a fake crypto trading platform and they disappeared with my money",
            "expected_primary": "Financial Fraud",
            "expected_sub": "Investment/Trading/IPO Fraud",
            "description": "Investment Fraud"
        },
        {
            "text": "Someone hacked my Facebook account and I cannot login anymore",
            "expected_primary": "Social Media Fraud",
            "expected_sub": "Facebook - Hack",
            "description": "Facebook Account Hack"
        },
        {
            "text": "I was blackmailed for ₹1 lakh with my intimate photos",
            "expected_primary": "Financial Fraud",
            "expected_sub": "Sextortion Fraud",
            "description": "Sextortion with amount"
        },
        {
            "text": "Fake police officer called saying I'm under digital arrest and demanded ₹2 lakhs",
            "expected_primary": "Financial Fraud",
            "expected_sub": "Digital Arrest Fraud",
            "description": "Digital Arrest Fraud"
        },
        {
            "text": "I paid ₹5000 on Amazon but never received the product",
            "expected_primary": "Financial Fraud",
            "expected_sub": "E-Commerce Fraud",
            "description": "E-Commerce Fraud"
        }
    ]
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'=' * 80}")
        print(f"Test Case {i}: {test_case['description']}")
        print(f"{'=' * 80}")
        print(f"\nInput Text:")
        print(f"  {test_case['text']}")
        print(f"\nExpected:")
        print(f"  Primary: {test_case['expected_primary']}")
        print(f"  Subcategory: {test_case['expected_sub']}")
        
        try:
            primary, sub, primary_conf, sub_conf = classifier.classify(test_case['text'])
            
            print(f"\nActual Result:")
            print(f"  Primary: {primary} (confidence: {primary_conf:.2%})")
            print(f"  Subcategory: {sub} (confidence: {sub_conf:.2%})")
            
            # Check if classification is correct
            primary_match = primary == test_case['expected_primary']
            sub_match = sub == test_case['expected_sub']
            
            if primary_match and sub_match:
                print(f"\n✅ PASSED - Correct classification!")
                passed += 1
            else:
                print(f"\n❌ FAILED - Incorrect classification!")
                if not primary_match:
                    print(f"   Primary mismatch: expected '{test_case['expected_primary']}', got '{primary}'")
                if not sub_match:
                    print(f"   Subcategory mismatch: expected '{test_case['expected_sub']}', got '{sub}'")
                failed += 1
                
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            failed += 1
    
    # Summary
    print(f"\n{'=' * 80}")
    print("SUMMARY")
    print(f"{'=' * 80}")
    print(f"Total Tests: {len(test_cases)}")
    print(f"Passed: {passed} ({passed/len(test_cases)*100:.1f}%)")
    print(f"Failed: {failed} ({failed/len(test_cases)*100:.1f}%)")
    print(f"{'=' * 80}\n")
    
    return passed, failed

if __name__ == "__main__":
    try:
        passed, failed = test_classifier()
        sys.exit(0 if failed == 0 else 1)
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
