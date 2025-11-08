require('dotenv').config();
const mongoose = require('mongoose');
const { AccountFreezeInquiry } = require('./models');

async function verifyDataConsistency() {
  try {
    console.log('🔍 Verifying data consistency...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const records = await AccountFreezeInquiry.find({}).limit(10);

    console.log('📊 Checking first 10 records for consistency:\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    let allConsistent = true;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const { freezeCity, freezeState, frozenByStatePolice } = record.accountDetails;

      console.log(`Record ${i + 1}:`);
      console.log(`  Name: ${record.userDetails.name}`);
      console.log(`  Account: ${record.accountDetails.accountNumber}`);
      console.log(`  User Lives In: ${record.userDetails.currentState} (can be different)`);
      console.log(`  Freeze City: ${freezeCity}`);
      console.log(`  Freeze State: ${freezeState}`);
      console.log(`  Frozen By: ${frozenByStatePolice} Police`);

      // Check consistency
      const isConsistent = freezeState === frozenByStatePolice;

      if (isConsistent) {
        console.log(`  ✅ CONSISTENT - freezeState and frozenByStatePolice match!`);
      } else {
        console.log(`  ❌ INCONSISTENT - freezeState (${freezeState}) != frozenByStatePolice (${frozenByStatePolice})`);
        allConsistent = false;
      }

      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════════\n');

    if (allConsistent) {
      console.log('✅ ALL RECORDS ARE CONSISTENT!');
      console.log('   freezeState === frozenByStatePolice in all records');
    } else {
      console.log('❌ SOME RECORDS ARE INCONSISTENT!');
      console.log('   Please re-run the seed script');
    }

    console.log('\n📊 Full Database Statistics:\n');

    const totalRecords = await AccountFreezeInquiry.countDocuments();
    console.log(`Total Records: ${totalRecords}`);

    // Check all records for consistency
    const allRecords = await AccountFreezeInquiry.find({});
    const inconsistentRecords = allRecords.filter(r => 
      r.accountDetails.freezeState !== r.accountDetails.frozenByStatePolice
    );

    console.log(`Consistent Records: ${totalRecords - inconsistentRecords.length}`);
    console.log(`Inconsistent Records: ${inconsistentRecords.length}`);

    if (inconsistentRecords.length === 0) {
      console.log('\n🎉 PERFECT! All 100 records are consistent!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
}

verifyDataConsistency();
