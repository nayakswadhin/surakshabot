"""
entity_extractor.py

Extract structured information using regex and spaCy NER.

Extracts:
- amounts (₹ or Rs.)
- phone numbers
- UPI IDs
- URLs
- platform mentions

"""
from __future__ import annotations

import re
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# SpaCy is optional - if not available, use regex-only mode
try:
    import spacy
    def ensure_spacy_model(model_name: str = "en_core_web_sm"):
        try:
            return spacy.load(model_name)
        except Exception:
            logger.warning(f"SpaCy model {model_name} not available. Using regex-only mode.")
            return None
    nlp = ensure_spacy_model()
except ImportError:
    logger.warning("SpaCy not installed. Using regex-only entity extraction.")
    nlp = None

# regex patterns
AMOUNT_RE = re.compile(r"(₹|Rs\.?\s?|INR\s?)[\s]*\d{1,3}(?:[,\d]{0,})?(?:\.\d+)?", flags=re.IGNORECASE)
PHONE_RE = re.compile(r"(?:\+91|91|0)?[-\s]?(?:\d{10}|\d{5}[-\s]?\d{5}|\d{3}[-\s]?\d{3}[-\s]?\d{4})")
UPI_RE = re.compile(r"[\w\.\-]{2,256}@[a-zA-Z]{2,64}")
URL_RE = re.compile(r"https?://\S+|www\.\S+", flags=re.IGNORECASE)
# Account number: typically 9-18 digits
ACCOUNT_RE = re.compile(r"\b(?:account|acc|a/c)[\s\#\:\-]*(\d{9,18})\b", flags=re.IGNORECASE)
# Transaction ID / Reference number: alphanumeric, often 10-20 chars
TXN_RE = re.compile(r"(?:transaction|txn|ref|reference|utr)[\s\#\:\-]*([A-Z0-9]{10,20})\b", flags=re.IGNORECASE)
# Date patterns: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
DATE_RE = re.compile(r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b")
# Bank names (common Indian banks)
BANKS = ["sbi", "hdfc", "icici", "axis", "pnb", "bob", "canara", "union bank", "kotak", "yes bank", "idbi", "indian bank"]

PLATFORMS = ["instagram", "facebook", "x", "twitter", "whatsapp", "telegram", "gmail", "paytm", "phonepe", "google pay", "amazon", "flipkart", "olx"]


def extract_entities(text: str) -> Dict[str, Any]:
    t = text or ""
    
    # Extract amounts
    amount_matches = [m.group(0) for m in AMOUNT_RE.finditer(t)]
    
    # Extract phone numbers
    phones = [m.group(0) for m in PHONE_RE.finditer(t)]
    
    # Extract UPI IDs
    upis = [m.group(0) for m in UPI_RE.finditer(t)]
    
    # Extract URLs
    urls = [m.group(0) for m in URL_RE.finditer(t)]
    
    # Extract account numbers
    accounts = [m.group(1) for m in ACCOUNT_RE.finditer(t)]
    
    # Extract transaction IDs
    txn_ids = [m.group(1) for m in TXN_RE.finditer(t)]
    
    # Extract dates
    dates = [m.group(0) for m in DATE_RE.finditer(t)]
    
    # Extract bank names
    low = t.lower()
    bank_names = [bank for bank in BANKS if bank in low]
    
    # spacy NER for extras (organizations, persons) - only if spaCy is available
    orgs = []
    persons = []
    if nlp is not None:
        try:
            doc = nlp(t)
            orgs = [ent.text for ent in doc.ents if ent.label_ in ("ORG", "PRODUCT")]
            persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
        except Exception as e:
            logger.warning(f"SpaCy NER failed: {e}")
    
    # Detect platform
    platform = None
    for p in PLATFORMS:
        if p in low:
            platform = p
            break
    
    return {
        "amount": amount_matches[0] if amount_matches else None,
        "phone_numbers": list(set(phones)) if phones else [],
        "upi_id": upis[0] if upis else None,
        "urls": urls,
        "platform": platform,
        "account_numbers": list(set(accounts)) if accounts else [],
        "transaction_ids": list(set(txn_ids)) if txn_ids else [],
        "dates": dates,
        "bank_names": bank_names,
        "orgs": orgs,
        "persons": persons,
    }


if __name__ == "__main__":
    s = "I lost ₹5,000 via UPI to test@okaxis. Contact +91-9876543210. The phishing site was http://scam.example.com"
    print(extract_entities(s))
