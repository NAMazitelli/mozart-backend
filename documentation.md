# Music Learning & Theory App (Mozart)
*Inspired by Duolingo's gamified learning approach*

## Overview

This app is designed to help users learn and practice music theory and sound concepts in a gamified way, closely following the Duolingo user experience. It supports mobile-first design using Ionic, backed by a Node.js backend and a MySQL database.

## Core Features

### 1. Authentication Screen

**Login/Register Screen:**
- Input fields: Email, Password
- Buttons: Login, Register
- Optional: Login with Google/Apple
- Redirect to Main Menu upon success
- Backend: Node.js endpoint to authenticate/store user info

### 2. Main Menu

**Display Elements:**
- User greeting
- Current streak
- Current coin balance
- Last activity

**Category Grid/List:**
- Scales
- Notes, Harmonies, Intervals
- Equalizing
- Volumes
- Panning
- Reading Rhythms
- Reading Notes
- Reading Partitures

Each category opens a sub-menu of available exercise types.

### 3. Exercise Selection Menu

- Choose exercise type (e.g., "Guess the Note")
- Choose difficulty (Easy, Medium, Hard)
- Begin practice session

### 4. Exercise Flow Screen

**Features:**
- Randomized questions pulled from database

**UI Elements:**
- Audio player or visual element (e.g., waveform, notation)
- Interactive answers (multiple choice, sliders, piano/guitar pads)
- Feedback indicator (correct/incorrect)

**After each answer:**
- Update score
- Show explanation if incorrect
- Proceed to next or quit

**End of session:**
- Display final score
- Update streak
- Award coins (streak multiplier: x1 to x4)

### 5. Progress & Rewards System

**Track per-user data:**
- High Score (per category/difficulty)
- Longest Streak
- Coins

**Coins calculation:**
- Easy: 10 pts | Medium: 20 pts | Hard: 40 pts
- Multiplied by streak bonus

### 6. Settings Menu

- Language Selection: English, German, Spanish
- Sound Level: Master Volume slider (0% to 100%)
- Personal Info: Change email, password, username

## Exercise Types & Interactions

### Scales
- Guess the scale (after listening)
- Next note in scale
- Which scale is melody in?

### Notes, Harmonies, Intervals
- Guess the note
- Guess the chord
- Guess the interval

### Equalizing
- Identify filter shape (Bandpass, Notch, etc.)
- Guess frequency cut/boosted (graph + audio)

### Volumes
- Identify volume changes across tracks
- Estimate gain change in dBs

### Panning
- Guess left/right pan percentage
- Which tracks were panned

### Reading Rhythms
- Guess rhythm (notation -> audio match)
- Write rhythm (interactive notation pad)
- Play rhythm (metronome interface + tap)

### Reading Notes
- Play notes on piano or guitar UI
- Write the heard note (note input field)

### Reading Partitures
- Play small part on in-app piano
- Write melody heard via piano keys 
## Architecture

### Frontend
- **Framework**: Ionic Framework (Angular/React)
- **Design**: Mobile-first, responsive design
- **Styling**: Custom styling to match game feel (Duolingo-inspired)
- **Structure**: Component-based architecture
  - AuthPage
  - MenuPage
  - ExercisePage
  - SettingsPage

### Backend
- **Framework**: Node.js with Express
- **REST API Endpoints**:
  - `/auth/login` - User authentication
  - `/auth/register` - User registration
  - `/user/profile` - Get user profile data
  - `/user/update` - Update user information
  - `/exercise/fetch` - Fetch exercise questions
  - `/score/update` - Update user scores
  - `/stats/leaderboard` - Leaderboard data (future feature)

### Database (MySQL)

**Users Table:**
- `id` (Primary Key)
- `email`
- `password` (hashed)
- `username`
- `coins`
- `language`
- `created_at`
- `updated_at`

**Scores Table:**
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `category`
- `difficulty`
- `high_score`
- `current_streak`
- `longest_streak`
- `created_at`
- `updated_at`

**Exercises Table:**
- `id` (Primary Key)
- `category`
- `type`
- `difficulty`
- `question_data` (JSON)
- `answer_data` (JSON)
- `audio_file_path`
- `created_at`
- `updated_at`

## UI/UX Design Notes

### Design Aesthetic
- **Style**: Friendly, fun, colorful interface
- **Inspiration**: Similar to Duolingo with icons and progress paths
- **Colors**: Vibrant color scheme to maintain engagement

### Gamification Elements
- Daily login rewards
- Progress bars and completion indicators
- Achievement badges (future addition)
- Streak counters and multipliers
- Coin system with rewards

### Animations & Feedback
- Success animations (confetti, positive feedback)
- Error feedback (subtle vibration, visual indicators)
- Smooth transitions between screens
- Loading animations for audio content

## Technical Specifications

### Mobile Compatibility
- **iOS**: iOS 12+
- **Android**: Android 8.0+ (API level 26+)
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Audio Requirements
- **Formats**: MP3, WAV, OGG
- **Quality**: 44.1kHz, 16-bit minimum
- **Loading**: Progressive loading for large audio files
- **Playback**: Web Audio API for precise timing

### Performance Considerations
- **Offline Mode**: Cache exercises for offline practice
- **Data Usage**: Optimize audio compression
- **Battery**: Efficient audio playback to preserve battery life
- **Storage**: Local storage for user progress and cached content

## Development Workflow

### Setup Instructions
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up MySQL database
4. Configure environment variables
5. Run development server: `ionic serve`

### Testing Strategy
- **Unit Tests**: Jest for backend logic
- **E2E Tests**: Cypress for user workflows
- **Audio Testing**: Manual testing for audio accuracy
- **Device Testing**: Test on multiple devices and browsers

### Deployment
- **Frontend**: Deploy to app stores (iOS App Store, Google Play)
- **Backend**: Deploy to cloud service (AWS, Heroku, DigitalOcean)
- **Database**: Managed MySQL service (AWS RDS, Google Cloud SQL)

## Future Roadmap

### Phase 2 Features
- Leaderboards and social features
- Achievement system with badges
- User-generated exercises and community content
- Offline mode with syncing

### Phase 3 Features
- Expand instrument support (violin, drums, bass, etc.)
- Voice input for note recognition
- Advanced music theory concepts
- Collaborative learning features

### Long-term Vision
- AI-powered personalized learning paths
- Integration with real instruments via MIDI
- Virtual reality music experiences
- Professional music education partnerships

## Summary

This document outlines the comprehensive functional and architectural framework for Mozart, a music learning app that gamifies music theory education. The app balances technical excellence with user-centric design, providing a clear path for scalable implementation using modern mobile-first technologies. The Duolingo-inspired approach ensures high user engagement while delivering effective music education.
