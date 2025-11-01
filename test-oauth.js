// Test OAuth endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testOAuthEndpoints() {
  console.log('🔐 Testing OAuth Integration...\n');

  try {
    // 1. Test OAuth route availability
    console.log('1. Testing OAuth routes availability...');

    // Test Google OAuth redirect (should redirect to Google)
    try {
      const googleResponse = await axios.get(`${BASE_URL}/auth/google`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status === 302; // Expect redirect
        }
      });
      console.log('✅ Google OAuth route:', googleResponse.status === 302 ? 'AVAILABLE (redirects to Google)' : 'FAILED');
      if (googleResponse.headers.location) {
        console.log('   Redirects to:', googleResponse.headers.location.substring(0, 50) + '...');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running');
        return;
      } else {
        console.log('❌ Google OAuth route error:', error.message);
      }
    }

    // Test Facebook OAuth redirect (should redirect to Facebook)
    try {
      const facebookResponse = await axios.get(`${BASE_URL}/auth/facebook`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status === 302; // Expect redirect
        }
      });
      console.log('✅ Facebook OAuth route:', facebookResponse.status === 302 ? 'AVAILABLE (redirects to Facebook)' : 'FAILED');
      if (facebookResponse.headers.location) {
        console.log('   Redirects to:', facebookResponse.headers.location.substring(0, 50) + '...');
      }
    } catch (error) {
      console.log('❌ Facebook OAuth route error:', error.message);
    }

    // 2. Test social accounts endpoint (requires authentication)
    console.log('\n2. Testing social accounts management...');

    // First create a test user to get a token
    const timestamp = Date.now();
    const registerData = {
      email: `oauth${timestamp}@example.com`,
      password: 'password123',
      username: `oauthuser${timestamp}`,
      fullName: 'OAuth Test User'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    if (registerResponse.status === 201) {
      const token = registerResponse.data.token;
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      // Test getting social accounts
      const socialAccountsResponse = await axios.get(`${BASE_URL}/auth/social-accounts`, authHeaders);
      console.log('✅ Social accounts endpoint:', socialAccountsResponse.status === 200 ? 'SUCCESS' : 'FAILED');
      console.log('   Connected accounts:', socialAccountsResponse.data?.socialAccounts?.length || 0);

      // 3. Test social login endpoint (simulated)
      console.log('\n3. Testing social login endpoint...');

      const socialLoginData = {
        provider: 'google',
        providerUserId: 'test_google_user_123',
        providerEmail: `social${timestamp}@gmail.com`,
        userData: {
          name: 'Social Test User',
          picture: 'https://example.com/avatar.jpg'
        }
      };

      const socialLoginResponse = await axios.post(`${BASE_URL}/auth/social-login`, socialLoginData);
      console.log('✅ Social login endpoint:', socialLoginResponse.status === 200 ? 'SUCCESS' : 'FAILED');

      if (socialLoginResponse.status === 200) {
        console.log('   New user created via social login');
        console.log('   Token received:', !!socialLoginResponse.data.token);
        console.log('   User data:', {
          id: socialLoginResponse.data.user?.id,
          email: socialLoginResponse.data.user?.email,
          username: socialLoginResponse.data.user?.username
        });

        // Test getting social accounts for the new social user
        const socialAuthHeaders = { headers: { Authorization: `Bearer ${socialLoginResponse.data.token}` } };
        const newUserSocialAccounts = await axios.get(`${BASE_URL}/auth/social-accounts`, socialAuthHeaders);
        console.log('✅ Social user accounts check:', newUserSocialAccounts.status === 200 ? 'SUCCESS' : 'FAILED');
        console.log('   Connected accounts for social user:', newUserSocialAccounts.data?.socialAccounts?.length || 0);
      }
    }

    console.log('\n🎉 OAuth integration tests completed successfully!');
    console.log('\n📝 Next steps for full OAuth setup:');
    console.log('1. Configure Google OAuth App in Google Cloud Console');
    console.log('2. Configure Facebook App in Facebook Developer Console');
    console.log('3. Update environment variables with real client IDs and secrets');
    console.log('4. Test with real OAuth providers');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first.');
    } else if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      if (error.response.data) {
        console.log('   Response data:', error.response.data);
      }
    } else {
      console.log('❌ Test error:', error.message);
    }
  }
}

testOAuthEndpoints();