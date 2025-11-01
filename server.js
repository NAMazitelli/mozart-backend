// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

// Import passport configuration AFTER dotenv
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const exerciseRoutes = require('./routes/exercise');
const oauthRoutes = require('./routes/oauth');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration - simplified and more permissive for debugging
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow requests from any origin in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, allow specific origins
    const allowedOrigins = [
      'https://mozart-frontend.vercel.app',
      'https://mozart-music-learning.vercel.app', // Add more possible Vercel URLs
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8100',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8100'
    ].filter(Boolean);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (origin === allowedOrigin) return true;
      // Also allow vercel.app subdomains
      if (origin.endsWith('.vercel.app') && allowedOrigins.some(allowed => allowed.includes('vercel.app'))) {
        return true;
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      // Don't throw error, just deny
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());

// Session configuration for OAuth
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/user', userRoutes);
app.use('/api/exercise', exerciseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mozart Music App API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});