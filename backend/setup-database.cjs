const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path - pointing to the database folder
const dbPath = path.join(__dirname, '..', 'database', 'katha_sales.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Use db.serialize to ensure commands are executed in order
db.serialize(() => {
  // Start a transaction
  db.run("BEGIN TRANSACTION;");

  // Array of table creation queries
  const tables = [
    `CREATE TABLE IF NOT EXISTS tbl_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_number INTEGER UNIQUE NOT NULL,
      group_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tbl_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tbl_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_code TEXT UNIQUE,
      item_name TEXT NOT NULL,
      product_name TEXT,
      company_name TEXT,
      model TEXT,
      mrp REAL,
      gst_percentage REAL DEFAULT 0,
      company_barcode TEXT,
      barcode_2 TEXT,
      opening_stock INTEGER DEFAULT 0,
      opening_cost REAL DEFAULT 0,
      current_stock INTEGER DEFAULT 0,
      category_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES tbl_categories (id)
    )`,
    `CREATE TABLE IF NOT EXISTS tbl_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT,
      invoice_date DATE,
      vendor_name TEXT,
      subtotal REAL,
      total_gst REAL,
      grand_total REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tbl_purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER,
      item_id INTEGER,
      quantity INTEGER,
      rate REAL,
      amount REAL,
      FOREIGN KEY (purchase_id) REFERENCES tbl_purchases (id),
      FOREIGN KEY (item_id) REFERENCES tbl_items (id)
    )`,
    `CREATE TABLE IF NOT EXISTS tbl_cashsales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT,
      invoice_date DATE,
      customer_name TEXT,
      sales_type TEXT,
      subtotal REAL,
      total_gst REAL,
      grand_total REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS tbl_cashsale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      item_id INTEGER,
      item_name TEXT,
      item_code TEXT,
      quantity INTEGER,
      rate REAL,
      amount REAL,
      FOREIGN KEY (sale_id) REFERENCES tbl_cashsales (id),
      FOREIGN KEY (item_id) REFERENCES tbl_items (id)
    )`
  ];

  // Execute all table creation queries
  tables.forEach(tableSql => {
    db.run(tableSql, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        // If a table fails to create, rollback and exit
        db.run("ROLLBACK;");
        process.exit(1);
      }
    });
  });

  // After creating tables, check and insert the default category
  const checkAndInsertCategory = () => {
    db.get("SELECT COUNT(*) as count FROM tbl_categories", (err, row) => {
      if (err) {
        console.error('Error checking categories:', err.message);
        db.run("ROLLBACK;");
        process.exit(1);
      } else if (row.count === 0) {
        db.run("INSERT INTO tbl_categories (category_name) VALUES (?)", ['General'], (err) => {
          if (err) {
            console.error('Error inserting default category:', err.message);
            db.run("ROLLBACK;");
            process.exit(1);
          } else {
            console.log('Default category "General" created.');
          }
        });
      }
    });
  };

  checkAndInsertCategory();

  // Commit the transaction
  db.run("COMMIT;", (err) => {
    if (err) {
      console.error('Error committing transaction:', err.message);
      process.exit(1);
    } else {
      console.log('All tables created/verified successfully.');
    }
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      process.exit(1); 
    } else {
      console.log('Database setup completed and connection closed.');
      // Exit with success code
      process.exit(0);
    }
  });
}); 