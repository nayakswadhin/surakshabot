/**
 * Test script for "Send WhatsApp" button functionality
 * This simulates the frontend button click to send WhatsApp messages
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

async function testSendWhatsAppButton() {
  console.log('🧪 Testing Send WhatsApp Button Functionality\n');
  console.log('='.repeat(60));

  // Test data - use a real phone number from your database
  const testData = {
    phoneNumber: '919876543210', // Replace with actual test number
    message: `Hello User,

This is regarding your cyber crime complaint.

📋 Case ID: TEST001
📊 Status: Under Investigation
📁 Category: Online Fraud
🔍 Type: Financial Fraud

We will keep you updated on the progress.

If you have any questions, please reply to this message.`,
    caseId: 'TEST001'
  };

  console.log('\n📤 Test 1: Sending WhatsApp message via admin button');
  console.log('Phone:', testData.phoneNumber);
  console.log('Case ID:', testData.caseId);
  console.log('Message preview:', testData.message.substring(0, 100) + '...');

  try {
    const response = await axios.post(
      `${BACKEND_URL}/whatsapp/send-message`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('\n✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n🎉 WhatsApp message sent successfully!');
      console.log('Message ID:', response.data.data?.messageId);
      console.log('Phone:', response.data.data?.phoneNumber);
    }

  } catch (error) {
    console.log('\n❌ FAILED!');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }

  // Test 2: Invalid phone number
  console.log('\n' + '='.repeat(60));
  console.log('\n📤 Test 2: Testing with invalid phone number');
  
  try {
    const response = await axios.post(
      `${BACKEND_URL}/whatsapp/send-message`,
      {
        phoneNumber: 'invalid',
        message: 'Test message',
        caseId: 'TEST001'
      },
      { timeout: 10000 }
    );

    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 500) {
      console.log('✅ Correctly handled invalid phone number');
      console.log('Error:', error.response.data.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  // Test 3: Missing required fields
  console.log('\n' + '='.repeat(60));
  console.log('\n📤 Test 3: Testing with missing fields');
  
  try {
    const response = await axios.post(
      `${BACKEND_URL}/whatsapp/send-message`,
      {
        phoneNumber: '919876543210'
        // message is missing
      },
      { timeout: 10000 }
    );

    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly handled missing fields');
      console.log('Error:', error.response.data.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All tests completed!\n');
}

// Run the test
testSendWhatsAppButton().catch(console.error);
