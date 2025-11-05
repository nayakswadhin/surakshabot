const mongoose = require('mongoose');
const { Users } = require('./models');
require('dotenv').config();

async function testDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test creating a user
    console.log('\n📝 Testing user creation...');
    const testUser = {
      aadharNumber: "123456789012",
      name: "Test User",
      fatherSpouseGuardianName: "Test Father",
      gender: "Male",
      emailid: "test@example.com",
      dob: new Date("1990-01-01"),
      phoneNumber: "9876543210",
      caseIds: [],
      address: {
        pincode: "751001",
        area: "Test Area",
        village: "Test Village",
        district: "Test District",
        postOffice: "Test Post Office",
        policeStation: "Test Police Station"
      }
    };

    const newUser = new Users(testUser);
    const savedUser = await newUser.save();
    console.log('✅ Test user created:', savedUser._id);

    // Verify user exists
    const foundUser = await Users.findById(savedUser._id);
    console.log('✅ User verified in database');
    console.log('User details:', JSON.stringify(foundUser, null, 2));

    // Clean up test user
    await Users.findByIdAndDelete(savedUser._id);
    console.log('✅ Test user deleted');

    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.code === 11000) {
      console.error('Duplicate key error - test data may already exist');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabase();