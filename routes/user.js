const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, username, full_name, age, gender, profile_picture_url,
              language, total_score, current_streak, longest_streak,
              total_exercises_completed, last_activity, created_at
       FROM users WHERE id = $1 AND status = 'active'`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get user preferences
    const preferencesResult = await query(
      'SELECT theme, master_volume, email_notifications, push_notifications FROM user_preferences WHERE user_id = $1',
      [req.user.userId]
    );

    const preferences = preferencesResult.rows[0] || {};

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      age: user.age,
      gender: user.gender,
      profilePictureUrl: user.profile_picture_url,
      language: user.language,
      totalScore: user.total_score,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      totalExercisesCompleted: user.total_exercises_completed,
      lastActivity: user.last_activity,
      createdAt: user.created_at,
      preferences: {
        theme: preferences.theme || 'light',
        masterVolume: preferences.master_volume || 100,
        emailNotifications: preferences.email_notifications !== false,
        pushNotifications: preferences.push_notifications !== false
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, fullName, age, gender, language, profilePictureUrl } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username) {
      updates.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount}`);
      values.push(fullName);
      paramCount++;
    }

    if (age !== undefined) {
      updates.push(`age = $${paramCount}`);
      values.push(age);
      paramCount++;
    }

    if (gender) {
      updates.push(`gender = $${paramCount}`);
      values.push(gender);
      paramCount++;
    }

    if (language && ['en', 'de', 'es'].includes(language)) {
      updates.push(`language = $${paramCount}`);
      values.push(language);
      paramCount++;
    }

    if (profilePictureUrl !== undefined) {
      updates.push(`profile_picture_url = $${paramCount}`);
      values.push(profilePictureUrl);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Username already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { theme, masterVolume, emailNotifications, pushNotifications, soundEffects, vibration } = req.body;

    await query(
      `INSERT INTO user_preferences (user_id, theme, master_volume, email_notifications, push_notifications, sound_effects, vibration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id)
       DO UPDATE SET
         theme = COALESCE($2, user_preferences.theme),
         master_volume = COALESCE($3, user_preferences.master_volume),
         email_notifications = COALESCE($4, user_preferences.email_notifications),
         push_notifications = COALESCE($5, user_preferences.push_notifications),
         sound_effects = COALESCE($6, user_preferences.sound_effects),
         vibration = COALESCE($7, user_preferences.vibration),
         updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, theme, masterVolume, emailNotifications, pushNotifications, soundEffects, vibration]
    );

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/scores', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT
         et.category,
         uea.difficulty,
         MAX(uea.score) as high_score,
         COUNT(*) as attempts_count,
         MIN(uea.time_taken_seconds) as best_time,
         MAX(uea.created_at) as last_attempted,
         ROUND(AVG(uea.accuracy), 1) as avg_accuracy
       FROM user_exercise_attempts uea
       JOIN exercise_types et ON uea.exercise_type_id = et.id
       WHERE uea.user_id = $1
       GROUP BY et.category, uea.difficulty
       ORDER BY et.category, uea.difficulty`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Scores fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get global leaderboard
router.get('/leaderboard/global', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT rank, username, full_name, total_score, longest_streak,
              total_attempts, total_correct, success_rate, average_accuracy
       FROM v_leaderboard_overall
       ORDER BY rank
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Global leaderboard fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exercise-specific leaderboard
router.get('/leaderboard/exercise/:exerciseType', async (req, res) => {
  try {
    const { exerciseType } = req.params;
    const { difficulty, limit = 50, offset = 0 } = req.query;

    let whereClause = 'WHERE exercise_type = $1';
    let params = [exerciseType];
    let paramCount = 2;

    if (difficulty) {
      whereClause += ` AND difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    const result = await query(
      `SELECT rank, username, full_name, exercise_type, difficulty,
              total_score, total_attempts, total_correct, success_rate,
              average_accuracy, longest_streak
       FROM v_leaderboard_by_exercise
       ${whereClause}
       ORDER BY rank
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Exercise leaderboard fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's leaderboard position
router.get('/leaderboard/position', authenticateToken, async (req, res) => {
  try {
    const { type, exerciseType, difficulty } = req.query;

    // First get the user's username to search in leaderboard views
    const userResult = await query('SELECT username FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const username = userResult.rows[0].username;

    if (type === 'global') {
      const result = await query(
        'SELECT rank FROM v_leaderboard_overall WHERE username = $1',
        [username]
      );

      res.json({
        rank: result.rows[0]?.rank || null,
        type: 'global'
      });
    } else if (type === 'exercise' && exerciseType) {
      let whereClause = 'WHERE username = $1 AND exercise_type = $2';
      let params = [username, exerciseType];

      if (difficulty) {
        whereClause += ' AND difficulty = $3';
        params.push(difficulty);
      }

      const result = await query(
        `SELECT rank FROM v_leaderboard_by_exercise ${whereClause}`,
        params
      );

      res.json({
        rank: result.rows[0]?.rank || null,
        type: 'exercise',
        exerciseType,
        difficulty: difficulty || 'all'
      });
    } else {
      res.status(400).json({ error: 'Invalid leaderboard type or missing parameters' });
    }
  } catch (error) {
    console.error('Leaderboard position fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get friends leaderboard (if user has friends)
router.get('/leaderboard/friends', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.total_score, u.current_streak,
              u.total_exercises_completed, u.last_activity
       FROM users u
       INNER JOIN user_friends uf ON (uf.friend_id = u.id OR uf.user_id = u.id)
       WHERE (uf.user_id = $1 OR uf.friend_id = $1)
       AND u.id != $1
       AND uf.status = 'accepted'
       AND u.status = 'active'
       ORDER BY u.total_score DESC
       LIMIT 50`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Friends leaderboard fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;