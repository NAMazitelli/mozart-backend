const bcrypt = require('bcryptjs');
const users = require('../mocks/users');
const exercises = require('../mocks/exercises');
const scores = require('../mocks/scores');
const userSessions = require('../mocks/userSessions');

class MockDatabase {
  constructor() {
    this.users = [...users];
    this.exercises = [...exercises];
    this.scores = [...scores];
    this.userSessions = [...userSessions];
    this.nextUserId = Math.max(...this.users.map(u => u.id)) + 1;
    this.nextScoreId = Math.max(...this.scores.map(s => s.id)) + 1;
    this.nextSessionId = Math.max(...this.userSessions.map(s => s.id)) + 1;
  }

  async execute(query, params = []) {
    const queryType = query.trim().toUpperCase();
    
    if (queryType.startsWith('SELECT')) {
      return this.handleSelect(query, params);
    } else if (queryType.startsWith('INSERT')) {
      return this.handleInsert(query, params);
    } else if (queryType.startsWith('UPDATE')) {
      return this.handleUpdate(query, params);
    } else if (queryType.startsWith('DELETE')) {
      return this.handleDelete(query, params);
    }
    
    throw new Error('Unsupported query type in mock database');
  }

  async handleSelect(query, params) {
    const lowerQuery = query.toLowerCase();
    
    // Handle user queries
    if (lowerQuery.includes('from users')) {
      if (lowerQuery.includes('where email = ?')) {
        const user = this.users.find(u => u.email === params[0]);
        return [user ? [user] : []];
      }
      if (lowerQuery.includes('where id = ?')) {
        const user = this.users.find(u => u.id === params[0]);
        return [user ? [user] : []];
      }
    }
    
    // Handle exercise queries
    if (lowerQuery.includes('from exercises')) {
      let filteredExercises = this.exercises;
      
      if (lowerQuery.includes('where category = ?')) {
        const categoryIndex = params.findIndex((_, i) => query.includes('category = ?'));
        filteredExercises = filteredExercises.filter(e => e.category === params[0]);
        
        if (lowerQuery.includes('and difficulty = ?')) {
          filteredExercises = filteredExercises.filter(e => e.difficulty === params[1]);
        }
        
        if (lowerQuery.includes('and type = ?')) {
          const typeParam = params[2] || params[1];
          filteredExercises = filteredExercises.filter(e => e.type === typeParam);
        }
      }
      
      if (lowerQuery.includes('order by rand()')) {
        filteredExercises = this.shuffleArray([...filteredExercises]);
      }
      
      if (lowerQuery.includes('limit')) {
        const limitMatch = query.match(/limit\s+(\d+)/i);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          filteredExercises = filteredExercises.slice(0, limit);
        }
      }
      
      return [filteredExercises];
    }
    
    // Handle score queries
    if (lowerQuery.includes('from scores')) {
      if (lowerQuery.includes('where user_id = ?')) {
        const userScores = this.scores.filter(s => s.user_id === params[0]);
        return [userScores];
      }
      
      if (lowerQuery.includes('where user_id = ? and category = ? and difficulty = ?')) {
        const score = this.scores.find(s => 
          s.user_id === params[0] && 
          s.category === params[1] && 
          s.difficulty === params[2]
        );
        return [score ? [score] : []];
      }
    }
    
    return [[]];
  }

  async handleInsert(query, params) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('into users')) {
      const newUser = {
        id: this.nextUserId++,
        email: params[0],
        password_hash: params[1],
        username: params[2],
        language: 'en',
        coins: 0,
        current_streak: 0,
        longest_streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.users.push(newUser);
      return [{ insertId: newUser.id }];
    }
    
    if (lowerQuery.includes('into user_sessions')) {
      const newSession = {
        id: this.nextSessionId++,
        user_id: params[0],
        category: params[1],
        difficulty: params[2],
        score: params[3],
        coins_earned: params[4],
        completed_at: new Date().toISOString()
      };
      this.userSessions.push(newSession);
      return [{ insertId: newSession.id }];
    }
    
    if (lowerQuery.includes('into scores')) {
      const newScore = {
        id: this.nextScoreId++,
        user_id: params[0],
        category: params[1],
        difficulty: params[2],
        high_score: params[3],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.scores.push(newScore);
      return [{ insertId: newScore.id }];
    }
    
    return [{ insertId: 1 }];
  }

  async handleUpdate(query, params) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('update users')) {
      const userId = params[params.length - 1];
      const userIndex = this.users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        const updates = this.parseUpdateQuery(query, params);
        Object.assign(this.users[userIndex], updates);
        this.users[userIndex].updated_at = new Date().toISOString();
      }
      
      return [{ affectedRows: userIndex !== -1 ? 1 : 0 }];
    }
    
    if (lowerQuery.includes('update scores')) {
      const scoreParams = params.slice(-3); // user_id, category, difficulty
      const scoreIndex = this.scores.findIndex(s => 
        s.user_id === scoreParams[0] && 
        s.category === scoreParams[1] && 
        s.difficulty === scoreParams[2]
      );
      
      if (scoreIndex !== -1) {
        this.scores[scoreIndex].high_score = params[0];
        this.scores[scoreIndex].updated_at = new Date().toISOString();
      }
      
      return [{ affectedRows: scoreIndex !== -1 ? 1 : 0 }];
    }
    
    return [{ affectedRows: 0 }];
  }

  async handleDelete(query, params) {
    return [{ affectedRows: 0 }];
  }

  parseUpdateQuery(query, params) {
    const updates = {};
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('current_streak = ?')) {
      updates.current_streak = params[0];
    }
    if (lowerQuery.includes('longest_streak = ?')) {
      updates.longest_streak = params[1];
    }
    if (lowerQuery.includes('coins = ?')) {
      updates.coins = params[2];
    }
    if (lowerQuery.includes('username = ?')) {
      updates.username = params[0];
    }
    if (lowerQuery.includes('language = ?')) {
      updates.language = params[0];
    }
    
    return updates;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async getConnection() {
    return {
      execute: this.execute.bind(this),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
}

module.exports = new MockDatabase();