const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'katha_sales.db');
const db = new sqlite3.Database(dbPath);

console.log('Connected to database');

// Check the structure of tbl_purchases
db.all("PRAGMA table_info(tbl_purchases)", [], (err, rows) => {
  if (err) {
    console.error('Error checking table structure:', err);
    return;
  }
  
  console.log('Columns in tbl_purchases:');
  rows.forEach(row => {
    console.log(`  - ${row.name} (${row.type})`);
  });
  
  // Also check if there's any data
  db.all("SELECT * FROM tbl_purchases LIMIT 5", [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
    } else {
      console.log('\nSample data from tbl_purchases:');
      console.log(rows);
    }
    db.close();
  });
}); 