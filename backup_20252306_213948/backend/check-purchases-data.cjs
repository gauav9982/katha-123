const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('katha_sales.db');

console.log('Checking purchases data...');

db.all('SELECT * FROM tbl_purchases LIMIT 5', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Purchases data:', rows);
    console.log('Number of purchases:', rows.length);
  }
  db.close();
}); 