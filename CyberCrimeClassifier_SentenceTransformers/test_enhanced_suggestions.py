"""
Comprehensive Test Suite for Enhanced Classification and Suggested Actions
Tests all subcategories and verifies 5-step suggestions with clickable links
"""
import requests
import json
import time
import re

API_URL = "http://127.0.0.1:8000/classify"

def count_action_steps(suggested_action):
    """Count numbered steps in the suggested action"""
    # Find all patterns like "1)", "2)", etc.
    steps = re.findall(r'\d+\)', suggested_action)
    return len(steps)

def check_for_links(suggested_action):
    """Check if the suggested action contains clickable links"""
    # Check for URL patterns
    url_pattern = r'https?://[^\s\)]+|www\.[^\s\)]+'
    links = re.findall(url_pattern, suggested_action)
    return links

def test_classification(test_case, expected_category, expected_subcategory, test_num, total_tests):
    """Test a single classification case"""
    print(f"\n{'=' * 80}")
    print(f"Test {test_num}/{total_tests}: {expected_subcategory}")
    print(f"{'=' * 80}")
    print(f"Input: {test_case[:150]}...")
    
    try:
        response = requests.post(API_URL, json={"complaint_text": test_case}, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ FAILED - HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        result = response.json()
        
        # Extract results
        primary = result.get("primary_category")
        subcategory = result.get("subcategory")
        suggested_action = result.get("suggested_action", "")
        primary_conf = result.get("confidence_scores", {}).get("primary_category", 0)
        sub_conf = result.get("confidence_scores", {}).get("subcategory", 0)
        
        print(f"\n📊 Classification Result:")
        print(f"  Primary: {primary} (confidence: {primary_conf:.2%})")
        print(f"  Subcategory: {subcategory} (confidence: {sub_conf:.2%})")
        
        # Verify classification
        primary_match = primary == expected_category
        sub_match = subcategory == expected_subcategory
        
        # Count steps in suggested action
        step_count = count_action_steps(suggested_action)
        has_5_steps = step_count == 5
        
        # Check for links
        links = check_for_links(suggested_action)
        has_links = len(links) > 0
        
        print(f"\n📝 Suggested Action Analysis:")
        print(f"  Steps Count: {step_count} {'✅' if has_5_steps else '❌ (Expected 5)'}")
        print(f"  Has Links: {'✅' if has_links else '❌'}")
        if links:
            print(f"  Links Found: {len(links)}")
            for link in links[:3]:  # Show first 3 links
                print(f"    - {link}")
        
        print(f"\n📋 Suggested Action:")
        # Print first 300 chars of suggestion
        print(f"  {suggested_action[:300]}...")
        
        # Overall result
        all_pass = primary_match and sub_match and has_5_steps
        
        if all_pass:
            print(f"\n✅ PASSED - Correct classification and 5-step guidance!")
            return True
        else:
            print(f"\n❌ FAILED")
            if not primary_match:
                print(f"   ✗ Primary: expected '{expected_category}', got '{primary}'")
            if not sub_match:
                print(f"   ✗ Subcategory: expected '{expected_subcategory}', got '{subcategory}'")
            if not has_5_steps:
                print(f"   ✗ Steps: expected 5, got {step_count}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ ERROR - Cannot connect to API at {API_URL}")
        print(f"   Make sure the server is running: python main.py")
        return False
    except Exception as e:
        print(f"❌ ERROR - {str(e)}")
        return False

def run_comprehensive_tests():
    """Run comprehensive test suite covering all major subcategories"""
    
    print("=" * 80)
    print("COMPREHENSIVE TEST SUITE - Enhanced Classification & Suggestions")
    print("=" * 80)
    print(f"API Endpoint: {API_URL}")
    print(f"Testing Classification Accuracy + 5-Step Suggestions + Clickable Links")
    print("=" * 80)
    
    # Wait for server
    print("\n⏳ Checking if API server is running...")
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=5)
        print("✅ API server is running!")
    except:
        print("❌ API server is not running. Please start it with: python main.py")
        return
    
    # Comprehensive test cases covering all major subcategories
    test_cases = [
        # Financial Fraud - Card Related
        {
            "text": "I have been scammed in an online SBI credit card fraud. The caller asked me to give the OTP for a limit increase on my credit card. Around ₹40,000 was taken away from my credit card.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Credit Card Fraud"
        },
        {
            "text": "My HDFC debit card was cloned and ₹25,000 was withdrawn from ATM without my permission. I found unauthorized transactions on my statement.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Debit Card Fraud"
        },
        
        # Financial Fraud - UPI/Payment
        {
            "text": "I lost Rs.15,000 via PhonePe UPI to scammer@paytm. They sent a payment request and I accidentally approved it. Contact +91-9876543210",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "UPI Fraud"
        },
        {
            "text": "Someone hacked my Paytm wallet and transferred ₹10,000 to an unknown account. My wallet balance is now zero.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "E-Wallet Fraud"
        },
        
        # Financial Fraud - Investment & Crypto
        {
            "text": "I invested ₹50,000 in a fake crypto trading platform called CryptoMax. They promised 50% returns but disappeared with my money.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Investment/Trading/IPO Fraud"
        },
        
        # Financial Fraud - E-Commerce
        {
            "text": "I paid ₹5,000 on Amazon for a laptop but never received the product. Seller is not responding to messages.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "E-Commerce Fraud"
        },
        {
            "text": "Bought a phone on OLX for ₹12,000 but received an empty box. Seller has blocked my number now.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "OLX Fraud"
        },
        
        # Financial Fraud - Loan & Job
        {
            "text": "Fake loan app charged me ₹5,000 as processing fee but never disbursed the loan. They are threatening to leak my contacts.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Loan App Fraud"
        },
        {
            "text": "Paid ₹15,000 as registration fee for a work from home job opportunity but it turned out to be fake. They stopped responding.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Online Job Fraud"
        },
        
        # Financial Fraud - Serious Crimes
        {
            "text": "Someone is blackmailing me with my intimate photos and demanding ₹1 lakh. They are threatening to share on social media.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Sextortion Fraud"
        },
        {
            "text": "Received a video call from fake police officer saying I'm under digital arrest and must pay ₹2 lakhs immediately or face legal action.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Digital Arrest Fraud"
        },
        
        # Financial Fraud - Other Services
        {
            "text": "Called fake HDFC customer care number and they asked for my card CVV. Later ₹30,000 was debited from my account.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Customer Care Fraud"
        },
        {
            "text": "Downloaded a fake banking APK and entered my credentials. Now my account shows unauthorized transactions of ₹20,000.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "APK Fraud"
        },
        {
            "text": "Someone used my Aadhar biometric to withdraw ₹15,000 from my bank account through AEPS without my knowledge.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "AEPS Fraud"
        },
        {
            "text": "Paid ₹8,000 for hotel booking on a fake website but the hotel says they never received my reservation.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Hotel Booking Fraud"
        },
        {
            "text": "Won a lottery of ₹25 lakhs according to a message I received. They are asking for ₹50,000 as processing fee.",
            "expected_category": "Financial Fraud",
            "expected_subcategory": "Lottery Fraud"
        },
        
        # Social Media Fraud - Platform Specific
        {
            "text": "Someone created a fake Instagram profile using my photos and name. They are messaging my friends asking for money.",
            "expected_category": "Social Media Fraud",
            "expected_subcategory": "Instagram - Impersonation"
        },
        {
            "text": "My Facebook account was hacked and I cannot login anymore. The hacker changed my password and email.",
            "expected_category": "Social Media Fraud",
            "expected_subcategory": "Facebook - Hack"
        },
        {
            "text": "Someone posted obscene morphed photos of me on Twitter/X. Multiple people have shared these images.",
            "expected_category": "Social Media Fraud",
            "expected_subcategory": "X - Obscene Content"
        },
        {
            "text": "Fake WhatsApp account using my profile picture is spreading false information in my family groups.",
            "expected_category": "Social Media Fraud",
            "expected_subcategory": "WhatsApp - Fake Account"
        },
        {
            "text": "Someone hacked my Telegram account and is sending scam messages to all my contacts asking for money.",
            "expected_category": "Social Media Fraud",
            "expected_subcategory": "Telegram - Hack"
        },
        {
            "text": "Received vulgar emails on my Gmail with inappropriate content and blackmail threats.",
            "expected_category": "Social Media Fraud",
            "expected_subcategory": "Gmail - Obscene Content"
        },
        
        # Edge Cases & Fraud Calls
        {
            "text": "Keep getting fraud calls from +91-9999999999 claiming to be from my bank and asking for OTP. No money lost yet.",
            "expected_category": "Social Media Fraud",
            "expected_subcategory": "Fraud Call - Impersonation"
        },
    ]
    
    # Run all tests
    total = len(test_cases)
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        result = test_classification(
            test_case["text"],
            test_case["expected_category"],
            test_case["expected_subcategory"],
            i,
            total
        )
        
        if result:
            passed += 1
        else:
            failed += 1
        
        # Small delay between tests
        time.sleep(0.5)
    
    # Final Summary
    print(f"\n{'=' * 80}")
    print("FINAL TEST SUMMARY")
    print(f"{'=' * 80}")
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed} ({passed/total*100:.1f}%)")
    print(f"❌ Failed: {failed} ({failed/total*100:.1f}%)")
    print(f"{'=' * 80}")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Classification and suggestions are working perfectly!")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please review the failures above.")
    
    print("\n")

if __name__ == "__main__":
    try:
        run_comprehensive_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
