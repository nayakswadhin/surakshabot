const mongoose = require('mongoose');
const StateContacts = require('./models/StateContacts');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Test state contact retrieval
const testStateContacts = async () => {
  try {
    console.log('🧪 TESTING STATE CONTACT RETRIEVAL\n');
    console.log('═'.repeat(70));

    // Test 1: Exact match
    console.log('\n📍 Test 1: Searching for "ODISHA"');
    const odisha = await StateContacts.findByState('ODISHA');
    if (odisha) {
      console.log('✅ Found:', odisha.stateUT);
      console.log('   Nodal Officer:', odisha.nodalOfficer.name);
      console.log('   Email:', odisha.nodalOfficer.email);
      console.log('   Grievance Officer:', odisha.grievanceOfficer.name);
      console.log('   Contact:', odisha.grievanceOfficer.contact);
    } else {
      console.log('❌ Not found');
    }

    // Test 2: Case insensitive
    console.log('\n📍 Test 2: Searching for "delhi" (lowercase)');
    const delhi = await StateContacts.findByState('delhi');
    if (delhi) {
      console.log('✅ Found:', delhi.stateUT);
      console.log('   Nodal Officer:', delhi.nodalOfficer.name);
    } else {
      console.log('❌ Not found');
    }

    // Test 3: Partial match
    console.log('\n📍 Test 3: Searching for "KARNATAKA"');
    const karnataka = await StateContacts.findByState('KARNATAKA');
    if (karnataka) {
      console.log('✅ Found:', karnataka.stateUT);
      console.log('   Nodal Officer:', karnataka.nodalOfficer.name);
    } else {
      console.log('❌ Not found');
    }

    // Test 4: Get all states
    console.log('\n📍 Test 4: Getting total count');
    const count = await StateContacts.countDocuments();
    console.log(`✅ Total States/UTs in database: ${count}`);

    // Test 5: Format message
    console.log('\n📍 Test 5: Formatted WhatsApp Message for Maharashtra');
    const maharashtra = await StateContacts.findByState('MAHARASHTRA');
    if (maharashtra) {
      const formattedMessage = formatContactMessage(maharashtra);
      console.log('\n' + formattedMessage);
    }

    console.log('\n═'.repeat(70));
    console.log('✅ All tests completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
};

// Format message helper
function formatContactMessage(stateContact) {
  if (!stateContact) return '';
  
  return (
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📞 GRIEVANCE CONTACTS\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `If the response has not been appropriate, you may contact:\n\n` +
    `🏛️ ${stateContact.stateUT}\n\n` +
    `👨‍✈️ Nodal Cyber Cell Officer:\n` +
    `   Name: ${stateContact.nodalOfficer.name}\n` +
    `   Rank: ${stateContact.nodalOfficer.rank}\n` +
    `   📧 ${stateContact.nodalOfficer.email}\n\n` +
    `👨‍⚖️ Grievance Officer:\n` +
    `   Name: ${stateContact.grievanceOfficer.name}\n` +
    `   Rank: ${stateContact.grievanceOfficer.rank}\n` +
    `   📞 ${stateContact.grievanceOfficer.contact}\n` +
    `   📧 ${stateContact.grievanceOfficer.email}\n\n` +
    `🇮🇳 National Helpline: 1930`
  );
}

// Run tests
connectDB().then(() => {
  testStateContacts();
});
