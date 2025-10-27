const bcrypt = require("bcryptjs");

const users = [
  {
    id: 1,
    email: "test@mozart.com",
    password_hash:
      "$2b$12$JKtEUuDJ.YLEgmnkguArn.vyobTe42XUioy/rKu1d.n27z0bYSxvq", // password123
    username: "TestUser",
    language: "en",
    coins: 150,
    current_streak: 5,
    longest_streak: 12,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    email: "demo@mozart.com",
    password_hash:
      "$2b$12$JKtEUuDJ.YLEgmnkguArn.vyobTe42XUioy/rKu1d.n27z0bYSxvq", // password123
    username: "DemoUser",
    language: "es",
    coins: 300,
    current_streak: 8,
    longest_streak: 15,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
  },
  {
    id: 3,
    email: "student@mozart.com",
    password_hash:
      "$2b$12$JKtEUuDJ.YLEgmnkguArn.vyobTe42XUioy/rKu1d.n27z0bYSxvq", // password123
    username: "StudentUser",
    language: "de",
    coins: 75,
    current_streak: 2,
    longest_streak: 6,
    created_at: "2024-01-03T00:00:00.000Z",
    updated_at: "2024-01-03T00:00:00.000Z",
  },
];

module.exports = users;
