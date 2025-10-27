require('dotenv').config();

const useMockDb = process.env.USE_MOCK_DB === 'true';

let db;

if (useMockDb) {
  console.log('🧪 Using mock database');
  db = require('./mockDatabase');
} else {
  console.log('🗄️  Using MySQL database');
  db = require('../config/database');
}

module.exports = db;