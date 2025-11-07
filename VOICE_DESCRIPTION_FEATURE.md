# 🎤 Voice Description Feature Documentation

## Overview
Users can now provide incident descriptions using **voice messages** during complaint registration. The voice is transcribed using OpenAI Whisper API and users must confirm the transcription before proceeding.

---

## 📋 Feature Flow

### **Step 1: Registration Complete**
After successful registration, user is asked:
```
📝 How would you like to provide the incident description?

Choose your preferred method:
1️⃣ VOICE - Send a voice message (recommended)
2️⃣ TEXT - Type manually

Reply with VOICE or TEXT
```

### **Step 2A: Voice Input Selected**
User replies with `VOICE` or `1`:
```
🎤 Voice Input Selected

Please send a voice message describing the incident.

Speak clearly and include:
• What happened
• When it happened
• Amount lost (if any)
• Any other relevant details

Supported languages: Hindi, English, Odia
```

### **Step 2B: Text Input Selected**
User replies with `TEXT` or `2`:
```
✍️ Text Input Selected

Please type a detailed description of the incident:

Include:
• What happened
• When it happened
• Amount lost (if any)
• Any other relevant details
```

---

## 🎙️ Voice Processing Flow

### **Step 3: User Sends Voice Message**
System processes:
```
🎤 Processing your voice message...

Please wait while we convert your speech to text.
```

### **Step 4: Transcription Shown**
```
✅ Voice transcribed successfully!

📝 Transcribed Text:
"[Full transcribed text shown here]"

Is this correct?

Reply with:
✅ YES - To use this description
✏️ NO - To type manually instead
🔄 RETRY - To send voice message again
```

### **Step 5A: User Confirms (YES)**
- Transcribed text is saved as incident description
- Continues to fraud category selection
- Normal complaint flow proceeds

### **Step 5B: User Rejects (NO)**
```
✍️ Please type the incident description manually:
```
- Falls back to text input mode
- User can type description

### **Step 5C: User Wants Retry (RETRY)**
```
🎤 Please send your voice message again.

Speak clearly and include all relevant details.
```
- Allows user to send voice message again
- Returns to Step 3

---

## 🔧 Technical Implementation

### **Files Modified/Created:**

1. **`services/voiceService.js`** (NEW)
   - Downloads audio from WhatsApp
   - Transcribes using OpenAI Whisper
   - Cleans up temp files

2. **`controllers/whatsappController.js`** (MODIFIED)
   - Added voice/text input selection
   - Added voice description handler
   - Added transcription confirmation handler
   - Updated registration success message

### **Key Methods:**

```javascript
// Handle voice description input
async handleVoiceDescriptionInput(from, audio)

// Handle confirmation of transcription
async handleVoiceDescriptionConfirmation(from, text)

// Process voice in complaint flow
async handleComplaintFilingInput(from, text, session)
```

### **Session States:**
- `INCIDENT_DESCRIPTION` - Waiting for voice/text choice
- `AWAITING_VOICE_DESCRIPTION` - Waiting for voice message
- `AWAITING_TEXT_DESCRIPTION` - Waiting for typed text
- `VOICE_DESCRIPTION_CONFIRM` - Waiting for transcription confirmation

---

## 🌐 Multi-Language Support

### **Supported Languages:**
- **Hindi** (हिन्दी) - Primary
- **English** - Supported
- **Odia** (ଓଡ଼ିଆ) - Auto-detected by Whisper

### **Confirmation Keywords:**
```javascript
YES: "yes", "हां", "ha", "y"
NO: "no", "नहीं", "nahi", "n"
RETRY: "retry", "फिर से", "phir se"
VOICE: "voice", "1"
TEXT: "text", "2"
```

---

## ⚙️ Configuration

### **Environment Variables:**
```env
# Required for WhatsApp audio download
WHATSAPP_TOKEN=your_whatsapp_token

# Optional - falls back to mock if not provided
OPENAI_API_KEY=sk-your-openai-api-key
```

### **Mock Mode:**
If `OPENAI_API_KEY` is not configured, the system uses a mock transcription:
```
"मुझे एक फ्रॉड कॉल आई थी जिसमें वो बोल रहे थे कि मैं बैंक से बोल रहा हूं। 
उन्होंने मुझसे OTP मांगा और फिर मेरे अकाउंट से 25000 रुपये निकाल लिए। 
यह घटना कल शाम 5 बजे हुई थी।"
```

---

## 🎯 User Benefits

### ✅ **Advantages of Voice Input:**
1. **Faster** - Speak naturally instead of typing
2. **Accessible** - Helps rural/elderly users
3. **Complete Details** - Users can explain fully
4. **Multi-language** - Speak in native language
5. **Verification** - User sees and confirms transcription

