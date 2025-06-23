const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - pointing to the database folder
const dbPath = path.join(__dirname, '..', '..', 'database', 'katha_sales.db');

// Create tables function
const createTables = () => {
  // Cities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      username TEXT,
      password TEXT
    )
  `);

  try {
    db.prepare("SELECT username FROM cities LIMIT 1").get();
  } catch (e) {
    db.exec(`
      ALTER TABLE cities ADD COLUMN username TEXT;
      ALTER TABLE cities ADD COLUMN password TEXT;
    `);
    console.log('Main DB schema updated with username and password columns.');
  }

  // Teachers table (Basic Info)
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to SQLite database');
  // Create tables when database connects
  createTables();
});

module.exports = db; 