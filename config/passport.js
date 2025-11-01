const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { query } = require('./database');

// Google OAuth Strategy - only configure if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000/api'}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google account
    const existingSocialLogin = await query(
      'SELECT user_id FROM social_logins WHERE provider = $1 AND provider_user_id = $2',
      ['google', profile.id]
    );

    if (existingSocialLogin.rows.length > 0) {
      // User exists, get their full profile
      const userResult = await query(
        'SELECT * FROM users WHERE id = $1 AND status = $2',
        [existingSocialLogin.rows[0].user_id, 'active']
      );

      if (userResult.rows.length > 0) {
        return done(null, userResult.rows[0]);
      }
    }

    // Check if user exists with the same email
    const existingEmailUser = await query(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [profile.emails[0].value, 'active']
    );

    let user;
    if (existingEmailUser.rows.length > 0) {
      // Link this Google account to existing email user
      user = existingEmailUser.rows[0];

      await query(
        `INSERT INTO social_logins (user_id, provider, provider_user_id, provider_email, provider_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          'google',
          profile.id,
          profile.emails[0].value,
          JSON.stringify({
            name: profile.displayName,
            picture: profile.photos[0]?.value,
            accessToken: accessToken
          })
        ]
      );
    } else {
      // Create new user
      const username = profile.emails[0].value.split('@')[0] + '_' + Date.now();

      const newUserResult = await query(
        `INSERT INTO users (email, username, full_name, profile_picture_url, email_verified, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          profile.emails[0].value,
          username,
          profile.displayName,
          profile.photos[0]?.value || null,
          true, // Email is verified by Google
          'active'
        ]
      );

      user = newUserResult.rows[0];

      // Create user preferences
      await query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [user.id]
      );

      // Create social login record
      await query(
        `INSERT INTO social_logins (user_id, provider, provider_user_id, provider_email, provider_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          'google',
          profile.id,
          profile.emails[0].value,
          JSON.stringify({
            name: profile.displayName,
            picture: profile.photos[0]?.value,
            accessToken: accessToken
          })
        ]
      );
    }

    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
  }));
} else {
  console.log('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not found');
}

// Facebook OAuth Strategy - only configure if credentials are available
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000/api'}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'email', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Facebook account
    const existingSocialLogin = await query(
      'SELECT user_id FROM social_logins WHERE provider = $1 AND provider_user_id = $2',
      ['facebook', profile.id]
    );

    if (existingSocialLogin.rows.length > 0) {
      // User exists, get their full profile
      const userResult = await query(
        'SELECT * FROM users WHERE id = $1 AND status = $2',
        [existingSocialLogin.rows[0].user_id, 'active']
      );

      if (userResult.rows.length > 0) {
        return done(null, userResult.rows[0]);
      }
    }

    // Check if user exists with the same email (if email is provided)
    let user;
    if (profile.emails && profile.emails.length > 0) {
      const existingEmailUser = await query(
        'SELECT * FROM users WHERE email = $1 AND status = $2',
        [profile.emails[0].value, 'active']
      );

      if (existingEmailUser.rows.length > 0) {
        // Link this Facebook account to existing email user
        user = existingEmailUser.rows[0];

        await query(
          `INSERT INTO social_logins (user_id, provider, provider_user_id, provider_email, provider_data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            user.id,
            'facebook',
            profile.id,
            profile.emails[0]?.value || null,
            JSON.stringify({
              name: profile.displayName,
              picture: profile.photos[0]?.value,
              accessToken: accessToken
            })
          ]
        );

        return done(null, user);
      }
    }

    // Create new user
    const email = profile.emails?.[0]?.value || null;
    const username = email ?
      email.split('@')[0] + '_' + Date.now() :
      'fb_' + profile.id + '_' + Date.now();

    const newUserResult = await query(
      `INSERT INTO users (email, username, full_name, profile_picture_url, email_verified, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        email,
        username,
        profile.displayName,
        profile.photos[0]?.value || null,
        !!email, // Email verified if provided
        'active'
      ]
    );

    user = newUserResult.rows[0];

    // Create user preferences
    await query(
      'INSERT INTO user_preferences (user_id) VALUES ($1)',
      [user.id]
    );

    // Create social login record
    await query(
      `INSERT INTO social_logins (user_id, provider, provider_id, provider_email, provider_name, access_token)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        'facebook',
        profile.id,
        email,
        profile.displayName,
        accessToken
      ]
    );

    return done(null, user);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    return done(error, null);
  }
  }));
} else {
  console.log('Facebook OAuth not configured - FACEBOOK_APP_ID and FACEBOOK_APP_SECRET not found');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (result.rows.length > 0) {
      done(null, result.rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
