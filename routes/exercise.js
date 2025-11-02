const express = require('express');
const { query, getClient } = require('../config/database');
const { authenticateToken, authenticateTokenOrGuest } = require('../middleware/auth');
const router = express.Router();

console.log('🎹 Exercise routes loaded - EQ EXERCISE FIXED VERSION 4');

// ======================
// EXERCISE GENERATION ENDPOINTS
// ======================

// Get a new guess-note exercise
router.get('/guess-note/:difficulty', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    // Generate a random note based on difficulty
    const noteRanges = {
      easy: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'], // Natural notes only
      medium: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'], // With sharps/flats
      hard: ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
             'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
             'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'] // 3 octaves
    };

    const availableNotes = noteRanges[difficulty];
    const correctNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];

    // Generate frequency for the note (simplified - A4 = 440Hz)
    const noteFrequencies = {
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
    };

    // Generate wrong options
    const wrongOptions = availableNotes.filter(note => note !== correctNote);
    const shuffledWrong = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
    const allOptions = [correctNote, ...shuffledWrong].sort(() => 0.5 - Math.random());

    const correctAnswerIndex = allOptions.indexOf(correctNote);

    const exercise = {
      id: `guess-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'guess-note',
      category: 'guess-note',
      difficulty,
      question: `Listen to the note and select the correct answer:`,
      correctNote: {
        name: correctNote,
        frequency: noteFrequencies[correctNote],
        displayName: correctNote
      },
      options: allOptions.map(note => ({
        name: note,
        displayName: note
      })),
      correctAnswerIndex,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 35,
      totalNotes: 1,
      difficultyInfo: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level note identification`
    };

    res.json(exercise);
  } catch (error) {
    console.error('Guess note exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a new intervals exercise
router.get('/intervals/:difficulty', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const noteCounts = { easy: 2, medium: 3, hard: 5 };
    const noteCount = noteCounts[difficulty];

    // For sequence generation, use natural notes only to keep it simple
    const sequenceNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

    // For piano display, include all chromatic notes (natural + sharp/flat)
    const allPianoNotes = [
      'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'
    ];

    // Complete frequency mapping for all chromatic notes
    const noteFrequencies = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
      'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
      'A#4': 466.16, 'B4': 493.88
    };

    const sequence = [];

    for (let i = 0; i < noteCount; i++) {
      const note = sequenceNotes[Math.floor(Math.random() * sequenceNotes.length)];
      sequence.push({
        note: note,
        frequency: noteFrequencies[note],
        displayName: note,
        isBlack: note.includes('#')
      });
    }

    const exercise = {
      id: `intervals-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'intervals',
      category: 'intervals',
      difficulty,
      question: `Listen to the sequence and replay it in the correct order:`,
      sequence,
      noteCount,
      points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40,
      difficultyInfo: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level sequence memory`,
      pianoNotes: allPianoNotes.map(note => ({
        note: note,
        frequency: noteFrequencies[note],
        displayName: note,
        isBlack: note.includes('#')
      }))
    };

    // Debug: Log piano notes to see what we're sending
    console.log('Intervals - Piano notes being sent:');
    exercise.pianoNotes.forEach(note => {
      console.log(`  ${note.displayName}: ${note.isBlack ? 'BLACK' : 'WHITE'} key`);
    });

    res.json(exercise);
  } catch (error) {
    console.error('Intervals exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a new harmonies exercise
router.get('/harmonies/:difficulty', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const noteCounts = { easy: 2, medium: 3, hard: 4 };
    const noteCount = noteCounts[difficulty];

    // For chord generation, use natural notes only to keep harmony simple
    const baseNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

    // For piano display, include all chromatic notes (natural + sharp/flat)
    const allPianoNotes = [
      'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'
    ];

    // Complete frequency mapping for all chromatic notes
    const noteFrequencies = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
      'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
      'A#4': 466.16, 'B4': 493.88
    };

    const chord = [];

    // Generate a chord (simplified - just random notes for now)
    const usedNotes = new Set();
    while (chord.length < noteCount) {
      const note = baseNotes[Math.floor(Math.random() * baseNotes.length)];
      if (!usedNotes.has(note)) {
        usedNotes.add(note);
        chord.push({
          note: note,
          frequency: noteFrequencies[note],
          displayName: note,
          isBlack: false
        });
      }
    }

    const exercise = {
      id: `harmonies-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'harmonies',
      category: 'harmonies',
      difficulty,
      question: `Listen to the chord and identify all the notes:`,
      chord,
      noteCount,
      points: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40,
      difficultyInfo: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level chord identification`,
      pianoNotes: allPianoNotes.map(note => ({
        note: note,
        frequency: noteFrequencies[note],
        displayName: note,
        isBlack: note.includes('#')
      }))
    };

    res.json(exercise);
  } catch (error) {
    console.error('Harmonies exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get other exercise types (panning, volumes, equalizing)
router.get('/:category/:difficulty', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { category, difficulty } = req.params;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    if (!['panning', 'volumes', 'equalizing'].includes(category)) {
      return res.status(400).json({ error: 'Invalid exercise category' });
    }

    // Get exercise type info from database
    const exerciseTypeResult = await query(
      'SELECT * FROM exercise_types WHERE category = $1',
      [category]
    );

    if (exerciseTypeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise type not found' });
    }

    const exerciseType = exerciseTypeResult.rows[0];
    const pointsField = `points_${difficulty}`;
    const points = exerciseType[pointsField];

    let exercise = {
      id: `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: category,
      category,
      difficulty,
      points
    };

    // Generate exercise based on category
    switch (category) {
      case 'panning':
        const panValues = {
          easy: [-1, 0, 1], // Left, Center, Right
          medium: [-1, -0.5, 0, 0.5, 1], // Quarter positions
          hard: Array.from({length: 21}, (_, i) => (i - 10) / 10) // Fine precision
        };
        const availablePanValues = panValues[difficulty];
        const correctPanValue = availablePanValues[Math.floor(Math.random() * availablePanValues.length)];

        exercise = {
          ...exercise,
          question: 'Listen to the sound and identify its stereo position:',
          sound: { type: 'sine', frequency: 440, displayName: '440Hz Sine Wave' },
          correctPanValue,
          correctPanPercentage: Math.round((correctPanValue + 1) * 50),
          panDescription: correctPanValue === -1 ? 'Left' : correctPanValue === 0 ? 'Center' : correctPanValue === 1 ? 'Right' : `${Math.round(correctPanValue * 100)}% ${correctPanValue > 0 ? 'Right' : 'Left'}`,
          tolerance: difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.15 : 0.1,
          difficultyInfo: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level stereo positioning`
        };
        break;

      case 'volumes':
        const volumeDifferences = {
          easy: [-12, -9, -6, -3, 3, 6, 9, 12], // Large differences
          medium: [-8, -6, -4, -2, 2, 4, 6, 8], // Medium differences
          hard: [-4, -3, -2, -1, 1, 2, 3, 4] // Small differences
        };
        const availableVolumes = volumeDifferences[difficulty];
        const volumeDifference = availableVolumes[Math.floor(Math.random() * availableVolumes.length)];

        exercise = {
          ...exercise,
          question: 'Compare the two sounds and identify the volume difference:',
          note: { frequency: 440, displayName: 'A4' },
          referenceGain: 0,
          secondGain: volumeDifference,
          volumeDifference,
          tolerance: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 2.5 : 1.5,
          difficultyInfo: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level volume comparison`
        };
        break;

      case 'equalizing':
        const frequencies = {
          easy: [250, 500, 1000, 2000, 4000], // Standard frequencies
          medium: [125, 250, 500, 1000, 2000, 4000, 8000], // Extended range
          hard: [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] // Full range
        };
        const eqGains = {
          easy: [-12, -9, -6, 6, 9, 12], // Large changes
          medium: [-8, -6, -4, -3, 3, 4, 6, 8], // Moderate changes
          hard: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] // Subtle changes
        };

        const availableFreqs = frequencies[difficulty];
        const availableGains = eqGains[difficulty];
        const targetFrequency = availableFreqs[Math.floor(Math.random() * availableFreqs.length)];
        const eqGainDb = availableGains[Math.floor(Math.random() * availableGains.length)];

        exercise = {
          ...exercise,
          question: 'Listen to the EQ change and identify the frequency and gain:',
          sound: { type: 'sawtooth', frequency: 220, displayName: 'Sawtooth Wave' },
          targetFrequency,
          eqGainDb,
          isBoost: eqGainDb > 0,
          qFactor: 4.0, // Q factor for the peaking filter
          tolerance: difficulty === 'easy' ? 200 : difficulty === 'medium' ? 150 : 100,
          difficultyInfo: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level EQ identification`
        };
        break;
    }

    res.json(exercise);
  } catch (error) {
    console.error('Exercise generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// VALIDATION ENDPOINTS
// ======================

// Validate guess-note answer
router.post('/validate/guess-note', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { exerciseId, selectedAnswerIndex, correctAnswerIndex } = req.body;

    if (selectedAnswerIndex === undefined || correctAnswerIndex === undefined) {
      return res.status(400).json({ error: 'Selected answer index and correct answer index are required' });
    }

    const isCorrect = selectedAnswerIndex === correctAnswerIndex;
    const message = isCorrect ? 'Correct! Well done!' : 'Not quite right. Try again!';

    res.json({
      isCorrect,
      message,
      explanation: isCorrect ? null : 'Listen carefully to the pitch and try to match it with the note names.'
    });
  } catch (error) {
    console.error('Guess note validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate intervals answer
router.post('/validate/intervals', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { exerciseId, userSequence, correctSequence } = req.body;

    if (!userSequence || !correctSequence) {
      return res.status(400).json({ error: 'User sequence and correct sequence are required' });
    }

    // Compare sequences
    const isCorrect = JSON.stringify(userSequence) === JSON.stringify(correctSequence);
    const accuracy = calculateSequenceAccuracy(userSequence, correctSequence);

    const message = isCorrect ?
      'Perfect! You got the sequence exactly right!' :
      `Close! You got ${Math.round(accuracy)}% of the sequence correct.`;

    res.json({
      isCorrect,
      accuracy,
      message,
      userSequence,
      correctSequence
    });
  } catch (error) {
    console.error('Intervals validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate harmonies answer
router.post('/validate/harmonies', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { exerciseId, userNotes, correctNotes } = req.body;

    if (!userNotes || !correctNotes) {
      return res.status(400).json({ error: 'User notes and correct notes are required' });
    }

    // Compare note sets
    const userSet = new Set(userNotes);
    const correctSet = new Set(correctNotes);

    const correctCount = [...correctSet].filter(note => userSet.has(note)).length;
    const accuracy = (correctCount / correctSet.size) * 100;
    const isCorrect = correctCount === correctSet.size && userSet.size === correctSet.size;

    const message = isCorrect ?
      'Excellent! You identified all the notes correctly!' :
      `Good effort! You got ${correctCount}/${correctSet.size} notes correct.`;

    res.json({
      isCorrect,
      accuracy,
      message,
      userNotes,
      correctNotes
    });
  } catch (error) {
    console.error('Harmonies validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate other exercise types
router.post('/validate/:category', authenticateTokenOrGuest, async (req, res) => {
  try {
    const { category } = req.params;
    const { exerciseId, userAnswer, correctAnswer, tolerance } = req.body;

    let isCorrect = false;
    let accuracy = 0;
    let message = '';

    switch (category) {
      case 'panning':
        const panDifference = Math.abs(userAnswer - correctAnswer);
        isCorrect = panDifference <= tolerance;
        accuracy = Math.max(0, (1 - panDifference / 2) * 100); // 0-100% based on how close
        message = isCorrect ?
          'Great! You identified the stereo position correctly!' :
          `Close! The correct position was ${Math.round(correctAnswer * 100)}% from center.`;
        break;

      case 'volumes':
        const volumeDifference = Math.abs(userAnswer - correctAnswer);
        isCorrect = volumeDifference <= tolerance;
        accuracy = Math.max(0, (1 - volumeDifference / 20) * 100); // 0-100% based on dB difference
        message = isCorrect ?
          'Perfect! You identified the volume difference correctly!' :
          `Good try! The correct difference was ${correctAnswer > 0 ? '+' : ''}${correctAnswer}dB.`;
        break;

      case 'equalizing':
        const freqDifference = Math.abs(userAnswer - correctAnswer);
        isCorrect = freqDifference <= tolerance;
        accuracy = Math.max(0, (1 - freqDifference / 1000) * 100); // 0-100% based on frequency difference
        message = isCorrect ?
          'Excellent! You identified the EQ frequency correctly!' :
          `Nice attempt! The correct frequency was ${correctAnswer}Hz.`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid exercise category' });
    }

    res.json({
      isCorrect,
      accuracy,
      message
    });
  } catch (error) {
    console.error('Exercise validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// EXERCISE SUBMISSION (Save to Database)
// ======================

router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const {
      exerciseCategory,
      difficulty,
      isCorrect,
      userAnswer,
      correctAnswer,
      accuracy,
      timeTaken,
      exerciseData
    } = req.body;

    if (!exerciseCategory || !difficulty || isCorrect === undefined) {
      return res.status(400).json({ error: 'Exercise category, difficulty, and isCorrect are required' });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Get exercise type
      const exerciseTypeResult = await client.query(
        'SELECT id, points_easy, points_medium, points_hard FROM exercise_types WHERE category = $1',
        [exerciseCategory]
      );

      if (exerciseTypeResult.rows.length === 0) {
        throw new Error('Exercise type not found');
      }

      const exerciseType = exerciseTypeResult.rows[0];
      const pointsField = `points_${difficulty}`;
      const maxPoints = exerciseType[pointsField];
      const pointsEarned = isCorrect ? maxPoints : 0;

      // Record the attempt
      const attemptResult = await client.query(
        `INSERT INTO user_exercise_attempts
         (user_id, exercise_type_id, difficulty, score, points_earned, max_possible_points,
          accuracy, is_correct, time_taken_seconds, user_answer, correct_answer, exercise_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          req.user.userId,
          exerciseType.id,
          difficulty,
          pointsEarned, // Score = points earned for now
          pointsEarned,
          maxPoints,
          accuracy || (isCorrect ? 100 : 0),
          isCorrect,
          timeTaken || null,
          userAnswer || null,
          correctAnswer || null,
          exerciseData ? JSON.stringify(exerciseData) : null
        ]
      );

      await client.query('COMMIT');

      // Get updated user stats
      const userStatsResult = await query(
        `SELECT total_score, current_streak, longest_streak, total_exercises_completed
         FROM users WHERE id = $1`,
        [req.user.userId]
      );

      const userStats = userStatsResult.rows[0];

      res.json({
        message: 'Exercise submitted successfully',
        attemptId: attemptResult.rows[0].id,
        pointsEarned,
        isCorrect,
        userStats: {
          totalScore: userStats.total_score,
          currentStreak: userStats.current_streak,
          longestStreak: userStats.longest_streak,
          totalExercisesCompleted: userStats.total_exercises_completed
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Exercise submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================
// HELPER FUNCTIONS
// ======================

function calculateSequenceAccuracy(userSequence, correctSequence) {
  if (!userSequence || !correctSequence) return 0;

  const maxLength = Math.max(userSequence.length, correctSequence.length);
  if (maxLength === 0) return 100;

  let matches = 0;
  const minLength = Math.min(userSequence.length, correctSequence.length);

  for (let i = 0; i < minLength; i++) {
    if (userSequence[i] === correctSequence[i]) {
      matches++;
    }
  }

  return (matches / maxLength) * 100;
}

module.exports = router;