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

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from any origin in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, allow specific origins or environment-configured origins
    const allowedOrigins = [
      'https://mozart-frontend.vercel.app',
      process.env.FRONTEND_URL, // Allow environment-configured frontend URL
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // In case frontend runs on 3000
      'http://localhost:8100', // Ionic serve default port
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8100'
    ].filter(Boolean); // Remove undefined values

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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