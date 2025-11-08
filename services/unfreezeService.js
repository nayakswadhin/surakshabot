const { StateContacts, AccountFreezeInquiry, Users } = require('../models');

class UnfreezeService {
  constructor() {
    // City to State mapping for smart detection
    this.cityStateMap = {
      // Major cities
      'mumbai': 'Maharashtra',
      'pune': 'Maharashtra',
      'nagpur': 'Maharashtra',
      'thane': 'Maharashtra',
      'nashik': 'Maharashtra',
      
      'delhi': 'Delhi',
      'new delhi': 'Delhi',
      
      'bangalore': 'Karnataka',
      'bengaluru': 'Karnataka',
      'mysore': 'Karnataka',
      'mangalore': 'Karnataka',
      'hubli': 'Karnataka',
      
      'hyderabad': 'Telangana',
      'secunderabad': 'Telangana',
      'warangal': 'Telangana',
      
      'chennai': 'Tamil Nadu',
      'madurai': 'Tamil Nadu',
      'coimbatore': 'Tamil Nadu',
      'salem': 'Tamil Nadu',
      
      'kolkata': 'West Bengal',
      'howrah': 'West Bengal',
      'durgapur': 'West Bengal',
      
      'ahmedabad': 'Gujarat',
      'surat': 'Gujarat',
      'vadodara': 'Gujarat',
      'rajkot': 'Gujarat',
      
      'jaipur': 'Rajasthan',
      'jodhpur': 'Rajasthan',
      'udaipur': 'Rajasthan',
      'kota': 'Rajasthan',
      
      'lucknow': 'Uttar Pradesh',
      'kanpur': 'Uttar Pradesh',
      'agra': 'Uttar Pradesh',
      'varanasi': 'Uttar Pradesh',
      'noida': 'Uttar Pradesh',
      'ghaziabad': 'Uttar Pradesh',
      'meerut': 'Uttar Pradesh',
      
      'bhopal': 'Madhya Pradesh',
      'indore': 'Madhya Pradesh',
      'gwalior': 'Madhya Pradesh',
      'jabalpur': 'Madhya Pradesh',
      
      'chandigarh': 'Chandigarh',
      
      'bhubaneswar': 'Odisha',
      'cuttack': 'Odisha',
      'rourkela': 'Odisha',
      'puri': 'Odisha',
      
      'patna': 'Bihar',
      'gaya': 'Bihar',
      'bhagalpur': 'Bihar',
      
      'ranchi': 'Jharkhand',
      'jamshedpur': 'Jharkhand',
      'dhanbad': 'Jharkhand',
      
      'guwahati': 'Assam',
      'dispur': 'Assam',
      
      'thiruvananthapuram': 'Kerala',
      'kochi': 'Kerala',
      'kozhikode': 'Kerala',
      'thrissur': 'Kerala',
      
      'amritsar': 'Punjab',
      'ludhiana': 'Punjab',
      'jalandhar': 'Punjab',
      
      'shimla': 'Himachal Pradesh',
      'dharamshala': 'Himachal Pradesh',
      
      'srinagar': 'Jammu & Kashmir',
      'jammu': 'Jammu & Kashmir',
      
      'dehradun': 'Uttarakhand',
      'haridwar': 'Uttarakhand',
      
      'imphal': 'Manipur',
      'aizawl': 'Mizoram',
      'gangtok': 'Sikkim',
      'agartala': 'Tripura',
      'shillong': 'Meghalaya',
      'kohima': 'Nagaland',
      'itanagar': 'Arunachal Pradesh',
      
      'panaji': 'Goa',
      'goa': 'Goa',
      
      'port blair': 'Andaman & Nicobar',
      'pondicherry': 'Puducherry',
      'puducherry': 'Puducherry',
      'daman': 'Dadra and Nagar Haveli and Daman & Diu',
      'diu': 'Dadra and Nagar Haveli and Daman & Diu',
      'lakshadweep': 'Lakshadweep',
      'kavaratti': 'Lakshadweep',
      'ladakh': 'Ladakh',
      'leh': 'Ladakh'
    };
  }

  /**
   * Detect state from city/state input
   * @param {string} input - City or state name
   * @returns {string|null} - State name or null
   */
  detectState(input) {
    if (!input) return null;
    
    const normalizedInput = input.toLowerCase().trim();
    
    // Check if it's a city
    if (this.cityStateMap[normalizedInput]) {
      return this.cityStateMap[normalizedInput];
    }
    
    // Check if it's a state name (case-insensitive partial match)
    // This will be validated against StateContacts database
    return input;
  }

