-- Mozart Music Learning App Database Setup
-- Run this file to create the database and all required tables

CREATE DATABASE IF NOT EXISTS mozart_music_app;
USE mozart_music_app;

-- Users table: stores user accounts and stats
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    language ENUM('en', 'de', 'es') DEFAULT 'en',
    coins INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Scores table: stores user high scores per category/difficulty
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    high_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category_difficulty (user_id, category, difficulty)
);

-- Exercises table: stores exercise questions and answers
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    question_data JSON NOT NULL,
    answer_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table: tracks completed exercise sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    score INT NOT NULL,
    coins_earned INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample exercise data for testing
INSERT INTO exercises (category, type, difficulty, question_data, answer_data) VALUES
-- Scales exercises
('scales', 'guess_scale', 'easy', '{"audio_file": "c_major_scale.mp3", "options": ["C Major", "G Major", "D Major", "A Major"]}', '{"correct_answer": "C Major"}'),
('scales', 'guess_scale', 'easy', '{"audio_file": "g_major_scale.mp3", "options": ["G Major", "D Major", "A Major", "E Major"]}', '{"correct_answer": "G Major"}'),
('scales', 'guess_scale', 'easy', '{"audio_file": "d_major_scale.mp3", "options": ["D Major", "A Major", "E Major", "B Major"]}', '{"correct_answer": "D Major"}'),

('scales', 'guess_scale', 'medium', '{"audio_file": "f_sharp_minor_scale.mp3", "options": ["F# Minor", "D Major", "B Minor", "E Major"]}', '{"correct_answer": "F# Minor"}'),
('scales', 'guess_scale', 'medium', '{"audio_file": "a_minor_scale.mp3", "options": ["A Minor", "C Major", "E Minor", "G Major"]}', '{"correct_answer": "A Minor"}'),
('scales', 'guess_scale', 'medium', '{"audio_file": "e_minor_scale.mp3", "options": ["E Minor", "G Major", "B Minor", "D Major"]}', '{"correct_answer": "E Minor"}'),

('scales', 'guess_scale', 'hard', '{"audio_file": "bb_dorian_scale.mp3", "options": ["Bb Dorian", "Ab Lydian", "Eb Mixolydian", "C Aeolian"]}', '{"correct_answer": "Bb Dorian"}'),
('scales', 'guess_scale', 'hard', '{"audio_file": "f_lydian_scale.mp3", "options": ["F Lydian", "C Ionian", "G Mixolydian", "D Dorian"]}', '{"correct_answer": "F Lydian"}'),
('scales', 'guess_scale', 'hard', '{"audio_file": "a_phrygian_scale.mp3", "options": ["A Phrygian", "F Major", "D Minor", "G Dorian"]}', '{"correct_answer": "A Phrygian"}'),

-- Notes exercises
('notes', 'identify_note', 'easy', '{"audio_file": "note_c4.mp3", "options": ["C", "D", "E", "F"]}', '{"correct_answer": "C"}'),
('notes', 'identify_note', 'easy', '{"audio_file": "note_g4.mp3", "options": ["G", "A", "B", "C"]}', '{"correct_answer": "G"}'),
('notes', 'identify_note', 'easy', '{"audio_file": "note_f4.mp3", "options": ["F", "G", "A", "B"]}', '{"correct_answer": "F"}'),

('notes', 'identify_note', 'medium', '{"audio_file": "note_fs4.mp3", "options": ["F#", "G", "A", "B"]}', '{"correct_answer": "F#"}'),
('notes', 'identify_note', 'medium', '{"audio_file": "note_bb4.mp3", "options": ["Bb", "C", "D", "E"]}', '{"correct_answer": "Bb"}'),
('notes', 'identify_note', 'medium', '{"audio_file": "note_cs4.mp3", "options": ["C#", "D", "E", "F"]}', '{"correct_answer": "C#"}'),

('notes', 'identify_note', 'hard', '{"audio_file": "note_bb2.mp3", "options": ["Bb", "C", "D", "Eb"]}', '{"correct_answer": "Bb"}'),
('notes', 'identify_note', 'hard', '{"audio_file": "note_fs2.mp3", "options": ["F#", "G", "A", "B"]}', '{"correct_answer": "F#"}'),
('notes', 'identify_note', 'hard', '{"audio_file": "note_ds5.mp3", "options": ["D#", "E", "F", "G"]}', '{"correct_answer": "D#"}'),

-- Interval exercises
('notes', 'identify_interval', 'easy', '{"audio_file": "perfect_fifth.mp3", "options": ["Perfect 5th", "Major 3rd", "Perfect 4th", "Major 2nd"]}', '{"correct_answer": "Perfect 5th"}'),
('notes', 'identify_interval', 'medium', '{"audio_file": "minor_seventh.mp3", "options": ["Minor 7th", "Major 7th", "Minor 6th", "Major 6th"]}', '{"correct_answer": "Minor 7th"}'),
('notes', 'identify_interval', 'hard', '{"audio_file": "tritone.mp3", "options": ["Tritone", "Perfect 4th", "Perfect 5th", "Major 3rd"]}', '{"correct_answer": "Tritone"}');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_scores_user_category ON scores(user_id, category);
CREATE INDEX idx_exercises_category_difficulty ON exercises(category, difficulty);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_date ON user_sessions(completed_at);

-- Sample user for testing (password: "password123")
INSERT INTO users (email, password_hash, username) VALUES 
('test@mozart.com', '$2b$12$JKtEUuDJ.YLEgmnkguArn.vyobTe42XUioy/rKu1d.n27z0bYSxvq', 'TestUser');