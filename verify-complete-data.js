require('dotenv').config();
const mongoose = require('mongoose');
const { AccountFreezeInquiry } = require('./models');

async function verifyCompleteData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allRecords = await AccountFreezeInquiry.find({}).limit(10);
    
    console.log('🔍 Checking first 10 records for COMPLETE data:\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let completeRecords = 0;
    let incompleteRecords = 0;

    allRecords.forEach((record, index) => {
      const hasName = record.userDetails?.name;
      const hasPhone = record.userDetails?.phone;
      const hasBank = record.accountDetails?.bankName;
      const hasAccount = record.accountDetails?.accountNumber;
      const hasFreezeState = record.accountDetails?.freezeState;
      const hasFrozenBy = record.accountDetails?.frozenByStatePolice;

      console.log(`${index + 1}. Inquiry ID: ${record.inquiryId}`);
      
      if (hasName && hasPhone && hasBank && hasAccount && hasFreezeState && hasFrozenBy) {
        console.log(`   ✅ COMPLETE DATA`);
        console.log(`      Name: ${hasName}`);
        console.log(`      Phone: ${hasPhone}`);
        console.log(`      Bank: ${hasBank}`);
        console.log(`      Account: ${hasAccount}`);
        console.log(`      State: ${hasFreezeState}`);
        console.log(`      Frozen By: ${hasFrozenBy}`);
        completeRecords++;
      } else {
        console.log(`   ❌ INCOMPLETE DATA`);
        console.log(`      Name: ${hasName || 'MISSING'}`);
        console.log(`      Phone: ${hasPhone || 'MISSING'}`);
        console.log(`      Bank: ${hasBank || 'MISSING'}`);
        console.log(`      Account: ${hasAccount || 'MISSING'}`);
        incompleteRecords++;
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`✅ Complete Records: ${completeRecords}/10`);
    console.log(`❌ Incomplete Records: ${incompleteRecords}/10\n`);

    if (incompleteRecords === 0) {
      console.log('🎉 ALL RECORDS HAVE COMPLETE DATA!\n');
    } else {
      console.log('❌ SOME RECORDS ARE MISSING DATA!\n');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyCompleteData();