### ✅ **Safety Features:**
1. **Confirmation Required** - No auto-submission
2. **Fallback to Text** - Always available
3. **Retry Option** - Can re-record if needed
4. **Error Handling** - Auto-fallback on failure

---

## 🧪 Testing

### **Test Scenario 1: Voice Input Happy Path**
```
1. Complete registration
2. Choose VOICE option
3. Send voice message in Hindi
4. Verify transcription shown
5. Reply YES
6. Continue with fraud category
```

### **Test Scenario 2: Transcription Rejected**
```
1. Complete registration
2. Choose VOICE option
3. Send voice message
4. Reply NO to transcription
5. Type description manually
6. Continue with fraud category
```

### **Test Scenario 3: Retry Voice**
```
1. Complete registration
2. Choose VOICE option
3. Send voice message
4. Reply RETRY
5. Send voice message again
6. Reply YES
7. Continue with fraud category
```

### **Test Scenario 4: Direct Text Input**
```
1. Complete registration
2. Choose TEXT option
3. Type description
4. Continue with fraud category
```

---

## 📊 Database Schema

**No changes to database schema required!**

The `incidentDescription` field in `Cases` model remains:
```javascript
incidentDescription: {
  type: String,
  required: true,
}
```

Voice-transcribed text is stored the same way as typed text.

---

## 🚀 Deployment Checklist

- [x] Install dependencies: `openai`, `axios`, `form-data`
- [x] Create `voiceService.js` with Whisper integration
- [x] Modify `whatsappController.js` with voice handlers
- [x] Add voice/text selection after registration
- [x] Add transcription confirmation flow
- [x] Add fallback to text input
- [x] Test with WhatsApp voice messages
- [ ] Configure `OPENAI_API_KEY` in `.env` (optional)
- [ ] Test with real WhatsApp Business account
- [ ] Monitor temp file cleanup
- [ ] Set up error logging for voice processing

---

## 🔍 Error Handling

### **Voice Processing Fails:**
```
❌ Sorry, we couldn't process your voice message.

Please type your incident description instead:
```
Auto-switches to text input mode.

### **Invalid Choice:**
```
❌ Invalid choice.

Please reply with:
1️⃣ VOICE or 1 - To send voice message
2️⃣ TEXT or 2 - To type manually
```

### **WhatsApp API Error:**
Falls back to mock transcription for testing.

---

## 📞 Support

### **User Facing Issues:**
- Check WhatsApp voice message format (should be `.ogg` or `.mp3`)
- Ensure clear audio recording
- Try text input if voice fails
- Contact 1930 helpline for assistance

### **Developer Debugging:**
```javascript
// Enable debug logging
console.log('[VoiceService] Processing audio:', mediaId);
console.log('[VoiceService] Transcription:', transcription);
```

---

## 🎓 Best Practices

1. **Speak Clearly** - Advise users to speak slowly and clearly
2. **Quiet Environment** - Reduce background noise
3. **Complete Sentences** - Encourage full descriptions
4. **Verify Transcription** - Always confirm before proceeding
5. **Fallback Ready** - Text option always available

---

## 📈 Future Enhancements

1. **Emotion Detection** - Detect urgency/panic in voice
2. **Speaker Recognition** - Verify caller identity
3. **Auto-translation** - Translate to English automatically
4. **Voice Playback** - Let user replay their recording
5. **Voice Commands** - "YES", "NO" as voice commands
6. **Real-time Streaming** - Process while speaking

---

## 📝 Example User Journey

**Raj Kumar (65-year-old farmer) lost ₹50,000 to fraud:**

```
Bot: How would you like to provide incident description?
Raj: VOICE

Bot: Please send a voice message...
[Raj sends voice in Hindi explaining the fraud]

Bot: ✅ Voice transcribed successfully!
     "मुझे एक फ्रॉड कॉल आई थी..."
     Is this correct?
Raj: YES

Bot: Please select fraud category:
     1. Financial
     2. Social Media
Raj: 1

[Continues with normal complaint flow...]
```

**Result:** Complaint filed successfully without typing!

---

## ✅ Testing Checklist

- [ ] Voice input selection works
- [ ] Text input selection works
- [ ] Voice message downloads correctly
- [ ] Whisper transcription accurate
- [ ] Mock mode works without API key
- [ ] Transcription confirmation works
- [ ] YES proceeds correctly
- [ ] NO switches to text input
- [ ] RETRY allows re-recording
- [ ] Error handling works
- [ ] Temp files cleaned up
- [ ] Multi-language detection works
- [ ] Hindi transcription accurate
- [ ] English transcription accurate
- [ ] Session state maintained properly

---

Made with ❤️ for Digital India 🇮🇳
**1930 Cyber Helpline - Government of Odisha**
