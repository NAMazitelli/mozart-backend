# 🧪 Mock Database System

The Mozart Music App backend now includes a complete mock database system that allows you to run the application without needing a MySQL database connection.

## 🔧 How to Enable Mock Database

### Option 1: Environment Variable
Set `USE_MOCK_DB=true` in your `.env` file:

```env
USE_MOCK_DB=true
```

### Option 2: Command Line
```bash
USE_MOCK_DB=true npm run dev
```

## 📁 Mock Data Structure

The mock database includes realistic data for all tables:

### Users (3 test users)
- **test@mozart.com** (password: `password123`)
  - Username: TestUser
  - Coins: 150
  - Current Streak: 5
  - Longest Streak: 12

- **demo@mozart.com** (password: `password123`)
  - Username: DemoUser
  - Coins: 300
  - Current Streak: 8
  - Longest Streak: 15

- **student@mozart.com** (password: `password123`)
  - Username: StudentUser
  - Coins: 75
  - Current Streak: 2
  - Longest Streak: 6

### Exercises (13 exercises total)
- **Scales**: 6 exercises (easy, medium, hard)
- **Notes**: 7 exercises (identify notes + intervals)
- Multiple difficulty levels with realistic audio file references

### Scores & Sessions
- Pre-populated high scores for testing
- Sample user sessions with coin earnings
- Realistic progression data

## 🎯 Mock Database Features

### ✅ Fully Functional
- **Authentication**: Login/register with JWT tokens
- **User Management**: Profile updates, language settings
- **Exercise System**: Fetch exercises by category/difficulty
- **Scoring**: Track high scores and streaks
- **Coin System**: Earn coins with streak multipliers
- **Session Tracking**: Complete exercise sessions

### ✅ Realistic Data
- Proper password hashing (bcrypt)
- JSON exercise data matching production format
- Authentic user statistics and progression
- Multiple languages and difficulty levels

### ✅ Development Benefits
- **No MySQL Required**: Run anywhere instantly
- **Consistent Data**: Same data every time
- **Fast Setup**: No database configuration
- **Easy Testing**: Predictable test scenarios

## 🚀 Getting Started

1. **Enable Mock Mode**:
   ```bash
   cd backend
   # Set USE_MOCK_DB=true in .env file
   ```

2. **Start Backend**:
   ```bash
   npm run dev
   ```

3. **Test Mock Database**:
   ```bash
   node test-mock.js
   ```

4. **Frontend Login**:
   - Email: `test@mozart.com`
   - Password: `password123`

## 📚 API Endpoints (All Working)

### Authentication
- `POST /api/auth/login` - Login with mock users
- `POST /api/auth/register` - Register new users (in-memory)

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/update` - Update username/language
- `GET /api/user/scores` - Get user high scores

### Exercises
- `GET /api/exercise/categories` - Get all categories
- `GET /api/exercise/fetch` - Fetch exercises by category/difficulty
- `POST /api/exercise/submit` - Submit answers and update scores

## 🔄 Switching Between Mock and MySQL

### For Development (Mock)
```env
USE_MOCK_DB=true
```

### For Production (MySQL)
```env
USE_MOCK_DB=false
# or remove the line entirely
```

## 🛠️ Technical Implementation

The mock database system includes:

- **MockDatabase Class** (`services/mockDatabase.js`): Simulates MySQL queries
- **Smart Query Parser**: Handles SELECT, INSERT, UPDATE operations
- **In-Memory Storage**: Persistent during app runtime
- **Realistic Responses**: Matches MySQL response format
- **Transaction Support**: Basic transaction simulation

## 📝 Available Test Data

### Sample Exercises
```javascript
// Scales - Easy
"Guess the scale after hearing C Major scale"
"Guess the scale after hearing G Major scale"

// Notes - Medium  
"Identify the note F# in audio"
"Identify the interval Minor 7th"

// And more...
```

### Sample Users for Testing
All users have password: `password123`
- Different coin amounts and streak levels
- Multiple languages (English, Spanish, German)
- Realistic progression data

## 🎉 Ready to Use!

The mock database system is now fully integrated and ready for development. No additional setup required - just enable the flag and start coding!

Perfect for:
- Development without database setup
- Testing and demonstrations
- Offline development
- Consistent testing scenarios