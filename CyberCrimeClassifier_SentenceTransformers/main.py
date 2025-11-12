"""
main.py

FastAPI app exposing POST /classify. Uses classifier and entity_extractor modules.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from schema import ComplaintRequest, ClassificationResponse, ExtractedEntities, ConfidenceScores
from classifier import FraudClassifier
from entity_extractor import extract_entities

app = FastAPI(title="WhatsApp Fraud Classifier (Prototype)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# initialize heavy components once
classifier = FraudClassifier()


def suggest_action(primary: str, sub: str, entities: dict, primary_conf: float) -> str:
    """
    Provide category-specific actionable guidance aligned with 1930 helpline recommendations.
    Each subcategory gets exactly 5 actionable steps with clickable links where applicable.
    """
    if primary_conf < 0.5:
        return "⚠️ UNCERTAIN CLASSIFICATION: 1) Call 1930 Cyber Crime Helpline immediately 2) File complaint at https://cybercrime.gov.in 3) Preserve all evidence (messages, screenshots, emails) 4) Note down all transaction details 5) Visit nearest cyber police station with documents"

    if primary == "Financial Fraud":
        # UPI Fraud
        if "UPI" in sub:
            return "🚨 URGENT - UPI FRAUD: 1) Call your bank immediately to freeze transaction and block UPI ID/beneficiary 2) Report to your UPI app (PhonePe: 080-68727374, Paytm: 0120-4456-456, GPay: Report in app) 3) File online complaint at https://cybercrime.gov.in with transaction details 4) Call 1930 National Cyber Crime Helpline 5) File FIR at nearest cyber police station with transaction screenshots and bank statement"
        
        # Debit Card Fraud
        elif "Debit Card" in sub:
            return "🚨 URGENT - DEBIT CARD FRAUD: 1) Block your debit card immediately via bank app/SMS/hotline (SBI: 1800-425-3800, HDFC: 1800-202-6161, ICICI: 1860-120-7777) 2) Report unauthorized transactions to bank and request chargeback/reversal 3) File complaint at https://cybercrime.gov.in 4) Call 1930 Helpline and report fraud 5) File FIR at cyber police station. ⚠️ NEVER share Card CVV/PIN/OTP with anyone"
        
        # Credit Card Fraud
        elif "Credit Card" in sub:
            return "🚨 URGENT - CREDIT CARD FRAUD: 1) Block your credit card immediately via bank app/hotline (SBI: 1800-180-1290, HDFC: 1800-202-6161, ICICI: 1860-120-7777, Axis: 1860-419-5555) 2) Dispute unauthorized transactions with bank and request chargeback 3) File complaint at https://cybercrime.gov.in with transaction details 4) Call 1930 National Cyber Crime Helpline 5) File FIR at nearest cyber police station with card statements. ⚠️ NEVER share CVV/OTP"
        
        # Sextortion Fraud
        elif "Sextortion" in sub:
            return "🔴 CRITICAL - SEXTORTION: 1) DO NOT pay any money - this encourages further extortion 2) DO NOT delete any chats/evidence - preserve everything 3) Immediately report at https://cybercrime.gov.in (100% CONFIDENTIAL - handled with complete privacy) 4) Call 1930 helpline for guidance 5) Block perpetrator on all platforms and file FIR. Your identity will be protected"
        
        # Digital Arrest Fraud
        elif "Digital Arrest" in sub:
            return "⚠️ SCAM ALERT - DIGITAL ARREST: 1) Hang up immediately - NO police/CBI/court conducts arrests via video call 2) DO NOT transfer any money or share bank details 3) Report scam at https://cybercrime.gov.in 4) Call 1930 to verify if concerned, or check https://cybercrime.gov.in/DigitalArrest.aspx 5) File FIR if money lost. Remember: Government agencies NEVER demand money via calls/video"
        
        # Loan App Fraud  
        elif "Loan App" in sub:
            return "⚠️ LOAN APP FRAUD: 1) DO NOT pay any processing/insurance fees upfront - legitimate loans don't require advance payment 2) Report fraudulent app on Google Play Store/Apple App Store 3) Lodge complaint at https://cybercrime.gov.in 4) Call 1930 Helpline for guidance 5) If personal data leaked/harassment, report to Sanchar Saathi (https://sancharsaathi.gov.in) and block lender's contact"
        
        # Investment/Trading/IPO Fraud
        elif "Investment" in sub or "Trading" in sub or "IPO" in sub:
            return "📉 INVESTMENT FRAUD: 1) Stop all further transactions immediately 2) Report to SEBI at https://scores.sebi.gov.in (for securities) or RBI at https://cms.rbi.org.in (for banking) 3) File complaint at https://cybercrime.gov.in with platform details 4) Call 1930 National Helpline 5) Verify if platform is SEBI/RBI registered at https://www.sebi.gov.in and seek legal advice for fund recovery"
        
        # E-Commerce Fraud
        elif "E-Commerce" in sub:
            return "🛒 E-COMMERCE FRAUD: 1) Report seller/listing immediately on platform (Amazon: Customer Service, Flipkart: Help Center, report fraud) 2) Request full refund via platform customer care with order details 3) File complaint at https://cybercrime.gov.in 4) Call 1930 Helpline if no response 5) Report to National Consumer Helpline at 1915 or https://consumerhelpline.gov.in. Keep all screenshots and receipts"
        
        # OLX Fraud
        elif "OLX" in sub:
            return "🏷️ OLX/CLASSIFIED ADS FRAUD: 1) Report fraudulent seller/listing on OLX platform immediately 2) DO NOT send advance payment without verifying product 3) File complaint at https://cybercrime.gov.in with seller details 4) Call 1930 Cyber Crime Helpline 5) If money transferred, contact your bank for transaction reversal and file FIR with chat screenshots"
        
        # Online Job Fraud
        elif "Online Job" in sub:
            return "💼 ONLINE JOB FRAUD: 1) Stop all communication immediately - legitimate companies never ask for registration/training fees 2) DO NOT pay any fees or share bank/Aadhar details 3) Report at https://cybercrime.gov.in with job posting details 4) Call 1930 Helpline for guidance 5) Report fake job portal to Ministry of Labour (https://labour.gov.in) and warn others about the scam"
        
        # Customer Care Fraud
        elif "Customer Care" in sub:
            return "📞 FAKE CUSTOMER CARE FRAUD: 1) Hang up immediately - verify official customer care from company's official website only 2) Call official number from company website (search '[Company Name] official customer care') 3) Report fake number at https://cybercrime.gov.in 4) Call 1930 National Helpline 5) If money lost, immediately contact your bank for transaction freeze/reversal and file FIR"
        
        # AEPS Fraud
        elif "AEPS" in sub:
            return "🆔 AEPS/AADHAR FRAUD: 1) Report to your bank immediately to block account and reverse transaction 2) File police complaint with Aadhar details and biometric authentication fraud evidence 3) Report at https://cybercrime.gov.in 4) Call 1930 Helpline and UIDAI helpline at 1947 5) Lock your Aadhar biometrics at https://resident.uidai.gov.in to prevent future misuse"
        
        # Gaming App Fraud
        elif "Gaming App" in sub:
            return "🎮 GAMING APP FRAUD: 1) Stop depositing money immediately - many gaming/betting apps are illegal 2) Report app on Play Store/App Store for fraudulent practices 3) File complaint at https://cybercrime.gov.in 4) Call 1930 Cyber Crime Helpline 5) If unauthorized debits occurred, contact bank immediately for transaction dispute and account security"
        
        # E-Wallet Fraud
        elif "E-Wallet" in sub:
            return "💳 E-WALLET FRAUD: 1) Immediately report to your wallet provider (PhonePe: 080-68727374, Paytm: 0120-4456-456, GPay: in-app support) 2) Freeze wallet, change password, and enable 2FA authentication 3) File complaint at https://cybercrime.gov.in with transaction ID 4) Call 1930 National Helpline 5) Check linked bank account for unauthorized access and notify bank"
        
        # Insurance Fraud
        elif "Insurance" in sub:
            return "🛡️ INSURANCE FRAUD: 1) Verify policy/company with IRDAI at https://www.irdai.gov.in (check registered insurers list) 2) Contact legitimate insurance company directly from their official website 3) Report fake agent/policy at https://cybercrime.gov.in 4) Call 1930 Helpline for guidance 5) DO NOT share policy documents, premium payments, or bank details to unverified callers"
        
        # Hotel/Ticket Booking Fraud
        elif "Hotel Booking" in sub or "Ticket Booking" in sub:
            return "🎫 BOOKING FRAUD: 1) Report fraudulent booking/agent on platform (MakeMyTrip, Goibibo, IRCTC official website) immediately 2) Request refund through official customer care with booking ID 3) File complaint at https://cybercrime.gov.in 4) Call 1930 Cyber Crime Helpline 5) Verify booking directly with hotel/airline on their official website/phone number"
        
        # APK Fraud
        elif "APK" in sub:
            return "📱 APK/MALICIOUS APP FRAUD: 1) Immediately uninstall suspicious APK and do NOT install apps from unknown sources 2) Run antivirus scan on device (Avast, Norton, McAfee) 3) Change all passwords and enable 2FA on banking/important apps 4) Report at https://cybercrime.gov.in with app details 5) Call 1930 Helpline and monitor bank accounts for unauthorized transactions"
        
        # Fake Franchisee/Dealership Fraud
        elif "Franchisee" in sub or "Dealership" in sub:
            return "🏪 FRANCHISEE/DEALERSHIP FRAUD: 1) Stop all payments immediately - verify franchisee opportunity with parent company directly 2) Check company registration at Ministry of Corporate Affairs (https://www.mca.gov.in) 3) File complaint at https://cybercrime.gov.in 4) Call 1930 Helpline 5) Report to Economic Offences Wing and file FIR with agreement/payment receipts"
        
        # Lottery Fraud
        elif "Lottery" in sub:
            return "🎰 LOTTERY/PRIZE FRAUD: 1) DO NOT pay any fees/taxes to claim prize - genuine lotteries never ask for advance payment 2) Verify lottery authenticity (most unsolicited lottery wins are scams) 3) Report at https://cybercrime.gov.in with lottery details 4) Call 1930 National Helpline 5) Block sender and warn family/friends about the scam"
        
        # Tower Installation Fraud
        elif "Tower" in sub:
            return "📡 TOWER INSTALLATION FRAUD: 1) DO NOT pay any advance fees - telecom companies don't contact individuals for tower installation 2) Verify with telecom company (Jio, Airtel, Vi) official customer care 3) Report scam at https://cybercrime.gov.in 4) Call 1930 Helpline 5) If money paid, file FIR immediately and contact bank for transaction reversal"
        
        # Fake Website Scam
        elif "Website" in sub or "Fake Website" in sub:
            return "🌐 FAKE WEBSITE SCAM: 1) DO NOT enter personal/banking details on suspicious websites 2) Report phishing site to Google Safe Browsing (https://safebrowsing.google.com/safebrowsing/report_phish/) 3) File complaint at https://cybercrime.gov.in with website URL 4) Call 1930 Helpline 5) If credentials shared, immediately change passwords, enable 2FA, and contact bank"
        
        # Others/General Financial Fraud
        else:
            amount = entities.get("amount")
            if amount:
                return f"💰 FINANCIAL FRAUD DETECTED ({amount}): 1) Contact your bank immediately to freeze account and block transactions 2) File detailed complaint at https://cybercrime.gov.in with all transaction details 3) Call 1930 National Cyber Crime Helpline for immediate assistance 4) File FIR at nearest cyber police station 5) Preserve ALL evidence (screenshots, messages, emails, call logs, bank statements)"
            return "⚠️ FINANCIAL FRAUD: 1) Stop all further transactions immediately 2) File complaint at https://cybercrime.gov.in with complete details 3) Call 1930 National Cyber Crime Helpline 4) Contact your bank if money was transferred 5) File FIR at cyber police station with all available evidence"

    if primary == "Social Media Fraud":
        platform = entities.get("platform") or "the platform"
        
        # Impersonation
        if "Impersonation" in sub:
            return f"👤 IMPERSONATION FRAUD: 1) Report impersonation account on {platform} immediately (use 'Report' option on fake profile) 2) Warn all your contacts about the fake account through official channel 3) Change your password and enable Two-Factor Authentication (2FA) 4) File complaint at https://cybercrime.gov.in with fake profile screenshots 5) Call 1930 Helpline if financial loss/threats, and file FIR with evidence"
        
        # Fake Account
        elif "Fake Account" in sub:
            return f"🚫 FAKE ACCOUNT: 1) Report fake account on {platform} using 'Report Account' feature 2) Block the account immediately 3) DO NOT send money or share personal information 4) File complaint at https://cybercrime.gov.in with account details and screenshots 5) Call 1930 Cyber Crime Helpline if threatened or deceived"
        
        # Account Hack
        elif "Hack" in sub:
            return f"🔒 ACCOUNT HACKED: 1) Immediately change password on {platform} and linked email using 'Forgot Password' 2) Enable Two-Factor Authentication (2FA) for added security 3) Logout from all devices/sessions remotely 4) Report hack to {platform} support center 5) File complaint at https://cybercrime.gov.in and call 1930 if financial loss occurred"
        
        # Obscene Content
        elif "Obscene Content" in sub or "Obscene" in sub:
            return f"🔞 OBSCENE CONTENT: 1) Report obscene content/morphed images to {platform} immediately (will be handled confidentially) 2) Block sender and DO NOT engage with them 3) File complaint at https://cybercrime.gov.in (handled with complete privacy) 4) Call 1930 Women & Child Helpline for support 5) Screenshot evidence and file FIR if blackmail/threats involved"
        
        # Fraud Call
        elif "Fraud Call" in sub:
            return "📞 FRAUD CALL ALERT: 1) Block the caller number immediately 2) Report number to TRAI via 1909 or Sanchar Saathi portal (https://sancharsaathi.gov.in) 3) File complaint at https://cybercrime.gov.in with caller details 4) Call 1930 if money was lost or threatened 5) Never share OTP/bank details/passwords over phone calls"
        
        # Generic Social Media Fraud
        else:
            return f"⚠️ SOCIAL MEDIA FRAUD: 1) Report suspicious account/activity to {platform} using Report feature 2) Block all suspicious accounts immediately 3) Change passwords and enable Two-Factor Authentication (2FA) 4) File complaint at https://cybercrime.gov.in 5) Call 1930 National Helpline if financial loss or serious threats"

    return "⚠️ UNABLE TO CLASSIFY: 1) Call 1930 National Cyber Crime Helpline immediately for expert guidance 2) File complaint at https://cybercrime.gov.in with all available details 3) Preserve all evidence (messages, emails, screenshots, transaction details) 4) Do NOT delete any communication or evidence 5) Visit nearest cyber police station with documents and evidence"


def calculate_priority(primary: str, sub: str, entities: dict) -> str:
    """
    Calculate priority based on fraud type and amount involved.
    
    Rules:
    - HIGH: Financial Fraud with amount ≥ ₹15,000
    - MEDIUM: Financial Fraud with amount < ₹15,000 OR Financial Fraud with no amount specified
    - LOW: Social Media Fraud
    
    Returns: "HIGH", "MEDIUM", or "LOW"
    """
    # Default priority
    priority = "MEDIUM"
    
    # If Social Media Fraud, always LOW priority
    if primary == "Social Media Fraud":
        return "LOW"
    
    # If Financial Fraud, check amount
    if primary == "Financial Fraud":
        amount_str = entities.get("amount")
        
        if amount_str:
            # Extract numeric amount from string
            import re
            # Remove currency symbols and commas
            amount_cleaned = re.sub(r'[₹Rs\.,\s]', '', amount_str)
            
            # Try to extract numbers
            numbers = re.findall(r'\d+', amount_cleaned)
            
            if numbers:
                try:
                    # Get the first number found
                    amount_value = int(numbers[0])
                    
                    # Check for thousand, lakh, crore multipliers
                    amount_str_lower = amount_str.lower()
                    if 'crore' in amount_str_lower or 'cr' in amount_str_lower:
                        amount_value *= 10000000
                    elif 'lakh' in amount_str_lower or 'lac' in amount_str_lower:
                        amount_value *= 100000
                    elif 'thousand' in amount_str_lower or 'k' in amount_str_lower:
                        amount_value *= 1000
                    
                    # Determine priority based on amount
                    if amount_value >= 15000:
                        priority = "HIGH"
                    else:
                        priority = "MEDIUM"
                except ValueError:
                    # If parsing fails, default to MEDIUM for financial fraud
                    priority = "MEDIUM"
            else:
                # No amount found, but it's financial fraud
                priority = "MEDIUM"
        else:
            # Financial fraud but no amount specified
            priority = "MEDIUM"
    
    # If uncertain or other categories, default to MEDIUM
    if primary not in ["Financial Fraud", "Social Media Fraud"]:
        priority = "MEDIUM"
    
    return priority


@app.post("/classify", response_model=ClassificationResponse)
def classify_endpoint(req: ComplaintRequest):
    text = req.complaint_text
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="complaint_text must be a non-empty string")

    primary, sub, primary_conf, sub_conf = classifier.classify(text)

    # handle low confidence gracefully
    if primary_conf < 0.5:
        primary = "uncertain"
        sub = "uncertain"

    ents = extract_entities(text)
    extracted = ExtractedEntities(
        amount=ents.get("amount"),
        phone_numbers=ents.get("phone_numbers"),
        upi_id=ents.get("upi_id"),
        urls=ents.get("urls"),
        platform=ents.get("platform"),
        other={k: v for k, v in ents.items() if k not in ("amount", "phone_numbers", "upi_id", "urls", "platform")},
    )

    # Calculate priority
    priority = calculate_priority(primary, sub, ents)

    suggested = suggest_action(primary, sub, ents, primary_conf)

    resp = ClassificationResponse(
        primary_category=primary,
        subcategory=sub,
        extracted_entities=extracted,
        confidence_scores=ConfidenceScores(primary_category=primary_conf, subcategory=sub_conf),
        priority=priority,
        suggested_action=suggested,
    )
    return resp


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
