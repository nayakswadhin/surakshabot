# 🔄 Classification API Workflow - Visual Diagram

## Complete Flow with AI Classification Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         🏁 START: New Complaint                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  User Registration/    │
                    │  Verification Complete │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  INCIDENT_DESCRIPTION  │
                    │  Show Choice:          │
                    │  🎤 Voice / ⌨️ Text    │
                    └────────┬───────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌───────────────────┐
    │ WAITING_FOR_VOICE │     │ WAITING_FOR_TEXT  │
    │ User sends voice  │     │ User types text   │
    └─────────┬─────────┘     └─────────┬─────────┘
              │                          │
              ▼                          │
    ┌───────────────────┐                │
    │ 🎯 Voice Processing│                │
    │ 1. Download audio  │                │
    │ 2. Transcribe      │                │
    │ 3. Improve (Gemini)│                │
    └─────────┬─────────┘                │
              │                          │
              ▼                          │
    ┌───────────────────┐                │
    │ TRANSCRIPTION_    │                │
    │   CONFIRMATION    │                │
    │ "Is this correct?"│                │
    │ [✅ Correct]      │                │
    │ [🔄 Record Again] │                │
    │ [⌨️ Type Instead] │                │
    └─────────┬─────────┘                │
              │ Confirm                  │
              └──────────┬───────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │ 🔄 AUTO_CLASSIFICATION     │ ◄─── ⭐ NEW STEP
            │ Processing message shown:  │
            │ "🔄 Analyzing your         │
            │  incident using AI..."     │
            └────────────┬───────────────┘
                         │
                         ▼
            ┌────────────────────────────┐
            │ 🤖 Call Classification API │
            │ POST localhost:8000/classify│
            │ Body: {                    │
            │   complaint_text: "..."    │
            │ }                          │
            └────────────┬───────────────┘
                         │
                ┌────────┴─────────┐
                │                  │
                ▼                  ▼
        ┌──────────┐        ┌──────────────┐
        │ SUCCESS  │        │ API FAILURE  │
        └────┬─────┘        └──────┬───────┘
             │                     │
             │                     ▼
             │              ┌─────────────────┐
             │              │ ⚠️ Error Message │
             │              │ "Couldn't auto- │
             │              │  classify..."   │
             │              └────────┬────────┘
             │                       │
             │                       ▼
             │              ┌─────────────────┐
             │              │ FRAUD_CATEGORY_ │ ◄─── Fallback
             │              │   SELECTION     │
             │              │ [Financial]     │
             │              │ [Social Media]  │
             │              └─────────────────┘
             │
             ▼
┌────────────────────────────────────────────────┐
│ 🎯 Display Classification Result              │
│                                                │
│ 🤖 AI Classification Result                   │
│                                                │
│ 📌 Category: Financial Fraud                  │
│ 📂 Sub-category: Credit Card Fraud            │
│ ✅ Confidence: 89.9%                           │
│                                                │
│ 📊 Extracted Information:                     │
│ 💰 Amount: ₹40,000                             │
│ 🏦 Bank: SBI                                   │
│ 📞 Phone: [if found]                           │
│ 💳 UPI ID: [if found]                          │
│                                                │
│ 💡 Suggested Action:                           │
│ URGENT: 1) Block card immediately...          │
│                                                │
└────────────────┬───────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ CLASSIFICATION_CONFIRMATION│ ◄─── ⭐ NEW STEP
    │ "Is this correct?"         │
    │ [✅ Yes, Correct]          │
    │ [❌ No, Wrong]             │
    │ [Back]                     │
    └────────┬───────────────────┘
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
┌─────────┐      ┌──────────────────┐
│ YES ✅   │      │ NO ❌             │
└────┬────┘      └─────┬────────────┘
     │                 │
     │                 ▼
     │        ┌──────────────────────┐
     │        │ 👤 Manual Selection   │
     │        │ "Please select the   │
     │        │  fraud category..."  │
     │        └─────┬────────────────┘
     │              │
     │              ▼
     │        ┌──────────────────────┐
     │        │ FRAUD_CATEGORY_      │
     │        │   SELECTION          │
     │        │ [Financial Fraud]    │
     │        │ [Social Media Fraud] │
     │        └─────┬────────────────┘
     │              │
     │              ▼
     │        ┌──────────────────────┐
     │        │ FRAUD_TYPE_SELECTION │
     │        │ Type number (1-23)   │
     │        │ or (1-7) for social  │
     │        └─────┬────────────────┘
     │              │
     └──────────────┴──────────────┐
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │ ✅ Classification Done   │
                    │ Generate Case ID         │
                    │ Store in session:        │
                    │ - category               │
                    │ - fraudType              │
                    │ - extractedEntities      │
                    └────────┬─────────────────┘
                             │
                             ▼
                    ┌──────────────────────────┐
                    │ 💬 Confirmation Message  │
                    │ "✅ Classification       │
                    │  confirmed!              │
                    │  📋 Case ID: CC...       │
                    │  📄 Next: Documents"     │
                    └────────┬─────────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │ 🗂️ Route Based on Category  │
                └────────┬───────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│ DOCUMENT_       │ │ SOCIAL_MEDIA_│ │ COMPLAINT_      │
