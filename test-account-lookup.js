require('dotenv').config();
const mongoose = require('mongoose');
const { AccountFreezeInquiry } = require('./models');

async function testAccountLookup() {
  try {
    console.log('🔍 Testing Account Number Lookup Feature\n');
    console.log('═══════════════════════════════════════\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get a random account from database
    const randomAccount = await AccountFreezeInquiry.findOne().limit(1);
    
    if (!randomAccount) {
      console.log('❌ No accounts found in database');
      return;
    }

    console.log('📋 TEST CASE: User enters account number\n');
    console.log('Account Number:', randomAccount.accountDetails.accountNumber);
    console.log('─────────────────────────────────────\n');

    // Simulate lookup
    const accountNumber = randomAccount.accountDetails.accountNumber;
    const lookupResult = await AccountFreezeInquiry.findOne({
      'accountDetails.accountNumber': accountNumber
    });

    if (lookupResult) {
      console.log('✅ ACCOUNT FOUND IN DATABASE!\n');
      console.log('📊 Account Details:');
      console.log(`   Bank: ${lookupResult.accountDetails.bankName}`);
      console.log(`   Account Holder: ${lookupResult.accountDetails.accountHolderName}`);
      console.log(`   Account: XXXX${accountNumber.slice(-4)}`);
      console.log(`   Bank Branch State: ${lookupResult.accountDetails.freezeState}`);
      console.log('');
      console.log('🚨 FROZEN BY:');
      console.log(`   ${lookupResult.accountDetails.frozenByStatePolice.toUpperCase()} POLICE`);
      console.log('');
      console.log('📞 Contact Information:');
      console.log(`   State: ${lookupResult.providedContacts.state}`);
      console.log('');
      console.log('   👨‍✈️ Nodal Officer:');
      console.log(`      Name: ${lookupResult.providedContacts.nodalOfficer.name}`);
      console.log(`      Rank: ${lookupResult.providedContacts.nodalOfficer.rank}`);
      console.log(`      Email: ${lookupResult.providedContacts.nodalOfficer.email}`);
      console.log('');
      console.log('   👨‍⚖️ Grievance Officer:');
      console.log(`      Name: ${lookupResult.providedContacts.grievanceOfficer.name}`);
      console.log(`      Rank: ${lookupResult.providedContacts.grievanceOfficer.rank}`);
      console.log(`      Contact: ${lookupResult.providedContacts.grievanceOfficer.contact}`);
      console.log(`      Email: ${lookupResult.providedContacts.grievanceOfficer.email}`);
      console.log('');
      console.log(`📋 Inquiry ID: ${lookupResult.inquiryId}`);
      console.log('');
    } else {
      console.log('❌ Account not found in database');
    }

    console.log('═══════════════════════════════════════');
    console.log('');

    // Show 5 more sample accounts for testing
    console.log('📝 Sample Accounts for Testing:\n');
    const samples = await AccountFreezeInquiry.find().limit(5);
    
    samples.forEach((record, index) => {
      console.log(`${index + 1}. Account: ${record.accountDetails.accountNumber}`);
      console.log(`   Bank: ${record.accountDetails.bankName}`);
      console.log(`   Holder: ${record.accountDetails.accountHolderName}`);
      console.log(`   Frozen By: ${record.accountDetails.frozenByStatePolice} Police`);
      console.log('');
    });

    console.log('💡 HOW TO TEST ON WHATSAPP:');
    console.log('   1. Select "Account Unfreeze" option');
    console.log('   2. Enter bank name (e.g., SBI, HDFC)');
    console.log('   3. Enter one of the account numbers above');
    console.log('   4. Bot will instantly show which state police froze it!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
    process.exit(0);
  }
}

testAccountLookup();
