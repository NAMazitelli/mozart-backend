const express = require('express');
const db = require('../services/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, username, language, coins, current_streak, longest_streak FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      coins: user.coins,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      language: user.language
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { username, language } = req.body;
    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }

    if (language && ['en', 'de', 'es'].includes(language)) {
      updates.push('language = ?');
      values.push(language);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.user.userId);
    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/scores', authenticateToken, async (req, res) => {
  try {
    const [scores] = await db.execute(
      'SELECT category, difficulty, high_score FROM scores WHERE user_id = ? ORDER BY category, difficulty',
      [req.user.userId]
    );

    res.json(scores);
  } catch (error) {
    console.error('Scores fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;