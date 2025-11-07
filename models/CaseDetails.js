const mongoose = require("mongoose");

const caseDetailsSchema = new mongoose.Schema({
  photos: [
    {
      documentType: {
        type: String,
      },
      url: {
        type: String,
      },
      fileName: {
        type: String,
      },
      publicId: {
        type: String, // Cloudinary public ID for deletion
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Social Media fraud specific fields
  metaRegistrationDone: {
    type: Boolean,
    default: false,
  },
  isImpersonationCase: {
    type: Boolean,
    default: false,
  },
  allegedUrls: [
    {
      type: String,
    },
  ],
  originalIdUrls: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
caseDetailsSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("CaseDetails", caseDetailsSchema);
