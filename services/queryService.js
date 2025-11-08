const axios = require("axios");

const QUERY_API_URL =
  process.env.QUERY_API_URL || "http://127.0.0.1:8000/query";
const DEFAULT_TOP_K = 5;
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Query Service for handling RAG API integration
 * Processes user queries and returns AI-generated answers
 */
class QueryService {
  /**
   * Process user query by calling the RAG API
   * @param {string} query - User's question
   * @param {number} topK - Number of results to return
   * @returns {Promise<Object>} API response with answer and sources
   */
  async processQuery(query, topK = DEFAULT_TOP_K) {
    try {
      console.log(`[QueryService] Processing query: "${query}"`);

      // Validate query
      if (!this.validateQuery(query)) {
        throw new Error(
          "Invalid query. Query must be between 3 and 500 characters."
        );
      }

      const response = await axios.post(
        QUERY_API_URL,
        {
          query: query.trim(),
          top_k: topK,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        }
      );

      console.log("[QueryService] Query processed successfully");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("[QueryService] Error processing query:", error.message);

      if (error.response) {
        // API returned an error response
        console.error(
          "[QueryService] API Response Error:",
          error.response.data
        );
        return {
          success: false,
          error: `API Error: ${error.response.status}`,
          message: error.response.data.detail || "Unknown error occurred",
        };
      } else if (error.request) {
        // Request was made but no response received
        console.error("[QueryService] No response from API");
        return {
          success: false,
          error: "Connection Error",
          message:
            "Cannot connect to the query API. Please ensure the API server is running.",
        };
      } else {
        // Error in request setup
        return {
          success: false,
          error: "Request Error",
          message: error.message,
        };
      }
    }
  }

  /**
   * Validate query before sending to API
   * @param {string} query - User's question
   * @returns {boolean} Is valid
   */
  validateQuery(query) {
    if (!query || typeof query !== "string") {
      return false;
    }

    const trimmedQuery = query.trim();
    return trimmedQuery.length >= 3 && trimmedQuery.length <= 500;
  }

  /**
   * Format the API response for WhatsApp display
   * @param {Object} apiResponse - Response from query API
   * @returns {string} Formatted message
   */
  formatResponse(apiResponse) {
    if (!apiResponse || !apiResponse.answer) {
      return "Sorry, I could not find an answer to your query.";
    }

    let answer = apiResponse.answer;

    // Remove asterisks (bold markdown) - replace **text** with text
    answer = answer.replace(/\*\*([^*]+)\*\*/g, "$1");

    // Remove single asterisks - replace *text* with text
    answer = answer.replace(/\*([^*]+)\*/g, "$1");

    // Remove any remaining asterisks
    answer = answer.replace(/\*/g, "");

    // Remove source information section (everything after "📚 Sources Used:")
    const sourcesIndex = answer.indexOf("📚 Sources Used:");
    if (sourcesIndex !== -1) {
      answer = answer.substring(0, sourcesIndex).trim();
    }

    // Remove page numbers and PDF references like "(Page 18.0) — 37%"
    answer = answer.replace(/\(Page \d+\.?\d*\)\s*—\s*\d+%/g, "");

    // Remove PDF filenames like "MHA-CitizenManualReportOtherCyberCrime-v10.pdf"
    answer = answer.replace(/MHA-[\w-]+\.pdf/g, "");

    // Extract and format relevant links
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(answer)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
      });
    }

    // Clean up multiple newlines (more than 2)
    answer = answer.replace(/\n{3,}/g, "\n\n");

    // Clean up multiple spaces
    answer = answer.replace(/  +/g, " ");

    // Clean up bullet points with asterisks at start of lines
    answer = answer.replace(/^\s*\*\s+/gm, "• ");

    // Add friendly header
    let formattedMessage = `✅ Here's What I Found:\n\n${answer}`;

    // Add links section if any relevant links exist
    if (links.length > 0) {
      formattedMessage += "\n\n━━━━━━━━━━━━━━━━━━━━━━\n";
      formattedMessage += "\n📎 For More Details:\n";
      links.forEach((link) => {
        formattedMessage += `\n• ${link.text}: ${link.url}`;
      });
    }

    return formattedMessage;
  }

  /**
   * Create error message for failed queries
   * @returns {string} Error message
   */
  getErrorMessage() {
    return (
      `❌ Sorry, I encountered an error processing your query.\n\n` +
      `📞 Please try again or call our helpline: 1930 (24x7)\n\n` +
      `🌐 You can also visit: https://cybercrime.gov.in`
    );
  }
}

module.exports = new QueryService();