│ COLLECTION      │ │ DOCUMENT_    │ │ CONFIRMATION    │
│ (Financial)     │ │ COLLECTION   │ │ (Other types)   │
│                 │ │ (Social)     │ │                 │
│ Documents:      │ │ Documents:   │ │ Direct submit   │
│ • Bank stmt     │ │ • Meta link  │ │ without docs    │
│ • Transaction   │ │ • Request    │ │                 │
│ • ID proof      │ │ • Govt ID    │ │                 │
│ • Screenshots   │ │ • Screenshots│ │                 │
│ • Others        │ │ • URLs       │ │                 │
└────────┬────────┘ └──────┬───────┘ └────────┬────────┘
         │                 │                  │
         └─────────────────┴──────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ 📝 Final Submit│
                  │ • Save to DB   │
                  │ • Notify user  │
                  │ • Send case ID │
                  └────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ ✅ COMPLETE    │
                  │ Complaint filed│
                  └────────────────┘
```

---

## 🎯 Key Decision Points

### 1. Voice vs Text Choice

```
User Input Method
├─ Voice: Transcribe → Improve → Confirm → Classify
└─ Text: Direct input → Classify
```

### 2. Classification API Response

```
API Call Result
├─ Success: Show results → Ask confirmation
└─ Failure: Show error → Manual selection
```

### 3. User Confirmation

```
User Choice
├─ YES (Correct): Direct to document collection
└─ NO (Wrong): Manual category → Manual subcategory → Documents
```

### 4. Category-Based Routing

```
After Classification
├─ Financial: Financial documents (5 types)
├─ Social Media: Social media documents (6+ types)
└─ Other: Direct to confirmation
```

---

## 📊 Session State Transitions

```
Initial State: COMPLAINT_FILING (step: "INCIDENT_DESCRIPTION")
     ↓
User chooses voice/text
     ↓
State: COMPLAINT_FILING (step: "WAITING_FOR_VOICE" or "WAITING_FOR_TEXT")
     ↓
User provides input
     ↓
State: COMPLAINT_FILING (step: "AUTO_CLASSIFICATION") ⭐ NEW
     ↓
API returns classification
     ↓
State: COMPLAINT_FILING (step: "CLASSIFICATION_CONFIRMATION") ⭐ NEW
     ↓
User confirms/rejects
     ↓
IF confirmed:
  State: DOCUMENT_COLLECTION or SOCIAL_MEDIA_DOCUMENT_COLLECTION
     ↓
  User uploads documents
     ↓
  State: COMPLAINT_FILING (step: "COMPLAINT_CONFIRMATION")
     ↓
  Submit to database

IF rejected:
  State: COMPLAINT_FILING (step: "FRAUD_CATEGORY_SELECTION")
     ↓
  State: COMPLAINT_FILING (step: "FRAUD_TYPE_SELECTION")
     ↓
  [Continue normal flow...]
```

---

## 🔄 Button Flow Map

```
INCIDENT_DESCRIPTION Screen:
├─ [🎤 Voice Input] → WAITING_FOR_VOICE
├─ [⌨️ Text Input] → WAITING_FOR_TEXT
└─ [Back] → Previous step

TRANSCRIPTION_CONFIRMATION Screen:
├─ [✅ Correct] → AUTO_CLASSIFICATION
├─ [🔄 Record Again] → WAITING_FOR_VOICE
└─ [⌨️ Type Instead] → WAITING_FOR_TEXT

CLASSIFICATION_CONFIRMATION Screen: ⭐ NEW
├─ [✅ Yes, Correct] → Document Collection
├─ [❌ No, Wrong] → FRAUD_CATEGORY_SELECTION
└─ [Back] → INCIDENT_DESCRIPTION

FRAUD_CATEGORY_SELECTION Screen: (Fallback)
├─ [Financial Fraud] → FRAUD_TYPE_SELECTION (Financial)
├─ [Social Media Fraud] → FRAUD_TYPE_SELECTION (Social)
└─ [Back] → INCIDENT_DESCRIPTION
```

---

## 🎨 Message Examples

### Processing Message:

```
🔄 Analyzing your incident description using AI...

This may take a few seconds.
```

### Classification Result:

```
🤖 AI Classification Result

📌 Category: Financial Fraud
📂 Sub-category: Credit Card Fraud
✅ Confidence: 89.9%

📊 Extracted Information:
💰 Amount: ₹40,000
🏦 Bank: sbi

💡 Suggested Action:
URGENT: 1) Block card immediately via bank app/hotline
2) Report unauthorized transactions 3) Request chargeback
4) File complaint on cybercrime.gov.in 5) Call 1930.
Do not share CVV/PIN/OTP with anyone.

❓ Is this classification correct?
```

### Confirmation Message:

```
✅ Classification confirmed!

📋 Case ID: CC1731023456789

📄 Next, we'll collect relevant documents for your complaint.
```

### Error Fallback:

```
⚠️ We couldn't automatically classify your complaint.

Please select the fraud category manually.
```

---

## 📈 Performance Metrics to Track

1. **Classification Success Rate**: % of successful API calls
2. **User Confirmation Rate**: % users accepting AI classification
3. **Fallback Usage**: % cases falling back to manual
4. **Processing Time**: Average time for classification
5. **Confidence Scores**: Distribution of confidence levels

---

## 🚀 Ready to Test!

This workflow maintains 100% backward compatibility while adding intelligent automation through AI classification.
