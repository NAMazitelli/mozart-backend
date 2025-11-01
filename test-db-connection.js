// Test database connection and basic queries
const { query } = require('./config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test basic connection
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Database connection successful!');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('🗄️  Database version:', result.rows[0].db_version.split(' ')[0]);

    // Test if our tables exist
    console.log('\n📋 Checking database schema...');

    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✅ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      // Test sample queries on main tables
      console.log('\n🧪 Testing sample queries...');

      // Test users table
      try {
        const usersCount = await query('SELECT COUNT(*) as count FROM users');
        console.log(`✅ Users table: ${usersCount.rows[0].count} users`);
      } catch (err) {
        console.log('❌ Users table error:', err.message);
      }

      // Test exercise_types table
      try {
        const exerciseTypesResult = await query('SELECT category, name FROM exercise_types LIMIT 5');
        console.log(`✅ Exercise types table: ${exerciseTypesResult.rows.length} types found`);
        exerciseTypesResult.rows.forEach(row => {
          console.log(`   - ${row.category}: ${row.name}`);
        });
      } catch (err) {
        console.log('❌ Exercise types table error:', err.message);
      }

      // Test views
      try {
        const leaderboardResult = await query('SELECT COUNT(*) as count FROM global_leaderboard');
        console.log(`✅ Global leaderboard view: ${leaderboardResult.rows[0].count} entries`);
      } catch (err) {
        console.log('❌ Global leaderboard view error:', err.message);
      }

    } else {
      console.log('⚠️  No tables found. Database schema may not be set up yet.');
      console.log('💡 Run the database-schema.sql file to create the schema.');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Check your .env file and Supabase connection settings.');
  }

  process.exit(0);
}

testDatabaseConnection();