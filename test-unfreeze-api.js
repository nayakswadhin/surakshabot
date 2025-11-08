const axios = require('axios');

async function testUnfreezeAPI() {
  const BASE_URL = 'http://localhost:3000/api/unfreeze';

  console.log('🧪 Testing Unfreeze API Endpoints...\n');

  try {
    // Test 1: Get all inquiries
    console.log('1️⃣ Testing GET /inquiries...');
    const allInquiries = await axios.get(`${BASE_URL}/inquiries`);
    console.log(`✅ Success! Found ${allInquiries.data.count} inquiries\n`);

    if (allInquiries.data.data.length > 0) {
      const sample = allInquiries.data.data[0];
      console.log('📋 Sample Inquiry:');
      console.log(`   ID: ${sample.inquiryId}`);
      console.log(`   Name: ${sample.userDetails.name}`);
      console.log(`   Account: ${sample.accountDetails.accountNumber}`);
      console.log(`   Bank: ${sample.accountDetails.bankName}`);
      console.log(`   Frozen By: ${sample.accountDetails.frozenByStatePolice} Police`);
      console.log('');

      // Test 2: Get single inquiry
      console.log('2️⃣ Testing GET /inquiry/:inquiryId...');
      const singleInquiry = await axios.get(`${BASE_URL}/inquiry/${sample.inquiryId}`);
      console.log(`✅ Success! Retrieved inquiry ${singleInquiry.data.data.inquiryId}\n`);

      // Test 3: Lookup by account number
      console.log('3️⃣ Testing POST /lookup (account lookup)...');
      const lookup = await axios.post(`${BASE_URL}/lookup`, {
        accountNumber: sample.accountDetails.accountNumber
      });
      console.log(`✅ Success! Account lookup returned:`);
      console.log(`   Frozen By: ${lookup.data.data.frozenByState} Police`);
      console.log(`   Nodal Officer: ${lookup.data.data.contacts?.nodalOfficer?.name}`);
      console.log(`   Message: ${lookup.data.message}\n`);

      // Test 4: Get by state
      console.log('4️⃣ Testing GET /inquiries/state/:state...');
      const byState = await axios.get(`${BASE_URL}/inquiries/state/${sample.accountDetails.freezeState}`);
      console.log(`✅ Success! Found ${byState.data.count} inquiries in ${sample.accountDetails.freezeState}\n`);

      // Test 5: Get by bank
      console.log('5️⃣ Testing GET /inquiries/bank/:bankName...');
      const byBank = await axios.get(`${BASE_URL}/inquiries/bank/${encodeURIComponent(sample.accountDetails.bankName)}`);
      console.log(`✅ Success! Found ${byBank.data.count} inquiries for ${sample.accountDetails.bankName}\n`);

      // Test 6: Get by frozen state
      console.log('6️⃣ Testing GET /inquiries/frozen-by/:state...');
      const byFrozenState = await axios.get(`${BASE_URL}/inquiries/frozen-by/${sample.accountDetails.frozenByStatePolice}`);
      console.log(`✅ Success! Found ${byFrozenState.data.count} inquiries frozen by ${sample.accountDetails.frozenByStatePolice} Police\n`);
    }

    // Test 7: Get statistics
    console.log('7️⃣ Testing GET /stats...');
    const stats = await axios.get(`${BASE_URL}/stats`);
    console.log(`✅ Success! Statistics retrieved:`);
    console.log(`   Total Inquiries: ${stats.data.data.total}`);
    console.log(`   Top 3 States:`);
    stats.data.data.byState.slice(0, 3).forEach((item, i) => {
      console.log(`      ${i + 1}. ${item.state}: ${item.count} inquiries`);
    });
    console.log(`   Top 3 Banks:`);
    stats.data.data.byBank.slice(0, 3).forEach((item, i) => {
      console.log(`      ${i + 1}. ${item.bank}: ${item.count} inquiries`);
    });
    console.log('');

    console.log('🎉 ALL TESTS PASSED! ✅');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('📱 Frontend can now access:');
    console.log('   • GET  /api/unfreeze/inquiries - List all');
    console.log('   • GET  /api/unfreeze/inquiry/:id - Get single');
    console.log('   • POST /api/unfreeze/lookup - Lookup by account');
    console.log('   • GET  /api/unfreeze/stats - Get statistics');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testUnfreezeAPI();
