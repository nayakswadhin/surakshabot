const mongoose = require("mongoose");

const casesSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true,
    required: true,
  },
  aadharNumber: {
    type: String,
    required: true,
    match: /^[0-9]{12}$/,
  },
  incidentDescription: {
    type: String,
    required: true,
  },
  caseCategory: {
    type: String,
    enum: ["Financial", "Social"],
    required: true,
  },
  typeOfFraud: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  isHighAlert: {
    type: Boolean,
    default: false,
  },
  caseDetailsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CaseDetails",
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
casesSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Cases", casesSchema);
