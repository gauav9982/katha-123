const db = require('../config/database');

// Create tables
const createTables = () => {
  console.log('Creating tables...');

  // Items table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT,
    price REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, err => {
    if (err) {
      console.error('Error creating items table:', err);
    } else {
      console.log('✓ Items table created');
    }
  });

  // Customers table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, err => {
    if (err) {
      console.error('Error creating customers table:', err);
    } else {
      console.log('✓ Customers table created');
    }
  });

  // Sales table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount REAL,
    payment_status TEXT,
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES tbl_customers (id)
  )`, err => {
    if (err) {
      console.error('Error creating sales table:', err);
    } else {
      console.log('✓ Sales table created');
    }
  });

  // Sale Items table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    item_id INTEGER,
    quantity REAL,
    price_per_unit REAL,
    total_price REAL,
    FOREIGN KEY (sale_id) REFERENCES tbl_sales (id),
    FOREIGN KEY (item_id) REFERENCES tbl_items (id)
  )`, err => {
    if (err) {
      console.error('Error creating sale_items table:', err);
    } else {
      console.log('✓ Sale Items table created');
    }
  });

  // Purchases table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_name TEXT,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount REAL,
    payment_status TEXT,
    notes TEXT
  )`, err => {
    if (err) {
      console.error('Error creating purchases table:', err);
    } else {
      console.log('✓ Purchases table created');
    }
  });

  // Purchase Items table
  db.run(`CREATE TABLE IF NOT EXISTS tbl_purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER,
    item_id INTEGER,
    quantity REAL,
    price_per_unit REAL,
    total_price REAL,
    FOREIGN KEY (purchase_id) REFERENCES tbl_purchases (id),
    FOREIGN KEY (item_id) REFERENCES tbl_items (id)
  )`, err => {
    if (err) {
      console.error('Error creating purchase_items table:', err);
    } else {
      console.log('✓ Purchase Items table created');
    }
  });
};

// Run migrations
createTables(); 