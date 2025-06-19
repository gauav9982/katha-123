const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'katha_sales.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Run all operations in a transaction
db.serialize(() => {
  // Begin transaction
  db.run('BEGIN TRANSACTION');

  try {
    // 1. Create new table with correct column order
    db.run(`CREATE TABLE IF NOT EXISTS tbl_purchase_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_code TEXT,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL,
      gst_percentage REAL DEFAULT 0,
      gst_amount REAL DEFAULT 0,
      transport_charge REAL DEFAULT 0,
      other_charge REAL DEFAULT 0,
      per_item_cost REAL DEFAULT 0
    )`);

    console.log('Created new purchase items table with correct column order');

    // 2. Copy data from old table to new table
    db.run(`INSERT INTO tbl_purchase_items_new 
      (id, purchase_id, item_id, item_code, item_name, quantity, rate, amount, 
       gst_percentage, gst_amount, transport_charge, other_charge, per_item_cost)
      SELECT id, purchase_id, item_id, item_code, item_name, quantity, rate, amount, 
             gst_percentage, gst_amount, transport_charge, other_charge, per_item_cost 
      FROM tbl_purchase_items`);

    console.log('Copied data from old table to new table');

    // 3. Drop the old table
    db.run('DROP TABLE tbl_purchase_items');
    console.log('Dropped old purchase items table');

    // 4. Rename the new table to the original name
    db.run('ALTER TABLE tbl_purchase_items_new RENAME TO tbl_purchase_items');
    console.log('Renamed new table to original name');

    // Commit the transaction
    db.run('COMMIT');
    console.log('Transaction committed successfully');
    console.log('Migration completed successfully');
  } catch (error) {
    // Rollback on error
    db.run('ROLLBACK');
    console.error('Error during migration:', error);
    console.log('Transaction rolled back');
  }
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed');
  }
}); 