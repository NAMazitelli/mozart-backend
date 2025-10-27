CREATE DATABASE IF NOT EXISTS mozart_music_app;
USE mozart_music_app;

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

CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    question_data JSON NOT NULL,
    answer_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

INSERT INTO exercises (category, type, difficulty, question_data, answer_data) VALUES
('scales', 'guess_scale', 'easy', '{"audio_file": "c_major_scale.mp3", "options": ["C Major", "G Major", "D Major", "A Major"]}', '{"correct_answer": "C Major"}'),
('scales', 'guess_scale', 'medium', '{"audio_file": "f_sharp_minor_scale.mp3", "options": ["F# Minor", "D Major", "B Minor", "E Major"]}', '{"correct_answer": "F# Minor"}'),
('scales', 'guess_scale', 'hard', '{"audio_file": "bb_dorian_scale.mp3", "options": ["Bb Dorian", "Ab Lydian", "Eb Mixolydian", "C Aeolian"]}', '{"correct_answer": "Bb Dorian"}'),
('notes', 'identify_note', 'easy', '{"audio_file": "note_c4.mp3", "options": ["C", "D", "E", "F"]}', '{"correct_answer": "C"}'),
('notes', 'identify_note', 'medium', '{"audio_file": "note_fs4.mp3", "options": ["F#", "G", "A", "B"]}', '{"correct_answer": "F#"}'),
('notes', 'identify_note', 'hard', '{"audio_file": "note_bb2.mp3", "options": ["Bb", "C", "D", "Eb"]}', '{"correct_answer": "Bb"}');