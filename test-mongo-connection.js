const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  console.log("🧪 Testing MongoDB Connection...\n");

  const uri = process.env.MONGODB_URI;
  console.log("📡 Connection URI:", uri.replace(/:[^:@]+@/, ":****@"));
  console.log("");

  try {
    console.log("⏳ Connecting...");

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log("✅ SUCCESS! MongoDB Connected");
    console.log("🏢 Host:", conn.connection.host);
    console.log("📊 Database:", conn.connection.name);
    console.log("🔌 Ready State:", conn.connection.readyState);

    // List databases
    const admin = conn.connection.db.admin();
    const { databases } = await admin.listDatabases();
    console.log("\n📂 Available databases:");
    databases.forEach((db) => {
      console.log(
        `   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`
      );
    });

    await mongoose.connection.close();
    console.log("\n✅ Connection closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED!");
    console.error("Error:", error.message);
    console.error("\n🔍 Possible issues:");
    console.error("   1. Username or password incorrect");
    console.error("   2. IP address not whitelisted in MongoDB Atlas");
    console.error("   3. Cluster is paused or deleted");
    console.error("   4. Network connectivity issues");
    console.error("\n📋 Current Network Access should include:");
    console.error("   - 0.0.0.0/0 (allows all IPs) OR");
    console.error("   - Your specific IP address");
    console.error("\n💡 To fix:");
    console.error("   1. Go to: https://cloud.mongodb.com");
    console.error("   2. Select your project");
    console.error("   3. Click 'Network Access' (Security section)");
    console.error("   4. Verify IP whitelist includes 0.0.0.0/0");
    console.error("   5. Click 'Database' and ensure cluster is running");

    process.exit(1);
  }
}

testConnection();
