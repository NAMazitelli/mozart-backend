const exercises = [
  // Scales exercises
  {
    id: 1,
    category: 'scales',
    type: 'guess_scale',
    difficulty: 'easy',
    question_data: {
      audio_file: 'c_major_scale.mp3',
      options: ['C Major', 'G Major', 'D Major', 'A Major']
    },
    answer_data: {
      correct_answer: 'C Major'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    category: 'scales',
    type: 'guess_scale',
    difficulty: 'easy',
    question_data: {
      audio_file: 'g_major_scale.mp3',
      options: ['G Major', 'D Major', 'A Major', 'E Major']
    },
    answer_data: {
      correct_answer: 'G Major'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    category: 'scales',
    type: 'guess_scale',
    difficulty: 'easy',
    question_data: {
      audio_file: 'd_major_scale.mp3',
      options: ['D Major', 'A Major', 'E Major', 'B Major']
    },
    answer_data: {
      correct_answer: 'D Major'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 4,
    category: 'scales',
    type: 'guess_scale',
    difficulty: 'medium',
    question_data: {
      audio_file: 'f_sharp_minor_scale.mp3',
      options: ['F# Minor', 'D Major', 'B Minor', 'E Major']
    },
    answer_data: {
      correct_answer: 'F# Minor'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 5,
    category: 'scales',
    type: 'guess_scale',
    difficulty: 'medium',
    question_data: {
      audio_file: 'a_minor_scale.mp3',
      options: ['A Minor', 'C Major', 'E Minor', 'G Major']
    },
    answer_data: {
      correct_answer: 'A Minor'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 6,
    category: 'scales',
    type: 'guess_scale',
    difficulty: 'hard',
    question_data: {
      audio_file: 'bb_dorian_scale.mp3',
      options: ['Bb Dorian', 'Ab Lydian', 'Eb Mixolydian', 'C Aeolian']
    },
    answer_data: {
      correct_answer: 'Bb Dorian'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  
  // Notes exercises
  {
    id: 7,
    category: 'notes',
    type: 'identify_note',
    difficulty: 'easy',
    question_data: {
      audio_file: 'note_c4.mp3',
      options: ['C', 'D', 'E', 'F']
    },
    answer_data: {
      correct_answer: 'C'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 8,
    category: 'notes',
    type: 'identify_note',
    difficulty: 'easy',
    question_data: {
      audio_file: 'note_g4.mp3',
      options: ['G', 'A', 'B', 'C']
    },
    answer_data: {
      correct_answer: 'G'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 9,
    category: 'notes',
    type: 'identify_note',
    difficulty: 'medium',
    question_data: {
      audio_file: 'note_fs4.mp3',
      options: ['F#', 'G', 'A', 'B']
    },
    answer_data: {
      correct_answer: 'F#'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 10,
    category: 'notes',
    type: 'identify_note',
    difficulty: 'hard',
    question_data: {
      audio_file: 'note_bb2.mp3',
      options: ['Bb', 'C', 'D', 'Eb']
    },
    answer_data: {
      correct_answer: 'Bb'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  
  // Interval exercises
  {
    id: 11,
    category: 'notes',
    type: 'identify_interval',
    difficulty: 'easy',
    question_data: {
      audio_file: 'perfect_fifth.mp3',
      options: ['Perfect 5th', 'Major 3rd', 'Perfect 4th', 'Major 2nd']
    },
    answer_data: {
      correct_answer: 'Perfect 5th'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 12,
    category: 'notes',
    type: 'identify_interval',
    difficulty: 'medium',
    question_data: {
      audio_file: 'minor_seventh.mp3',
      options: ['Minor 7th', 'Major 7th', 'Minor 6th', 'Major 6th']
    },
    answer_data: {
      correct_answer: 'Minor 7th'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 13,
    category: 'notes',
    type: 'identify_interval',
    difficulty: 'hard',
    question_data: {
      audio_file: 'tritone.mp3',
      options: ['Tritone', 'Perfect 4th', 'Perfect 5th', 'Major 3rd']
    },
    answer_data: {
      correct_answer: 'Tritone'
    },
    created_at: '2024-01-01T00:00:00.000Z'
  }
];

module.exports = exercises;