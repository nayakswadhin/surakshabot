const cloudinary = require("cloudinary").v2;

class CloudinaryService {
  constructor() {
    // Configure Cloudinary with environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload image buffer to Cloudinary
   * @param {Buffer} imageBuffer - Image data as buffer
   * @param {string} fileName - Original filename
   * @param {string} folder - Cloudinary folder (optional)
   * @returns {Promise<Object>} Upload result with secure_url and public_id
   */
  async uploadImage(imageBuffer, fileName, folder = "suraksha-bot/documents") {
    try {
      console.log(`Uploading image to Cloudinary: ${fileName}`);

      return new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: folder,
          public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`, // Remove extension, add timestamp
          resource_type: "image",
          format: "jpg", // Convert all images to JPG for consistency
          quality: "auto:good", // Optimize quality
          fetch_format: "auto", // Auto format selection
        };

        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log(`Image uploaded successfully: ${result.secure_url}`);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                fileName: fileName,
                uploadedAt: new Date(),
              });
            }
          })
          .end(imageBuffer);
      });
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(publicId) {
    try {
      console.log(`Deleting image from Cloudinary: ${publicId}`);
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Image deleted successfully: ${publicId}`, result);
      return result;
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      throw error;
    }
  }

  /**
   * Delete multiple images from Cloudinary
   * @param {Array<string>} publicIds - Array of Cloudinary public IDs
   * @returns {Promise<Object>} Deletion results
   */
  async deleteMultipleImages(publicIds) {
    try {
      console.log(`Deleting ${publicIds.length} images from Cloudinary`);
      const result = await cloudinary.api.delete_resources(publicIds);
      console.log(`Multiple images deleted successfully`, result);
      return result;
    } catch (error) {
      console.error("Error deleting multiple images from Cloudinary:", error);
      throw error;
    }
  }

  /**
   * Validate image format and size
   * @param {string} mimeType - MIME type of the file
   * @param {number} fileSize - File size in bytes
   * @returns {Object} Validation result
   */
  validateImage(mimeType, fileSize) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxSizeMB = 10; // 10MB limit
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const isValidType = allowedTypes.includes(mimeType?.toLowerCase());
    const isValidSize = fileSize <= maxSizeBytes;

    return {
      isValid: isValidType && isValidSize,
      errors: {
        ...(!isValidType && {
          type: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
        }),
        ...(!isValidSize && {
          size: `File too large. Maximum size: ${maxSizeMB}MB`,
        }),
      },
    };
  }

  /**
   * Generate folder path based on document type
   * @param {string} documentType - Type of document being uploaded
   * @returns {string} Cloudinary folder path
   */
  getFolderPath(documentType) {
    const basePath = "suraksha-bot/financial-fraud";
    const folderMap = {
      aadhar_pan: `${basePath}/identity-documents`,
      debit_credit_card: `${basePath}/card-documents`,
      bank_front_page: `${basePath}/bank-documents`,
      bank_statement: `${basePath}/bank-statements`,
      debit_messages: `${basePath}/transaction-messages`,
      upi_screenshots: `${basePath}/upi-transactions`,
      credit_card_statement: `${basePath}/credit-statements`,
      beneficiary_details: `${basePath}/beneficiary-details`,
    };

    return folderMap[documentType] || `${basePath}/misc-documents`;
  }
}

module.exports = CloudinaryService;
