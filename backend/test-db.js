const db = require('./config/database');

// Test database connection
console.log('Testing database connection...');

// Check if tables exist
const tables = [
  'tbl_items',
  'tbl_customers',
  'tbl_sales',
  'tbl_sale_items',
  'tbl_purchases',
  'tbl_purchase_items'
];

tables.forEach(table => {
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table], (err, row) => {
    if (err) {
      console.error(`Error checking table ${table}:`, err);
      return;
    }
    if (row) {
      console.log(`✓ Table ${table} exists`);
      // Get count of records
      db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
        if (err) {
          console.error(`Error counting records in ${table}:`, err);
          return;
        }
        console.log(`  - Records in ${table}: ${row.count}`);
      });
    } else {
      console.log(`✗ Table ${table} does not exist`);
    }
  });
}); 