const axios = require('axios');
require('dotenv').config();

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Helper function to test endpoint response structure
function validateExerciseStructure(exercise, type) {
  const requiredFields = ['id', 'type', 'category', 'difficulty', 'points', 'question'];

  for (const field of requiredFields) {
    if (!exercise[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (exercise.type !== type) {
    throw new Error(`Expected type ${type}, got ${exercise.type}`);
  }

  if (!DIFFICULTIES.includes(exercise.difficulty)) {
    throw new Error(`Invalid difficulty: ${exercise.difficulty}`);
  }

  if (typeof exercise.points !== 'number' || exercise.points <= 0) {
    throw new Error(`Invalid points: ${exercise.points}`);
  }
}

// Test Guess Note Exercise
async function testGuessNoteExercise() {
  console.log('🎵 Testing Guess Note Exercise...');

  for (const difficulty of DIFFICULTIES) {
    try {
      const response = await axios.get(`${BASE_URL}/exercise/guess-note/${difficulty}`);
      const exercise = response.data;

      validateExerciseStructure(exercise, 'guess-note');

      // Validate guess-note specific fields
      if (!exercise.correctNote || !exercise.correctNote.frequency || !exercise.correctNote.displayName) {
        throw new Error('Missing or invalid correctNote structure');
      }

      if (!Array.isArray(exercise.options) || exercise.options.length !== 4) {
        throw new Error('Options should be an array of 4 items');
      }

      if (typeof exercise.correctAnswerIndex !== 'number' || exercise.correctAnswerIndex < 0 || exercise.correctAnswerIndex >= 4) {
        throw new Error('Invalid correctAnswerIndex');
      }

      // Validate frequency is reasonable (between 100-1000 Hz)
      if (exercise.correctNote.frequency < 100 || exercise.correctNote.frequency > 1000) {
        throw new Error(`Unreasonable frequency: ${exercise.correctNote.frequency}Hz`);
      }

      console.log(`   ✅ ${difficulty}: ${exercise.correctNote.displayName} (${exercise.correctNote.frequency}Hz)`);

    } catch (error) {
      console.log(`   ❌ ${difficulty}: ${error.message}`);
    }
  }
}

// Test Intervals Exercise
async function testIntervalsExercise() {
  console.log('🎼 Testing Intervals Exercise...');

  for (const difficulty of DIFFICULTIES) {
    try {
      const response = await axios.get(`${BASE_URL}/exercise/intervals/${difficulty}`);
      const exercise = response.data;

      validateExerciseStructure(exercise, 'intervals');

      // Validate intervals specific fields
      if (!Array.isArray(exercise.sequence) || exercise.sequence.length === 0) {
        throw new Error('Missing or empty sequence');
      }

      if (!Array.isArray(exercise.pianoNotes) || exercise.pianoNotes.length !== 12) {
        throw new Error('PianoNotes should contain 12 chromatic notes');
      }

      // Validate black keys are present
      const blackKeys = exercise.pianoNotes.filter(note => note.isBlack);
      if (blackKeys.length !== 5) {
        throw new Error(`Expected 5 black keys, got ${blackKeys.length}`);
      }

      // Validate note count matches difficulty
      const expectedCounts = { easy: 2, medium: 3, hard: 5 };
      if (exercise.noteCount !== expectedCounts[difficulty]) {
        throw new Error(`Expected ${expectedCounts[difficulty]} notes for ${difficulty}, got ${exercise.noteCount}`);
      }

      console.log(`   ✅ ${difficulty}: ${exercise.noteCount} notes, ${blackKeys.length} black keys`);

    } catch (error) {
      console.log(`   ❌ ${difficulty}: ${error.message}`);
    }
  }
}

// Test Harmonies Exercise
async function testHarmoniesExercise() {
  console.log('🎹 Testing Harmonies Exercise...');

  for (const difficulty of DIFFICULTIES) {
    try {
      const response = await axios.get(`${BASE_URL}/exercise/harmonies/${difficulty}`);
      const exercise = response.data;

      validateExerciseStructure(exercise, 'harmonies');

      // Validate harmonies specific fields
      if (!Array.isArray(exercise.chord) || exercise.chord.length === 0) {
        throw new Error('Missing or empty chord');
      }

      if (!Array.isArray(exercise.pianoNotes) || exercise.pianoNotes.length !== 12) {
        throw new Error('PianoNotes should contain 12 chromatic notes');
      }

      // Validate black keys are present
      const blackKeys = exercise.pianoNotes.filter(note => note.isBlack);
      if (blackKeys.length !== 5) {
        throw new Error(`Expected 5 black keys, got ${blackKeys.length}`);
      }

      // Validate note count matches difficulty
      const expectedCounts = { easy: 2, medium: 3, hard: 4 };
      if (exercise.noteCount !== expectedCounts[difficulty]) {
        throw new Error(`Expected ${expectedCounts[difficulty]} notes for ${difficulty}, got ${exercise.noteCount}`);
      }

      console.log(`   ✅ ${difficulty}: ${exercise.noteCount}-note chord, ${blackKeys.length} black keys`);

    } catch (error) {
      console.log(`   ❌ ${difficulty}: ${error.message}`);
    }
  }
}

// Test Volume Exercise
async function testVolumeExercise() {
  console.log('🔊 Testing Volume Exercise...');

  for (const difficulty of DIFFICULTIES) {
    try {
      const response = await axios.get(`${BASE_URL}/exercise/volumes/${difficulty}`);
      const exercise = response.data;

      validateExerciseStructure(exercise, 'volumes');

      // Validate volume specific fields
      if (!exercise.note || !exercise.note.frequency || !exercise.note.displayName) {
        throw new Error('Missing or invalid note structure');
      }

      if (typeof exercise.referenceGain !== 'number') {
        throw new Error('Missing referenceGain');
      }

      if (typeof exercise.secondGain !== 'number') {
        throw new Error('Missing secondGain');
      }

      if (typeof exercise.volumeDifference !== 'number') {
        throw new Error('Missing volumeDifference');
      }

      // Validate reasonable volume ranges (should be within ±12dB after our fix)
      if (Math.abs(exercise.volumeDifference) > 15) {
        throw new Error(`Volume difference too extreme: ${exercise.volumeDifference}dB`);
      }

      console.log(`   ✅ ${difficulty}: ${exercise.volumeDifference > 0 ? '+' : ''}${exercise.volumeDifference}dB difference`);

    } catch (error) {
      console.log(`   ❌ ${difficulty}: ${error.message}`);
    }
  }
}

// Test Panning Exercise
async function testPanningExercise() {
  console.log('↔️  Testing Panning Exercise...');

  for (const difficulty of DIFFICULTIES) {
    try {
      const response = await axios.get(`${BASE_URL}/exercise/panning/${difficulty}`);
      const exercise = response.data;

      validateExerciseStructure(exercise, 'panning');

      // Validate panning specific fields
      if (!exercise.sound || !exercise.sound.frequency || !exercise.sound.displayName) {
        throw new Error('Missing or invalid sound structure');
      }

      if (typeof exercise.correctPanValue !== 'number' || exercise.correctPanValue < -1 || exercise.correctPanValue > 1) {
        throw new Error('Invalid correctPanValue (should be between -1 and 1)');
      }

      if (typeof exercise.tolerance !== 'number' || exercise.tolerance <= 0) {
        throw new Error('Invalid tolerance');
      }

      // Validate difficulty-appropriate tolerance
      const expectedTolerances = { easy: 0.2, medium: 0.15, hard: 0.1 };
      if (exercise.tolerance !== expectedTolerances[difficulty]) {
        throw new Error(`Expected tolerance ${expectedTolerances[difficulty]} for ${difficulty}, got ${exercise.tolerance}`);
      }

      console.log(`   ✅ ${difficulty}: Pan ${exercise.correctPanValue}, tolerance ±${exercise.tolerance}`);

    } catch (error) {
      console.log(`   ❌ ${difficulty}: ${error.message}`);
    }
  }
}

// Test EQ Exercise
async function testEqualizingExercise() {
  console.log('🎛️  Testing EQ Exercise...');

  for (const difficulty of DIFFICULTIES) {
    try {
      const response = await axios.get(`${BASE_URL}/exercise/equalizing/${difficulty}`);
      const exercise = response.data;

      validateExerciseStructure(exercise, 'equalizing');

      // Validate EQ specific fields
      if (!exercise.sound || !exercise.sound.type || !exercise.sound.displayName) {
        throw new Error('Missing or invalid sound structure');
      }

      // Validate sound type is now audio-file (uses piano-loop)
      if (exercise.sound.type !== 'audio-file') {
        throw new Error(`Expected audio-file sound type, got: ${exercise.sound.type}`);
      }

      // Validate filename is present for audio-file type
      if (!exercise.sound.filename) {
        throw new Error('Missing filename for audio-file sound');
      }

      // Validate filename is piano-loop.mp3
      if (exercise.sound.filename !== 'piano-loop.mp3') {
        throw new Error(`Expected piano-loop.mp3, got: ${exercise.sound.filename}`);
      }

      if (typeof exercise.targetFrequency !== 'number' || exercise.targetFrequency <= 0) {
        throw new Error('Invalid targetFrequency');
      }

      if (typeof exercise.eqGainDb !== 'number') {
        throw new Error('Missing eqGainDb');
      }

      if (!exercise.filterType || !['lowpass', 'highpass', 'bandpass', 'notch'].includes(exercise.filterType)) {
        throw new Error(`Invalid or missing filterType: ${exercise.filterType}`);
      }

      if (typeof exercise.qFactor !== 'number' || exercise.qFactor <= 0) {
        throw new Error('Missing or invalid qFactor');
      }

      // Validate reasonable EQ gain (should be within ±12dB after our fix)
      if (Math.abs(exercise.eqGainDb) > 15) {
        throw new Error(`EQ gain too extreme: ${exercise.eqGainDb}dB`);
      }

      // Validate answerType field
      if (!exercise.answerType || !['slider', 'multiple-choice'].includes(exercise.answerType)) {
        throw new Error(`Invalid or missing answerType: ${exercise.answerType}`);
      }

      // Validate answer type matches difficulty
      if ((difficulty === 'easy' || difficulty === 'medium') && exercise.answerType !== 'multiple-choice') {
        throw new Error(`Expected multiple-choice for ${difficulty}, got: ${exercise.answerType}`);
      }

      if (difficulty === 'hard' && exercise.answerType !== 'slider') {
        throw new Error(`Expected slider for ${difficulty}, got: ${exercise.answerType}`);
      }

      // Validate multiple choice options for easy/medium
      if (exercise.answerType === 'multiple-choice') {
        if (!Array.isArray(exercise.options) || exercise.options.length !== 4) {
          throw new Error('Multiple choice should have 4 options');
        }

        if (typeof exercise.correctAnswerIndex !== 'number' || exercise.correctAnswerIndex < 0 || exercise.correctAnswerIndex >= 4) {
          throw new Error('Invalid correctAnswerIndex for multiple choice');
        }

        // Validate that correctAnswerIndex points to targetFrequency
        if (exercise.options[exercise.correctAnswerIndex] !== exercise.targetFrequency) {
          throw new Error('correctAnswerIndex does not match targetFrequency');
        }
      }

      console.log(`   ✅ ${difficulty}: ${exercise.answerType}, ${exercise.filterType} ${exercise.targetFrequency}Hz, ${exercise.eqGainDb > 0 ? '+' : ''}${exercise.eqGainDb}dB, Q=${exercise.qFactor}`);

    } catch (error) {
      console.log(`   ❌ ${difficulty}: ${error.message}`);
    }
  }
}

// Test Exercise Validation Endpoints
async function testExerciseValidation() {
  console.log('✅ Testing Exercise Validation...');

  try {
    // Test EQ validation - Multiple Choice (easy/medium)
    const eqMultipleChoiceResponse = await axios.post(`${BASE_URL}/exercise/validate/equalizing`, {
      exerciseId: 'test-123',
      selectedAnswerIndex: 1,
      correctAnswerIndex: 1,
      correctAnswer: 1000,
      tolerance: 200
    });

    if (!eqMultipleChoiceResponse.data.isCorrect) {
      throw new Error('EQ multiple choice validation should be correct for exact match');
    }

    console.log('   ✅ EQ validation (multiple choice): Exact match works');

    // Test EQ validation - Slider (hard)
    const eqSliderResponse = await axios.post(`${BASE_URL}/exercise/validate/equalizing`, {
      exerciseId: 'test-123',
      userAnswer: 1000,
      correctAnswer: 1000,
      tolerance: 200
    });

    if (!eqSliderResponse.data.isCorrect) {
      throw new Error('EQ slider validation should be correct for exact match');
    }

    console.log('   ✅ EQ validation (slider): Exact match works');

    // Test volume validation
    const volumeResponse = await axios.post(`${BASE_URL}/exercise/validate/volumes`, {
      exerciseId: 'test-123',
      userAnswer: 6,
      correctAnswer: 6,
      tolerance: 4
    });

    if (!volumeResponse.data.isCorrect) {
      throw new Error('Volume validation should be correct for exact match');
    }

    console.log('   ✅ Volume validation: Exact match works');

    // Test panning validation
    const panResponse = await axios.post(`${BASE_URL}/exercise/validate/panning`, {
      exerciseId: 'test-123',
      userAnswer: 0.5,
      correctAnswer: 0.5,
      tolerance: 0.2
    });

    if (!panResponse.data.isCorrect) {
      throw new Error('Panning validation should be correct for exact match');
    }

    console.log('   ✅ Panning validation: Exact match works');

  } catch (error) {
    if (error.response) {
      console.log(`   ❌ Validation failed: ${error.response.status} - ${error.response.data.error}`);
    } else {
      console.log(`   ❌ Validation failed: ${error.message}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Exercise API Tests...\n');

  try {
    await testGuessNoteExercise();
    console.log();

    await testIntervalsExercise();
    console.log();

    await testHarmoniesExercise();
    console.log();

    await testVolumeExercise();
    console.log();

    await testPanningExercise();
    console.log();

    await testEqualizingExercise();
    console.log();

    await testExerciseValidation();
    console.log();

    console.log('🎉 All tests completed!');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running. Please start server first with: npm start');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testGuessNoteExercise,
  testIntervalsExercise,
  testHarmoniesExercise,
  testVolumeExercise,
  testPanningExercise,
  testEqualizingExercise,
  testExerciseValidation
};