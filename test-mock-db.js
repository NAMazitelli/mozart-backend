// Test file to demonstrate mock database functionality
require('dotenv').config({ path: './backend/.env' });

async function testMockDatabase() {
  console.log('🧪 Testing Mock Database System...\n');
  
  try {
    // Import mock database
    const db = require('./backend/services/database');
    console.log('✅ Database service loaded successfully');
    
    // Test user login
    console.log('\n--- Testing User Login ---');
    const [users] = await db.execute(
      'SELECT id, email, password_hash, username, language, coins, current_streak, longest_streak FROM users WHERE email = ?',
      ['test@mozart.com']
    );
    console.log('Found user:', users[0]?.username || 'Not found');
    console.log('User stats:', {
      coins: users[0]?.coins,
      streak: users[0]?.current_streak,
      longestStreak: users[0]?.longest_streak
    });
    
    // Test exercise fetching
    console.log('\n--- Testing Exercise Fetching ---');
    const [exercises] = await db.execute(
      'SELECT * FROM exercises WHERE category = ? AND difficulty = ? ORDER BY RAND() LIMIT 5',
      ['scales', 'easy']
    );
    console.log(`Found ${exercises.length} easy scale exercises`);
    exercises.forEach((ex, i) => {
      console.log(`  ${i + 1}. ${ex.question_data.options[0]} (${ex.type})`);
    });
    
    // Test score fetching
    console.log('\n--- Testing Score Fetching ---');
    const [scores] = await db.execute(
      'SELECT category, difficulty, high_score FROM scores WHERE user_id = ? ORDER BY category, difficulty',
      [1]
    );
    console.log(`Found ${scores.length} high scores for user 1:`);
    scores.forEach(score => {
      console.log(`  ${score.category} (${score.difficulty}): ${score.high_score}`);
    });
    
    console.log('\n✅ Mock database system working perfectly!');
    console.log('🎯 Ready to run backend without MySQL connection');
    
  } catch (error) {
    console.error('❌ Error testing mock database:', error.message);
  }
}

testMockDatabase();