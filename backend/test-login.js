const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
  console.log('🔐 Testing Login Process...');
  
  try {
    const db = require('./services/database');
    
    // Test user lookup
    const [users] = await db.execute(
      'SELECT id, email, password_hash, username, language, coins, current_streak, longest_streak FROM users WHERE email = ?',
      ['test@mozart.com']
    );
    
    if (users.length === 0) {
      console.log('❌ No user found with email test@mozart.com');
      return;
    }
    
    const user = users[0];
    console.log('✅ Found user:', user.username);
    console.log('   Email:', user.email);
    console.log('   Password hash:', user.password_hash);
    
    // Test password verification
    const testPassword = 'password123';
    console.log('\n🔑 Testing password verification...');
    console.log('   Testing password:', testPassword);
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log('   Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed!');
      
      // Let's generate a new hash for testing
      console.log('\n🔧 Generating new hash...');
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('   New hash:', newHash);
      
      // Test the new hash
      const newHashValid = await bcrypt.compare(testPassword, newHash);
      console.log('   New hash valid:', newHashValid);
    } else {
      console.log('✅ Password verification successful!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testLogin();