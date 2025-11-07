# Voice Feature Flow Diagram

## 📊 Complete User Flow

```
START: User Files Complaint
         |
         v
    Registration
    (if new user)
         |
         v
┌────────────────────────────────┐
│  INCIDENT DESCRIPTION STEP     │
│                                │
│  "How would you like to        │
│   provide incident details?"   │
│                                │
│  [🎤 Voice] [⌨️ Text] [Back]   │
└────────┬───────────────┬───────┘
         |               |
    Voice Path      Text Path
         |               |
         v               v
┌──────────────────┐   ┌──────────────────┐
│ VOICE INPUT      │   │ TEXT INPUT       │
│                  │   │                  │
│ "Send voice msg" │   │ "Type description│
│                  │   │  here..."        │
└────────┬─────────┘   └────────┬─────────┘
         |                      |
    User sends               User types
    voice message            text message
         |                      |
         v                      |
┌──────────────────┐            |
│ TRANSCRIPTION    │            |
│                  │            |
│ Google Cloud     │            |
│ Speech-to-Text   │            |
│                  │            |
│ "Processing..."  │            |
└────────┬─────────┘            |
         |                      |
         v                      |
┌──────────────────────────┐    |
│ SHOW TRANSCRIPTION       │    |
│                          │    |
│ "Here's what I heard:    │    |
│  '[transcribed text]'    │    |
│                          │    |
│  Is this correct?"       │    |
│                          │    |
│ [✅ Correct]             │    |
│ [🔄 Record Again]        │    |
│ [⌨️ Type Instead]        │    |
└───┬──────┬────────┬──────┘    |
    |      |        |           |
    v      v        v           |
Confirm  Retry  Switch to Text  |
    |      |        |           |
    |      └────────┘           |
    |          |                |
    v          v                v
┌────────────────────────────────┐
│  SAVE TO MONGODB               │
│                                │
│  incidentDescription: "..."    │
└────────────────────────────────┘
         |
         v
┌────────────────────────────────┐
│  CONTINUE COMPLAINT FLOW       │
│                                │
│  → Fraud Category Selection    │
│  → Fraud Type Selection        │
│  → Document Collection         │
│  → Submit Complaint            │
└────────────────────────────────┘
```

## 🔄 Session State Transitions

```
State: COMPLAINT_FILING
Step: INCIDENT_DESCRIPTION
  │
  ├─ User clicks "Voice Input"
  │    ↓
  │  Step: WAITING_FOR_VOICE
  │    ↓
  │  User sends voice message
  │    ↓
  │  Step: TRANSCRIPTION_CONFIRMATION
  │    ↓
  │  User clicks "Correct"
  │    ↓
  │  Step: FRAUD_CATEGORY_SELECTION
  │
  └─ User clicks "Text Input"
       ↓
     Step: WAITING_FOR_TEXT
       ↓
     User types description
       ↓
     Step: FRAUD_CATEGORY_SELECTION
```

## 🎙️ Voice Processing Pipeline

```
┌─────────────────────────────────────────────────┐
│ 1. WhatsApp Voice Message Received              │
│    - Format: OGG OPUS                           │
│    - Media ID from WhatsApp API                 │
└─────────────────┬───────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────┐
│ 2. Download Audio File                          │
│    - GET WhatsApp Media URL                     │
│    - Download audio buffer                      │
│    - Save to temp/audio_<timestamp>.ogg         │
└─────────────────┬───────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────┐
│ 3. Send to Google Cloud Speech-to-Text          │
│    - Encoding: OGG_OPUS                         │
│    - Sample Rate: 16000 Hz                      │
│    - Language: en-IN (English India)            │
│    - Enable: Automatic Punctuation              │
└─────────────────┬───────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────┐
│ 4. Receive Transcription                        │
│    - Transcribed Text                           │
│    - Confidence Score (0-1)                     │
│    - Alternative Transcriptions                 │
└─────────────────┬───────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────┐
│ 5. Clean Up Temp File                           │
│    - Delete audio file                          │
│    - Free up storage                            │
└─────────────────┬───────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────┐
│ 6. Return to User                                │
│    - Show transcription                         │
│    - Request confirmation                       │
└─────────────────────────────────────────────────┘
```

## 📱 WhatsApp Message Types

```
Incoming Messages Handled:
┌──────────────────────────────────┐
│ message.type === "text"          │ → Text message (typing)
│ message.type === "audio"         │ → Audio file
│ message.type === "voice"         │ → Voice message (🎤)
│ message.type === "image"         │ → Image (documents)
│ message.type === "interactive"   │ → Button clicks
└──────────────────────────────────┘

Voice Feature Uses:
✅ "voice" type  → For incident description
✅ "interactive" → For button selections
✅ "text"        → For alternate text input
```

## 🗂️ Code Flow

