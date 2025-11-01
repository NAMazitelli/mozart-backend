// Test backend endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Testing Backend Endpoints...\n');

  try {
    // Test server is running
    console.log('1. Testing server connection...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');

    // Test authentication routes
    console.log('\n2. Testing authentication routes...');

    // Test user registration
    const timestamp = Date.now();
    const registerData = {
      email: `test${timestamp}@example.com`,
      password: 'password123',
      username: `testuser${timestamp}`,
      fullName: 'Test User'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ User registration:', registerResponse.status === 201 ? 'SUCCESS' : 'FAILED');

    if (registerResponse.status === 201) {
      const token = registerResponse.data.token;
      console.log('   Token received:', token ? 'YES' : 'NO');

      // Test authenticated routes
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      // Test profile endpoint
      console.log('\n3. Testing profile endpoint...');
      const profileResponse = await axios.get(`${BASE_URL}/user/profile`, authHeaders);
      console.log('✅ Profile fetch:', profileResponse.status === 200 ? 'SUCCESS' : 'FAILED');

      // Test exercise generation
      console.log('\n4. Testing exercise generation...');
      const exerciseResponse = await axios.get(`${BASE_URL}/exercise/guess-note/easy`, authHeaders);
      console.log('✅ Exercise generation:', exerciseResponse.status === 200 ? 'SUCCESS' : 'FAILED');

      if (exerciseResponse.status === 200) {
        console.log('   Exercise data:', {
          type: exerciseResponse.data.type,
          difficulty: exerciseResponse.data.difficulty,
          hasOptions: !!exerciseResponse.data.options
        });
      }

      // Test leaderboard
      console.log('\n5. Testing leaderboard endpoints...');
      const leaderboardResponse = await axios.get(`${BASE_URL}/user/leaderboard/global`, authHeaders);
      console.log('✅ Global leaderboard:', leaderboardResponse.status === 200 ? 'SUCCESS' : 'FAILED');

      // Test scores
      console.log('\n6. Testing user scores...');
      const scoresResponse = await axios.get(`${BASE_URL}/user/scores`, authHeaders);
      console.log('✅ User scores:', scoresResponse.status === 200 ? 'SUCCESS' : 'FAILED');
      console.log('   Scores count:', scoresResponse.data?.length || 0);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first with: npm start');
    } else if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
    } else {
      console.log('❌ Test error:', error.message);
    }
  }
}

testEndpoints();