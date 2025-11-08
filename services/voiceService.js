const axios = require("axios");
const fs = require("fs");
const path = require("path");
const speech = require("@google-cloud/speech");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const geminiService = require('./geminiService');

class VoiceService {
  constructor() {
    // Initialize Google Cloud Speech client
    const credentialsPath = path.join(
      __dirname,
      "..",
      "google-credentials.json"
    );

    this.speechClient = new speech.SpeechClient({
      keyFilename: credentialsPath,
    });

    this.whatsappToken = process.env.WHATSAPP_TOKEN;
    this.tempDir = path.join(__dirname, "..", "temp");

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    console.log(
      "[VoiceService] ✅ Initialized with Google Cloud Speech-to-Text"
    );
    console.log("[VoiceService] Credentials:", credentialsPath);
  }

  /**
   * Download audio file from WhatsApp
   */
  async downloadAudioFromWhatsApp(mediaId) {
    try {
      console.log(`[VoiceService] Downloading audio with media ID: ${mediaId}`);

      // Step 1: Get media URL from WhatsApp
      const mediaUrlResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          headers: {
            Authorization: `Bearer ${this.whatsappToken}`,
          },
        }
      );

      const mediaUrl = mediaUrlResponse.data.url;
      console.log(`[VoiceService] Media URL retrieved`);

