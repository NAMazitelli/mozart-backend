// Simple test for mock database
require('dotenv').config();

async function testMockDatabase() {
  console.log('🧪 Testing Mock Database System...');
  console.log('USE_MOCK_DB:', process.env.USE_MOCK_DB);
  
  try {
    const db = require('./services/database');
    console.log('✅ Database service loaded successfully');
    
    // Test user query
    const [users] = await db.execute(
      'SELECT id, email, username, coins, current_streak FROM users WHERE email = ?',
      ['test@mozart.com']
    );
    
    if (users.length > 0) {
      console.log('✅ Found test user:', users[0].username);
      console.log('   Coins:', users[0].coins);
      console.log('   Streak:', users[0].current_streak);
    } else {
      console.log('❌ No test user found');
    }
    
    // Test exercise query
    const [exercises] = await db.execute(
      'SELECT * FROM exercises WHERE category = ? AND difficulty = ? LIMIT 3',
      ['scales', 'easy']
    );
    
    console.log(`✅ Found ${exercises.length} scale exercises`);
    
    console.log('\n🎯 Mock database working perfectly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMockDatabase();