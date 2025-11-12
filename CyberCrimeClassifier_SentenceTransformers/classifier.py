"""
classifier.py

Provides a lightweight DistilBERT-based embedding helper + keyword heuristics to
classify complaint text into the requested primary and subcategories.

Design:
- Use DistilBERT to compute sentence embeddings (mean pooling).
- Build prototype embeddings for each subcategory from a few representative
  phrases and keywords.
- Classification picks the prototype with highest cosine similarity.
- Also includes keyword heuristics for fast, high-precision mapping.

This design allows running locally and keeps results explainable. If similarity
confidence is low, the API will return 'uncertain' with recommended actions.
"""
from __future__ import annotations

from typing import Dict, Tuple, List
import math
import logging
import re

import torch
from transformers import DistilBertTokenizerFast, DistilBertModel
import numpy as np

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# Primary categories and subcategories
PRIMARY_CATEGORIES = ["Financial Fraud", "Social Media Fraud"]

FINANCIAL_SUBCATEGORIES = [
    "Investment/Trading/IPO Fraud",
    "Customer Care Fraud",
    "UPI Fraud",
    "APK Fraud",
    "Fake Franchisee/Dealership Fraud",
    "Online Job Fraud",
    "Debit Card Fraud",
    "Credit Card Fraud",
    "E-Commerce Fraud",
    "Loan App Fraud",
    "Sextortion Fraud",
    "OLX Fraud",
    "Lottery Fraud",
    "Hotel Booking Fraud",
    "Gaming App Fraud",
    "AEPS Fraud",
    "Tower Installation Fraud",
    "E-Wallet Fraud",
    "Digital Arrest Fraud",
    "Fake Website Scam Frauds",
    "Ticket Booking Fraud",
    "Insurance Maturity Fraud",
    "Others",
]

SOCIAL_PLATFORMS = [
    "Facebook",
    "Instagram",
    "X",
    "WhatsApp",
    "Telegram",
    "Gmail",
    "Fraud Call",
]

SOCIAL_ISSUES = ["Impersonation", "Fake Account", "Hack", "Obscene Content"]

SOCIAL_SUBCATEGORIES = [f"{p} - {i}" for p in SOCIAL_PLATFORMS for i in SOCIAL_ISSUES]


