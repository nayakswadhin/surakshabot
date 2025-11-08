const mongoose = require('mongoose');
require('dotenv').config();

const AccountFreezeInquiry = require('./models/AccountFreezeInquiry');

const searchAccount = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const accountNumber = '811857493627';
    console.log(`\n🔍 Searching for account number: ${accountNumber}\n`);

    const inquiry = await AccountFreezeInquiry.findOne({
      'accountDetails.accountNumber': accountNumber
    });

    if (inquiry) {
      console.log('✅ FOUND!');
      console.log('Inquiry ID:', inquiry.inquiryId);
      console.log('User Name:', inquiry.userDetails.name);
      console.log('Phone:', inquiry.userDetails.phone);
      console.log('Bank:', inquiry.accountDetails.bankName);
      console.log('Account Number:', inquiry.accountDetails.accountNumber);
      console.log('Account Holder:', inquiry.accountDetails.accountHolderName);
      console.log('Freeze State:', inquiry.accountDetails.freezeState);
      console.log('\nFull Data:', JSON.stringify(inquiry, null, 2));
    } else {
      console.log('❌ NOT FOUND');
      
      // Try to find similar account numbers
      const allInquiries = await AccountFreezeInquiry.find({}).limit(5);
      console.log('\n📋 Sample account numbers in database:');
      allInquiries.forEach(inq => {
        console.log(`  - ${inq.accountDetails.accountNumber} (${inq.accountDetails.bankName})`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

searchAccount();
