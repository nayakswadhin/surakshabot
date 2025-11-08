require('dotenv').config();
const mongoose = require('mongoose');
const { AccountFreezeInquiry } = require('./models');

async function checkAllRecords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allRecords = await AccountFreezeInquiry.find({});
    
    console.log(`📊 Total Records: ${allRecords.length}\n`);

    let consistent = 0;
    let inconsistent = 0;
    const inconsistentRecords = [];

    allRecords.forEach((record, index) => {
      const freeze = record.accountDetails.freezeState;
      const frozen = record.accountDetails.frozenByStatePolice;
      
      if (freeze === frozen) {
        consistent++;
      } else {
        inconsistent++;
        inconsistentRecords.push({
          index: index + 1,
          inquiryId: record.inquiryId,
          name: record.userDetails.name,
          freezeState: freeze,
          frozenByStatePolice: frozen
        });
      }
    });

    console.log(`✅ CONSISTENT Records: ${consistent}`);
    console.log(`❌ INCONSISTENT Records: ${inconsistent}\n`);

    if (inconsistent > 0) {
      console.log('❌ INCONSISTENT RECORDS FOUND:\n');
      inconsistentRecords.forEach(rec => {
        console.log(`${rec.index}. ${rec.name} (${rec.inquiryId})`);
        console.log(`   freezeState: ${rec.freezeState}`);
        console.log(`   frozenByStatePolice: ${rec.frozenByStatePolice}`);
        console.log('');
      });
      console.log('🔄 RE-SEEDING REQUIRED!\n');
    } else {
      console.log('🎉 ALL 100 RECORDS ARE CONSISTENT!\n');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllRecords();
