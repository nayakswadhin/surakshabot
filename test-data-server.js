/**
 * Simple Data Retrieval Test
 * This creates a test endpoint to fetch data from MongoDB
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const Cases = require('./models/Cases');
const Users = require('./models/Users');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Simple test endpoint - Get all cases
app.get('/test/cases', async (req, res) => {
  try {
    console.log('📊 Fetching all cases...');
    const cases = await Cases.find().sort({ createdAt: -1 }).limit(100);
    
    console.log(`✅ Found ${cases.length} cases`);
    
    res.json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    console.error('❌ Error fetching cases:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test endpoint - Get all users
app.get('/test/users', async (req, res) => {
  try {
    console.log('👥 Fetching all users...');
    const users = await Users.find().sort({ createdAt: -1 }).limit(100);
    
    console.log(`✅ Found ${users.length} users`);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database stats
app.get('/test/stats', async (req, res) => {
  try {
    const casesCount = await Cases.countDocuments();
    const usersCount = await Users.countDocuments();
    const pendingCases = await Cases.countDocuments({ status: 'pending' });
    const solvedCases = await Cases.countDocuments({ status: 'solved' });
    
    res.json({
      success: true,
      stats: {
        totalCases: casesCount,
        totalUsers: usersCount,
        pendingCases: pendingCases,
        solvedCases: solvedCases
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🧪 Data Retrieval Test Server',
    endpoints: {
      cases: '/test/cases',
      users: '/test/users',
      stats: '/test/stats'
    }
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 Test Server Started');
  console.log('='.repeat(50));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Cases: http://localhost:${PORT}/test/cases`);
  console.log(`👥 Users: http://localhost:${PORT}/test/users`);
  console.log(`📈 Stats: http://localhost:${PORT}/test/stats`);
  console.log('='.repeat(50) + '\n');
});
