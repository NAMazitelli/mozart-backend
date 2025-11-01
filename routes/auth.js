const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, username, fullName, age, gender } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user with PostgreSQL syntax
    const result = await query(
      `INSERT INTO users (email, password_hash, username, full_name, age, gender)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, full_name, age, gender, total_score, current_streak, longest_streak, language, created_at`,
      [email, hashedPassword, username, fullName || null, age || null, gender || null]
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create user preferences with defaults
    await query(
      'INSERT INTO user_preferences (user_id) VALUES ($1)',
      [newUser.id]
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.full_name,
        age: newUser.age,
        gender: newUser.gender,
        totalScore: newUser.total_score,
        currentStreak: newUser.current_streak,
        longestStreak: newUser.longest_streak,
        language: newUser.language,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user with PostgreSQL syntax
    const result = await query(
      `SELECT id, email, password_hash, username, full_name, age, gender,
              total_score, current_streak, longest_streak, language,
              total_exercises_completed, last_activity, status
       FROM users WHERE email = $1 AND status = 'active'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user has a password (not just social login)
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Please login using your social provider' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last activity
    await query(
      'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session token
    await query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        age: user.age,
        gender: user.gender,
        totalScore: user.total_score,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        totalExercisesCompleted: user.total_exercises_completed,
        language: user.language,
        lastActivity: user.last_activity
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Invalidate the session token
      await query(
        'UPDATE user_sessions SET is_active = FALSE WHERE session_token = $1',
        [token]
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Social login endpoint (Google, Facebook, Apple)
router.post('/social-login', async (req, res) => {
  try {
    const { provider, providerUserId, providerEmail, userData } = req.body;

    if (!provider || !providerUserId) {
      return res.status(400).json({ error: 'Provider and provider user ID are required' });
    }

    // Check if social login already exists
    const existingSocial = await query(
      'SELECT user_id FROM social_logins WHERE provider = $1 AND provider_user_id = $2',
      [provider, providerUserId]
    );

    let user;

    if (existingSocial.rows.length > 0) {
      // User exists, get their info
      const userResult = await query(
        `SELECT id, email, username, full_name, age, gender,
                total_score, current_streak, longest_streak, language,
                total_exercises_completed, last_activity
         FROM users WHERE id = $1 AND status = 'active'`,
        [existingSocial.rows[0].user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User account not found' });
      }

      user = userResult.rows[0];
    } else {
      // Create new user from social login
      const email = providerEmail || `${providerUserId}@${provider}.social`;
      const username = userData?.name || `${provider}_user_${providerUserId.slice(-6)}`;
      const fullName = userData?.name || null;

      const userResult = await query(
        `INSERT INTO users (email, username, full_name, email_verified)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username, full_name, total_score, current_streak, longest_streak, language, created_at`,
        [email, username, fullName, true] // Social logins are pre-verified
      );

      user = userResult.rows[0];

      // Create social login record
      await query(
        `INSERT INTO social_logins (user_id, provider, provider_user_id, provider_email, provider_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, provider, providerUserId, providerEmail, JSON.stringify(userData)]
      );

      // Create user preferences
      await query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [user.id]
      );
    }

    // Update last activity
    await query(
      'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session token
    await query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.json({
      message: 'Social login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        totalScore: user.total_score,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        totalExercisesCompleted: user.total_exercises_completed || 0,
        language: user.language
      }
    });
  } catch (error) {
    console.error('Social login error:', error);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;