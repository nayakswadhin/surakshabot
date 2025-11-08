require('dotenv').config();
const mongoose = require('mongoose');
const { AccountFreezeInquiry, StateContacts } = require('./models');

// Sample data pools
const indianNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
  'Anjali Gupta', 'Rahul Verma', 'Pooja Iyer', 'Sanjay Mehta', 'Deepika Rao',
  'Arjun Nair', 'Kavita Joshi', 'Suresh Yadav', 'Neha Saxena', 'Manoj Kumar',
  'Divya Agarwal', 'Karthik Menon', 'Ritu Malhotra', 'Vijay Desai', 'Sakshi Pandey',
  'Aditya Sharma', 'Megha Kulkarni', 'Rohan Das', 'Shreya Banerjee', 'Nikhil Reddy',
  'Swati Kapoor', 'Ashok Tiwari', 'Pallavi Singh', 'Gaurav Jain', 'Nisha Chopra',
  'Praveen Kumar', 'Asha Rani', 'Rakesh Sinha', 'Geeta Devi', 'Mohit Agarwal',
  'Anita Mishra', 'Sunil Bhatt', 'Rekha Nambiar', 'Harish Reddy', 'Sunita Rao',
  'Ramesh Babu', 'Lata Sharma', 'Dinesh Patel', 'Meena Gupta', 'Naresh Kumar',
  'Usha Verma', 'Kishore Rao', 'Savita Singh', 'Bharat Kumar', 'Kamala Devi'
];

const banks = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank',
  'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'Bank of India', 'Indian Bank',
  'IDBI Bank', 'Central Bank of India', 'Indian Overseas Bank', 'UCO Bank', 'Bank of Maharashtra',
  'Punjab & Sind Bank', 'Yes Bank', 'Kotak Mahindra Bank', 'IndusInd Bank', 'Federal Bank'
];

const states = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu',
  'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh',
  'Odisha', 'Bihar', 'Kerala', 'Haryana', 'Punjab',
  'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh',
  'Jammu & Kashmir', 'Goa', 'Chandigarh', 'Puducherry', 'Andhra Pradesh'
];

