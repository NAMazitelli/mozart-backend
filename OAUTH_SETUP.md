# OAuth Social Login Setup Guide

This guide explains how to configure Google and Facebook OAuth for the Mozart Music Learning App.

## ✅ What's Already Implemented

The backend now includes complete OAuth integration:

- **Google OAuth Strategy** - `/api/auth/google` and `/api/auth/google/callback`
- **Facebook OAuth Strategy** - `/api/auth/facebook` and `/api/auth/facebook/callback`
- **Social Login Management** - Connect/disconnect accounts, view connected accounts
- **Database Integration** - Social logins stored in `social_logins` table
- **JWT Token Generation** - Same token system as regular login

## 🔧 Required OAuth Provider Setup

### 1. Google OAuth Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Set Application type to "Web application"
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://your-domain.com/api/auth/google/callback` (production)

4. **Get Client ID and Secret**:
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file

### 2. Facebook OAuth Setup

1. **Create a Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App" > "Consumer" or "Business"

2. **Add Facebook Login Product**:
   - In your app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"

3. **Configure OAuth Settings**:
   - Go to Facebook Login > Settings
   - Add Valid OAuth Redirect URIs:
     - `http://localhost:3000/api/auth/facebook/callback` (development)
     - `https://your-domain.com/api/auth/facebook/callback` (production)

4. **Get App ID and Secret**:
   - Go to Settings > Basic
   - Copy the App ID and App Secret
   - Add them to your `.env` file

## 📁 Environment Variables

Update your `.env` file with the OAuth credentials:

```bash
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:5173
```

## 🚀 Available Endpoints

### OAuth Login Routes
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/facebook` - Initiate Facebook OAuth
- `GET /api/auth/facebook/callback` - Facebook OAuth callback

### Social Account Management
- `GET /api/auth/social-accounts` - Get user's connected social accounts
- `DELETE /api/auth/social-accounts/:provider` - Disconnect a social account

### Direct Social Login (for mobile apps)
- `POST /api/auth/social-login` - Login with social provider data

## 📱 Frontend Integration

### Web App Integration

```javascript
// Redirect to OAuth provider
window.location.href = 'http://localhost:3000/api/auth/google';

// Handle OAuth callback (frontend route)
// The callback will redirect to: /auth/success?token=JWT_TOKEN&provider=google
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const provider = urlParams.get('provider');

if (token) {
  localStorage.setItem('authToken', token);
  // Redirect to dashboard or home page
}
```

### Mobile App Integration

For mobile apps, use the direct social login endpoint:

```javascript
// After getting user data from Google/Facebook SDK
const socialLogin = await fetch('/api/auth/social-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'google', // or 'facebook'
    providerUserId: userData.id,
    providerEmail: userData.email,
    userData: {
      name: userData.name,
      picture: userData.picture
    }
  })
});

const result = await socialLogin.json();
const token = result.token;
```

## 🔒 Security Features

- **Account Linking**: If a user signs up with email then later uses OAuth with the same email, accounts are automatically linked
- **Duplicate Prevention**: Users cannot create multiple accounts with the same social provider
- **Session Management**: OAuth logins create the same JWT tokens as regular login
- **Account Disconnection**: Users can disconnect social accounts (but not if it's their only login method)

## 🗃️ Database Schema

Social logins are stored in the `social_logins` table:

```sql
CREATE TABLE social_logins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  provider social_provider NOT NULL, -- 'google', 'facebook', 'apple'
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  provider_data JSONB, -- Stores name, picture, access_token, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ✅ Testing

The OAuth integration includes comprehensive tests:

```bash
# Test OAuth endpoints
node test-oauth.js

# Test complete auth flow
node test-endpoints.js
```

## 🐛 Troubleshooting

### Common Issues:

1. **"OAuth provider not configured"** - Check that CLIENT_ID and CLIENT_SECRET are set in `.env`
2. **"Redirect URI mismatch"** - Ensure callback URLs match exactly in OAuth provider settings
3. **"Session errors"** - Verify session secret is set and cookies are working
4. **"Database errors"** - Check that social_logins table exists and has correct schema

### Development vs Production:

- **Development**: Use `http://localhost:3000` URLs
- **Production**: Use your actual domain with HTTPS
- Update OAuth provider settings when deploying
- Set `NODE_ENV=production` and `FRONTEND_URL` environment variables

The OAuth integration is now fully functional and ready for production use!