// Test Supabase Database Connection
const { pool, query } = require('./config/database');

async function testConnection() {
  console.log('🔍 Testing Supabase PostgreSQL connection...\n');

  try {
    // Test basic connection
    console.log('1. Testing connection pool...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!\n');

    // Release the client back to the pool
    client.release();

    // Test query execution
    console.log('2. Testing query execution...');
    const result = await query('SELECT NOW() as current_time, version() as db_version');

    if (result.rows.length > 0) {
      console.log('✅ Query executed successfully!');
      console.log('📅 Current time:', result.rows[0].current_time);
      console.log('🗄️  Database version:', result.rows[0].db_version.split(' ')[0], '\n');
    }

    // Test our tables exist
    console.log('3. Checking Mozart database tables...');
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'exercise_types', 'user_exercise_attempts', 'leaderboard_entries', 'user_streaks')
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✅ Found Mozart tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   📋 ${row.table_name}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No Mozart tables found. You may need to run the database schema:');
      console.log('   psql [YOUR_DATABASE_URL] -f database-schema.sql\n');
    }

    // Test exercise types data
    console.log('4. Checking exercise types data...');
    const exerciseTypesResult = await query('SELECT COUNT(*) as count FROM exercise_types');
    const count = parseInt(exerciseTypesResult.rows[0].count);

    if (count > 0) {
      console.log(`✅ Found ${count} exercise types in database`);

      // Show exercise types
      const exercisesResult = await query('SELECT category, name FROM exercise_types ORDER BY category');
      exercisesResult.rows.forEach(row => {
        console.log(`   🎵 ${row.category}: ${row.name}`);
      });
    } else {
      console.log('⚠️  No exercise types found. Schema may need to be imported.');
    }

    console.log('\n🎉 All tests passed! Your Supabase database is ready for Mozart! 🎵');

  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error('Error:', error.message);

    if (error.code) {
      console.error('Error Code:', error.code);
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has the correct DATABASE_URL');
    console.log('2. Verify your Supabase password is correct');
    console.log('3. Ensure your Supabase project is active');
    console.log('4. Check if you need to import the database schema');
    console.log('5. Verify SSL connection is working');
  } finally {
    // Close the pool
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testConnection();