class SimpleDistilEmbedder:
    def __init__(self, device: str | None = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Loading DistilBERT on device={self.device}")
        self.tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")
        self.model = DistilBertModel.from_pretrained("distilbert-base-uncased").to(self.device)
        self.model.eval()

    def embed(self, texts: List[str]) -> np.ndarray:
        # returns (n, dim) numpy array
        with torch.no_grad():
            encoded = self.tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
            input_ids = encoded["input_ids"].to(self.device)
            attention_mask = encoded["attention_mask"].to(self.device)
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            last_hidden = outputs.last_hidden_state  # (batch, seq, dim)
            mask = attention_mask.unsqueeze(-1).to(last_hidden.dtype)
            summed = (last_hidden * mask).sum(1)
            lengths = mask.sum(1).clamp(min=1)
            mean_pooled = summed / lengths
            arr = mean_pooled.cpu().numpy()
            return arr


def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    # a and b are 1-D
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


class FraudClassifier:
    def __init__(self, device: str | None = None):
        self.embedder = SimpleDistilEmbedder(device=device)
        # Build prototypes
        self._build_prototypes()

    def _build_prototypes(self):
        # Comprehensive keyword phrases for all 23 financial subcategories
        self.financial_keywords = {
            "Investment/Trading/IPO Fraud": ["investment scam", "trading app", "ipo scam", "stock scam", "portfolio", "trading fraud", "fake investment", "share market", "invested", "crypto", "bitcoin", "cryptocurrency", "forex", "trading platform", "stock market"],
            "Customer Care Fraud": ["customer care", "fake customer service", "customer support fraud", "helpline scam", "toll free number fraud"],
            "UPI Fraud": ["upi fraud", "upi id", "failed payment", "upi", "collect money via upi", "imps", "neft", "rtgs", "inb", "internet banking fraud", "via upi"],
            "APK Fraud": ["apk", "download apk", "install apk", "malicious app", "android app fraud", "suspicious application"],
            "Fake Franchisee/Dealership Fraud": ["franchisee", "dealership", "distributorship fraud", "fake franchise", "franchise scam"],
            "Online Job Fraud": ["work from home", "job offer", "interview fee", "job scam", "part time job", "registration fee", "fake job"],
            "Debit Card Fraud": ["debit card", "card blocked", "card used without consent", "atm card fraud", "card details stolen", "debit card cloned", "atm fraud"],
            "Credit Card Fraud": ["credit card", "unauthorized transaction", "cc number", "credit card cloning", "card details leaked", "credit card fraud", "card limit", "credit limit", "cvv", "card otp", "credit card scam"],
            "E-Commerce Fraud": ["fake seller", "didn't receive", "scam e-commerce", "refund not received", "online shopping fraud", "fake product", "amazon fraud", "flipkart scam", "never received"],
            "Loan App Fraud": ["loan app", "loan approval", "loan app fraud", "instant loan scam", "personal loan fraud", "fake loan"],
            "Sextortion Fraud": ["sextortion", "intimate photos", "blackmail", "nude photos", "video call blackmail", "compromising photos", "extortion"],
            "OLX Fraud": ["olx", "olx scam", "classified ads fraud", "second hand sale fraud"],
            "Lottery Fraud": ["lottery", "won lottery", "lucky draw", "prize money", "lottery scam", "sweepstakes fraud"],
            "Hotel Booking Fraud": ["hotel booking", "fake hotel", "oyo fraud", "booking.com scam", "accommodation fraud"],
            "Gaming App Fraud": ["gaming app", "online game fraud", "betting app", "fantasy sports scam", "pubg scam", "game wallet fraud"],
            "AEPS Fraud": ["aeps", "aadhar enabled payment", "aadhar fraud", "biometric fraud", "fingerprint payment fraud"],
            "Tower Installation Fraud": ["tower installation", "mobile tower", "telecom tower fraud", "tower lease scam"],
            "E-Wallet Fraud": ["phonepe", "google pay", "paytm", "e-wallet", "wallet", "digital wallet fraud", "mobikwik"],
            "Digital Arrest Fraud": ["digital arrest", "police arrest", "cyber crime arrest", "legal notice fraud", "arrest warrant", "fake police call"],
            "Fake Website Scam Frauds": ["fake website", "phishing site", "spoofed website", "clone website", "fake portal", "look-alike website"],
            "Ticket Booking Fraud": ["ticket booking", "train ticket fraud", "flight booking scam", "fake tickets", "irctc fraud"],
            "Insurance Maturity Fraud": ["insurance maturity", "lic fraud", "insurance scam", "policy maturity", "fake insurance claim"],
            "Others": ["scam", "fraud", "cheated", "fraudulent", "duped", "conned"],
        }

        # social prototypes use platform + issue with enhanced keywords
        self.social_keywords = {}
        
        # Enhanced platform-specific keywords
        platform_keywords = {
            "Instagram": ["instagram", "insta", "ig account", "instagram profile", "insta account"],
            "Facebook": ["facebook", "fb", "fb account", "facebook profile", "fb profile"],
            "WhatsApp": ["whatsapp", "whats app", "wa", "whatsapp account", "whatsapp number"],
            "Telegram": ["telegram", "tg", "telegram account", "telegram group", "tg account"],
            "X": ["twitter", "x account", "tweet", "x platform", "twitter account"],
            "Snapchat": ["snapchat", "snap", "snapchat account"],
            "Gmail": ["gmail", "google mail", "email account", "email address"]
        }
        
        issue_keywords = {
            "Impersonation": ["impersonation", "fake profile", "fake account", "impersonate", "pretending"],
            "Hack": ["hack", "hacked", "hacking", "unauthorized access", "can't login"],
            "Obscene Content": ["obscene", "vulgar", "morphed photos", "inappropriate", "explicit content"],
            "Fake Account": ["fake account", "scam account", "fraud account", "clone account"]
        }
        
        for p in SOCIAL_PLATFORMS:
            for i in SOCIAL_ISSUES:
                key = f"{p} - {i}"
                # Combine platform and issue specific keywords
                p_kws = platform_keywords.get(p, [p.lower()])
                i_kws = issue_keywords.get(i, [i.lower()])
                combined = p_kws + i_kws + [f"{p.lower()} {i.lower()}", f"{i.lower()} {p.lower()}"]
                self.social_keywords[key] = combined

        # global prototypes dict
        prototypes = {}
        # financial: use first representative phrase for each
        for sub, kws in self.financial_keywords.items():
            prototypes[sub] = " . ".join(kws[:3])

        # add remaining financial categories with generic terms
        for sub in FINANCIAL_SUBCATEGORIES:
            if sub not in prototypes:
                prototypes[sub] = sub.lower()

        for sub, kws in self.social_keywords.items():
            prototypes[sub] = " . ".join(kws[:3])

        # compute prototype embeddings
        proto_texts = list(prototypes.values())
        proto_keys = list(prototypes.keys())
        proto_embs = self.embedder.embed(proto_texts)
        self.prototypes = {k: v for k, v in zip(proto_keys, proto_embs)}
        # also build aggregated primary prototypes (mean of its subcategories)
        fin_keys = [k for k in self.prototypes if k in FINANCIAL_SUBCATEGORIES]
        soc_keys = [k for k in self.prototypes if k in SOCIAL_SUBCATEGORIES]
        if fin_keys:
            fin_embs = np.stack([self.prototypes[k] for k in fin_keys])
            self.primary_proto_fin = fin_embs.mean(0)
        else:
            self.primary_proto_fin = np.zeros(proto_embs.shape[1])
        if soc_keys:
            soc_embs = np.stack([self.prototypes[k] for k in soc_keys])
            self.primary_proto_soc = soc_embs.mean(0)
        else:
            self.primary_proto_soc = np.zeros(proto_embs.shape[1])

    def classify(self, text: str) -> Tuple[str, str, float, float]:
        """
        Returns primary_category, subcategory, primary_confidence, subcategory_confidence
        
        Enhanced Multi-stage classification:
        1. Strong financial fraud detection (credit card, UPI, banking with amounts)
        2. Fast keyword matching for high-precision cases
        3. Embedding-based similarity for ambiguous cases
        4. Confidence-aware fallback to "Others" or "uncertain"
        """
        t = text.lower()
        
        # STAGE 0: Detect strong financial fraud signals FIRST (highest priority)
        # These are definitive financial fraud indicators that should override other signals
        strong_financial_indicators = {
            "has_amount": bool(re.search(r"₹|rs\.?\s*\d+|rupees?\s+\d+|\d+\s*(?:thousand|lakh|crore)", t)),
            "has_bank": bool(re.search(r"\b(?:sbi|hdfc|icici|axis|pnb|bob|kotak|yes bank|idbi|canara|union bank|bank)\b", t)),
            "has_card": bool(re.search(r"\b(?:credit|debit)\s+card\b", t)),
            "has_upi": bool(re.search(r"\b(?:upi|phonepe|paytm|gpay|google pay|bhim)\b", t)),
            "has_transaction": bool(re.search(r"\b(?:transaction|payment|transfer|withdrawn?|charged?|debited?)\b", t)),
            "has_unauthorized": bool(re.search(r"\b(?:unauthorized|fraudulent|scam|fraud|taken away|lost money|stolen)\b", t)),
            "has_account": bool(re.search(r"\b(?:account|account number|a/c)\b", t))
        }
        
        # Calculate financial fraud score
        financial_score = sum(strong_financial_indicators.values())
        
        # If strong financial indicators (amount + card/bank/upi + transaction/unauthorized), prioritize financial fraud
        if strong_financial_indicators["has_amount"] and financial_score >= 3:
            # Determine specific financial subcategory
            if strong_financial_indicators["has_card"]:
                if "credit" in t and "card" in t:
                    emb = self.embedder.embed([text])[0]
                    primary_conf = (cosine_sim(emb, self.primary_proto_fin) + 1) / 2
                    primary_conf = max(primary_conf, 0.85)  # High confidence for clear card fraud
                    sub_conf = max(self._score_subcategory_by_embedding(emb, "Credit Card Fraud"), 0.80)
                    return "Financial Fraud", "Credit Card Fraud", float(primary_conf), float(sub_conf)
                elif "debit" in t and "card" in t:
                    emb = self.embedder.embed([text])[0]
                    primary_conf = (cosine_sim(emb, self.primary_proto_fin) + 1) / 2
                    primary_conf = max(primary_conf, 0.85)
                    sub_conf = max(self._score_subcategory_by_embedding(emb, "Debit Card Fraud"), 0.80)
                    return "Financial Fraud", "Debit Card Fraud", float(primary_conf), float(sub_conf)
                else:
                    # Generic card fraud
                    emb = self.embedder.embed([text])[0]
                    primary_conf = (cosine_sim(emb, self.primary_proto_fin) + 1) / 2
                    primary_conf = max(primary_conf, 0.82)
                    # Determine if credit or debit based on keywords
                    if "credit" in t:
                        sub_conf = max(self._score_subcategory_by_embedding(emb, "Credit Card Fraud"), 0.78)
                        return "Financial Fraud", "Credit Card Fraud", float(primary_conf), float(sub_conf)
                    else:
                        sub_conf = max(self._score_subcategory_by_embedding(emb, "Debit Card Fraud"), 0.78)
                        return "Financial Fraud", "Debit Card Fraud", float(primary_conf), float(sub_conf)
            
            elif strong_financial_indicators["has_upi"]:
                emb = self.embedder.embed([text])[0]
                primary_conf = (cosine_sim(emb, self.primary_proto_fin) + 1) / 2
                primary_conf = max(primary_conf, 0.83)
                # Determine if UPI or E-Wallet based on keywords
                # PhonePe, Paytm, GPay can be both UPI and E-Wallet, but if UPI mentioned explicitly, use UPI
                if "upi" in t or "@" in text:
                    sub_conf = max(self._score_subcategory_by_embedding(emb, "UPI Fraud"), 0.78)
                    return "Financial Fraud", "UPI Fraud", float(primary_conf), float(sub_conf)
                else:
                    # Could be E-Wallet or UPI, choose based on embedding
                    upi_score = self._score_subcategory_by_embedding(emb, "UPI Fraud")
                    wallet_score = self._score_subcategory_by_embedding(emb, "E-Wallet Fraud")
                    if upi_score > wallet_score:
                        return "Financial Fraud", "UPI Fraud", float(primary_conf), float(upi_score)
                    else:
                        return "Financial Fraud", "E-Wallet Fraud", float(primary_conf), float(wallet_score)
            
            elif strong_financial_indicators["has_bank"] or strong_financial_indicators["has_account"]:
                # Bank account related fraud
                emb = self.embedder.embed([text])[0]
                primary_conf = (cosine_sim(emb, self.primary_proto_fin) + 1) / 2
                primary_conf = max(primary_conf, 0.80)
                # Could be UPI or other banking fraud
                best_sub, sub_conf = self._best_subcategory_by_embedding(emb, 
                    ["UPI Fraud", "Debit Card Fraud", "Credit Card Fraud", "E-Wallet Fraud", "Others"])
                sub_conf = max(sub_conf, 0.75)
                return "Financial Fraud", best_sub, float(primary_conf), float(sub_conf)
        
        # STAGE 1: Check for fraud call ONLY if no strong financial indicators
        # Fraud call should only be detected when it's clearly about receiving fraudulent calls
        # NOT when someone mentions "the caller" in context of a financial fraud
        fraud_call_signals = ["fraud call", "fake call", "scam call", "received a call", 
                              "got a call", "someone called me", "call from unknown", "received call"]
        
        fraud_call_count = sum(1 for sig in fraud_call_signals if sig in t)
        
        # Only classify as fraud call if:
        # 1. Explicit fraud call mention AND
        # 2. No strong financial fraud indicators (amount + transaction)
        # 3. Focus is on the call itself, not the fraud aftermath
        if fraud_call_count >= 1 and financial_score < 3:
            # Additional check: make sure it's about the call itself, not just mentioning a caller
            call_focus_words = ["received call", "got call", "call from", "calling me", "called me", "received a call", "got a call"]
            # Check if there's NO actual financial transaction completed
            no_transaction = not any(word in t for word in ["taken away", "withdrawn", "lost money", "transferred", "paid", "debited", "charged"])
            
            if any(word in t for word in call_focus_words) and no_transaction:
                emb = self.embedder.embed([text])[0]
                primary_conf = (cosine_sim(emb, self.primary_proto_soc) + 1) / 2
                primary_conf = max(primary_conf, 0.75)
                sub_conf = 0.85
                return "Social Media Fraud", "Fraud Call - Impersonation", float(primary_conf), float(sub_conf)
        
        # STAGE 2: Strong keyword-based classification for financial fraud
        # Check for each financial category's keywords
        financial_matches = []
        for category, keywords in self.financial_keywords.items():
            match_count = sum(1 for kw in keywords if kw in t)
            if match_count > 0:
                # Give extra weight to specific categories with strong signals
                weight_multiplier = 1.0
                if category in ["Credit Card Fraud", "Debit Card Fraud"] and strong_financial_indicators["has_card"]:
                    weight_multiplier = 2.0
                elif category == "UPI Fraud" and strong_financial_indicators["has_upi"]:
                    weight_multiplier = 2.0
                elif category == "Sextortion Fraud" and "sextortion" in t:
                    weight_multiplier = 2.5
                elif category == "Digital Arrest Fraud" and "arrest" in t:
                    weight_multiplier = 2.0
                
                weighted_score = match_count * weight_multiplier
                financial_matches.append((category, match_count, weighted_score))
        
        # If we have strong keyword matches, use the best one
        if financial_matches:
            financial_matches.sort(key=lambda x: x[2], reverse=True)  # Sort by weighted score
            best_fin_category = financial_matches[0][0]
            best_fin_score = financial_matches[0][1]
            
            # If strong match (2+ keywords or category-specific signals), use it
            if best_fin_score >= 2 or self._has_strong_financial_signal(t, best_fin_category):
                emb = self.embedder.embed([text])[0]
                primary_conf = (cosine_sim(emb, self.primary_proto_fin) + 1) / 2
                primary_conf = max(primary_conf, 0.75)  # boost confidence for keyword matches
                sub_conf = self._score_subcategory_by_embedding(emb, best_fin_category)
                sub_conf = max(sub_conf, 0.70)
                return "Financial Fraud", best_fin_category, float(primary_conf), float(sub_conf)
        
        # STAGE 3: Social media classification
        social_signals = [p.lower() for p in SOCIAL_PLATFORMS] + ["profile", "account", "imperson", "fake profile", "hack", "obscene"]
        
        # If explicit platform exists and words like profile/impersonation -> Social Media Fraud
        # But ONLY if financial score is low
        social_keywords_found = sum(1 for kw in social_signals if kw in t)
        if social_keywords_found >= 2 and financial_score < 3:
            # find best social subcategory by keyword
            sub = self._best_social_subcategory(t)
            primary = "Social Media Fraud"
            # compute confidences
            emb = self.embedder.embed([text])[0]
            primary_conf = (cosine_sim(emb, self.primary_proto_soc) + 1) / 2
            primary_conf = max(primary_conf, 0.70)  # boost for keyword match
            sub_conf = self._score_subcategory_by_embedding(emb, sub)
            sub_conf = max(sub_conf, 0.65)
            return primary, sub, float(primary_conf), float(sub_conf)
        
        # STAGE 4: If monetary keywords exist but weak match -> likely financial
        financial_signals = ["upi", "rupee", "rs ", "₹", "loan", "credit card", "debit card", "wallet", 
                             "paytm", "phonepe", "google pay", "bank", "account number", "transaction", "payment"]
        financial_signal_count = sum(1 for kw in financial_signals if kw in t)
        
        if financial_signal_count >= 1 or financial_matches:
            emb = self.embedder.embed([text])[0]
            # decide best financial subcategory
            if financial_matches:
                best_sub = financial_matches[0][0]
                sub_conf = self._score_subcategory_by_embedding(emb, best_sub)
            else:
                best_sub, sub_conf = self._best_subcategory_by_embedding(emb, FINANCIAL_SUBCATEGORIES)
            primary_conf = (cosine_sim(emb, self.primary_proto_fin) + 1) / 2
            primary = "Financial Fraud"
            return primary, best_sub, float(primary_conf), float(sub_conf)
        
        # STAGE 5: Fallback to embedding similarity across all prototypes
        emb = self.embedder.embed([text])[0]
        # compare to primary prototypes
        sim_fin = cosine_sim(emb, self.primary_proto_fin)
        sim_soc = cosine_sim(emb, self.primary_proto_soc)
        
        if sim_fin >= sim_soc:
            primary = "Financial Fraud"
            primary_conf = (sim_fin + 1) / 2
            best_sub, sub_conf = self._best_subcategory_by_embedding(emb, FINANCIAL_SUBCATEGORIES)
        else:
            primary = "Social Media Fraud"
            primary_conf = (sim_soc + 1) / 2
            best_sub, sub_conf = self._best_subcategory_by_embedding(emb, SOCIAL_SUBCATEGORIES)
        
        return primary, best_sub, float(primary_conf), float(sub_conf)
    
    def _has_strong_financial_signal(self, text: str, category: str) -> bool:
        """Check for category-specific strong signals"""
        strong_signals = {
            "UPI Fraud": ["upi", "phonepe", "paytm", "google pay", "gpay", "bhim", "@ybl", "@paytm", "@oksbi"],
            "Debit Card Fraud": ["debit", "atm", "debit card", "atm card"],
            "Credit Card Fraud": ["credit card", "cc", "cvv", "credit limit"],
            "Sextortion Fraud": ["blackmail", "intimate", "nude", "video", "sextortion", "extortion"],
            "Digital Arrest Fraud": ["arrest", "police", "warrant", "legal notice", "digital arrest", "cyber crime arrest"],
            "AEPS Fraud": ["aadhar", "biometric", "fingerprint", "aeps", "aadhar enabled"],
            "Loan App Fraud": ["loan", "personal loan", "instant loan", "loan app"],
            "E-Wallet Fraud": ["wallet", "phonepe", "paytm", "google pay", "e-wallet"],
            "E-Commerce Fraud": ["amazon", "flipkart", "myntra", "meesho", "didn't receive", "fake product"],
            "OLX Fraud": ["olx", "classified", "second hand"],
            "Investment/Trading/IPO Fraud": ["investment", "trading", "ipo", "stock", "crypto", "bitcoin"],
            "Gaming App Fraud": ["gaming", "pubg", "betting", "fantasy"],
            "Lottery Fraud": ["lottery", "lucky draw", "prize", "won"],
        }
        signals = strong_signals.get(category, [])
        match_count = sum(1 for sig in signals if sig in text)
        # Need at least 1 strong signal match
        return match_count >= 1

    def _best_social_subcategory(self, text: str) -> str:
        """Find best social media subcategory with improved platform detection"""
        text_lower = text.lower()
        
        # Enhanced platform detection with variations
        platform_variations = {
            "Instagram": ["instagram", "insta", "ig account"],
            "Facebook": ["facebook", "fb account", "fb profile"],
            "WhatsApp": ["whatsapp", "whats app", "wa account"],
            "Telegram": ["telegram", "tg account"],
            "X": ["twitter", "x account", " x ", "tweet"],
            "Snapchat": ["snapchat", "snap"],
            "Gmail": ["gmail", "google mail", "email account"]
        }
        
        # Issue keyword variations
        issue_variations = {
            "Impersonation": ["impersonat", "fake profile", "fake account", "using my photo", "using my name", "pretending to be"],
            "Hack": ["hack", "hacked", "can't login", "changed password", "lost access", "unauthorized access"],
            "Obscene Content": ["obscene", "morphed", "nude", "intimate", "vulgar", "inappropriate content", "explicit"],
            "Fake Account": ["fake account", "fake profile", "scam account", "fraud account"]
        }
        
        # Find matching platform
        detected_platform = None
        for platform, variations in platform_variations.items():
            if any(var in text_lower for var in variations):
                detected_platform = platform
                break
        
        # Find matching issue
        detected_issue = None
        for issue, variations in issue_variations.items():
            if any(var in text_lower for var in variations):
                detected_issue = issue
                break
        
        # If both detected, return combination
        if detected_platform and detected_issue:
            return f"{detected_platform} - {detected_issue}"
        
        # If only platform detected, try to infer issue from context
        if detected_platform:
            # Default issue inference based on keywords
            if any(word in text_lower for word in ["hack", "hacked", "can't login", "lost access"]):
                return f"{detected_platform} - Hack"
            elif any(word in text_lower for word in ["fake", "imperson", "pretend"]):
                return f"{detected_platform} - Impersonation"
            elif any(word in text_lower for word in ["obscene", "morphed", "nude"]):
                return f"{detected_platform} - Obscene Content"
            else:
                return f"{detected_platform} - Fake Account"
        
        # If only issue detected, try to infer platform
        if detected_issue:
            # Try to find any social media related word
            if "email" in text_lower or "@gmail" in text_lower or "@" in text_lower:
                return f"Gmail - {detected_issue}"
            elif "message" in text_lower or "contact" in text_lower:
                return f"WhatsApp - {detected_issue}"
            else:
                return f"Facebook - {detected_issue}"  # Default platform
        
        # Ultimate fallback - check for fraud call
        if any(word in text_lower for word in ["call", "calling", "phone", "called"]):
            return "Fraud Call - Impersonation"
        
        # Default fallback
        return "Facebook - Impersonation"

    def _best_subcategory_by_embedding(self, emb: np.ndarray, candidate_list: List[str]) -> Tuple[str, float]:
        best = None
        best_score = -1.0
        for c in candidate_list:
            proto = self.prototypes.get(c)
            if proto is None:
                continue
            s = cosine_sim(emb, proto)
            if s > best_score:
                best_score = s
                best = c
        # normalize
        conf = (best_score + 1) / 2 if best_score is not None else 0.0
        return best or "Others", float(conf)

    def _score_subcategory_by_embedding(self, emb: np.ndarray, sub: str) -> float:
        proto = self.prototypes.get(sub)
        if proto is None:
            return 0.0
        return float((cosine_sim(emb, proto) + 1) / 2)


if __name__ == "__main__":
    # quick local test
    cls = FraudClassifier()
    examples = [
        "I got a message asking for my UPI and my PhonePe ₹5000 was taken",
        "Someone created a fake Instagram profile impersonating me",
    ]
    for ex in examples:
        print(ex)
        print(cls.classify(ex))
