"""
test_examples.py

Comprehensive test cases covering all fraud categories to validate the classifier.
Run this after starting the FastAPI server to test the endpoint.
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# Test cases covering all 23 financial fraud categories
FINANCIAL_TEST_CASES = [
    {
        "name": "UPI Fraud",
        "complaint": "I transferred ₹15,000 via PhonePe to scammer@paytm thinking it was a refund. Transaction ID: UPI12345678. They called from +91-9876543210",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "UPI"
    },
    {
        "name": "Investment/Trading Fraud",
        "complaint": "I invested ₹50,000 in a fake trading app called QuickTrade. They promised 300% returns on IPO but now the website is down",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Investment"
    },
    {
        "name": "Customer Care Fraud",
        "complaint": "Got a call from fake Amazon customer care number 1800-123-456. They asked for my debit card CVV and withdrew ₹8000",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Customer Care"
    },
    {
        "name": "Debit Card Fraud",
        "complaint": "My debit card was cloned at an ATM. Unauthorized transaction of Rs.12,000 from my SBI account number 12345678901",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Debit Card"
    },
    {
        "name": "Credit Card Fraud",
        "complaint": "Someone used my HDFC credit card online without my consent. I see a transaction of ₹25,000 on 15/10/2024",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Credit Card"
    },
    {
        "name": "E-Commerce Fraud",
        "complaint": "I ordered iPhone from fake Amazon seller. Paid ₹35,000 but received a box of stones. Seller is not responding",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "E-Commerce"
    },
    {
        "name": "Loan App Fraud",
        "complaint": "Downloaded instant loan app FastCash. They approved ₹10,000 loan but demanding ₹3000 insurance fee upfront. Now threatening to leak my contacts",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Loan App"
    },
    {
        "name": "Sextortion Fraud",
        "complaint": "Someone recorded my video call and is blackmailing me for ₹50,000. They have my intimate photos and threatening to send to my family",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Sextortion"
    },
    {
        "name": "OLX Fraud",
        "complaint": "I was selling my car on OLX. Buyer sent fake payment confirmation screenshot and took the car. Lost ₹2,00,000",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "OLX"
    },
    {
        "name": "Lottery Fraud",
        "complaint": "Received message that I won KBC lottery of Rs.25 lakh. They asked me to pay ₹15,000 processing fee",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Lottery"
    },
    {
        "name": "Online Job Fraud",
        "complaint": "Applied for work from home job. Company asked ₹5000 registration fee and ₹10,000 training fee. Now not responding",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Online Job"
    },
    {
        "name": "APK Fraud",
        "complaint": "Downloaded APK file from link sent on WhatsApp. It asked for all permissions and ₹20,000 got debited from my Paytm wallet",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "APK"
    },
    {
        "name": "Digital Arrest Fraud",
        "complaint": "Someone called claiming to be CBI officer. Showed fake arrest warrant on video call and demanded ₹1,00,000 to avoid digital arrest",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Digital Arrest"
    },
    {
        "name": "Gaming App Fraud",
        "complaint": "Deposited ₹30,000 in TeenPatti gaming app. Won ₹80,000 but unable to withdraw. App is asking for more deposit",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Gaming App"
    },
    {
        "name": "AEPS Fraud",
        "complaint": "Someone did biometric transaction using my Aadhar at a shop. ₹40,000 withdrawn from my account via AEPS",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "AEPS"
    },
    {
        "name": "Fake Franchisee Fraud",
        "complaint": "Paid ₹5,00,000 for Jio dealership. They gave fake agreement and now office is closed",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Franchisee"
    },
    {
        "name": "Tower Installation Fraud",
        "complaint": "Company promised ₹50,000 monthly rent for mobile tower on my land. Took ₹2,00,000 registration fee and disappeared",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Tower"
    },
    {
        "name": "E-Wallet Fraud",
        "complaint": "My Google Pay was hacked. Someone changed my UPI PIN and transferred ₹18,000 to gpay@icici",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "E-Wallet"
    },
    {
        "name": "Fake Website Fraud",
        "complaint": "Booked train ticket on fake IRCTC website irctc-booking.com. Paid ₹4500 but no ticket received",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Fake Website"
    },
    {
        "name": "Hotel Booking Fraud",
        "complaint": "Booked hotel on fake OYO website. Paid ₹8000 but when reached hotel, they said no booking exists",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Hotel Booking"
    },
    {
        "name": "Ticket Booking Fraud",
        "complaint": "Booked flight tickets from fake MakeMyTrip site. Paid Rs.12,000 via credit card but tickets never came",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Ticket Booking"
    },
    {
        "name": "Insurance Maturity Fraud",
        "complaint": "Got call about LIC policy maturity. They asked for bank details and OTP. ₹60,000 debited from account",
        "expected_primary": "Financial Fraud",
        "expected_sub_contains": "Insurance"
    },
]

# Social Media Fraud test cases
SOCIAL_MEDIA_TEST_CASES = [
    {
        "name": "Instagram Impersonation",
        "complaint": "Someone created fake Instagram profile using my photos and name. They are messaging my friends asking for money",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "Instagram"
    },
    {
        "name": "Facebook Fake Account",
        "complaint": "Fake Facebook account is using my identity. They are posting inappropriate content and defaming me",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "Facebook"
    },
    {
        "name": "WhatsApp Hack",
        "complaint": "My WhatsApp account was hacked. Scammer is sending messages to all my contacts asking for money using my number +91-9876543210",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "WhatsApp"
    },
    {
        "name": "Instagram Hack",
        "complaint": "My Instagram account got hacked. I can't login anymore and they changed my profile picture and bio",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "Instagram"
    },
    {
        "name": "X (Twitter) Obscene Content",
        "complaint": "Someone is spreading obscene morphed photos of me on X (Twitter). Multiple fake accounts are tagging me",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "X"
    },
    {
        "name": "Telegram Fake Account",
        "complaint": "Fake Telegram account impersonating me is running investment scam group and collecting money from people",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "Telegram"
    },
    {
        "name": "Gmail Hack",
        "complaint": "My Gmail account manish@gmail.com was hacked. They sent obscene emails to my office contacts",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "Gmail"
    },
    {
        "name": "Fraud Call Impersonation",
        "complaint": "Getting fraud calls from +91-9999999999 claiming to be bank manager and asking for OTP",
        "expected_primary": "Social Media Fraud",
        "expected_sub_contains": "Fraud Call"
    },
]


def test_classification():
    """Test all fraud categories"""
    print("=" * 80)
    print("TESTING FRAUD CLASSIFICATION SYSTEM")
    print("=" * 80)
    
    # Test Financial Fraud cases
    print("\n### FINANCIAL FRAUD TESTS ###\n")
    financial_correct = 0
    for i, test in enumerate(FINANCIAL_TEST_CASES, 1):
        print(f"\nTest {i}: {test['name']}")
        print(f"Complaint: {test['complaint'][:100]}...")
        
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
            primary_match = primary == test["expected_primary"]
            sub_match = test["expected_sub_contains"].lower() in subcategory.lower()
            
            status = "✓ PASS" if (primary_match and sub_match) else "✗ FAIL"
            if primary_match and sub_match:
                financial_correct += 1
            
            print(f"Result: {status}")
            print(f"  Primary: {primary} (confidence: {primary_conf:.2f})")
            print(f"  Subcategory: {subcategory} (confidence: {sub_conf:.2f})")
            print(f"  Entities: {result['extracted_entities']}")
            print(f"  Action: {result['suggested_action'][:100]}...")
            
        except Exception as e:
            print(f"✗ ERROR: {str(e)}")
    
    # Test Social Media Fraud cases
    print("\n\n### SOCIAL MEDIA FRAUD TESTS ###\n")
    social_correct = 0
    for i, test in enumerate(SOCIAL_MEDIA_TEST_CASES, 1):
        print(f"\nTest {i}: {test['name']}")
        print(f"Complaint: {test['complaint'][:100]}...")
        
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
            primary_match = primary == test["expected_primary"]
            sub_match = test["expected_sub_contains"].lower() in subcategory.lower()
            
            status = "✓ PASS" if (primary_match and sub_match) else "✗ FAIL"
            if primary_match and sub_match:
                social_correct += 1
            
            print(f"Result: {status}")
            print(f"  Primary: {primary} (confidence: {primary_conf:.2f})")
            print(f"  Subcategory: {subcategory} (confidence: {sub_conf:.2f})")
            print(f"  Action: {result['suggested_action'][:100]}...")
            
        except Exception as e:
            print(f"✗ ERROR: {str(e)}")
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Financial Fraud: {financial_correct}/{len(FINANCIAL_TEST_CASES)} passed ({financial_correct/len(FINANCIAL_TEST_CASES)*100:.1f}%)")
    print(f"Social Media Fraud: {social_correct}/{len(SOCIAL_MEDIA_TEST_CASES)} passed ({social_correct/len(SOCIAL_MEDIA_TEST_CASES)*100:.1f}%)")
    total_correct = financial_correct + social_correct
    total_tests = len(FINANCIAL_TEST_CASES) + len(SOCIAL_MEDIA_TEST_CASES)
    print(f"\nOVERALL ACCURACY: {total_correct}/{total_tests} ({total_correct/total_tests*100:.1f}%)")
    print("=" * 80)


if __name__ == "__main__":
    print("\nMake sure the FastAPI server is running (python main.py)")
    print("Press Enter to start testing...")
    input()
    test_classification()
