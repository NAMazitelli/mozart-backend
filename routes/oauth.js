const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ======================
// GOOGLE OAUTH ROUTES
// ======================

// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create session record
      const { query } = require('../config/database');
      await query(
        `INSERT INTO user_sessions (user_id, jwt_token, expires_at, created_at)
         VALUES ($1, $2, $3, $4)`,
        [
          user.id,
          token,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          new Date()
        ]
      );

      // For mobile app, you might want to use a custom scheme redirect
      // For web app, redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // Redirect to frontend with token as query parameter
      res.redirect(`${frontendUrl}/auth/success?token=${token}&provider=google`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/error?message=oauth_error`);
    }
  }
);

// ======================
// FACEBOOK OAUTH ROUTES
// ======================

// Initiate Facebook OAuth login
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}));

// Facebook OAuth callback
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create session record
      const { query } = require('../config/database');
      await query(
        `INSERT INTO user_sessions (user_id, jwt_token, expires_at, created_at)
         VALUES ($1, $2, $3, $4)`,
        [
          user.id,
          token,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          new Date()
        ]
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/success?token=${token}&provider=facebook`);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/error?message=oauth_error`);
    }
  }
);

// ======================
// SOCIAL LOGIN STATUS
// ======================

// Get user's connected social accounts
router.get('/social-accounts', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { query } = require('../config/database');
    const result = await query(
      `SELECT provider, provider_email, provider_data, created_at, updated_at
       FROM social_logins
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({
      socialAccounts: result.rows
    });
  } catch (error) {
    console.error('Social accounts fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disconnect a social account
router.delete('/social-accounts/:provider', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const { query } = require('../config/database');

    // Check if user has other login methods (password or other social logins)
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.userId]
    );

    const socialLoginsResult = await query(
      'SELECT COUNT(*) as count FROM social_logins WHERE user_id = $1',
      [req.user.userId]
    );

    const hasPassword = userResult.rows[0]?.password_hash !== null;
    const socialLoginsCount = parseInt(socialLoginsResult.rows[0].count);

    // Don't allow disconnecting if it's the only login method
    if (!hasPassword && socialLoginsCount <= 1) {
      return res.status(400).json({
        error: 'Cannot disconnect the only login method. Please set a password first.'
      });
    }

    // Remove the social login
    const deleteResult = await query(
      'DELETE FROM social_logins WHERE user_id = $1 AND provider = $2',
      [req.user.userId, provider]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Social account not found' });
    }

    res.json({ message: `${provider} account disconnected successfully` });
  } catch (error) {
    console.error('Social account disconnect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;