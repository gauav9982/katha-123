const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'katha_sales.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create tables
const createTables = () => {
  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating categories table:', err.message);
    } else {
      console.log('Categories table created or already exists.');
    }
  });

  // Items table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_items (
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
  )`, (err) => {
    if (err) {
      console.error('Error creating items table:', err.message);
    } else {
      console.log('Items table created or already exists.');
    }
  });

  // Purchases table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT,
    invoice_date DATE,
    vendor_name TEXT,
    subtotal REAL,
    total_gst REAL,
    grand_total REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating purchases table:', err.message);
    } else {
      console.log('Purchases table created or already exists.');
    }
  });

  // Purchase items table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER,
    item_id INTEGER,
    quantity INTEGER,
    rate REAL,
    amount REAL,
    FOREIGN KEY (purchase_id) REFERENCES tbl_purchases (id),
    FOREIGN KEY (item_id) REFERENCES tbl_items (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating purchase items table:', err.message);
    } else {
      console.log('Purchase items table created or already exists.');
    }
  });

  // Cash sales table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_cashsales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT,
    invoice_date DATE,
    customer_name TEXT,
    sales_type TEXT,
    subtotal REAL,
    total_gst REAL,
    grand_total REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating cash sales table:', err.message);
    } else {
      console.log('Cash sales table created or already exists.');
    }
  });

  // Cash sale items table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_cashsale_items (
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
  )`, (err) => {
    if (err) {
      console.error('Error creating cash sale items table:', err.message);
    } else {
      console.log('Cash sale items table created or already exists.');
    }
  });

  // Insert default category if none exists
  db.get("SELECT COUNT(*) as count FROM tbl_categories", (err, row) => {
    if (err) {
      console.error('Error checking categories:', err.message);
    } else if (row.count === 0) {
      db.run("INSERT INTO tbl_categories (category_name) VALUES (?)", ['General'], (err) => {
        if (err) {
          console.error('Error inserting default category:', err.message);
        } else {
          console.log('Default category "General" created.');
        }
      });
    }
  });
};

// Run setup
createTables();

// Close database connection after setup
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database setup completed successfully.');
    }
  });
}, 2000); 