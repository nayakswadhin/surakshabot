# Voice Input Feature for Incident Description

## Overview

This feature allows users to provide incident descriptions via voice messages in addition to text input during the complaint filing process. It uses **Google Cloud Speech-to-Text API** for transcription.

## Features Implemented

### 1. **Input Mode Selection**

When filing a complaint and reaching the incident description step, users are presented with two options:

- 🎤 **Voice Input**: Record and send a voice message
- ⌨️ **Text Input**: Type the description manually

### 2. **Voice Message Flow**

1. User selects "Voice Input"
2. Instructions are shown on how to record voice message
3. User sends voice message
4. System transcribes using Google Cloud Speech-to-Text
5. Transcribed text is shown to user for confirmation
6. User can:
   - ✅ Confirm if transcription is correct
   - 🔄 Record again if not satisfied
   - ⌨️ Switch to text input

### 3. **Text Input Flow**

1. User selects "Text Input"
2. Instructions are shown
3. User types incident description
4. System proceeds to next step

## Files Modified

### 1. **package.json**

Added dependencies:

- `@google-cloud/speech`: Google Cloud Speech-to-Text SDK
- `form-data`: For handling multipart form data

### 2. **google-credentials.json**

Updated with your Google Cloud service account credentials for Speech-to-Text API.

### 3. **services/voiceService.js**

- Configured to use Google Cloud credentials from `google-credentials.json`
- Downloads audio from WhatsApp
- Transcribes using Google Cloud Speech-to-Text API
- Supports OGG OPUS format (WhatsApp's audio format)

### 4. **services/complaintService.js**

Added new message templates:

- `createIncidentDescriptionMessage()`: Shows voice/text choice
- `createVoiceInputInstructionMessage()`: Voice recording instructions
- `createTextInputInstructionMessage()`: Text typing instructions
- `createTranscriptionConfirmationMessage()`: Confirm transcription

### 5. **services/whatsappService.js**

- Added `VoiceService` integration
- Added `processVoiceMessage()` method to handle voice processing

### 6. **controllers/whatsappController.js**

Added new methods:

- `handleVoiceMessage()`: Process incoming voice messages
- `handleVoiceInputChoice()`: User chooses voice input
- `handleTextInputChoice()`: User chooses text input
- `handleTranscriptionConfirmation()`: User confirms transcription
- `handleRetryVoice()`: User wants to record again
- Updated `processMessage()` to handle audio/voice message types
- Updated `handleButtonClick()` to handle new button IDs
- Updated `handleComplaintFilingInput()` to handle WAITING_FOR_TEXT state

## Session Flow

### New Session Steps

- **INCIDENT_DESCRIPTION**: Initial step showing voice/text choice
- **WAITING_FOR_VOICE**: Waiting for user to send voice message
- **WAITING_FOR_TEXT**: Waiting for user to type description
- **TRANSCRIPTION_CONFIRMATION**: User confirming transcribed text
- **FRAUD_CATEGORY_SELECTION**: Next step after incident description

## How It Works

### User Journey

```
1. User starts complaint filing
   ↓
2. System asks: "How would you like to provide incident details?"
   ├─ Voice Input → User records voice
   │   ↓
   │   Voice sent → Transcription processing
   │   ↓
   │   Transcription shown → "Is this correct?"
   │   ├─ ✅ Correct → Save to MongoDB → Continue
   │   ├─ 🔄 Record Again → Back to voice recording
   │   └─ ⌨️ Type Instead → Switch to text input
   │
   └─ Text Input → User types description
       ↓
       Text saved → Continue to fraud category
```

## Google Cloud Speech-to-Text Configuration

### Audio Format

- **Encoding**: OGG_OPUS (WhatsApp format)
- **Sample Rate**: 16000 Hz
- **Channels**: Mono (1 channel)
- **Language**: English (India) with US English fallback

### Features Enabled

- Automatic punctuation
- Multi-language support (English)
- High accuracy model

## Environment Setup

### Required

Your Google Cloud credentials are already configured in `google-credentials.json`:

- Project ID: `speedy-cab-472105-d8`
- Service Account: `speech-api-text@speedy-cab-472105-d8.iam.gserviceaccount.com`

### WhatsApp Business API

No additional configuration needed - uses existing WhatsApp token.

## Data Storage

### MongoDB Field

The incident description (whether from voice or text) is stored in the same field:

```javascript
{
  incidentDescription: String; // Stores transcribed voice OR typed text
}
```

## Error Handling

### Voice Processing Errors

- If transcription fails: User can retry or switch to text
- If audio download fails: Error message shown
- If Google API fails: Fallback error handling

### User-Friendly Messages

- Clear instructions for voice recording
- Helpful error messages
- Option to switch input methods

## Testing the Feature

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Start a complaint on WhatsApp**

   - Send "Hello" to the bot
   - Complete registration (if new user)
   - When asked for incident description, choose voice or text

3. **Test Voice Input**:

   - Select "🎤 Voice Input"
   - Record and send a voice message
   - Verify transcription
   - Confirm or retry

4. **Test Text Input**:
   - Select "⌨️ Text Input"
   - Type description
   - Verify it's saved

## Benefits

✅ **Accessibility**: Users can speak instead of type
✅ **Speed**: Faster than typing for detailed descriptions
✅ **Accuracy**: Google Cloud provides high-quality transcription
✅ **Flexibility**: Users can choose their preferred input method
✅ **Confirmation**: Users verify transcription before saving
✅ **Fallback**: Easy switch between voice and text

## Future Enhancements

- Support for Hindi and other Indian languages
- Voice commands for navigation
- Audio file storage alongside transcription
- Sentiment analysis of voice input
- Multiple voice message support

## Notes

- Voice feature is **ONLY** for incident description
- Other inputs (name, phone, etc.) remain text-based
- Transcriptions are stored as plain text in MongoDB
- Original audio files are not stored (only transcription)
- Temp audio files are automatically cleaned up

## Support

For issues or questions:

- Check Google Cloud console for API quotas
- Verify credentials in `google-credentials.json`
- Check WhatsApp Business API logs
- Review session states in MongoDB
