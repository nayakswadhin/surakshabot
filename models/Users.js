const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  aadharNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{12}$/,
  },
  name: {
    type: String,
    required: true,
  },
  fatherSpouseGuardianName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Others"],
  },
  emailid: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/,
  },
  freeze: {
    type: Boolean,
    default: false,
  },
  caseIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cases",
    },
  ],
  address: {
    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/,
    },
    area: {
      type: String,
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    postOffice: {
      type: String,
      default: "TBD",
    },
    policeStation: {
      type: String,
      default: "TBD",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  verifiedVia: {
    type: String,
    enum: ["manual", "didit"],
    default: "manual",
  },
  diditSessionId: {
    type: String,
    default: null,
  },
});

// Update the updatedAt field before saving
usersSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Users", usersSchema);
