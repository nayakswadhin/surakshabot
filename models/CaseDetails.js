const mongoose = require("mongoose");

const caseDetailsSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cases",
    required: true,
  },
  photos: [
    {
      url: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  policeStationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoliceStation",
  },
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
