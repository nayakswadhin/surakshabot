const axios = require("axios");
require("dotenv").config();

/**
 * Didit Verification Service
 * Handles identity verification using Didit API
 */
class DiditService {
  constructor() {
    this.apiKey = process.env.DIDIT_API_KEY;
    this.workflowId = process.env.DIDIT_WORKFLOW_ID;
    this.baseUrl = "https://verification.didit.me/v2";

    if (!this.apiKey) {
      console.warn(
        "⚠️ DIDIT_API_KEY not found in environment variables. Didit verification will not work."
      );
    }

    if (!this.workflowId) {
      console.warn(
        "⚠️ DIDIT_WORKFLOW_ID not found in environment variables. Didit verification will not work."
      );
    }
  }

  /**
   * Create a new verification session
   * @param {string} vendorData - Custom data to associate with session
   * @returns {Promise<Object>} Session data including session_id and url
   */
  async createVerificationSession(vendorData = "Government ID") {
    try {
      console.log(
        `Creating Didit verification session with vendor data: ${vendorData}`
      );

      const response = await axios.post(
        `${this.baseUrl}/session/`,
        {
          workflow_id: this.workflowId,
          vendor_data: vendorData,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": this.apiKey,
          },
        }
      );

      console.log(
        `✅ Didit session created successfully: ${response.data.session_id}`
      );

      return {
        success: true,
        session_id: response.data.session_id, // Keep original format
        sessionId: response.data.session_id,
        sessionNumber: response.data.session_number,
        sessionToken: response.data.session_token,
        url: response.data.url,
        status: response.data.status,
        workflowId: response.data.workflow_id,
        vendorData: response.data.vendor_data,
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error(
        "❌ Error creating Didit verification session:",
        error.response?.data || error.message
      );

      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errorDetails: error.response?.data,
      };
    }
  }

  /**
   * Get verification session status and decision
   * @param {string} sessionId - Session ID to check
   * @returns {Promise<Object>} Session status and verification data
   */
  async getSessionDecision(sessionId) {
    try {
      console.log(`Fetching Didit session decision for: ${sessionId}`);

      const response = await axios.get(
        `${this.baseUrl}/session/${sessionId}/decision/`,
        {
          headers: {
            accept: "application/json",
            "x-api-key": this.apiKey,
          },
        }
      );

      console.log(
        `✅ Didit session decision fetched: Status = ${response.data.status}`
      );

      return {
        success: true,
        sessionId: response.data.session_id,
        sessionNumber: response.data.session_number,
        sessionUrl: response.data.session_url,
        status: response.data.status,
        workflowId: response.data.workflow_id,
        features: response.data.features,
        vendorData: response.data.vendor_data,
        metadata: response.data.metadata,
        idVerification: response.data.id_verification,
        nfc: response.data.nfc,
        liveness: response.data.liveness,
        faceMatch: response.data.face_match,
        phone: response.data.phone,
        email: response.data.email,
        poa: response.data.poa,
        aml: response.data.aml,
        ipAnalysis: response.data.ip_analysis,
        databaseValidation: response.data.database_validation,
        reviews: response.data.reviews,
        createdAt: response.data.created_at,
      };
    } catch (error) {
      console.error(
        "❌ Error fetching Didit session decision:",
        error.response?.data || error.message
      );

      return {
        success: false,
        error: error.response?.data?.message || error.message,
        errorDetails: error.response?.data,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Extract user data from verification response
   * @param {Object} sessionDecision - Session decision response
   * @returns {Object|null} Extracted user data or null if not approved
   */
  extractUserData(sessionDecision) {
    try {
      if (!sessionDecision.success || sessionDecision.status !== "Approved") {
        console.log(
          `⚠️ Cannot extract user data. Status: ${
            sessionDecision.status || "Unknown"
          }`
        );
        return null;
      }

      const idVerification = sessionDecision.idVerification;

      if (!idVerification || idVerification.status !== "Approved") {
        console.log(
          `⚠️ ID verification not approved. Status: ${
            idVerification?.status || "Unknown"
          }`
        );
        return null;
      }

      // Extract and format data
      const firstName = idVerification.first_name || "";
      const lastName = idVerification.last_name || "";
      const fullName =
        idVerification.full_name || `${firstName} ${lastName}`.trim();

      // Convert gender format: F -> Female, M -> Male
      let gender = "Others";
      if (idVerification.gender === "F") {
        gender = "Female";
      } else if (idVerification.gender === "M") {
        gender = "Male";
      }

      const userData = {
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        aadharNumber:
          idVerification.document_number || idVerification.personal_number,
        gender: gender,
        dob: idVerification.date_of_birth,
        age: idVerification.age,
        documentType: idVerification.document_type,
        issuingState: idVerification.issuing_state,
        issuingStateName: idVerification.issuing_state_name,
        nationality: idVerification.nationality,
        expirationDate: idVerification.expiration_date,
        dateOfIssue: idVerification.date_of_issue,
        placeOfBirth: idVerification.place_of_birth,
        address: idVerification.address,
        formattedAddress: idVerification.formatted_address,
        parsedAddress: idVerification.parsed_address,
        portraitImage: idVerification.portrait_image,
        frontImage: idVerification.front_image,
        backImage: idVerification.back_image,
        warnings: idVerification.warnings || [],
      };

      console.log(`✅ User data extracted successfully for: ${fullName}`);

      return userData;
    } catch (error) {
      console.error("❌ Error extracting user data:", error);
      return null;
    }
  }

  /**
   * Get status message for user
   * @param {string} status - Verification status
   * @returns {string} User-friendly status message
   */
  getStatusMessage(status) {
    const statusMessages = {
      "Not Started":
        "Your verification hasn't been started yet. Please complete the verification process.",
      "In Progress":
        "Your verification is currently in progress. Please complete all the required steps.",
      "In Review":
        "Your verification is under review by our team. This usually takes a few minutes.",
      Approved: "Your verification has been approved successfully!",
      Declined:
        "Your verification was declined. Please retry with correct information.",
      Expired:
        "Your verification session has expired. Please start a new verification.",
    };

    return (
      statusMessages[status] ||
      "Verification status is unknown. Please contact support."
    );
  }

  /**
   * Check if verification is complete (approved or declined)
   * @param {string} status - Verification status
   * @returns {boolean} True if verification is complete
   */
  isVerificationComplete(status) {
    return status === "Approved" || status === "Declined";
  }

  /**
   * Check if verification is pending
   * @param {string} status - Verification status
   * @returns {boolean} True if verification is pending
   */
  isVerificationPending(status) {
    return ["Not Started", "In Progress", "In Review"].includes(status);
  }

  /**
   * Alias for createVerificationSession
   * @param {string} vendorData - Custom data to associate with session
   * @returns {Promise<Object>} Session data including session_id and url
   */
  async createSession(vendorData = "Government ID") {
    return this.createVerificationSession(vendorData);
  }

  /**
   * Fetch complete user verification data from Didit using stored session ID
   * This is useful for retrieving verification details after user registration
   * @param {string} sessionId - Didit session ID stored in database
   * @returns {Promise<Object>} Complete verification data or error
   */
  async fetchUserVerificationData(sessionId) {
    try {
      console.log(
        `Fetching complete verification data for session: ${sessionId}`
      );

      const decision = await this.getSessionDecision(sessionId);

      if (!decision.success) {
        return {
          success: false,
          error: "Failed to fetch verification data",
          details: decision.error,
        };
      }

      // Return complete verification data
      return {
        success: true,
        sessionId: decision.sessionId,
        status: decision.status,
        workflowId: decision.workflowId,
        createdAt: decision.createdAt,

        // ID Verification data
        idVerification: decision.idVerification
          ? {
              status: decision.idVerification.status,
              documentType: decision.idVerification.document_type,
              documentNumber: decision.idVerification.document_number,
              personalNumber: decision.idVerification.personal_number,
              firstName: decision.idVerification.first_name,
              lastName: decision.idVerification.last_name,
              fullName: decision.idVerification.full_name,
              dateOfBirth: decision.idVerification.date_of_birth,
              age: decision.idVerification.age,
              gender: decision.idVerification.gender,
              expirationDate: decision.idVerification.expiration_date,
              dateOfIssue: decision.idVerification.date_of_issue,
              issuingState: decision.idVerification.issuing_state,
              issuingStateName: decision.idVerification.issuing_state_name,
              nationality: decision.idVerification.nationality,
              address: decision.idVerification.address,
              formattedAddress: decision.idVerification.formatted_address,
              placeOfBirth: decision.idVerification.place_of_birth,
              portraitImage: decision.idVerification.portrait_image,
              frontImage: decision.idVerification.front_image,
              backImage: decision.idVerification.back_image,
              warnings: decision.idVerification.warnings || [],
            }
          : null,

        // Phone verification data
        phone: decision.phone
          ? {
              status: decision.phone.status,
              phoneNumber: decision.phone.phone_number,
              fullNumber: decision.phone.full_number,
              countryCode: decision.phone.country_code,
              verifiedAt: decision.phone.verified_at,
            }
          : null,

        // Email verification data
        email: decision.email
          ? {
              status: decision.email.status,
              email: decision.email.email,
              verifiedAt: decision.email.verified_at,
            }
          : null,

        // Liveness check data
        liveness: decision.liveness
          ? {
              status: decision.liveness.status,
              score: decision.liveness.score,
              method: decision.liveness.method,
            }
          : null,

        // Face match data
        faceMatch: decision.faceMatch
          ? {
              status: decision.faceMatch.status,
              score: decision.faceMatch.score,
            }
          : null,

        // Reviews (if any)
        reviews: decision.reviews || [],
      };
    } catch (error) {
      console.error("Error fetching user verification data:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get simplified user info from stored session ID
   * @param {string} sessionId - Didit session ID
   * @returns {Promise<Object>} Simplified user data
   */
  async getUserInfoFromSession(sessionId) {
    try {
      const verificationData = await this.fetchUserVerificationData(sessionId);

      if (!verificationData.success) {
        return {
          success: false,
          error: verificationData.error,
        };
      }

      // Extract only essential user info
      const idVerif = verificationData.idVerification;

      return {
        success: true,
        name: idVerif?.fullName || `${idVerif?.firstName} ${idVerif?.lastName}`,
        documentNumber: idVerif?.documentNumber || idVerif?.personalNumber,
        documentType: idVerif?.documentType,
        dateOfBirth: idVerif?.dateOfBirth,
        gender: idVerif?.gender,
        nationality: idVerif?.nationality,
        address: idVerif?.address,
        verificationStatus: verificationData.status,
        verifiedAt: verificationData.createdAt,
      };
    } catch (error) {
      console.error("Error getting user info from session:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract Aadhaar images from decision data
   * @param {string} sessionId - Didit session ID
   * @returns {Promise<Object>} Aadhaar front and back image URLs
   */
  async getAadhaarImages(sessionId) {
    try {
      console.log(`Extracting Aadhaar images from session: ${sessionId}`);

      const decision = await this.getSessionDecision(sessionId);

      if (!decision.success) {
        throw new Error(decision.error || "Failed to fetch session decision");
      }

      const idVerification = decision.idVerification;

      if (!idVerification) {
        throw new Error("No ID verification data found in session");
      }

      if (!idVerification.front_image || !idVerification.back_image) {
        throw new Error("Aadhaar images not available in verification data");
      }

      console.log(
        `✅ Aadhaar images extracted successfully for ${idVerification.full_name}`
      );

      return {
        success: true,
        frontImage: idVerification.front_image,
        backImage: idVerification.back_image,
        portraitImage: idVerification.portrait_image,
        fullFrontImage: idVerification.full_front_image,
        fullBackImage: idVerification.full_back_image,
        documentNumber: idVerification.document_number,
        fullName: idVerification.full_name,
        documentType: idVerification.document_type,
        dateOfBirth: idVerification.date_of_birth,
        address: idVerification.address,
      };
    } catch (error) {
      console.error("❌ Error extracting Aadhaar images:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = DiditService;
