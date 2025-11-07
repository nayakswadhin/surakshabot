/**
 * Test Frontend-Backend Connection
 * This script tests all API endpoints used by the frontend
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
};

// Test endpoints
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    url: `${API_BASE_URL}/health`,
  },
  {
    name: 'Get All Cases',
    method: 'GET',
    url: `${API_BASE_URL}/whatsapp/cases/all`,
  },
  {
    name: 'Get All Users',
    method: 'GET',
    url: `${API_BASE_URL}/whatsapp/users/all`,
  },
];

async function testEndpoint(test) {
  try {
    log.test(`Testing: ${test.name}`);
    
    const config = {
      method: test.method,
      url: test.url,
      timeout: 5000,
    };

    if (test.data) {
      config.data = test.data;
    }

    const response = await axios(config);
    
    log.success(`${test.name} - Status: ${response.status}`);
    
    if (response.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  Data count: ${response.data.data.length} items`);
      } else if (response.data.message) {
        console.log(`  Message: ${response.data.message}`);
      }
    }
    
    return { success: true, test: test.name };
  } catch (error) {
    log.error(`${test.name} - Failed`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`  Error: Backend server not running on ${API_BASE_URL}`);
    } else if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Message: ${error.response.data?.message || 'Unknown error'}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
    return { success: false, test: test.name, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Frontend-Backend Connection Tests');
  console.log('='.repeat(60) + '\n');

  log.info(`Testing backend at: ${API_BASE_URL}`);
  console.log('');

  const results = [];

  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push(result);
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${results.length}`);
  log.success(`Passed: ${passed}`);
  
  if (failed > 0) {
    log.error(`Failed: ${failed}`);
  }
  
  console.log('');

  if (failed === 0) {
    log.success('All tests passed! Frontend can connect to backend. ✨');
  } else {
    log.error('Some tests failed. Please check the backend server.');
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 Next Steps:');
  console.log('='.repeat(60));
  console.log('1. Ensure backend is running: node main.js');
  console.log('2. Start frontend: cd frontend && npm run dev');
  console.log('3. Open browser: http://localhost:3001');
  console.log('4. Test connection in Settings page');
  console.log('');
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
