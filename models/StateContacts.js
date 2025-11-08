const mongoose = require('mongoose');

const stateContactSchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: true,
    unique: true
  },
  stateUT: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nodalOfficer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    rank: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  grievanceOfficer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    rank: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      type: String,
      required: false,
      trim: true,
      default: "Not Available"
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
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
stateContactSchema.index({ stateUT: 1 });

// Method to find contact by state name (case-insensitive, partial match)
stateContactSchema.statics.findByState = async function(stateName) {
  if (!stateName) return null;
  
  // Clean the state name
  const cleanState = stateName.trim().toUpperCase();
  
  // Try exact match first
  let contact = await this.findOne({ 
    stateUT: new RegExp(`^${cleanState}$`, 'i') 
  });
  
  if (!contact) {
    // Try partial match
    contact = await this.findOne({ 
      stateUT: new RegExp(cleanState, 'i') 
    });
  }
  
  return contact;
};

const StateContacts = mongoose.model('StateContacts', stateContactSchema);

module.exports = StateContacts;
