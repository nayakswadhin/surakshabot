/**
 * Check API key and list available models
 */
require("dotenv").config();
const https = require("https");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("🔑 Checking Gemini API Key...");
console.log(`API Key: ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + "..." : "NOT FOUND"}`);

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

// List available models using REST API
const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${GEMINI_API_KEY}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log("\n📋 Fetching available models from Google AI...\n");

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      console.log("✅ Successfully connected to Gemini API!");
      console.log(`\n📊 Found ${response.models?.length || 0} available models:\n`);
      
      if (response.models) {
        response.models.forEach((model, idx) => {
          console.log(`${idx + 1}. ${model.name}`);
          console.log(`   Display Name: ${model.displayName}`);
          console.log(`   Description: ${model.description}`);
          console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(", ")}`);
          console.log("");
        });
        
        // Find text generation models
        const textModels = response.models.filter(m => 
          m.supportedGenerationMethods?.includes("generateContent")
        );
        
        if (textModels.length > 0) {
          console.log("✨ Recommended model for text generation:");
          console.log(`   Use: ${textModels[0].name.replace("models/", "")}`);
        }
      }
    } else {
      console.error(`❌ Error: ${res.statusCode} ${res.statusMessage}`);
      console.error(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
