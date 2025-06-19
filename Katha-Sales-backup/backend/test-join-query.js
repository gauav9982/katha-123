const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'katha_sales.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database for testing JOIN query.');
});

console.log('Testing JOIN query from routes file...');

// Test the exact query from routes/index.js
const query = `
  SELECT cs.id, cs.invoice_number, cs.invoice_date, cs.customer_name,
         cs.sales_type, cs.subtotal, cs.total_gst, cs.grand_total,
         COUNT(csi.id) as items_count,
         SUM(csi.quantity) as total_quantity
  FROM tbl_cashsales cs
  LEFT JOIN tbl_cashsale_items csi ON cs.id = csi.sale_id
  GROUP BY cs.id
  ORDER BY cs.invoice_date DESC
`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error with JOIN query:', err);
    return;
  }
  console.log(`JOIN query returned ${rows.length} cash sales:`);
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ID: ${row.id}, Invoice: ${row.invoice_number}, Items: ${row.items_count}`);
  });
  
  // Now test simple query
  console.log('\nTesting simple query...');
  db.all('SELECT * FROM tbl_cashsales ORDER BY id DESC', [], (err, simpleRows) => {
    if (err) {
      console.error('Error with simple query:', err);
      return;
    }
    console.log(`Simple query returned ${simpleRows.length} cash sales:`);
    simpleRows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Invoice: ${row.invoice_number}`);
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
}); 