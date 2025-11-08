/**
 * List available Gemini models
 */
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("🔍 Fetching available Gemini models...\n");
    
    // Try with gemini-1.5-pro-latest
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent("Hello");
    console.log("✅ Successfully connected with model: gemini-1.5-pro-latest");
    console.log("Response:", result.response.text());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    // Try alternate model names
    const modelNames = [
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.5-flash",
      "gemini-flash",
      "models/gemini-pro",
      "models/gemini-1.5-pro"
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ Success with: ${modelName}`);
        console.log("Response:", result.response.text());
        break;
      } catch (err) {
        console.log(`❌ Failed: ${modelName}`);
      }
    }
  }
}

listModels();
