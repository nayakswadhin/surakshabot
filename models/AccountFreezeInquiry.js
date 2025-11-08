const mongoose = require('mongoose');

const accountFreezeInquirySchema = new mongoose.Schema({
  inquiryId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `UFI${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for demo/synthetic data
  },
  userDetails: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    currentState: {
      type: String,
      default: 'Not Provided'
    }
  },
  accountDetails: {
    bankName: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true  // Full account number, not masked
    },
    accountHolderName: {
      type: String,
      required: true
    },
    freezeCity: {
      type: String,
      default: 'Unknown'  // User doesn't know where it was frozen
    },
    freezeState: {
      type: String,
      required: true  // This is the bank branch state
    },
    frozenByStatePolice: {
      type: String,
      required: true  // Which state police froze this account
    },
    freezeDate: {
      type: Date,
      required: true
    },
    reasonByBank: {
      type: String,
      default: 'Not Provided'
    },
    transactionId: {
      type: String,
      default: 'Not Provided'
    }
  },
  providedContacts: {
    state: String,
    nodalOfficer: {
      name: String,
      rank: String,
      email: String
    },
    grievanceOfficer: {
      name: String,
      rank: String,
      contact: String,
      email: String
    }
  },
  status: {
    type: String,
    enum: ['inquiry_completed', 'contacts_provided'],
    default: 'inquiry_completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
accountFreezeInquirySchema.index({ userId: 1, createdAt: -1 });
accountFreezeInquirySchema.index({ 'accountDetails.freezeState': 1 });
accountFreezeInquirySchema.index({ inquiryId: 1 });

// Static method to get inquiry by ID
accountFreezeInquirySchema.statics.findByInquiryId = async function(inquiryId) {
  return await this.findOne({ inquiryId });
};

// Static method to get user's inquiries
accountFreezeInquirySchema.statics.findByUserId = async function(userId) {
  return await this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to get inquiries by state
accountFreezeInquirySchema.statics.findByState = async function(state) {
  return await this.find({ 'accountDetails.freezeState': state }).sort({ createdAt: -1 });
};

const AccountFreezeInquiry = mongoose.model('AccountFreezeInquiry', accountFreezeInquirySchema);

module.exports = AccountFreezeInquiry;
