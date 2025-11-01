const express = require('express');
const db = require('../services/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/fetch', authenticateToken, async (req, res) => {
  try {
    const { category, type, difficulty } = req.query;

    if (!category || !difficulty) {
      return res.status(400).json({ error: 'Category and difficulty are required' });
    }

    let query = 'SELECT * FROM exercises WHERE category = ? AND difficulty = ?';
    const params = [category, difficulty];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY RAND() LIMIT 10';

    const [exercises] = await db.execute(query, params);

    res.json(exercises);
  } catch (error) {
    console.error('Exercise fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { category, difficulty, score, isCorrect } = req.body;

    if (!category || !difficulty || score === undefined || isCorrect === undefined) {
      return res.status(400).json({ error: 'Category, difficulty, score, and isCorrect are required' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [userResult] = await connection.execute(
        'SELECT current_streak, longest_streak, coins FROM users WHERE id = ?',
        [req.user.userId]
      );

      const user = userResult[0];
      let newStreak = isCorrect ? user.current_streak + 1 : 0;
      let newLongestStreak = Math.max(user.longest_streak, newStreak);

      const streakMultiplier = Math.min(Math.floor(newStreak / 5) + 1, 4);
      const baseCoins = { easy: 10, medium: 20, hard: 40 };
      const coinsEarned = isCorrect ? baseCoins[difficulty] * streakMultiplier : 0;
      const newCoins = user.coins + coinsEarned;

      await connection.execute(
        'UPDATE users SET current_streak = ?, longest_streak = ?, coins = ? WHERE id = ?',
        [newStreak, newLongestStreak, newCoins, req.user.userId]
      );

      await connection.execute(
        'INSERT INTO user_sessions (user_id, category, difficulty, score, coins_earned) VALUES (?, ?, ?, ?, ?)',
        [req.user.userId, category, difficulty, score, coinsEarned]
      );

      const [existingScore] = await connection.execute(
        'SELECT high_score FROM scores WHERE user_id = ? AND category = ? AND difficulty = ?',
        [req.user.userId, category, difficulty]
      );

      if (existingScore.length === 0) {
        await connection.execute(
          'INSERT INTO scores (user_id, category, difficulty, high_score) VALUES (?, ?, ?, ?)',
          [req.user.userId, category, difficulty, score]
        );
      } else if (score > existingScore[0].high_score) {
        await connection.execute(
          'UPDATE scores SET high_score = ? WHERE user_id = ? AND category = ? AND difficulty = ?',
          [score, req.user.userId, category, difficulty]
        );
      }

      await connection.commit();

      res.json({
        message: 'Exercise submitted successfully',
        coinsEarned,
        newStreak,
        newLongestStreak,
        totalCoins: newCoins,
        streakMultiplier
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Exercise submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Note definitions for different difficulty levels
const NOTES_EASY = [
  { name: 'C', frequency: 261.63, displayName: 'C' },
  { name: 'D', frequency: 293.66, displayName: 'D' },
  { name: 'E', frequency: 329.63, displayName: 'E' },
  { name: 'F', frequency: 349.23, displayName: 'F' },
  { name: 'G', frequency: 392.00, displayName: 'G' },
  { name: 'A', frequency: 440.00, displayName: 'A' },
  { name: 'B', frequency: 493.88, displayName: 'B' }
];

const NOTES_MEDIUM = [
  { name: 'C', frequency: 261.63, displayName: 'C' },
  { name: 'C#', frequency: 277.18, displayName: 'C#' },
  { name: 'D', frequency: 293.66, displayName: 'D' },
  { name: 'D#', frequency: 311.13, displayName: 'D#' },
  { name: 'E', frequency: 329.63, displayName: 'E' },
  { name: 'F', frequency: 349.23, displayName: 'F' },
  { name: 'F#', frequency: 369.99, displayName: 'F#' },
  { name: 'G', frequency: 392.00, displayName: 'G' },
  { name: 'G#', frequency: 415.30, displayName: 'G#' },
  { name: 'A', frequency: 440.00, displayName: 'A' },
  { name: 'A#', frequency: 466.16, displayName: 'A#' },
  { name: 'B', frequency: 493.88, displayName: 'B' }
];

const NOTES_HARD = [
  // Octave 3 (lower)
  { name: 'C3', frequency: 130.81, displayName: 'C (low)' },
  { name: 'C#3', frequency: 138.59, displayName: 'C# (low)' },
  { name: 'D3', frequency: 146.83, displayName: 'D (low)' },
  { name: 'D#3', frequency: 155.56, displayName: 'D# (low)' },
  { name: 'E3', frequency: 164.81, displayName: 'E (low)' },
  { name: 'F3', frequency: 174.61, displayName: 'F (low)' },
  { name: 'F#3', frequency: 185.00, displayName: 'F# (low)' },
  { name: 'G3', frequency: 196.00, displayName: 'G (low)' },
  { name: 'G#3', frequency: 207.65, displayName: 'G# (low)' },
  { name: 'A3', frequency: 220.00, displayName: 'A (low)' },
  { name: 'A#3', frequency: 233.08, displayName: 'A# (low)' },
  { name: 'B3', frequency: 246.94, displayName: 'B (low)' },

  // Octave 4 (middle)
  { name: 'C4', frequency: 261.63, displayName: 'C (mid)' },
  { name: 'C#4', frequency: 277.18, displayName: 'C# (mid)' },
  { name: 'D4', frequency: 293.66, displayName: 'D (mid)' },
  { name: 'D#4', frequency: 311.13, displayName: 'D# (mid)' },
  { name: 'E4', frequency: 329.63, displayName: 'E (mid)' },
  { name: 'F4', frequency: 349.23, displayName: 'F (mid)' },
  { name: 'F#4', frequency: 369.99, displayName: 'F# (mid)' },
  { name: 'G4', frequency: 392.00, displayName: 'G (mid)' },
  { name: 'G#4', frequency: 415.30, displayName: 'G# (mid)' },
  { name: 'A4', frequency: 440.00, displayName: 'A (mid)' },
  { name: 'A#4', frequency: 466.16, displayName: 'A# (mid)' },
  { name: 'B4', frequency: 493.88, displayName: 'B (mid)' },

  // Octave 5 (higher)
  { name: 'C5', frequency: 523.25, displayName: 'C (high)' },
  { name: 'C#5', frequency: 554.37, displayName: 'C# (high)' },
  { name: 'D5', frequency: 587.33, displayName: 'D (high)' },
  { name: 'D#5', frequency: 622.25, displayName: 'D# (high)' },
  { name: 'E5', frequency: 659.25, displayName: 'E (high)' },
  { name: 'F5', frequency: 698.46, displayName: 'F (high)' },
  { name: 'F#5', frequency: 739.99, displayName: 'F# (high)' },
  { name: 'G5', frequency: 783.99, displayName: 'G (high)' },
  { name: 'G#5', frequency: 830.61, displayName: 'G# (high)' },
  { name: 'A5', frequency: 880.00, displayName: 'A (high)' },
  { name: 'A#5', frequency: 932.33, displayName: 'A# (high)' },
  { name: 'B5', frequency: 987.77, displayName: 'B (high)' }
];

// Helper function to get notes based on difficulty
const getNotesByDifficulty = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return NOTES_EASY;
    case 'medium':
      return NOTES_MEDIUM;
    case 'hard':
      return NOTES_HARD;
    default:
      return NOTES_EASY;
  }
};

// Generate a random note exercise for "guess the note"
router.get('/guess-note', authenticateToken, async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;

    // Get appropriate note set based on difficulty
    const availableNotes = getNotesByDifficulty(difficulty);

    // Select a random note
    const correctNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];

    // Generate wrong options (ensure they're different from correct answer)
    const wrongOptions = [];
    const otherNotes = availableNotes.filter(note => note.name !== correctNote.name);

    // Shuffle and pick 2 wrong answers
    const shuffledWrong = otherNotes.sort(() => Math.random() - 0.5);
    wrongOptions.push(shuffledWrong[0], shuffledWrong[1]);

    // Create options array and shuffle
    const options = [correctNote, ...wrongOptions].sort(() => Math.random() - 0.5);

    // Find the correct answer index in the shuffled options
    const correctAnswerIndex = options.findIndex(option => option.name === correctNote.name);

    // Create difficulty-specific question text
    const questionTexts = {
      easy: 'Listen to the note and select the correct answer:',
      medium: 'Listen to the note (including sharps/flats) and select the correct answer:',
      hard: 'Listen to the note across different octaves and select the correct answer:'
    };

    const exercise = {
      id: `guess-note-${Date.now()}`,
      type: 'guess-note',
      category: 'notes',
      difficulty,
      question: questionTexts[difficulty] || questionTexts.easy,
      correctNote: {
        name: correctNote.name,
        frequency: correctNote.frequency,
        displayName: correctNote.displayName
      },
      options: options.map(option => ({
        name: option.name,
        displayName: option.displayName
      })),
      correctAnswerIndex,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 40,
      totalNotes: availableNotes.length,
      difficultyInfo: {
        easy: 'Natural notes only (C, D, E, F, G, A, B)',
        medium: 'Natural notes + sharps/flats (chromatic scale)',
        hard: 'Full chromatic scale across 3 octaves'
      }[difficulty]
    };

    res.json(exercise);
  } catch (error) {
    console.error('Guess note exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate answer for guess note exercise
router.post('/guess-note/validate', authenticateToken, async (req, res) => {
  try {
    const { exerciseId, selectedAnswerIndex, correctAnswerIndex } = req.body;

    if (selectedAnswerIndex === undefined || correctAnswerIndex === undefined) {
      return res.status(400).json({ error: 'Answer indices are required' });
    }

    const isCorrect = selectedAnswerIndex === correctAnswerIndex;

    res.json({
      isCorrect,
      message: isCorrect ? 'Correct! Well done!' : 'Not quite right. Try again!',
      explanation: isCorrect ? null : 'Listen carefully to the pitch and try to match it with the note names.'
    });
  } catch (error) {
    console.error('Answer validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sound types for panning exercise
const PANNING_SOUNDS = [
  { type: 'sine', frequency: 440, displayName: 'Pure Tone', description: 'Sine wave at 440Hz (A4)' },
  { type: 'square', frequency: 330, displayName: 'Electronic Tone', description: 'Square wave at 330Hz (E4)' },
  { type: 'triangle', frequency: 550, displayName: 'Soft Tone', description: 'Triangle wave at 550Hz (C#5)' }
];

// Generate a random panning exercise
router.get('/panning', authenticateToken, async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;

    // Generate random pan value from -1 (100% left) to 1 (100% right)
    let panValue;
    const soundType = PANNING_SOUNDS[Math.floor(Math.random() * PANNING_SOUNDS.length)];

    // Difficulty affects how extreme the panning can be
    switch (difficulty) {
      case 'easy':
        // Easy: Only use extreme positions (left, center, right)
        const easyPositions = [-1, 0, 1];
        panValue = easyPositions[Math.floor(Math.random() * easyPositions.length)];
        break;
      case 'medium':
        // Medium: Use quarter positions
        const mediumPositions = [-1, -0.5, 0, 0.5, 1];
        panValue = mediumPositions[Math.floor(Math.random() * mediumPositions.length)];
        break;
      case 'hard':
        // Hard: Any position with 0.1 precision
        panValue = Math.round((Math.random() * 2 - 1) * 10) / 10;
        break;
      default:
        panValue = 0;
    }

    // Convert pan value to percentage for display
    const panPercentage = Math.round(panValue * 100);
    const panDescription = panValue < -0.1 ? `${Math.abs(panPercentage)}% Left` :
                          panValue > 0.1 ? `${panPercentage}% Right` : 'Center';

    const exercise = {
      id: `panning-${Date.now()}`,
      type: 'panning',
      category: 'panning',
      difficulty,
      question: 'Listen to the sound and adjust the slider to match the panning position:',
      sound: {
        type: soundType.type,
        frequency: soundType.frequency,
        displayName: soundType.displayName,
        description: soundType.description
      },
      correctPanValue: panValue,
      correctPanPercentage: panPercentage,
      panDescription: panDescription,
      points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40,
      tolerance: difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.15 : 0.1,
      difficultyInfo: {
        easy: 'Only left, center, or right positions',
        medium: 'Quarter positions (L, L/2, C, R/2, R)',
        hard: 'Any position with fine precision'
      }[difficulty]
    };

    res.json(exercise);
  } catch (error) {
    console.error('Panning exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate panning exercise answer
router.post('/panning/validate', authenticateToken, async (req, res) => {
  try {
    const { exerciseId, userPanValue, correctPanValue, tolerance } = req.body;

    if (userPanValue === undefined || correctPanValue === undefined || tolerance === undefined) {
      return res.status(400).json({ error: 'Pan values and tolerance are required' });
    }

    const difference = Math.abs(userPanValue - correctPanValue);
    const isCorrect = difference <= tolerance;

    // Calculate accuracy percentage
    const accuracy = Math.max(0, Math.round((1 - difference / 2) * 100));

    let message;
    if (isCorrect) {
      message = accuracy >= 95 ? 'Perfect! Excellent ear!' :
                accuracy >= 80 ? 'Great job! Very close!' : 'Correct! Well done!';
    } else {
      message = difference <= 0.3 ? 'Close! Try to listen more carefully to the stereo position.' :
                'Not quite right. Focus on which ear hears the sound more prominently.';
    }

    const userPercentage = Math.round(userPanValue * 100);
    const correctPercentage = Math.round(correctPanValue * 100);

    res.json({
      isCorrect,
      message,
      accuracy,
      userPanValue,
      correctPanValue,
      userPercentage,
      correctPercentage,
      difference: Math.round(difference * 100),
      explanation: isCorrect ?
        `You guessed ${userPercentage >= 0 ? userPercentage + '% Right' : Math.abs(userPercentage) + '% Left'}. The correct answer was ${correctPercentage >= 0 ? correctPercentage + '% Right' : Math.abs(correctPercentage) + '% Left'}.` :
        `The sound was panned ${correctPercentage >= 0 ? correctPercentage + '% to the right' : Math.abs(correctPercentage) + '% to the left'}. Try focusing on which ear hears it more prominently.`
    });
  } catch (error) {
    console.error('Panning validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notes for volume exercise
const VOLUME_NOTES = [
  { note: 'C4', frequency: 261.63, displayName: 'C4' },
  { note: 'D4', frequency: 293.66, displayName: 'D4' },
  { note: 'E4', frequency: 329.63, displayName: 'E4' },
  { note: 'F4', frequency: 349.23, displayName: 'F4' },
  { note: 'G4', frequency: 392.00, displayName: 'G4' },
  { note: 'A4', frequency: 440.00, displayName: 'A4' },
  { note: 'B4', frequency: 493.88, displayName: 'B4' }
];

// Generate a random volume exercise
router.get('/volumes', authenticateToken, async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;

    // Select a random note
    const selectedNote = VOLUME_NOTES[Math.floor(Math.random() * VOLUME_NOTES.length)];

    // Generate volume difference based on difficulty (in dB)
    let volumeDifference;
    let tolerance;

    switch (difficulty) {
      case 'easy':
        // Easy: Large differences (6-20 dB), wide tolerance
        volumeDifference = Math.round((Math.random() * 14 + 6) * (Math.random() < 0.5 ? -1 : 1));
        tolerance = 4; // ±4 dB tolerance
        break;
      case 'medium':
        // Medium: Medium differences (3-12 dB), medium tolerance
        volumeDifference = Math.round((Math.random() * 9 + 3) * (Math.random() < 0.5 ? -1 : 1));
        tolerance = 2.5; // ±2.5 dB tolerance
        break;
      case 'hard':
        // Hard: Small differences (1-8 dB), tight tolerance
        volumeDifference = Math.round((Math.random() * 7 + 1) * (Math.random() < 0.5 ? -1 : 1));
        tolerance = 1.5; // ±1.5 dB tolerance
        break;
      default:
        volumeDifference = 6;
        tolerance = 4;
    }

    // Convert dB to linear gain values for Web Audio API
    // Reference volume (first note) is 0.3 (comfortable listening level)
    const referenceGain = 0.3;
    const secondGain = referenceGain * Math.pow(10, volumeDifference / 20);

    const exercise = {
      id: `volumes-${Date.now()}`,
      type: 'volumes',
      category: 'volumes',
      difficulty,
      question: 'Listen to both notes and guess the volume difference in dB:',
      note: {
        frequency: selectedNote.frequency,
        displayName: selectedNote.displayName
      },
      referenceGain,
      secondGain: Math.min(1.0, Math.max(0.01, secondGain)), // Clamp between 0.01 and 1.0
      volumeDifference, // in dB
      tolerance,
      points: difficulty === 'easy' ? 12 : difficulty === 'medium' ? 22 : 35,
      difficultyInfo: {
        easy: 'Large volume differences (6-20 dB), ±4 dB tolerance',
        medium: 'Medium volume differences (3-12 dB), ±2.5 dB tolerance',
        hard: 'Small volume differences (1-8 dB), ±1.5 dB tolerance'
      }[difficulty],
      volumeDescription: volumeDifference > 0 ?
        `Second note is ${volumeDifference} dB louder` :
        volumeDifference < 0 ?
        `Second note is ${Math.abs(volumeDifference)} dB quieter` :
        'Both notes have the same volume'
    };

    res.json(exercise);
  } catch (error) {
    console.error('Volume exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate volume exercise answer
router.post('/volumes/validate', authenticateToken, async (req, res) => {
  try {
    const { exerciseId, userVolumeDifference, correctVolumeDifference, tolerance } = req.body;

    if (userVolumeDifference === undefined || correctVolumeDifference === undefined || tolerance === undefined) {
      return res.status(400).json({ error: 'Volume difference and tolerance are required' });
    }

    const difference = Math.abs(userVolumeDifference - correctVolumeDifference);
    const isCorrect = difference <= tolerance;

    // Calculate accuracy percentage
    const maxDifference = 20; // Maximum possible difference in dB
    const accuracy = Math.max(0, Math.round((1 - difference / maxDifference) * 100));

    let message;
    if (isCorrect) {
      message = accuracy >= 95 ? 'Perfect! Excellent dynamic range perception!' :
                accuracy >= 85 ? 'Great job! Very good ear for volume differences!' :
                'Correct! Well done!';
    } else {
      message = difference <= tolerance * 1.5 ?
        'Close! Try to focus on the relative loudness between the two notes.' :
        'Not quite right. Listen carefully to which note sounds louder or quieter.';
    }

    res.json({
      isCorrect,
      message,
      accuracy,
      userVolumeDifference,
      correctVolumeDifference,
      difference: Math.round(difference * 10) / 10, // Round to 1 decimal
      explanation: isCorrect ?
        `You guessed ${userVolumeDifference > 0 ? '+' : ''}${userVolumeDifference} dB. The correct answer was ${correctVolumeDifference > 0 ? '+' : ''}${correctVolumeDifference} dB.` :
        `The second note was ${correctVolumeDifference > 0 ? correctVolumeDifference + ' dB louder' : correctVolumeDifference < 0 ? Math.abs(correctVolumeDifference) + ' dB quieter' : 'the same volume'} than the first note.`
    });
  } catch (error) {
    console.error('Volume validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Frequency ranges for equalizing exercise
const EQ_FREQUENCY_RANGES = [
  {
    id: 'bass',
    name: 'Bass',
    frequency: 80,
    displayName: 'Bass (60-120 Hz)',
    description: 'Low frequency content, sub-bass and bass fundamentals'
  },
  {
    id: 'low-mid',
    name: 'Low-Mid',
    frequency: 250,
    displayName: 'Low-Mid (200-400 Hz)',
    description: 'Lower midrange, warmth and body of instruments'
  },
  {
    id: 'mid',
    name: 'Mid',
    frequency: 1000,
    displayName: 'Mid (800-1.5k Hz)',
    description: 'Midrange, vocal presence and instrument definition'
  },
  {
    id: 'high-mid',
    name: 'High-Mid',
    frequency: 3000,
    displayName: 'High-Mid (2-5k Hz)',
    description: 'Upper midrange, clarity and presence'
  },
  {
    id: 'treble',
    name: 'Treble',
    frequency: 8000,
    displayName: 'Treble (6-12k Hz)',
    description: 'High frequencies, brightness and air'
  }
];

// Sound types with rich harmonic content for EQ exercises
const EQ_SOUNDS = [
  { type: 'sawtooth', frequency: 220, displayName: 'Rich Harmonic Tone', description: 'Sawtooth wave with full frequency spectrum' },
  { type: 'square', frequency: 330, displayName: 'Square Wave Tone', description: 'Square wave with odd harmonics' },
  { type: 'triangle', frequency: 440, displayName: 'Triangle Wave Tone', description: 'Triangle wave with softer harmonics' }
];

// Generate a random equalizing exercise
router.get('/equalizing', authenticateToken, async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;

    // Select random sound type
    const soundType = EQ_SOUNDS[Math.floor(Math.random() * EQ_SOUNDS.length)];

    // Generate random target frequency between 50 and 2000 Hz
    const targetFrequency = Math.round(Math.random() * (2000 - 50) + 50);

    // Generate EQ settings based on difficulty
    let eqGainDb, tolerance;
    const isBoost = Math.random() < 0.5; // Random boost or cut

    switch (difficulty) {
      case 'easy':
        // Easy: Large EQ changes (6-12 dB), wide tolerance
        eqGainDb = (Math.random() * 6 + 6) * (isBoost ? 1 : -1);
        tolerance = 200; // ±200 Hz tolerance
        break;
      case 'medium':
        // Medium: Moderate EQ changes (3-8 dB), medium tolerance
        eqGainDb = (Math.random() * 5 + 3) * (isBoost ? 1 : -1);
        tolerance = 150; // ±150 Hz tolerance
        break;
      case 'hard':
        // Hard: Subtle EQ changes (1-5 dB), tight tolerance
        eqGainDb = (Math.random() * 4 + 1) * (isBoost ? 1 : -1);
        tolerance = 100; // ±100 Hz tolerance
        break;
      default:
        eqGainDb = 6;
        tolerance = 200;
    }

    eqGainDb = Math.round(eqGainDb * 10) / 10; // Round to 1 decimal

    const exercise = {
      id: `equalizing-${Date.now()}`,
      type: 'equalizing',
      category: 'equalizing',
      difficulty,
      question: 'Listen to both sounds and adjust the slider to the frequency that was boosted or cut:',
      sound: {
        type: soundType.type,
        frequency: soundType.frequency,
        displayName: soundType.displayName,
        description: soundType.description
      },
      targetFrequency,
      eqGainDb,
      isBoost,
      tolerance,
      qFactor: 2.0, // Q factor for EQ filter
      points: difficulty === 'easy' ? 18 : difficulty === 'medium' ? 28 : 45,
      difficultyInfo: {
        easy: 'Large EQ changes (6-12 dB), ±200 Hz tolerance',
        medium: 'Moderate EQ changes (3-8 dB), ±150 Hz tolerance',
        hard: 'Subtle EQ changes (1-5 dB), ±100 Hz tolerance'
      }[difficulty],
      eqDescription: `${targetFrequency} Hz ${isBoost ? 'boosted' : 'cut'} by ${Math.abs(eqGainDb)} dB`
    };

    res.json(exercise);
  } catch (error) {
    console.error('Equalizing exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate equalizing exercise answer
router.post('/equalizing/validate', authenticateToken, async (req, res) => {
  try {
    const { exerciseId, userFrequency, correctFrequency, tolerance } = req.body;

    if (userFrequency === undefined || correctFrequency === undefined || tolerance === undefined) {
      return res.status(400).json({ error: 'Frequencies and tolerance are required' });
    }

    const difference = Math.abs(userFrequency - correctFrequency);
    const isCorrect = difference <= tolerance;

    // Calculate accuracy percentage based on how close the guess was
    const maxDifference = 2000; // Maximum possible difference in Hz
    const accuracy = Math.max(0, Math.round((1 - difference / maxDifference) * 100));

    let message;
    if (isCorrect) {
      message = accuracy >= 95 ? 'Perfect! Excellent frequency discrimination!' :
                accuracy >= 85 ? 'Great job! Very good ear for EQ changes!' :
                'Correct! Well done!';
    } else {
      message = difference <= tolerance * 1.5 ?
        'Close! Try to focus on which part of the frequency spectrum sounds different.' :
        'Not quite right. Listen carefully to identify which frequencies were affected.';
    }

    res.json({
      isCorrect,
      message,
      accuracy,
      userFrequency,
      correctFrequency,
      difference: Math.round(difference),
      tolerance,
      acceptanceRangeMin: correctFrequency - tolerance,
      acceptanceRangeMax: correctFrequency + tolerance,
      explanation: isCorrect ?
        `You guessed ${userFrequency} Hz. The correct answer was ${correctFrequency} Hz.` :
        `The EQ change was at ${correctFrequency} Hz. Your guess of ${userFrequency} Hz was ${Math.round(difference)} Hz away.`
    });
  } catch (error) {
    console.error('Equalizing validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Piano notes for intervals exercise (1 octave)
const PIANO_NOTES = [
  { note: 'C4', frequency: 261.63, displayName: 'C', isBlack: false },
  { note: 'C#4', frequency: 277.18, displayName: 'C#', isBlack: true },
  { note: 'D4', frequency: 293.66, displayName: 'D', isBlack: false },
  { note: 'D#4', frequency: 311.13, displayName: 'D#', isBlack: true },
  { note: 'E4', frequency: 329.63, displayName: 'E', isBlack: false },
  { note: 'F4', frequency: 349.23, displayName: 'F', isBlack: false },
  { note: 'F#4', frequency: 369.99, displayName: 'F#', isBlack: true },
  { note: 'G4', frequency: 392.00, displayName: 'G', isBlack: false },
  { note: 'G#4', frequency: 415.30, displayName: 'G#', isBlack: true },
  { note: 'A4', frequency: 440.00, displayName: 'A', isBlack: false },
  { note: 'A#4', frequency: 466.16, displayName: 'A#', isBlack: true },
  { note: 'B4', frequency: 493.88, displayName: 'B', isBlack: false }
];

// Generate a random intervals exercise
router.get('/intervals', authenticateToken, async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;

    // Determine number of notes based on difficulty
    let noteCount;
    switch (difficulty) {
      case 'easy':
        noteCount = 2;
        break;
      case 'medium':
        noteCount = 3;
        break;
      case 'hard':
        noteCount = 5;
        break;
      default:
        noteCount = 2;
    }

    // Generate random sequence of notes
    const sequence = [];
    for (let i = 0; i < noteCount; i++) {
      const randomNote = PIANO_NOTES[Math.floor(Math.random() * PIANO_NOTES.length)];
      sequence.push({
        note: randomNote.note,
        frequency: randomNote.frequency,
        displayName: randomNote.displayName,
        isBlack: randomNote.isBlack
      });
    }

    const exercise = {
      id: `intervals-${Date.now()}`,
      type: 'intervals',
      category: 'intervals',
      difficulty,
      question: `Listen to the sequence of ${noteCount} notes and replay them on the piano:`,
      sequence,
      noteCount,
      points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40,
      difficultyInfo: {
        easy: 'Replay 2 notes in sequence',
        medium: 'Replay 3 notes in sequence',
        hard: 'Replay 5 notes in sequence'
      }[difficulty],
      pianoNotes: PIANO_NOTES
    };

    res.json(exercise);
  } catch (error) {
    console.error('Intervals exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate intervals exercise answer
router.post('/intervals/validate', authenticateToken, async (req, res) => {
  try {
    const { exerciseId, userSequence, correctSequence } = req.body;

    if (!userSequence || !correctSequence || userSequence.length !== correctSequence.length) {
      return res.status(400).json({ error: 'Invalid sequence data' });
    }

    // Check if sequences match exactly
    let correctCount = 0;
    const isCorrect = userSequence.length === correctSequence.length &&
                     userSequence.every((userNote, index) => {
                       const matches = userNote === correctSequence[index];
                       if (matches) correctCount++;
                       return matches;
                     });

    // Calculate accuracy percentage
    const accuracy = Math.round((correctCount / correctSequence.length) * 100);

    let message;
    if (isCorrect) {
      message = accuracy === 100 ? 'Perfect! Excellent musical memory!' :
                'Correct sequence! Well done!';
    } else {
      message = correctCount >= correctSequence.length / 2 ?
        'Close! Some notes were correct. Try listening more carefully.' :
        'Not quite right. Focus on each note and try to remember the sequence.';
    }

    res.json({
      isCorrect,
      message,
      accuracy,
      correctCount,
      totalNotes: correctSequence.length,
      userSequence,
      correctSequence,
      explanation: isCorrect ?
        `You played the correct sequence: ${correctSequence.join(' → ')}.` :
        `The correct sequence was: ${correctSequence.join(' → ')}. You played: ${userSequence.join(' → ')}.`
    });
  } catch (error) {
    console.error('Intervals validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate a random harmonies exercise
router.get('/harmonies', authenticateToken, async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;

    // Determine number of notes based on difficulty
    let noteCount;
    switch (difficulty) {
      case 'easy':
        noteCount = 2;
        break;
      case 'medium':
        noteCount = 3;
        break;
      case 'hard':
        noteCount = 4;
        break;
      default:
        noteCount = 2;
    }

    // Generate random chord (ensure no duplicate notes)
    const chord = [];
    const usedNotes = new Set();

    while (chord.length < noteCount) {
      const randomNote = PIANO_NOTES[Math.floor(Math.random() * PIANO_NOTES.length)];
      if (!usedNotes.has(randomNote.note)) {
        chord.push({
          note: randomNote.note,
          frequency: randomNote.frequency,
          displayName: randomNote.displayName,
          isBlack: randomNote.isBlack
        });
        usedNotes.add(randomNote.note);
      }
    }

    // Sort chord by frequency for better sound
    chord.sort((a, b) => a.frequency - b.frequency);

    const exercise = {
      id: `harmonies-${Date.now()}`,
      type: 'harmonies',
      category: 'harmonies',
      difficulty,
      question: `Listen to the chord and identify all ${noteCount} notes played simultaneously:`,
      chord,
      noteCount,
      points: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 45,
      difficultyInfo: {
        easy: 'Identify 2 notes played together',
        medium: 'Identify 3 notes played together',
        hard: 'Identify 4 notes played together'
      }[difficulty],
      pianoNotes: PIANO_NOTES
    };

    res.json(exercise);
  } catch (error) {
    console.error('Harmonies exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate harmonies exercise answer
router.post('/harmonies/validate', authenticateToken, async (req, res) => {
  try {
    const { exerciseId, userNotes, correctNotes } = req.body;

    if (!userNotes || !correctNotes || userNotes.length !== correctNotes.length) {
      return res.status(400).json({ error: 'Invalid notes data' });
    }

    // Sort both arrays for comparison
    const sortedUserNotes = [...userNotes].sort();
    const sortedCorrectNotes = [...correctNotes].sort();

    // Check how many notes match
    let correctCount = 0;
    const matchedNotes = [];

    sortedCorrectNotes.forEach(correctNote => {
      if (sortedUserNotes.includes(correctNote)) {
        correctCount++;
        matchedNotes.push(correctNote);
      }
    });

    // Check for extra notes (penalty for false positives)
    const extraNotes = sortedUserNotes.filter(note => !sortedCorrectNotes.includes(note));
    const hasExtraNotes = extraNotes.length > 0;

    // Determine if correct (all notes found, no extra notes)
    const isCorrect = correctCount === correctNotes.length && !hasExtraNotes;

    // Calculate accuracy percentage
    const accuracy = Math.round((correctCount / correctNotes.length) * 100);

    let message;
    if (isCorrect) {
      message = accuracy === 100 ? 'Perfect! Excellent chord recognition!' :
                'Correct chord! Well done!';
    } else if (hasExtraNotes) {
      message = correctCount === correctNotes.length ?
        'Almost! You found all the right notes but selected some extra ones.' :
        'Not quite right. You selected some incorrect notes.';
    } else {
      message = correctCount >= correctNotes.length / 2 ?
        'Close! You found some notes. Try listening for all parts of the chord.' :
        'Not quite right. Listen carefully to identify all notes in the harmony.';
    }

    res.json({
      isCorrect,
      message,
      accuracy,
      correctCount,
      totalNotes: correctNotes.length,
      extraNotesCount: extraNotes.length,
      userNotes: sortedUserNotes,
      correctNotes: sortedCorrectNotes,
      matchedNotes,
      extraNotes,
      explanation: isCorrect ?
        `You correctly identified the chord: ${sortedCorrectNotes.join(' + ')}.` :
        `The correct chord was: ${sortedCorrectNotes.join(' + ')}. You selected: ${sortedUserNotes.join(' + ')}.`
    });
  } catch (error) {
    console.error('Harmonies validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = [
      // Available exercises first
      { id: 'notes', name: 'Notes', icon: '🎵', description: 'Identify individual notes and pitches' },
      { id: 'panning', name: 'Panning', icon: '🎧', description: 'Understand stereo placement' },
      { id: 'volumes', name: 'Volumes', icon: '🔊', description: 'Master volume and dynamics' },
      { id: 'equalizing', name: 'Equalizing', icon: '🎛️', description: 'Learn audio frequency shaping' },
      { id: 'intervals', name: 'Intervals', icon: '🎯', description: 'Practice note sequence memory' },
      { id: 'harmonies', name: 'Harmonies', icon: '🎶', description: 'Identify chord notes' },
      // Coming soon exercises at the bottom
      { id: 'scales', name: 'Scales', icon: '🎼', description: 'Learn different musical scales' },
      { id: 'rhythms', name: 'Reading Rhythms', icon: '🥁', description: 'Practice rhythm notation' },
      { id: 'reading_notes', name: 'Reading Notes', icon: '🎹', description: 'Learn to read sheet music' },
      { id: 'partitures', name: 'Reading Partitures', icon: '📜', description: 'Master full musical scores' }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;