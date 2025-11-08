const axios = require('axios');

async function verifyFrontendData() {
  console.log('🔍 Verifying Frontend Data Consistency...\n');

  try {
    // Fetch data from API (what frontend sees)
    const response = await axios.get('http://localhost:3000/api/unfreeze/inquiries');
    const inquiries = response.data.data;

    console.log(`✅ Found ${inquiries.length} total inquiries\n`);

    // Show first 5 records
    console.log('📊 First 5 Records (What Frontend Sees):\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    inquiries.slice(0, 5).forEach((inquiry, index) => {
      console.log(`${index + 1}. ${inquiry.userDetails.name}`);
      console.log(`   Inquiry ID: ${inquiry.inquiryId}`);
      console.log(`   Phone: ${inquiry.userDetails.phone}`);
      console.log(`   Lives In: ${inquiry.userDetails.currentState}`);
      console.log(`   Account: ${inquiry.accountDetails.accountNumber}`);
      console.log(`   Bank: ${inquiry.accountDetails.bankName}`);
      console.log(`   Account State: ${inquiry.accountDetails.freezeState}`);
      console.log(`   Frozen By: ${inquiry.accountDetails.frozenByStatePolice} Police`);
      console.log(`   Freeze Date: ${new Date(inquiry.accountDetails.freezeDate).toLocaleDateString('en-IN')}`);
      
      // Verify consistency
      if (inquiry.accountDetails.freezeState === inquiry.accountDetails.frozenByStatePolice) {
        console.log(`   ✅ CONSISTENT - Both match!`);
      } else {
        console.log(`   ❌ INCONSISTENT - ${inquiry.accountDetails.freezeState} != ${inquiry.accountDetails.frozenByStatePolice}`);
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════\n');

    // Check for the specific record from screenshot (Anita Mishra)
    const anitaRecord = inquiries.find(i => 
      i.userDetails.name === 'Anita Mishra' && 
      i.accountDetails.accountNumber === '918794818832'
    );

    if (anitaRecord) {
      console.log('🎯 Found record from screenshot (Anita Mishra):\n');
      console.log(`   Name: ${anitaRecord.userDetails.name}`);
      console.log(`   Account: ${anitaRecord.accountDetails.accountNumber}`);
      console.log(`   Bank: ${anitaRecord.accountDetails.bankName}`);
      console.log(`   Lives In: ${anitaRecord.userDetails.currentState}`);
      console.log(`   Account State: ${anitaRecord.accountDetails.freezeState}`);
      console.log(`   Frozen By: ${anitaRecord.accountDetails.frozenByStatePolice}`);
      console.log('');
      
      if (anitaRecord.accountDetails.freezeState === anitaRecord.accountDetails.frozenByStatePolice) {
        console.log('   ✅ This record is CONSISTENT!');
      } else {
        console.log('   ❌ This record is INCONSISTENT!');
      }
    } else {
      console.log('⚠️  Could not find Anita Mishra record with account 918794818832');
    }

    console.log('');
    console.log('🎉 Data verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

verifyFrontendData();
