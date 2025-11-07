const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Connection options with more robust settings
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log("🔄 Attempting to connect to MongoDB...");
    console.log(
      "📡 Connection string:",
      process.env.MONGODB_URI.replace(/:[^:@]+@/, ":****@")
    );

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    console.error("Full error:", error);

    // Don't exit process, just log error and continue
    console.log("⚠️  Server will continue running without database connection");
    console.log("⚠️  Please check your MongoDB Atlas configuration:");
    console.log("   1. Verify username and password");
    console.log("   2. Check IP whitelist (should include 0.0.0.0/0)");
    console.log("   3. Ensure cluster is running");
  }
};

module.exports = connectDB;