      // Step 2: Download the actual audio file
      const audioResponse = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${this.whatsappToken}`,
        },
        responseType: "arraybuffer",
      });

      // Step 3: Save to temp file (WhatsApp sends .ogg)
      const fileName = `audio_${Date.now()}.ogg`;
      const filePath = path.join(this.tempDir, fileName);
      fs.writeFileSync(filePath, audioResponse.data);

      console.log(`[VoiceService] Audio saved: ${fileName}`);
      return filePath;
    } catch (error) {
      console.error("[VoiceService] Error downloading audio:", error.message);
      throw new Error("Failed to download audio from WhatsApp");
    }
  }

  /**
   * Convert OGG to WAV format (required for best Google Speech API results)
   */
  async convertOggToWav(oggFilePath) {
    try {
      const wavFilePath = oggFilePath.replace(".ogg", ".wav");
      console.log(`[VoiceService] Converting to WAV format...`);

      // Use ffmpeg to convert
      const command = `ffmpeg -i "${oggFilePath}" -ar 16000 -ac 1 "${wavFilePath}" -y`;

      await execPromise(command);

      console.log(`[VoiceService] ✅ Conversion successful`);
      return wavFilePath;
    } catch (error) {
      console.warn(
        "[VoiceService] ⚠️ ffmpeg conversion failed, trying without conversion"
      );
      console.warn(
        "[VoiceService] To install ffmpeg: https://ffmpeg.org/download.html"
      );

      // Return original file if conversion fails
      return oggFilePath;
    }
  }

  /**
   * Transcribe audio using Google Cloud Speech-to-Text
   */
  async transcribeAudio(audioFilePath) {
    try {
      console.log(
        `[VoiceService] Starting Google Cloud Speech transcription...`
      );

      // Read the audio file
      const audioBytes = fs.readFileSync(audioFilePath);

      const audio = {
        content: audioBytes.toString("base64"),
      };

      // Configure for OGG OPUS (WhatsApp format)
      const config = {
        encoding: "OGG_OPUS", // WhatsApp sends OGG OPUS format
        sampleRateHertz: 16000,
        languageCode: "en-IN", // English (India)
        alternativeLanguageCodes: ["en-US"], // Fallback to US English
        enableAutomaticPunctuation: true,
        model: "default",
        audioChannelCount: 1, // Mono
      };

      const request = {
        audio: audio,
        config: config,
      };

      console.log("[VoiceService] 🔄 Sending to Google Cloud Speech API...");
      console.log("[VoiceService] Config:", JSON.stringify(config, null, 2));

      // Perform the transcription
      const [response] = await this.speechClient.recognize(request);

      console.log(
        "[VoiceService] Response:",
        JSON.stringify(response, null, 2)
      );

      if (!response.results || response.results.length === 0) {
        console.log("[VoiceService] ⚠️ No transcription results");
        throw new Error("No transcription results from Google API");
      }

      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      const confidence = response.results[0].alternatives[0].confidence || 0;

      console.log(`[VoiceService] ✅ Google Cloud transcription successful!`);
      console.log(`[VoiceService] Transcribed: "${transcription}"`);
      console.log(
        `[VoiceService] Confidence: ${(confidence * 100).toFixed(1)}%`
      );

      return {
        rawText: transcription.trim(),
        confidence: confidence
      };
    } catch (error) {
      console.error(
        "[VoiceService] ❌ Error transcribing audio:",
        error.message
      );
      console.error("[VoiceService] Full error:", error);
      throw error;
    }
  }

  /**
   * Fine-tune transcribed text using Gemini AI
   * Improves grammar, punctuation, and clarity for fraud complaint reporting
   */
  async fineTuneTextWithGemini(rawText, confidence) {
    try {
      console.log(`[VoiceService] 🤖 Fine-tuning text with Gemini AI...`);

      const prompt = `
You are a text refinement assistant for a cybercrime complaint system in India. 
A user has given a voice input describing a fraud/scam incident, which was transcribed by speech-to-text.

Raw transcription (confidence: ${(confidence * 100).toFixed(1)}%):
"${rawText}"

Your task:
1. Fix grammar and spelling mistakes
2. Add proper punctuation and capitalize appropriately
3. Structure sentences clearly and coherently
4. Preserve all factual information (amounts, dates, names, places, phone numbers)
5. Keep the tone professional but natural
6. Format amounts with ₹ symbol if mentioned
7. If the text is in Hindi/Hinglish, keep it as is but improve structure
8. Do NOT add any information that wasn't in the original text
9. Do NOT change the meaning or facts

Return ONLY the refined text without any additional comments or explanations.
`;

      const refinedText = await geminiService.generateContent(prompt);

      console.log(`[VoiceService] ✅ Gemini refinement complete!`);
      console.log(`[VoiceService] Refined text: "${refinedText}"`);

      return refinedText.trim();
    } catch (error) {
      console.error('[VoiceService] ⚠️ Gemini refinement failed:', error.message);
      console.log('[VoiceService] Falling back to raw transcription');
      // Fallback to raw text if Gemini fails
      return rawText;
    }
  }

  /**
   * Process voice message: Download → Convert → Transcribe → Fine-tune with AI → Return text
   */
  async processVoiceMessage(mediaId) {
    let audioFilePath = null;

    try {
      console.log(`[VoiceService] Processing voice message: ${mediaId}`);

      // Step 1: Download audio
      audioFilePath = await this.downloadAudioFromWhatsApp(mediaId);

      // Step 2: Transcribe audio using Google Speech-to-Text
      const transcriptionResult = await this.transcribeAudio(audioFilePath);
      const rawText = transcriptionResult.rawText;
      const confidence = transcriptionResult.confidence;

      console.log(`[VoiceService] Raw transcription: "${rawText}"`);

      // Step 3: Fine-tune with Gemini AI
      const refinedText = await this.fineTuneTextWithGemini(rawText, confidence);

      // Cleanup temp files
      this.cleanupTempFile(audioFilePath);

      return {
        success: true,
        rawTranscription: rawText,
        refinedText: refinedText,
        transcription: refinedText, // Default to refined text
        confidence: confidence,
      };
    } catch (error) {
      console.error("[VoiceService] Error processing voice message:", error);

      // Cleanup on error
      if (audioFilePath) {
        this.cleanupTempFile(audioFilePath);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Clean up temporary audio file
   */
  cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[VoiceService] Cleaned up: ${path.basename(filePath)}`);
      }

      // Also cleanup WAV file if exists
      const wavPath = filePath.replace(".ogg", ".wav");
      if (wavPath !== filePath && fs.existsSync(wavPath)) {
        fs.unlinkSync(wavPath);
        console.log(`[VoiceService] Cleaned up: ${path.basename(wavPath)}`);
      }
    } catch (error) {
      console.error("[VoiceService] Error cleaning up:", error.message);
    }
  }

  /**
   * Clean up old temp files (older than 1 hour)
   */
  cleanupOldTempFiles() {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > oneHour) {
          fs.unlinkSync(filePath);
          console.log(`[VoiceService] Deleted old file: ${file}`);
        }
      });
    } catch (error) {
      console.error("[VoiceService] Error cleaning old files:", error.message);
    }
  }
}

module.exports = VoiceService;
