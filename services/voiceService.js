const axios = require("axios");
const fs = require("fs");
const path = require("path");
const speech = require("@google-cloud/speech");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

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

      return transcription.trim();
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
   * Process voice message: Download → Convert → Transcribe → Return text
   */
  async processVoiceMessage(mediaId) {
    let audioFilePath = null;

    try {
      console.log(`[VoiceService] Processing voice message: ${mediaId}`);

      // Download audio
      audioFilePath = await this.downloadAudioFromWhatsApp(mediaId);

      // Transcribe audio (conversion happens inside if needed)
      const transcription = await this.transcribeAudio(audioFilePath);

      // Cleanup temp files
      this.cleanupTempFile(audioFilePath);

      return {
        success: true,
        transcription: transcription,
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
