const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'katha_sales.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database for testing.');
});

console.log('Testing cash sales data...');

// Count total records
db.get('SELECT COUNT(*) as count FROM tbl_cashsales', [], (err, row) => {
  if (err) {
    console.error('Error counting cash sales:', err);
    return;
  }
  console.log(`Total cash sales in database: ${row.count}`);
});

// Get all records with details
db.all('SELECT * FROM tbl_cashsales ORDER BY id DESC', [], (err, rows) => {
  if (err) {
    console.error('Error fetching cash sales:', err);
    return;
  }
  console.log(`\nFound ${rows.length} cash sales:`);
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ID: ${row.id}, Invoice: ${row.invoice_number}, Date: ${row.invoice_date}, Customer: ${row.customer_name}`);
  });
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('\nDatabase connection closed.');
    }
  });
}); 