require('dotenv').config();
const mongoose = require('mongoose');
const AccountFreezeInquiry = require('./models/AccountFreezeInquiry');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check for exact match with what user entered
    const record1 = await AccountFreezeInquiry.findOne({ 
      'accountDetails.accountNumber': '2307550351172' 
    });
    console.log('\nSearching for: 2307550351172');
    console.log('Found:', !!record1);
    if (record1) {
      console.log('Bank:', record1.accountDetails.bankName);
      console.log('Account Holder:', record1.accountDetails.accountHolderName);
    }
    
    // Check for the one I thought was in screenshot
    const record2 = await AccountFreezeInquiry.findOne({ 
      'accountDetails.accountNumber': '23075503517' 
    });
    console.log('\nSearching for: 23075503517');
    console.log('Found:', !!record2);
    if (record2) {
      console.log('Bank:', record2.accountDetails.bankName);
      console.log('Account Holder:', record2.accountDetails.accountHolderName);
    }
    
    // Find any account starting with 230755
    const allMatching = await AccountFreezeInquiry.find({ 
      'accountDetails.accountNumber': /^230755/ 
    });
    console.log('\nAll accounts starting with 230755:');
    allMatching.forEach(r => {
      console.log(`- ${r.accountDetails.accountNumber} (${r.accountDetails.bankName})`);
    });
    
    // Let's see ANY 5 accounts
    const anyAccounts = await AccountFreezeInquiry.find().limit(5);
    console.log('\nFirst 5 accounts in database:');
    anyAccounts.forEach(r => {
      console.log(`- ${r.accountDetails.accountNumber} at ${r.accountDetails.bankName}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
