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
    enum: [
      // Financial Fraud Categories
      "Investment/Trading/IPO Fraud",
      "Customer Care Fraud",
      "UPI Fraud (UPI/IMPS/INB/NEFT/RTGS)",
      "APK Fraud",
      "Fake Franchisee/Dealership Fraud",
      "Online Job Fraud",
      "Debit Card Fraud",
      "Credit Card Fraud",
      "E-Commerce Fraud",
      "Loan App Fraud",
      "Sextortion Fraud",
      "OLX Fraud",
      "Lottery Fraud",
      "Hotel Booking Fraud",
      "Gaming App Fraud",
      "AEPS Fraud (Aadhar Enabled Payment System)",
      "Tower Installation Fraud",
      "E-Wallet Fraud",
      "Digital Arrest Fraud",
      "Fake Website Scam Fraud",
      "Ticket Booking Fraud",
      "Insurance Maturity Fraud",
      "Financial - Others",
      // Social Media Fraud Categories
      "Facebook Fraud",
      "Instagram Fraud",
      "X (Twitter) Fraud",
      "WhatsApp Fraud",
      "Telegram Fraud",
      "Hacked Gmail/YouTube",
      "Fraud Call/SMS",
      "Social Media - Others",
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "solved"],
    default: "pending",
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
