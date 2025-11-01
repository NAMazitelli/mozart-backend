// Debug Environment Variables
require('dotenv').config();

console.log('🔍 Debugging Environment Variables...\n');

console.log('📁 Current working directory:', process.cwd());
console.log('📄 Looking for .env file at:', process.cwd() + '/.env');

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found!\n');

    // Read and show .env contents (safely)
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    console.log('📋 Environment variables in .env file:');
    lines.forEach(line => {
        const [key] = line.split('=');
        if (key) {
            console.log(`   ${key}=${process.env[key] ? '[SET]' : '[NOT SET]'}`);
        }
    });
} else {
    console.log('❌ .env file NOT found!');
    console.log('💡 Please create a .env file with your Supabase credentials.\n');
}

console.log('\n🔧 Current environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET - length: ' + process.env.DATABASE_URL.length + ']' : '[NOT SET]');
console.log('DB_HOST:', process.env.DB_HOST || '[NOT SET]');
console.log('DB_PORT:', process.env.DB_PORT || '[NOT SET]');
console.log('DB_NAME:', process.env.DB_NAME || '[NOT SET]');
console.log('DB_USER:', process.env.DB_USER || '[NOT SET]');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');

if (process.env.DATABASE_URL) {
    console.log('\n🔗 DATABASE_URL format check:');
    console.log('First 50 characters:', process.env.DATABASE_URL.substring(0, 50) + '...');

    // Check if it looks like a Supabase URL
    if (process.env.DATABASE_URL.includes('supabase.com')) {
        console.log('✅ Looks like a Supabase URL');
    } else if (process.env.DATABASE_URL.includes('postgresql://')) {
        console.log('⚠️  PostgreSQL URL but not Supabase - might be correct');
    } else {
        console.log('❌ Does not look like a valid PostgreSQL URL');
    }
} else {
    console.log('\n❌ DATABASE_URL is not set!');
    console.log('\n💡 Your .env file should contain:');
    console.log('DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres');
}

console.log('\n📝 Next steps:');
console.log('1. Create/update your .env file with the correct DATABASE_URL from Supabase');
console.log('2. Make sure the .env file is in the backend/ directory');
console.log('3. Run this script again to verify the variables are loaded');