const cities = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  'Delhi': ['New Delhi', 'Delhi'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'],
  'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Chandigarh'],
  'Punjab': ['Amritsar', 'Ludhiana', 'Jalandhar'],
  'Assam': ['Guwahati', 'Dispur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
  'Chhattisgarh': ['Raipur', 'Bilaspur'],
  'Uttarakhand': ['Dehradun', 'Haridwar'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu'],
  'Goa': ['Panaji', 'Goa'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Tirupati']
};

const reasons = [
  'Police request due to fraud investigation',
  'Suspicious transaction flagged by bank',
  'Account involved in cybercrime case',
  'Money laundering investigation',
  'Fraudulent money transfer received',
  'Part of online scam investigation',
  'UPI fraud case involvement',
  'Credit card fraud investigation',
  'Phishing attack victim account',
  'Financial fraud complaint filed'
];

function generateAccountNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

function generatePhoneNumber() {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const remaining = Math.floor(10000000 + Math.random() * 90000000);
  return prefix + remaining;
}

function getRandomDate(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCityForState(state) {
  const stateCities = cities[state];
  return stateCities ? getRandomElement(stateCities) : state;
}

async function seedUnfreezeData() {
  try {
    console.log('🌱 Starting to seed Account Unfreeze Inquiry data...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing unfreeze inquiry data...');
    await AccountFreezeInquiry.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Fetch all state contacts
    console.log('📊 Fetching state contacts...');
    const allStateContacts = await StateContacts.find({});
    console.log(`✅ Found ${allStateContacts.length} states\n`);

    // Generate 100 records
    console.log('📝 Generating 100 synthetic records...\n');
    const records = [];

    for (let i = 0; i < 100; i++) {
      // Add delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const name = getRandomElement(indianNames);
      const bank = getRandomElement(banks);
      const accountNumber = generateAccountNumber();
      const phoneNumber = generatePhoneNumber();
      
      // User's home state (where they live)
      const userHomeState = getRandomElement(states);
      
      // Bank branch state (where account is registered)
      const bankBranchState = getRandomElement(states);
      
      // State police who froze the account - DIFFERENT from bank branch (fraud happened elsewhere)
      const frozenByState = getRandomElement(states);  // Can be ANY state
      
      // Freeze city must be in the frozen state (where fraud was detected)
      const freezeCityInState = getCityForState(frozenByState);
      
      // Get state contacts for the state where account was frozen
      const stateContact = allStateContacts.find(sc => 
        sc.stateUT.toLowerCase().includes(frozenByState.toLowerCase()) ||
        frozenByState.toLowerCase().includes(sc.stateUT.toLowerCase())
      );

      if (!stateContact) {
        console.log(`⚠️  Warning: No state contact found for ${frozenByState}, skipping...`);
        continue;
      }

      const freezeDate = getRandomDate(new Date('2025-01-01'), new Date('2025-11-08'));
      const reason = getRandomElement(reasons);
      
      const record = {
        userDetails: {
          name: name,
          phone: phoneNumber,
          currentState: userHomeState  // Where user lives (can be different)
        },
        accountDetails: {
          bankName: bank,
          accountNumber: accountNumber,
          accountHolderName: name,
          freezeCity: freezeCityInState,  // City in the frozen state
          freezeState: frozenByState,  // State where frozen
          frozenByStatePolice: frozenByState,  // SAME - state police who froze it
          freezeDate: freezeDate,
          reasonByBank: reason,
          transactionId: `TXN${Date.now()}${i}`
        },
        providedContacts: {
          state: stateContact.stateUT,
          nodalOfficer: {
            name: stateContact.nodalOfficer.name,
            rank: stateContact.nodalOfficer.rank,
            email: stateContact.nodalOfficer.email
          },
          grievanceOfficer: {
            name: stateContact.grievanceOfficer.name,
            rank: stateContact.grievanceOfficer.rank,
            contact: stateContact.grievanceOfficer.contact || 'Not Available',
            email: stateContact.grievanceOfficer.email
          }
        },
        status: 'inquiry_completed'
      };

      records.push(record);

      if ((i + 1) % 10 === 0) {
        console.log(`   Generated ${i + 1}/100 records...`);
      }
    }

    // Insert all records
    console.log('\n💾 Inserting records into database...');
    const inserted = await AccountFreezeInquiry.insertMany(records);
    console.log(`✅ Successfully inserted ${inserted.length} records\n`);

    // Display statistics
    console.log('📊 DATA STATISTICS:');
    console.log('═══════════════════════════════════════\n');

    // Count by state
    const stateGroups = {};
    for (const record of inserted) {
      const state = record.accountDetails.freezeState;
      stateGroups[state] = (stateGroups[state] || 0) + 1;
    }

    console.log('Top 10 States by Inquiry Count:');
    const sortedStates = Object.entries(stateGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedStates.forEach(([state, count], index) => {
      console.log(`   ${index + 1}. ${state}: ${count} inquiries`);
    });

    console.log('\n');

    // Count by bank
    const bankGroups = {};
    for (const record of inserted) {
      const bank = record.accountDetails.bankName;
      bankGroups[bank] = (bankGroups[bank] || 0) + 1;
    }

    console.log('Top 10 Banks by Inquiry Count:');
    const sortedBanks = Object.entries(bankGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedBanks.forEach(([bank, count], index) => {
      console.log(`   ${index + 1}. ${bank}: ${count} inquiries`);
    });

    console.log('\n');

    // Sample records
    console.log('Sample Records (First 5):');
    console.log('─────────────────────────────────────\n');
    
    for (let i = 0; i < Math.min(5, inserted.length); i++) {
      const record = inserted[i];
      console.log(`${i + 1}. Inquiry ID: ${record.inquiryId}`);
      console.log(`   Name: ${record.userDetails.name}`);
      console.log(`   Bank: ${record.accountDetails.bankName}`);
      console.log(`   Account: ${record.accountDetails.accountNumber}`);
      console.log(`   User State: ${record.userDetails.currentState}`);
      console.log(`   Bank Branch State: ${record.accountDetails.freezeState}`);
      console.log(`   Frozen By: ${record.accountDetails.frozenByStatePolice} Police`);
      console.log(`   Freeze Date: ${record.accountDetails.freezeDate.toLocaleDateString('en-IN')}`);
      console.log(`   Contact State: ${record.providedContacts.state}`);
      console.log(`   Nodal Officer: ${record.providedContacts.nodalOfficer.name}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════\n');

    console.log('📝 Summary:');
    console.log(`   Total Records: ${inserted.length}`);
    console.log(`   Unique States: ${Object.keys(stateGroups).length}`);
    console.log(`   Unique Banks: ${Object.keys(bankGroups).length}`);
    console.log(`   Date Range: ${new Date('2025-01-01').toLocaleDateString('en-IN')} - ${new Date('2025-11-08').toLocaleDateString('en-IN')}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seeding
seedUnfreezeData();
