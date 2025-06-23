const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - pointing to the database folder
const dbPath = path.join(__dirname, '..', '..', 'database', 'katha_sales.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to SQLite database');
});

module.exports = db; 