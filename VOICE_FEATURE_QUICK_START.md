# Voice Feature - Quick Start Guide

## ✅ Setup Complete!

Your SurakshaBot now has **voice input capability** for incident descriptions using Google Cloud Speech-to-Text API.

## 🎯 What's New?

Users can now **speak** their incident description instead of typing it when filing a complaint.

## 📱 User Experience

### Step-by-Step Flow:

1. **User starts complaint**

   ```
   User: "Hello"
   Bot: Welcome! [Shows menu]
   User: Clicks "New Complaint"
   ```

2. **Registration** (if new user)

   - User provides name, phone, email, etc.

3. **Incident Description - NEW FEATURE** 🎙️

   ```
   Bot: "How would you like to provide the incident details?"

   Buttons:
   🎤 Voice Input
   ⌨️ Text Input
   ```

4. **If user chooses Voice Input**

   ```
   Bot: "Please send a voice message describing the incident..."

   User: [Sends voice message 🎤]

   Bot: "🎙️ Processing your voice message..."

   Bot: "Here's what I understood:
         '[Transcribed text]'

         Is this correct?"

   Buttons:
   ✅ Correct
   🔄 Record Again
   ⌨️ Type Instead
   ```

5. **If user confirms transcription**
   ```
   ✅ Text saved to MongoDB
   → Continues to fraud category selection
   ```

## 🔧 Technical Details

### What Happens Behind the Scenes:

1. User sends voice message via WhatsApp
2. Bot downloads audio file (OGG OPUS format)
3. Sends to Google Cloud Speech-to-Text API
4. Receives transcription in English
5. Shows transcription to user for confirmation
6. Saves to MongoDB if confirmed

### API Used:

- **Google Cloud Speech-to-Text**
- Project: speedy-cab-472105-d8
- Language: English (India)
- Audio Format: OGG OPUS (WhatsApp native)

## 📊 Database Storage

The incident description (voice or text) is stored in the same field:

```javascript
Cases Collection:
{
  incidentDescription: "Transcribed text from voice OR typed text",
  // ... other fields
}
```

## 🎤 Voice Message Requirements

✅ **Supported**:

- WhatsApp voice messages
- OGG OPUS format
- English language
- Clear audio quality

❌ **Not Supported**:

- Other audio file formats (MP3, WAV, etc.)
- Voice messages outside incident description
- Multiple languages in single message

## 🧪 Testing Guide

### 1. Start the Server

```bash
npm start
```

You should see:

```
[VoiceService] ✅ Initialized with Google Cloud Speech-to-Text
🚀 Suraksha Bot Server Started
```

### 2. Test on WhatsApp

**Test Voice Input:**

1. Send "Hello" to your WhatsApp bot
2. Click "New Complaint"
3. Complete registration
4. When asked for incident description:
   - Click "🎤 Voice Input"
   - Record a voice message like:
     _"I received a fraud call yesterday. Someone claiming to be from my bank asked for my OTP. I lost 50000 rupees."_
   - Send the voice message
5. Wait for transcription
6. Verify the text is correct
7. Click "✅ Correct"

**Test Text Input:**

1. Follow steps 1-4 above
2. Click "⌨️ Text Input"
3. Type your incident description
4. Send

**Test Retry:**

1. Follow voice input steps
2. When transcription appears, click "🔄 Record Again"
3. Record new voice message

**Test Switch to Text:**

1. Follow voice input steps
2. When transcription appears, click "⌨️ Type Instead"
3. Type description manually

## 🔍 Monitoring & Debugging

### Check Logs

Watch console for:

```
[VoiceService] Processing voice message: <media_id>
[VoiceService] 🔄 Sending to Google Cloud Speech API...
[VoiceService] ✅ Google Cloud transcription successful!
[VoiceService] Transcribed: "<text>"
[VoiceService] Confidence: 95.2%
```

### Common Issues

**Issue**: "Couldn't transcribe voice message"

- **Cause**: Audio quality too low, background noise
- **Solution**: Ask user to record again in quiet environment

**Issue**: "Error processing voice message"

- **Cause**: Google API error, network issue
- **Solution**: Check internet connection, verify Google credentials

**Issue**: Voice message not recognized

- **Cause**: User sent at wrong step
- **Solution**: Only voice messages during WAITING_FOR_VOICE step are processed

## 📈 Google Cloud API Usage

### Quotas:

- **Free Tier**: 60 minutes/month
- **After Free Tier**: Paid per minute

### Monitor Usage:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `speedy-cab-472105-d8`
3. Navigate to "APIs & Services" → "Dashboard"
4. Check Speech-to-Text API usage

## 🔐 Security

- ✅ Audio files are temporary (deleted after processing)
- ✅ Only transcriptions are stored
- ✅ Google credentials secured in `google-credentials.json`
- ✅ Voice messages only accepted during specific workflow step

## 🎯 Feature Scope

### ✅ Where Voice Works:

- **Incident Description ONLY** during complaint filing

### ❌ Where Voice Doesn't Work:

- Name, phone number, email (text only)
- Date of birth (text only)
- Aadhar number (text only)
- Status check (text only)
- Other queries (text only)

## 📝 Session States Reference

```
INCIDENT_DESCRIPTION     → Shows voice/text choice
  ↓
WAITING_FOR_VOICE        → Waiting for voice message
  ↓
TRANSCRIPTION_CONFIRMATION → User confirms transcription
  ↓
FRAUD_CATEGORY_SELECTION → Continue complaint flow

OR

INCIDENT_DESCRIPTION     → Shows voice/text choice
  ↓
WAITING_FOR_TEXT         → Waiting for typed text
  ↓
FRAUD_CATEGORY_SELECTION → Continue complaint flow
```

## 🚀 Next Steps

1. **Test thoroughly** with different voice messages
2. **Monitor Google Cloud quotas** to avoid overages
3. **Collect user feedback** on transcription accuracy
4. **Consider adding more languages** (Hindi, Odia, etc.)

## 📞 Support

For issues:

1. Check server logs
2. Verify Google Cloud credentials
3. Test with simple voice messages first
4. Contact Google Cloud support for API issues

---

**Congratulations! Your voice feature is ready to use! 🎉**
