const axios = require('axios');
require('dotenv').config();

async function testLoginAPI() {
  console.log('🌐 Testing Login API...');
  
  try {
    // Test login endpoint
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@mozart.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('   User:', response.data.user.username);
    console.log('   Coins:', response.data.user.coins);
    console.log('   Token:', response.data.token ? 'Present' : 'Missing');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Login failed:');
      console.log('   Status:', error.response.status);
      console.log('   Error:', error.response.data.error);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running. Please start server first with: npm run dev');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testLoginAPI();