```
controllers/whatsappController.js
  │
  ├─ processMessage(message)
  │    │
  │    ├─ if type === "voice"
  │    │    └─→ handleVoiceMessage()
  │    │          │
  │    │          └─→ whatsappService.processVoiceMessage()
  │    │                 │
  │    │                 └─→ voiceService.processVoiceMessage()
  │    │                        │
  │    │                        ├─ downloadAudioFromWhatsApp()
  │    │                        ├─ transcribeAudio()
  │    │                        └─ return { transcription }
  │    │
  │    └─ if type === "interactive"
  │         └─→ handleButtonClick(buttonId)
  │               │
  │               ├─ "voice_input" → handleVoiceInputChoice()
  │               ├─ "text_input"  → handleTextInputChoice()
  │               ├─ "confirm_transcription" → handleTranscriptionConfirmation()
  │               ├─ "retry_voice" → handleRetryVoice()
  │               └─ "switch_to_text" → handleTextInputChoice()
  │
  └─ if type === "text" && step === "WAITING_FOR_TEXT"
       └─→ handleComplaintFilingInput()
            └─→ Save to session & continue
```

## 🎯 Button IDs Reference

```
Button Clicks:
┌────────────────────────┬──────────────────────────┐
│ Button ID              │ Action                   │
├────────────────────────┼──────────────────────────┤
│ voice_input            │ Switch to voice mode     │
│ text_input             │ Switch to text mode      │
│ confirm_transcription  │ Accept transcription     │
│ retry_voice            │ Record again             │
│ switch_to_text         │ Change to typing         │
└────────────────────────┴──────────────────────────┘
```

## 💾 Data Storage Structure

```
MongoDB - Cases Collection
┌──────────────────────────────────────────┐
│ {                                        │
│   caseId: "CC20241108123456",            │
│   userId: ObjectId("..."),               │
│   incidentDescription: "I received...",  │ ← Voice OR Text
│   fraudType: "UPI Fraud",                │
│   category: "financial",                 │
│   status: "pending",                     │
│   createdAt: ISODate("..."),             │
│   documents: [],                         │
│   ...                                    │
│ }                                        │
└──────────────────────────────────────────┘

Note: No distinction between voice/text in storage!
Both stored in same field: incidentDescription
```

## 🔐 Security Flow

```
Voice Message Security:
┌────────────────────────────────────┐
│ 1. WhatsApp Encrypted Transmission │
└──────────┬─────────────────────────┘
           │
           v
┌────────────────────────────────────┐
│ 2. Download via Secure API         │
│    - HTTPS only                    │
│    - Access token required         │
└──────────┬─────────────────────────┘
           │
           v
┌────────────────────────────────────┐
│ 3. Temp Storage (Ephemeral)        │
│    - temp/audio_<id>.ogg           │
│    - Auto-deleted after use        │
└──────────┬─────────────────────────┘
           │
           v
┌────────────────────────────────────┐
│ 4. Send to Google Cloud            │
│    - TLS encryption                │
│    - Service account auth          │
└──────────┬─────────────────────────┘
           │
           v
┌────────────────────────────────────┐
│ 5. Store Transcription Only        │
│    - Text in MongoDB               │
│    - No audio file kept            │
└────────────────────────────────────┘
```

## ⚡ Performance Metrics

```
Typical Processing Time:

User sends voice (5-30 seconds)
          │
          v
Download audio (< 1 second)
          │
          v
Google transcription (2-5 seconds)
          │
          v
Show result to user
          │
          v
Total: Usually 3-7 seconds

Storage:
- Temp audio: ~100KB - 1MB (deleted immediately)
- Transcription: ~100-500 bytes in MongoDB
```

## 🎨 UI Components

```
Message Templates Created:

1. createIncidentDescriptionMessage()
   ┌─────────────────────────────┐
   │ 🎙️ Incident Description     │
   │                             │
   │ How would you like to...    │
   │                             │
   │ [🎤 Voice] [⌨️ Text] [Back] │
   └─────────────────────────────┘

2. createVoiceInputInstructionMessage()
   ┌─────────────────────────────┐
   │ 🎙️ Voice Recording          │
   │ Instructions                │
   │                             │
   │ Please send a voice...      │
   └─────────────────────────────┘

3. createTextInputInstructionMessage()
   ┌─────────────────────────────┐
   │ ⌨️ Type Incident            │
   │ Description                 │
   │                             │
   │ Please type the cyber...    │
   └─────────────────────────────┘

4. createTranscriptionConfirmationMessage()
   ┌─────────────────────────────┐
   │ 📝 Voice Transcription      │
   │                             │
   │ "I received a fraud call... │
   │                             │
   │ Is this correct?            │
   │                             │
   │ [✅] [🔄] [⌨️]              │
   └─────────────────────────────┘
```

## 🧩 Feature Integration Points

```
Existing System:
┌──────────────────────────────────┐
│ WhatsApp Bot Flow                │
│                                  │
│ 1. Greeting                      │
│ 2. Registration                  │
│ 3. Complaint Filing              │ ← NEW: Voice Option Added Here
│    └─ Incident Description       │
│ 4. Fraud Category                │
│ 5. Document Collection           │
│ 6. Submit                        │
└──────────────────────────────────┘

New Integration:
Step 3 enhanced with:
  - Voice/Text choice
  - Voice processing
  - Transcription confirmation
```

---

## ✨ Visual Summary

```
                    VOICE FEATURE
                         🎙️

    ┌─────────────────────────────────────┐
    │                                     │
    │   USER SPEAKS  →  AI TRANSCRIBES    │
    │                                     │
    │   USER CONFIRMS  →  SYSTEM SAVES    │
    │                                     │
    └─────────────────────────────────────┘

    Everything else remains the same!
    Only incident description gets voice option.
```

---

**This diagram helps visualize the complete voice feature implementation! 📊**
