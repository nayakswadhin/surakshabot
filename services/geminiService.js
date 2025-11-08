const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  /**
   * Generate text content using Gemini AI
   * @param {string} prompt - The prompt to send to Gemini
   * @param {string} modelName - The model to use (default: gemini-2.5-flash)
   * @returns {Promise<string>} Generated text response
   */
  async generateContent(prompt, modelName = "gemini-2.5-flash") {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate content from Gemini AI");
    }
  }

  /**
   * Generate streaming content (for real-time responses)
   * @param {string} prompt - The prompt to send to Gemini
   * @param {string} modelName - The model to use
   * @returns {Promise<AsyncGenerator>} Streaming response
   */
  async generateContentStream(prompt, modelName = "gemini-2.5-flash") {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream(prompt);
      return result.stream;
    } catch (error) {
      console.error("Gemini Streaming Error:", error);
      throw new Error("Failed to generate streaming content");
    }
  }

  /**
   * Chat with Gemini (maintains conversation history)
   * @param {Array} messages - Array of chat messages
   * @returns {Promise<string>} Chat response
   */
  async chat(messages, modelName = "gemini-2.5-flash") {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        history: messages,
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw new Error("Failed to process chat message");
    }
  }

  /**
   * Analyze complaint data and generate insights
   * @param {Object} complaintData - Complaint statistics and data
   * @returns {Promise<string>} AI-generated insights
   */
  async analyzeComplaintData(complaintData) {
    const prompt = `
Analyze the following cybercrime complaint data from India and provide actionable insights:

Total Complaints: ${complaintData.totalComplaints}
Financial Complaints: ${complaintData.financialComplaints}
Social Media Complaints: ${complaintData.socialComplaints}
Pending Cases: ${complaintData.pendingCases}
Solved Cases: ${complaintData.solvedCases}

Top Fraud Types:
${complaintData.topFraudTypes?.map((type, idx) => `${idx + 1}. ${type.type}: ${type.count} cases`).join("\n")}

Top Districts:
${complaintData.topDistricts?.map((district, idx) => `${idx + 1}. ${district.name}: ${district.count} cases`).join("\n")}

Please provide:
1. Key patterns and trends
2. High-risk areas that need attention
3. Recommended preventive measures
4. Insights on fraud type distribution

Keep the response concise and actionable (max 300 words).
`;

    return await this.generateContent(prompt);
  }

  /**
   * Summarize location-based complaint patterns
   * @param {string} location - Location name
   * @param {Array} complaints - Array of complaints for that location
   * @returns {Promise<string>} Summary
   */
  async summarizeLocationPattern(location, complaints) {
    const fraudTypes = complaints.map((c) => c.fraudType).join(", ");
    const prompt = `
Summarize the cybercrime pattern in ${location}:
- Total cases: ${complaints.length}
- Fraud types: ${fraudTypes}

Provide a brief 2-3 sentence summary highlighting the main concerns.
`;

    return await this.generateContent(prompt);
  }

  /**
   * Generate fraud prevention tips
   * @param {string} fraudType - Type of fraud
   * @returns {Promise<string>} Prevention tips
   */
  async generatePreventionTips(fraudType) {
    const prompt = `
Generate 5 practical tips to prevent ${fraudType} in India. 
Keep each tip concise (one sentence) and actionable.
Format as a numbered list.
`;

    return await this.generateContent(prompt);
  }

  /**
   * Answer user questions about cybercrime
   * @param {string} question - User's question
   * @returns {Promise<string>} AI-generated answer
   */
  async answerQuestion(question) {
    const prompt = `
You are a cybercrime awareness assistant for India. 
Answer the following question clearly and concisely:

Question: ${question}

Provide a helpful, accurate response in 2-3 paragraphs.
`;

    return await this.generateContent(prompt);
  }
}

module.exports = new GeminiService();
