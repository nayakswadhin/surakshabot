const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function testEndpoints() {
  console.log("🧪 Testing WhatsApp Bot Endpoints...\n");

  try {
    // Test health endpoint
    console.log("1. Testing Health Check...");
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Health Check:", healthResponse.data);
    console.log("");

    // Test webhook verification
    console.log("2. Testing Webhook Verification...");
    const webhookResponse = await axios.get(
      `${BASE_URL}/api/whatsapp/webhook`,
      {
        params: {
          "hub.mode": "subscribe",
          "hub.verify_token":
            process.env.WEBHOOK_VERIFY_TOKEN || "SurakshaBot_webhook_2025",
          "hub.challenge": "test_challenge_123",
        },
      }
    );
    console.log("✅ Webhook Verification:", webhookResponse.data);
    console.log("");

    // Test webhook message simulation
    console.log("3. Testing Webhook Message Processing...");
    const messagePayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          changes: [
            {
              field: "messages",
              value: {
                messages: [
                  {
                    from: "919876543210",
                    type: "text",
                    text: { body: "Hello" },
                    timestamp: Date.now(),
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const webhookPostResponse = await axios.post(
      `${BASE_URL}/api/whatsapp/webhook`,
      messagePayload
    );
    console.log(
      "✅ Webhook Message Processing:",
      webhookPostResponse.status === 200 ? "Success" : "Failed"
    );
    console.log("");

    console.log("🎉 All endpoints are working correctly!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run tests
testEndpoints();