  /**
   * Get police contacts for a state
   * @param {string} state - State name
   * @returns {Object|null} - State contacts or null
   */
  async getStateContacts(state) {
    try {
      const stateContact = await StateContacts.findByState(state);
      return stateContact;
    } catch (error) {
      console.error('Error fetching state contacts:', error);
      return null;
    }
  }

  /**
   * Create freeze inquiry record
   * @param {Object} data - Inquiry data
   * @returns {Object} - Created inquiry
   */
  async createFreezeInquiry(data) {
    try {
      const inquiry = new AccountFreezeInquiry(data);
      await inquiry.save();
      return inquiry;
    } catch (error) {
      console.error('Error creating freeze inquiry:', error);
      throw error;
    }
  }

  /**
   * Format contact information message
   * @param {Object} stateContact - State contact object
   * @param {Object} inquiryData - Inquiry data
   * @returns {string} - Formatted message
   */
  formatContactMessage(stateContact, inquiryData) {
    const { accountDetails } = inquiryData;
    
    let message = `✅ *INQUIRY DETAILS RECEIVED*\n\n`;
    message += `📊 *Summary:*\n`;
    message += `• Bank: ${accountDetails.bankName}\n`;
    message += `• Account: ${accountDetails.accountNumber}\n`;
    message += `• Bank Branch State: ${accountDetails.freezeState}\n`;
    message += `• Date Frozen: ${this.formatDate(accountDetails.freezeDate)}\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📞 *CONTACT THESE OFFICERS IN ${accountDetails.freezeState.toUpperCase()}:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🏛️ *${stateContact.stateUT}*\n\n`;
    
    message += `👨‍✈️ *Nodal Cyber Cell Officer:*\n`;
    message += `   Name: ${stateContact.nodalOfficer.name}\n`;
    message += `   Rank: ${stateContact.nodalOfficer.rank}\n`;
    message += `   📧 ${stateContact.nodalOfficer.email}\n\n`;
    
    message += `👨‍⚖️ *Grievance Officer:*\n`;
    message += `   Name: ${stateContact.grievanceOfficer.name}\n`;
    message += `   Rank: ${stateContact.grievanceOfficer.rank}\n`;
    if (stateContact.grievanceOfficer.contact) {
      message += `   📞 ${stateContact.grievanceOfficer.contact}\n`;
    }
    message += `   📧 ${stateContact.grievanceOfficer.email}\n\n`;
    
    message += `⚠️ *IMPORTANT STEPS:*\n`;
    message += `• Contact the officers listed above for ${accountDetails.freezeState}\n`;
    message += `• Carry: Bank freeze notice, ID proof, address proof, bank statement\n`;
    message += `• Explain you're an innocent victim whose account received fraudulent money\n`;
    message += `• Request account unfreeze after verification\n`;
    message += `• Visit your bank branch with police clearance letter\n\n`;
    
    message += `🇮🇳 *National Cyber Helpline:* 1930\n\n`;
    
    message += `🆔 *Your Inquiry ID:* ${inquiryData.inquiryId}\n`;
    message += `(Keep this for reference)\n`;
    
    return message;
  }

  /**
   * Mask account number for security
   * @param {string} accountNumber
   * @returns {string}
   */
  maskAccountNumber(accountNumber) {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    return `XXXX${lastFour}`;
  }

  /**
   * Format date to readable string
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    if (!date) return 'Not Provided';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Parse date from user input
   * @param {string} dateString
   * @returns {Date|null}
   */
  parseDate(dateString) {
    try {
      // Try various date formats
      // DD-MM-YYYY or DD/MM/YYYY
      const parts = dateString.split(/[-\/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
      
      // Try parsing as standard date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  /**
   * Validate account number format
   * @param {string} accountNumber
   * @returns {boolean}
   */
  isValidAccountNumber(accountNumber) {
    // Basic validation: should be alphanumeric, 9-18 digits
    return /^[0-9]{9,18}$/.test(accountNumber.replace(/\s/g, ''));
  }

  /**
   * Get inquiry by ID
   * @param {string} inquiryId
   * @returns {Object|null}
   */
  async getInquiryById(inquiryId) {
    try {
      return await AccountFreezeInquiry.findByInquiryId(inquiryId);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      return null;
    }
  }

  /**
   * Get user's inquiries
   * @param {string} userId
   * @returns {Array}
   */
  async getUserInquiries(userId) {
    try {
      return await AccountFreezeInquiry.findByUserId(userId);
    } catch (error) {
      console.error('Error fetching user inquiries:', error);
      return [];
    }
  }
}

module.exports = UnfreezeService;
