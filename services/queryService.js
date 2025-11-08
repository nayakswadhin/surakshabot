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

    // Remove all markdown formatting (asterisks, bold, italic, etc.)
    answer = this.removeMarkdownFormatting(answer);

    // Remove technical sections (REFERENCE DOCUMENTS, EXPLORE MORE, etc.) but keep main content
    answer = this.removeTechnicalSections(answer);

    // Extract useful links from the answer and sources
    const links = this.extractAllLinks(answer, apiResponse.sources);

    // Clean up extra whitespace and line breaks
    answer = answer.replace(/\n{3,}/g, "\n\n").trim();

    // Build the final response
    let finalResponse = "";

    // Add the main answer content
    if (answer && answer.length > 10) {
      finalResponse = answer;
    }

    // Add source information if available
    if (apiResponse.sources && apiResponse.sources.length > 0) {
      finalResponse += "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
      finalResponse += "📚 Information Source:\n\n";

      // Group sources by section
      const sourcesBySection = this.groupSourcesBySection(apiResponse.sources);

      Object.keys(sourcesBySection).forEach((section) => {
        finalResponse += `• ${section}\n`;
        sourcesBySection[section].forEach((source) => {
          const cleanFileName = this.cleanPdfName(source.filename);
          finalResponse += `  - ${cleanFileName} (Page ${Math.floor(
            source.page
          )})\n`;
        });
        finalResponse += "\n";
      });
    }

    // Add helpful links at the end if found
    if (links.length > 0) {
      finalResponse += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
      finalResponse += "🔗 Related Links:\n\n";

      // Remove duplicates and format links
      const uniqueLinks = this.removeDuplicateLinks(links);
      uniqueLinks.forEach((link) => {
        finalResponse += `• ${link.text}\n  ${link.url}\n\n`;
      });
    }

    // Add helpline at the end
    finalResponse += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    finalResponse += "📞 Need Help?\n";
    finalResponse += "• Website: https://cybercrime.gov.in\n";
    finalResponse += "• Helpline: 1930 (24x7)\n";
    finalResponse += "• Email: report@cybercrime.gov.in";

    return finalResponse;
  }

  /**
   * Group sources by section
   * @param {Array} sources - Sources array
   * @returns {Object} Sources grouped by section
   */
  groupSourcesBySection(sources) {
    const grouped = {};

    sources.forEach((source) => {
      const section = source.section || "General Reference";
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(source);
    });

    return grouped;
  }

  /**
   * Clean PDF filename for display
   * @param {string} filename - Original filename
   * @returns {string} Cleaned name
   */
  cleanPdfName(filename) {
    if (!filename) return "Document";

    // Remove .pdf extension
    let name = filename.replace(".pdf", "");

    // Convert known patterns to readable names
    const nameMap = {
      "MHA-CitizenManualReportOtherCyberCrime-v10":
        "Citizen Manual - Report Cyber Crime",
      "MHA-CitizenManualReportCPRGRcomplaints-v10":
        "Citizen Manual - Report CP/RGR Complaints",
      CyberSafetyEng: "Cyber Safety Guide",
      Final_English_Manual_Basic: "Basic Safety Manual",
    };

    if (nameMap[name]) {
      return nameMap[name];
    }

    // Clean up remaining names
    name = name
      .replace(/MHA-/g, "")
      .replace(/-v\d+/g, "")
      .replace(/_/g, " ")
      .replace(/-/g, " ");

    // Capitalize first letter of each word
    name = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    return name;
  }

  /**
   * Remove all markdown formatting from text
   * @param {string} text - Text with markdown
   * @returns {string} Clean text
   */
  removeMarkdownFormatting(text) {
    // Remove bold (**text** or *text*)
    text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
    text = text.replace(/\*([^*]+)\*/g, "$1");

    // Remove italic (_text_)
    text = text.replace(/_([^_]+)_/g, "$1");

    // Remove square brackets from links [text]
    text = text.replace(/\[([^\]]+)\]/g, "$1");

    // Remove heading markers (#, ##, etc.)
    text = text.replace(/^#{1,6}\s+/gm, "");

    // Remove any remaining asterisks
    text = text.replace(/\*/g, "");

    return text;
  }

  /**
   * Remove technical sections like REFERENCE DOCUMENTS, page numbers, etc.
   * @param {string} text - Response text
   * @returns {string} Clean text
   */
  removeTechnicalSections(text) {
    // Remove "REFERENCE DOCUMENTS" section and everything after it
    text = text.replace(/━{15,}\s*REFERENCE DOCUMENTS[\s\S]*/gi, "");
    text = text.replace(/REFERENCE DOCUMENTS[\s\S]*/gi, "");

    // Remove "EXPLORE MORE" section
    text = text.replace(/━{15,}\s*EXPLORE MORE[\s\S]*/gi, "");
    text = text.replace(/EXPLORE MORE[\s\S]*/gi, "");

    // Remove inline technical references like (Page 5.0 • 95% relevance)
    text = text.replace(/\(Page \d+\.\d+\s*•\s*\d+%\s*relevance\)/gi, "");
    text = text.replace(/Page \d+\.\d+\s*•\s*\d+%\s*relevance/gi, "");

    // Remove navigation arrows and instructions
    text = text.replace(/→/g, "");
    text = text.replace(/Tap links to view official PDFs/gi, "");
    text = text.replace(
      /_Click section links below to view original PDFs on cybercrime\.gov\.in_/gi,
      ""
    );
    text = text.replace(
      /Click section links below to view original PDFs on cybercrime\.gov\.in/gi,
      ""
    );

    // Remove standalone emoji headers but KEEP the content after them
    text = text.replace(/^[🧠📖🛡️🔗📚]\s*[A-Za-z\s]+\s*$/gm, "");

    // Remove extra headers from the API response
    text = text.replace(/^🇮🇳 National Cybercrime Reporting Portal\s*$/gm, "");

    // Clean up empty lines after separator patterns (but keep the actual content)
    text = text.replace(/━{15,}\s*\n\s*\n/g, "");

    return text;
  }

  /**
   * Extract all useful links from answer text and sources
   * @param {string} text - Response text
   * @param {Array} sources - Sources array from API
   * @returns {Array} Array of {text, url} objects
   */
  extractAllLinks(text, sources = []) {
    const links = [];

    // Extract URLs from the text (excluding PDF URLs)
    const urlRegex = /https?:\/\/cybercrime\.gov\.in\/(?!UploadMedia)[^\s)]+/gi;
    const textUrls = text.match(urlRegex) || [];

    textUrls.forEach((url) => {
      let linkText = this.getLinkDisplayName(url);
      links.push({ text: linkText, url: url });
    });

    // Extract PDF links from sources if available
    if (sources && sources.length > 0) {
      // Only add PDF links if they exist in the source
      sources.forEach((source) => {
        if (source.filename && source.filename.endsWith(".pdf")) {
          const pdfUrl = `https://cybercrime.gov.in/UploadMedia/${source.filename}`;
          const sectionName = source.section || "Reference Document";
          const cleanName = this.cleanPdfName(source.filename);

          links.push({
            text: `${sectionName} - ${cleanName}`,
            url: pdfUrl,
          });
        }
      });
    }

    return links;
  }

  /**
   * Get display name for a URL
   * @param {string} url - URL string
   * @returns {string} Display name
   */
  getLinkDisplayName(url) {
    if (url.includes("Citizen_Manual")) {
      return "Citizen Manual Guide";
    } else if (
      url.includes("OnlineSafetyTips") ||
      url.includes("Crime_OnlineSafetyTips")
    ) {
      return "Online Safety Tips";
    } else if (url.includes("CyberAware")) {
      return "Cyber Awareness Resources";
    } else if (url.includes("dailyDigest")) {
      return "Daily Cyber Digest";
    } else if (url.includes("Webform")) {
      return "Online Services Portal";
    } else if (url.includes("cybercrime.gov.in")) {
      return "Cybercrime Portal";
    } else {
      return "More Information";
    }
  }

  /**
   * Remove duplicate links based on URL
   * @param {Array} links - Array of link objects
   * @returns {Array} Deduplicated links
   */
  removeDuplicateLinks(links) {
    const seen = new Set();
    const unique = [];

    links.forEach((link) => {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        unique.push(link);
      }
    });

    return unique;
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
