const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Validation middleware
const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields,
        message: `Required fields missing: ${missingFields.join(', ')}`
      });
    }
    next();
  };
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: err.details || null
  });
});

// SQLite DB setup
const dbPath = path.join(__dirname, 'katha_sales.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables if not exist
const createTables = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tbl_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_number INTEGER NOT NULL,
      group_name TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tbl_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_number INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      group_id INTEGER NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tbl_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_code TEXT NOT NULL,
      item_name TEXT NOT NULL,
      mrp REAL NOT NULL,
      gst_percentage REAL DEFAULT 0,
      current_stock INTEGER DEFAULT 0,
      product_name TEXT,
      company_name TEXT,
      model TEXT,
      company_barcode TEXT,
      barcode_2 TEXT,
      opening_stock INTEGER DEFAULT 0,
      opening_cost REAL DEFAULT 0,
      category_id INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tbl_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      total_gst REAL DEFAULT 0,
      grand_total REAL NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tbl_purchase_items (
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
    // Add Cash Sales tables
    db.run(`CREATE TABLE IF NOT EXISTS tbl_cashsales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      sales_type TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      grand_total REAL NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tbl_cashsale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_code TEXT,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL
    )`);
    // Add Credit Sales tables
    db.run(`CREATE TABLE IF NOT EXISTS tbl_creditsales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      sales_type TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      grand_total REAL NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tbl_creditsale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_code TEXT,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      rate REAL NOT NULL,
      amount REAL NOT NULL
    )`);
    
    // Add Delivery Chalan tables
    db.run(`CREATE TABLE IF NOT EXISTS tbl_delivery_chalans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chalan_number TEXT NOT NULL,
      chalan_date TEXT NOT NULL,
      party_name TEXT NOT NULL,
      total_quantity INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tbl_delivery_chalan_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chalan_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_code TEXT,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL
    )`);
    
    // Add Party, Receipt, Payment, and Expense tables
    db.run(`CREATE TABLE IF NOT EXISTS tbl_parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      party_name TEXT NOT NULL,
      party_type TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      address TEXT,
      opening_balance REAL DEFAULT 0,
      balance_type TEXT DEFAULT 'cr',
      current_balance REAL DEFAULT 0
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS tbl_receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT NOT NULL,
      receipt_date TEXT NOT NULL,
      party_id INTEGER NOT NULL,
      party_name TEXT NOT NULL,
      bank_account TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_mode TEXT NOT NULL,
      cheque_number TEXT,
      cheque_date TEXT,
      bank_name TEXT,
      neft_date TEXT,
      is_on_account BOOLEAN DEFAULT 0,
      is_advance BOOLEAN DEFAULT 0,
      notes TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS tbl_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_number TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      party_id INTEGER NOT NULL,
      party_name TEXT NOT NULL,
      bank_account TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_mode TEXT NOT NULL,
      cheque_number TEXT,
      cheque_date TEXT,
      bank_name TEXT,
      neft_date TEXT,
      is_advance BOOLEAN DEFAULT 0,
      purchase_invoice_id INTEGER,
      purchase_invoice_number TEXT,
      notes TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS tbl_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voucher_number TEXT NOT NULL,
      expense_date TEXT NOT NULL,
      expense_type TEXT NOT NULL,
      payment_mode TEXT NOT NULL,
      bank_account TEXT,
      amount REAL NOT NULL,
      description TEXT,
      notes TEXT
    )`);
  });
};

createTables();

// Check if the per_item_cost column exists and add it if it doesn't
const addPerItemCostColumn = () => {
  console.log("Checking for per_item_cost column in tbl_purchase_items table...");
  db.all("PRAGMA table_info(tbl_purchase_items)", [], (err, columns) => {
    if (err) {
      console.error("Error checking table columns:", err);
      return;
    }
    
    const hasPerItemCost = columns.some(col => col.name === 'per_item_cost');
    
    if (!hasPerItemCost) {
      console.log("Adding per_item_cost column to tbl_purchase_items table...");
      db.run("ALTER TABLE tbl_purchase_items ADD COLUMN per_item_cost REAL DEFAULT 0", (alterErr) => {
        if (alterErr) {
          console.error("Error adding per_item_cost column:", alterErr);
        } else {
          console.log("Successfully added per_item_cost column to tbl_purchase_items table");
        }
      });
    } else {
      console.log("per_item_cost column already exists in tbl_purchase_items table");
    }
    
    // Check if item_code column exists
    const hasItemCode = columns.some(col => col.name === 'item_code');
    
    if (!hasItemCode) {
      console.log("Adding item_code column to tbl_purchase_items table...");
      db.run("ALTER TABLE tbl_purchase_items ADD COLUMN item_code TEXT", (alterErr) => {
        if (alterErr) {
          console.error("Error adding item_code column:", alterErr);
        } else {
          console.log("Successfully added item_code column to tbl_purchase_items table");
        }
      });
    } else {
      console.log("item_code column already exists in tbl_purchase_items table");
    }
  });
};

// Run the check for per_item_cost column
addPerItemCostColumn();

// API information route
app.get('/api', (req, res) => {
  console.log('API info route hit');
  res.send('Katha Sales Backend API Running');
});

// Custom route to get next group number
app.get('/api/groups-next-number', (req, res) => {
  db.get('SELECT group_number FROM tbl_groups ORDER BY group_number DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let nextNumber = 1;
    if (row && row.group_number) {
      nextNumber = row.group_number + 1;
      // Ensure group number is single digit
      if (nextNumber > 9) {
        return res.status(400).json({ error: 'Maximum group number (9) reached' });
      }
    }
    
    res.json({ next_number: nextNumber });
  });
});

// GROUPS CRUD ENDPOINTS
app.get('/api/groups', (req, res) => {
  db.all('SELECT * FROM tbl_groups ORDER BY group_number', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/groups/:id', (req, res) => {
  db.get('SELECT * FROM tbl_groups WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Group not found' });
    res.json(row);
  });
});

app.post('/api/groups', (req, res) => {
  const { group_number, group_name } = req.body;
  
  // Validate group number is between 1 and 9
  if (group_number < 1 || group_number > 9) {
    return res.status(400).json({ error: 'Group number must be between 1 and 9' });
  }
  
  db.run('INSERT INTO tbl_groups (group_number, group_name) VALUES (?, ?)', 
    [group_number, group_name], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, group_number, group_name });
    }
  );
});

app.put('/api/groups/:id', (req, res) => {
  const { group_number, group_name } = req.body;
  db.run('UPDATE tbl_groups SET group_number = ?, group_name = ? WHERE id = ?', [group_number, group_name, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, group_number, group_name });
  });
});

app.delete('/api/groups/:id', (req, res) => {
  db.run('DELETE FROM tbl_groups WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// CATEGORIES CRUD ENDPOINTS
app.get('/api/categories', (req, res) => {
  // Modified to include group_name by joining with tbl_groups
  const query = `
    SELECT c.*, g.group_name 
    FROM tbl_categories c
    LEFT JOIN tbl_groups g ON c.group_id = g.id
    ORDER BY c.category_number
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/categories/:id', (req, res) => {
  // Updated query to include group_name from tbl_groups
  const query = `
    SELECT c.*, g.group_name 
    FROM tbl_categories c
    LEFT JOIN tbl_groups g ON c.group_id = g.id
    WHERE c.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Category not found' });
    res.json(row);
  });
});

app.post('/api/categories', (req, res) => {
  const { category_number, category_name, group_id } = req.body;
  
  // Validate data
  if (!category_name || !group_id) {
    return res.status(400).json({ error: 'Category name and group ID are required' });
  }
  
  // If category_number is not provided, generate it based on group_number
  if (!category_number) {
    // Get the group info first
    db.get('SELECT group_number FROM tbl_groups WHERE id = ?', [group_id], (err, group) => {
    if (err) return res.status(500).json({ error: err.message });
      
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      const groupNumber = group.group_number;
      
      // Find the highest category number for this group
      db.all('SELECT category_number FROM tbl_categories WHERE group_id = ? ORDER BY category_number DESC LIMIT 1', 
        [group_id], 
        (err, categories) => {
          if (err) return res.status(500).json({ error: err.message });
          
          let nextCategoryNumber;
          
          if (categories.length === 0) {
            // No categories yet, start with groupNumber + "1"
            nextCategoryNumber = parseInt(groupNumber.toString() + "1");
          } else {
            // Get highest category number
            const highestCategoryNumber = categories[0].category_number;
            
            // Convert to string for analysis
            const highestStr = highestCategoryNumber.toString();
            const groupStr = groupNumber.toString();
            
            // Check if the highest number starts with the group number
            if (highestStr.startsWith(groupStr)) {
              // Get the part after the group number
              const suffix = highestStr.substring(groupStr.length);
              
              // Check if we need to transition from 9 to 10 in the sequence
              // For example, from 19 to 110 for group 1, or 29 to 210 for group 2
              // Works for all groups including double-digit groups
              if (suffix === '9') {
                // We're at the last single digit (e.g., 19, 29, 109), next should use 10 as suffix
                nextCategoryNumber = parseInt(groupStr + '10');
              } else {
                // Normal increment
                nextCategoryNumber = highestCategoryNumber + 1;
              }
            } else {
              // If it doesn't follow the pattern, start the pattern
              nextCategoryNumber = parseInt(groupNumber.toString() + "1");
            }
          }
          
          console.log('Generated next category number for new category:', nextCategoryNumber);
          
          // Now insert with the generated number
          db.run('INSERT INTO tbl_categories (category_number, category_name, group_id) VALUES (?, ?, ?)', 
            [nextCategoryNumber, category_name, group_id], 
            function(err) {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ 
                id: this.lastID, 
                category_number: nextCategoryNumber, 
                category_name, 
                group_id 
              });
            }
          );
        }
      );
    });
  } else {
    // Use the provided category_number
    db.run('INSERT INTO tbl_categories (category_number, category_name, group_id) VALUES (?, ?, ?)', 
      [category_number, category_name, group_id], 
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, category_number, category_name, group_id });
      }
    );
  }
});

app.put('/api/categories/:id', (req, res) => {
  const { category_number, category_name, group_id } = req.body;
  db.run('UPDATE tbl_categories SET category_number = ?, category_name = ?, group_id = ? WHERE id = ?', [category_number, category_name, group_id, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, category_number, category_name, group_id });
  });
});

app.delete('/api/categories/:id', (req, res) => {
  db.run('DELETE FROM tbl_categories WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Custom route to get next category number based on group
app.get('/api/categories-next-number', (req, res) => {
  const groupId = req.query.group_id;
  
  if (!groupId) {
    return res.status(400).json({ error: 'Group ID query parameter is required' });
  }
  
  // First get the group number
  db.get('SELECT group_number FROM tbl_groups WHERE id = ?', [groupId], (err, group) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const groupNumber = group.group_number;
    console.log('Group number:', groupNumber);
    
    // Find categories with this group_id
    db.all('SELECT category_number FROM tbl_categories WHERE group_id = ? ORDER BY category_number DESC', [groupId],
      (err, categories) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let nextNumber;
        
        if (categories.length === 0) {
          // No categories yet, start with groupNumber + "1"
          nextNumber = parseInt(groupNumber.toString() + "1");
        } else {
          // Get highest category number
          const highestNumber = categories[0].category_number;
          const suffix = highestNumber % 10; // Get last digit
          
          if (suffix === 9) {
            // We're at X9, move to next tens (e.g., 19 -> 21 or 29 -> 31)
            const nextGroup = Math.floor(highestNumber / 10) + 1;
            if (nextGroup > 99) {
              return res.status(400).json({ error: 'Maximum category number reached for this group' });
            }
            nextNumber = nextGroup * 10 + 1;
          } else {
            // Normal increment within the same tens
            nextNumber = highestNumber + 1;
          }
        }
        
        console.log('Generated next category number:', nextNumber);
        res.json({ next_number: nextNumber });
      }
    );
  });
});

// ITEMS CRUD ENDPOINTS
app.get('/api/items', (req, res) => {
  console.log('Get all items route hit');
  
  // Check if we have item_code query parameter for search
  const searchValue = req.query.item_code;
  const queryValue = req.query.query;
  
  if (searchValue) {
    console.log('Searching for item with code or barcode:', searchValue);
    
    // To ensure exact string matches, we'll cast values to text strings in the query
    // This prevents SQLite from doing type conversions that could cause "1" to match "1101"
    db.all(`SELECT * FROM tbl_items WHERE 
      CAST(item_code AS TEXT) = CAST(? AS TEXT) OR 
      CAST(company_barcode AS TEXT) = CAST(? AS TEXT) OR 
      CAST(barcode_2 AS TEXT) = CAST(? AS TEXT)`, 
      [searchValue, searchValue, searchValue], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Add additional logging to debug the matches
        console.log(`Search for "${searchValue}" found ${rows.length} items:`, 
          rows.map(r => ({id: r.id, code: r.item_code, name: r.item_name})));
        
        res.json(rows);
      }
    );
  } else if (queryValue) {
    // Search by name with LIKE operator for partial matches
    console.log('Searching for items with name containing:', queryValue);
    
    const searchPattern = `%${queryValue}%`;
    
    db.all(`SELECT * FROM tbl_items WHERE 
      item_name LIKE ? OR
      item_code LIKE ? OR
      company_barcode LIKE ? OR
      barcode_2 LIKE ? 
      LIMIT 20`, 
      [searchPattern, searchPattern, searchPattern, searchPattern], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        console.log(`Search for "${queryValue}" found ${rows.length} items`);
        res.json(rows);
      }
    );
  } else {
    // Return all items when no filter is provided
    db.all('SELECT * FROM tbl_items', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// Custom route for max-code
app.get('/api/items-max-code', (req, res) => {
  const category_number = req.query.category_number;
  console.log('Category number received:', category_number);
  
  if (!category_number) {
    return res.status(400).json({ error: 'category_number parameter is required' });
  }
  
  // Calculate expected item code length based on category number length
  const categoryLength = category_number.length;
  const expectedLength = categoryLength + 2; // Add 2 for sequence digits
  
  console.log('Category length:', categoryLength);
  console.log('Expected item code length:', expectedLength);
  
  // Get all items for this category
  const query = `
    SELECT item_code 
    FROM tbl_items 
    WHERE item_code LIKE '${category_number}%'
      AND LENGTH(item_code) = ${expectedLength}
    ORDER BY 
      CAST(substr(item_code, -2) AS INTEGER) DESC
    LIMIT 1
  `;
  console.log('Executing query:', query);
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    console.log('Found items:', rows);
    
    // If no items exist, start with 01
    if (!rows || rows.length === 0) {
      const first_code = `${category_number}01`;
      console.log('No items found, using first code:', first_code);
      return res.json({ last_code: first_code });
    }
    
    // Get the sequence from the highest item code (last 2 digits)
    const highestCode = rows[0].item_code;
    const sequence = parseInt(highestCode.slice(-2));
    
    console.log('Highest code found:', highestCode);
    console.log('Current sequence:', sequence);
    
    // If sequence is invalid or 99, start with 01
    if (isNaN(sequence) || sequence === 99) {
      const first_code = `${category_number}01`;
      console.log('Invalid sequence or 99, starting with:', first_code);
      return res.json({ last_code: first_code });
    }
    
    // Increment sequence and ensure 2 digits
    const nextSequence = (sequence + 1).toString().padStart(2, '0');
    const next_code = `${category_number}${nextSequence}`;
    
    console.log('Next code will be:', next_code);
    res.json({ last_code: next_code });
  });
});

app.get('/api/items/:id', (req, res) => {
  console.log('Get item by ID route hit, id:', req.params.id);
  db.get('SELECT * FROM tbl_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    res.json(row);
  });
});

app.post('/api/items', validateRequest(['item_code', 'item_name', 'mrp']), (req, res) => {
  const { item_code, item_name, mrp, gst_percentage, current_stock, product_name, company_name, model, company_barcode, barcode_2, opening_stock, opening_cost, category_id } = req.body;
  db.run(`INSERT INTO tbl_items (item_code, item_name, mrp, gst_percentage, current_stock, product_name, company_name, model, company_barcode, barcode_2, opening_stock, opening_cost, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [item_code, item_name, mrp, gst_percentage, current_stock, product_name, company_name, model, company_barcode, barcode_2, opening_stock, opening_cost, category_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

app.put('/api/items/:id', (req, res) => {
  const { item_code, item_name, mrp, gst_percentage, current_stock, product_name, company_name, model, company_barcode, barcode_2, opening_stock, opening_cost, category_id } = req.body;
  db.run(`UPDATE tbl_items SET item_code = ?, item_name = ?, mrp = ?, gst_percentage = ?, current_stock = ?, product_name = ?, company_name = ?, model = ?, company_barcode = ?, barcode_2 = ?, opening_stock = ?, opening_cost = ?, category_id = ? WHERE id = ?`,
    [item_code, item_name, mrp, gst_percentage, current_stock, product_name, company_name, model, company_barcode, barcode_2, opening_stock, opening_cost, category_id, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: req.params.id, ...req.body });
    }
  );
});

app.delete('/api/items/:id', (req, res) => {
  db.run('DELETE FROM tbl_items WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// PURCHASES CRUD ENDPOINTS
app.get('/api/purchases', (req, res) => {
  db.all('SELECT * FROM tbl_purchases', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/purchases/:id', (req, res) => {
  db.get('SELECT * FROM tbl_purchases WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Purchase not found' });
    res.json(row);
  });
});

app.post('/api/purchases', validateRequest(['invoice_number', 'invoice_date', 'vendor_name']), (req, res) => {
  const { invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total } = req.body;
  db.run('INSERT INTO tbl_purchases (invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total) VALUES (?, ?, ?, ?, ?, ?)', [invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total });
  });
});

app.put('/api/purchases/:id', (req, res) => {
  const { invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total } = req.body;
  db.run('UPDATE tbl_purchases SET invoice_number = ?, invoice_date = ?, vendor_name = ?, subtotal = ?, total_gst = ?, grand_total = ? WHERE id = ?', [invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total });
  });
});

app.delete('/api/purchases/:id', (req, res) => {
  db.run('DELETE FROM tbl_purchases WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// PURCHASE ITEMS CRUD ENDPOINTS
app.get('/api/purchase-items', (req, res) => {
  // Filter by purchase_id or item_id if provided
  const purchaseId = req.query.purchase_id;
  const itemId = req.query.item_id;
  const itemCode = req.query.item_code;
  
  if (purchaseId) {
    db.all('SELECT * FROM tbl_purchase_items WHERE purchase_id = ?', 
      [purchaseId], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else if (itemId) {
    db.all('SELECT * FROM tbl_purchase_items WHERE item_id = ?', 
      [itemId], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else if (itemCode) {
    // Find purchase items by item code
    db.all('SELECT * FROM tbl_purchase_items WHERE item_code = ?', 
      [itemCode], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else {
    db.all('SELECT * FROM tbl_purchase_items', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// New endpoint to get last purchase details by item code
app.get('/api/last-purchase-by-code', (req, res) => {
  const itemCode = req.query.item_code;
  
  if (!itemCode) {
    return res.status(400).json({ error: 'Item code is required' });
  }
  
  console.log('Looking up last purchase details for item code:', itemCode);
  
  // Get the item details first
  db.get('SELECT * FROM tbl_items WHERE item_code = ?', [itemCode], (err, item) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!item) {
            return res.status(404).json({ error: 'Item not found' });
          }
          
    // Find all purchase items for this item
    db.all('SELECT pi.* FROM tbl_purchase_items pi WHERE pi.item_id = ? OR pi.item_code = ?', 
      [item.id, item.item_code], 
      (err, purchaseItems) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (!purchaseItems || purchaseItems.length === 0) {
          // No purchases found, return item details with opening cost
          return res.json({
            item: item,
            lastPurchase: null,
            lastCost: item.opening_cost || 0,
            lastPurchaseDate: "No purchase"
          });
        }
        
        // Get all purchase IDs
        const purchaseIds = purchaseItems.map(pi => pi.purchase_id);
        
        if (purchaseIds.length === 0) {
          return res.json({
            item: item,
            lastPurchase: null,
            lastCost: item.opening_cost || 0,
            lastPurchaseDate: "No purchase"
          });
        }
        
        // Create placeholders for SQL query
        const placeholders = purchaseIds.map(() => '?').join(',');
        
        // Get purchase details
        db.all(`SELECT * FROM tbl_purchases WHERE id IN (${placeholders})`, 
          purchaseIds, 
          (err, purchases) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (!purchases || purchases.length === 0) {
              // No purchase headers found
              return res.json({
                item: item,
                lastPurchase: null,
                lastCost: item.opening_cost || 0,
                lastPurchaseDate: "No purchase"
              });
            }
            
            // Sort purchases by date (most recent first)
            purchases.sort((a, b) => {
              const dateA = a.invoice_date || "";
              const dateB = b.invoice_date || "";
              return new Date(dateB) - new Date(dateA);
            });
            
            // Get the most recent purchase
            const latestPurchase = purchases[0];
            
            // Find the purchase item in the latest purchase
            const latestPurchaseItem = purchaseItems.find(pi => 
              pi.purchase_id === latestPurchase.id
            );
            
            if (!latestPurchaseItem) {
              // Should not happen, but handle it anyway
              return res.json({
                item: item,
                lastPurchase: latestPurchase,
                lastCost: item.opening_cost || 0,
                lastPurchaseDate: "No purchase"
              });
            }
            
            // Return the item details with last purchase info
            res.json({
              item: item,
              lastPurchase: latestPurchase,
              lastCost: latestPurchaseItem.per_item_cost || latestPurchaseItem.rate || item.opening_cost || 0,
              lastPurchaseDate: latestPurchase.invoice_date || "Unknown date"
            });
          }
        );
      }
    );
  });
});

app.get('/api/purchase-items/:id', (req, res) => {
  db.get('SELECT * FROM tbl_purchase_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Purchase Item not found' });
    res.json(row);
  });
});

app.post('/api/purchase-items', validateRequest(['purchase_id', 'item_id', 'item_name', 'quantity', 'rate']), (req, res) => {
  try {
    let { purchase_id, item_id, item_code, item_name, quantity, rate, amount, gst_percentage, gst_amount, transport_charge, other_charge, per_item_cost } = req.body;
    
    // Validate numeric fields
    const numericFields = {
      quantity: Number(quantity),
      rate: Number(rate),
      amount: Number(amount) || 0,
      gst_percentage: Number(gst_percentage) || 0,
      gst_amount: Number(gst_amount) || 0,
      transport_charge: Number(transport_charge) || 0,
      other_charge: Number(other_charge) || 0
    };

    // Check for NaN values
    const invalidFields = Object.entries(numericFields)
      .filter(([key, value]) => isNaN(value))
      .map(([key]) => key);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid numeric values',
        fields: invalidFields,
        message: `Invalid numeric values for fields: ${invalidFields.join(', ')}`
      });
    }

    // Update the values with validated numbers
    Object.assign(req.body, numericFields);

    // Calculate totals
    const total = numericFields.amount + numericFields.gst_amount + numericFields.transport_charge + numericFields.other_charge;
    per_item_cost = numericFields.quantity > 0 ? total / numericFields.quantity : 0;

    db.run(`INSERT INTO tbl_purchase_items (purchase_id, item_id, item_code, item_name, quantity, rate, amount, gst_percentage, gst_amount, transport_charge, other_charge, per_item_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [purchase_id, item_id, item_code, item_name, quantity, rate, amount, gst_percentage, gst_amount, transport_charge, other_charge, per_item_cost],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, ...req.body, per_item_cost });
      }
    );
  } catch (error) {
    console.error('Error processing purchase item:', error);
    res.status(400).json({
      error: 'Invalid request data',
      message: error.message,
      details: error.stack
    });
  }
});

app.put('/api/purchase-items/:id', (req, res) => {
  let { purchase_id, item_id, item_code, item_name, quantity, rate, amount, gst_percentage, gst_amount, transport_charge, other_charge, per_item_cost } = req.body;
  // Calculate per_item_cost on backend
  amount = Number(amount) || 0;
  gst_amount = Number(gst_amount) || 0;
  transport_charge = Number(transport_charge) || 0;
  other_charge = Number(other_charge) || 0;
  quantity = Number(quantity) || 1;
  const total = amount + gst_amount + transport_charge + other_charge;
  per_item_cost = quantity > 0 ? total / quantity : 0;
  db.run(`UPDATE tbl_purchase_items SET 
    purchase_id = ?, 
    item_id = ?, 
    item_code = ?,
    item_name = ?, 
    quantity = ?, 
    rate = ?, 
    amount = ?, 
    gst_percentage = ?, 
    gst_amount = ?, 
    transport_charge = ?, 
    other_charge = ?,
    per_item_cost = ? 
    WHERE id = ?`,
    [purchase_id, item_id, item_code, item_name, quantity, rate, amount, gst_percentage, gst_amount, transport_charge, other_charge, per_item_cost, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: req.params.id, ...req.body, per_item_cost });
    }
  );
});

app.delete('/api/purchase-items/:id', (req, res) => {
  db.run('DELETE FROM tbl_purchase_items WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// CASH SALES CRUD ENDPOINTS
app.get('/api/cashsales', (req, res) => {
  console.log('Fetching all cash sales...');
  db.all('SELECT * FROM tbl_cashsales ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching cash sales:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Found ${rows.length} cash sales in database`);
    res.json(rows);
  });
});

app.get('/api/cashsales/:id', (req, res) => {
  db.get('SELECT * FROM tbl_cashsales WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Cash Sale not found' });
    res.json(row);
  });
});

app.post('/api/cashsales', (req, res) => {
  const { invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total } = req.body;
  db.run('INSERT INTO tbl_cashsales (invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total) VALUES (?, ?, ?, ?, ?, ?)', 
    [invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        invoice_number, 
        invoice_date, 
        customer_name, 
        sales_type, 
        subtotal, 
        grand_total 
      });
    }
  );
});

app.put('/api/cashsales/:id', (req, res) => {
  const { invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total } = req.body;
  db.run('UPDATE tbl_cashsales SET invoice_number = ?, invoice_date = ?, customer_name = ?, sales_type = ?, subtotal = ?, grand_total = ? WHERE id = ?', 
    [invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total, req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: req.params.id, 
        invoice_number, 
        invoice_date, 
        customer_name, 
        sales_type, 
        subtotal, 
        grand_total 
      });
    }
  );
});

app.delete('/api/cashsales/:id', (req, res) => {
  db.run('DELETE FROM tbl_cashsales WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// CASH SALE ITEMS CRUD ENDPOINTS
app.get('/api/cashsale-items', (req, res) => {
  const saleId = req.query.sale_id;
  
  if (saleId) {
    db.all('SELECT * FROM tbl_cashsale_items WHERE sale_id = ?', [saleId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all('SELECT * FROM tbl_cashsale_items', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.get('/api/cashsale-items/:id', (req, res) => {
  db.get('SELECT * FROM tbl_cashsale_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Cash Sale Item not found' });
    res.json(row);
  });
});

app.post('/api/cashsale-items', (req, res) => {
  const { sale_id, item_id, item_name, item_code, quantity, rate, amount } = req.body;
  db.run('INSERT INTO tbl_cashsale_items (sale_id, item_id, item_name, item_code, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [sale_id, item_id, item_name, item_code, quantity, rate, amount], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        sale_id, 
        item_id, 
        item_name,
        item_code, 
        quantity, 
        rate, 
        amount 
      });
    }
  );
});

app.put('/api/cashsale-items/:id', (req, res) => {
  const { sale_id, item_id, item_name, item_code, quantity, rate, amount } = req.body;
  db.run('UPDATE tbl_cashsale_items SET sale_id = ?, item_id = ?, item_name = ?, item_code = ?, quantity = ?, rate = ?, amount = ? WHERE id = ?', 
    [sale_id, item_id, item_name, item_code, quantity, rate, amount, req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: req.params.id, 
        sale_id, 
        item_id, 
        item_name,
        item_code, 
        quantity, 
        rate, 
        amount 
      });
    }
  );
});

app.delete('/api/cashsale-items/:id', (req, res) => {
  db.run('DELETE FROM tbl_cashsale_items WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// CREDIT SALES CRUD ENDPOINTS
app.get('/api/creditsales', (req, res) => {
  db.all('SELECT * FROM tbl_creditsales', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/creditsales/:id', (req, res) => {
  db.get('SELECT * FROM tbl_creditsales WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Credit Sale not found' });
    res.json(row);
  });
});

app.post('/api/creditsales', (req, res) => {
  const { invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total } = req.body;
  db.run('INSERT INTO tbl_creditsales (invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total) VALUES (?, ?, ?, ?, ?, ?)', 
    [invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        invoice_number, 
        invoice_date, 
        customer_name, 
        sales_type, 
        subtotal, 
        grand_total 
      });
    }
  );
});

app.put('/api/creditsales/:id', (req, res) => {
  const { invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total } = req.body;
  db.run('UPDATE tbl_creditsales SET invoice_number = ?, invoice_date = ?, customer_name = ?, sales_type = ?, subtotal = ?, grand_total = ? WHERE id = ?', 
    [invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total, req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: req.params.id, 
        invoice_number, 
        invoice_date, 
        customer_name, 
        sales_type, 
        subtotal, 
        grand_total 
      });
    }
  );
});

app.delete('/api/creditsales/:id', (req, res) => {
  db.run('DELETE FROM tbl_creditsales WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// CREDIT SALE ITEMS CRUD ENDPOINTS
app.get('/api/creditsale-items', (req, res) => {
  const saleId = req.query.sale_id;
  
  if (saleId) {
    db.all('SELECT * FROM tbl_creditsale_items WHERE sale_id = ?', [saleId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all('SELECT * FROM tbl_creditsale_items', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.get('/api/creditsale-items/:id', (req, res) => {
  db.get('SELECT * FROM tbl_creditsale_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Credit Sale Item not found' });
    res.json(row);
  });
});

app.post('/api/creditsale-items', (req, res) => {
  const { sale_id, item_id, item_name, item_code, quantity, rate, amount } = req.body;
  db.run('INSERT INTO tbl_creditsale_items (sale_id, item_id, item_name, item_code, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [sale_id, item_id, item_name, item_code, quantity, rate, amount], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        sale_id, 
        item_id, 
        item_name,
        item_code, 
        quantity, 
        rate, 
        amount 
      });
    }
  );
});

app.put('/api/creditsale-items/:id', (req, res) => {
  const { sale_id, item_id, item_name, item_code, quantity, rate, amount } = req.body;
  db.run('UPDATE tbl_creditsale_items SET sale_id = ?, item_id = ?, item_name = ?, item_code = ?, quantity = ?, rate = ?, amount = ? WHERE id = ?', 
    [sale_id, item_id, item_name, item_code, quantity, rate, amount, req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: req.params.id, 
        sale_id, 
        item_id, 
        item_name,
        item_code, 
        quantity, 
        rate, 
        amount 
      });
    }
  );
});

app.delete('/api/creditsale-items/:id', (req, res) => {
  db.run('DELETE FROM tbl_creditsale_items WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// New endpoint for exact item lookup by code or barcode (for Tab/Enter key in forms)
app.get('/api/item-exact', (req, res) => {
  const searchValue = req.query.code;
  
  if (!searchValue) {
    return res.status(400).json({ error: 'Item code is required' });
  }
  
  console.log('Exact item lookup triggered (Tab/Enter key):', searchValue);
  
  // Strict exact matching with CAST to ensure proper type handling
  db.get(`SELECT * FROM tbl_items WHERE 
    CAST(item_code AS TEXT) = CAST(? AS TEXT) OR 
    CAST(company_barcode AS TEXT) = CAST(? AS TEXT) OR 
    CAST(barcode_2 AS TEXT) = CAST(? AS TEXT) 
    LIMIT 1`, 
    [searchValue, searchValue, searchValue], 
    (err, item) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (!item) {
        console.log('No exact match found for code:', searchValue);
        return res.status(404).json({ 
          error: 'No item found with this exact code',
          message: 'कोई आइटम नहीं मिला' // Hindi message
        });
      }
      
      console.log('Exact match found:', item.item_name);
      
      // Look up the last purchase details for this item
      db.all('SELECT pi.*, p.invoice_date FROM tbl_purchase_items pi JOIN tbl_purchases p ON pi.purchase_id = p.id WHERE pi.item_id = ? OR pi.item_code = ?', 
        [item.id, item.item_code],
        (err, purchaseItems) => {
          if (err) return res.status(500).json({ error: err.message });
          
          const lastPurchase = purchaseItems && purchaseItems.length > 0 ? purchaseItems[0] : null;
          
          // Return both item and its last purchase details
          res.json({
            item: item,
            lastPurchase: lastPurchase,
            lastCost: lastPurchase ? lastPurchase.per_item_cost || lastPurchase.rate || item.opening_cost || 0 : item.opening_cost || 0,
            lastPurchaseDate: lastPurchase ? lastPurchase.invoice_date || "Unknown date" : "No purchase"
          });
        }
      );
    }
  );
});

// DELIVERY CHALAN CRUD ENDPOINTS
app.get('/api/delivery-chalans', (req, res) => {
  db.all('SELECT * FROM tbl_delivery_chalans ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/delivery-chalans/:id', (req, res) => {
  db.get('SELECT * FROM tbl_delivery_chalans WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Delivery Chalan not found' });
    res.json(row);
  });
});

app.post('/api/delivery-chalans', (req, res) => {
  console.log('POST request to /api/delivery-chalans');
  console.log('Request body:', req.body);
  
  const { chalan_number, chalan_date, party_name, total_quantity } = req.body;
  
  // Validate required fields
  if (!chalan_number || !chalan_date || !party_name) {
    console.log('Missing required fields in request');
    return res.status(400).json({ error: 'Missing required fields: chalan_number, chalan_date, and party_name are required' });
  }
  
  db.run(
    'INSERT INTO tbl_delivery_chalans (chalan_number, chalan_date, party_name, total_quantity) VALUES (?, ?, ?, ?)',
    [chalan_number, chalan_date, party_name, total_quantity],
    function(err) {
      if (err) {
        console.error('Database error in delivery-chalans POST:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log('Successfully created delivery chalan with ID:', this.lastID);
      res.json({ id: this.lastID, chalan_number, chalan_date, party_name, total_quantity });
    }
  );
});

app.put('/api/delivery-chalans/:id', (req, res) => {
  const { chalan_number, chalan_date, party_name, total_quantity } = req.body;
  db.run(
    'UPDATE tbl_delivery_chalans SET chalan_number = ?, chalan_date = ?, party_name = ?, total_quantity = ? WHERE id = ?',
    [chalan_number, chalan_date, party_name, total_quantity, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: parseInt(req.params.id),
        chalan_number,
        chalan_date,
        party_name,
        total_quantity
      });
    }
  );
});

app.delete('/api/delivery-chalans/:id', (req, res) => {
  db.run('DELETE FROM tbl_delivery_chalans WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELIVERY CHALAN ITEMS CRUD ENDPOINTS
app.get('/api/delivery-chalan-items', (req, res) => {
  // Filter by chalan_id if provided
  const chalanId = req.query.chalan_id;
  
  if (chalanId) {
    db.all('SELECT * FROM tbl_delivery_chalan_items WHERE chalan_id = ?', 
      [chalanId], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else {
    db.all('SELECT * FROM tbl_delivery_chalan_items', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.get('/api/delivery-chalan-items/:id', (req, res) => {
  db.get('SELECT * FROM tbl_delivery_chalan_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Delivery Chalan Item not found' });
    res.json(row);
  });
});

app.post('/api/delivery-chalan-items', (req, res) => {
  const { chalan_id, item_id, item_code, item_name, quantity } = req.body;
  db.run(
    'INSERT INTO tbl_delivery_chalan_items (chalan_id, item_id, item_code, item_name, quantity) VALUES (?, ?, ?, ?, ?)',
    [chalan_id, item_id, item_code, item_name, quantity],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        chalan_id, 
        item_id, 
        item_code, 
        item_name, 
        quantity 
      });
    }
  );
});

app.delete('/api/delivery-chalan-items/:id', (req, res) => {
  db.run('DELETE FROM tbl_delivery_chalan_items WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Stock report API endpoints
app.get('/api/reports/stock-by-group', (req, res) => {
  const query = `
    SELECT 
      g.id AS group_id,
      g.group_number,
      g.group_name,
      COUNT(DISTINCT c.id) AS category_count,
      COUNT(i.id) AS item_count,
      SUM(i.current_stock) AS total_stock
    FROM 
      tbl_groups g
    LEFT JOIN 
      tbl_categories c ON g.id = c.group_id
    LEFT JOIN 
      tbl_items i ON c.id = i.category_id
    GROUP BY 
      g.id
    ORDER BY 
      g.group_number
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/reports/stock-by-category', (req, res) => {
  // If group_id is provided, filter by group
  const groupId = req.query.group_id;
  
  let query = `
    SELECT 
      c.id AS category_id,
      c.category_number,
      c.category_name,
      g.id AS group_id,
      g.group_number,
      g.group_name,
      COUNT(i.id) AS item_count,
      SUM(i.current_stock) AS total_stock
    FROM 
      tbl_categories c
    LEFT JOIN 
      tbl_groups g ON c.group_id = g.id
    LEFT JOIN 
      tbl_items i ON c.id = i.category_id
  `;
  
  // Add WHERE clause if groupId is provided
  if (groupId) {
    query += ` WHERE c.group_id = ${groupId}`;
  }
  
  // Complete the query with GROUP BY and ORDER BY
  query += `
    GROUP BY 
      c.id
    ORDER BY 
      g.group_number, c.category_number
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/reports/stock-by-item', (req, res) => {
  // Filter by category_id if provided
  const categoryId = req.query.category_id;
  const groupId = req.query.group_id;
  
  let query = `
    SELECT 
      i.id AS item_id,
      i.item_code,
      i.item_name,
      i.current_stock,
      i.mrp,
      i.gst_percentage,
      i.opening_cost,
      c.id AS category_id,
      c.category_number,
      c.category_name,
      g.id AS group_id,
      g.group_number,
      g.group_name
    FROM 
      tbl_items i
    LEFT JOIN 
      tbl_categories c ON i.category_id = c.id
    LEFT JOIN 
      tbl_groups g ON c.group_id = g.id
  `;
  
  // Add WHERE clauses if filters are provided
  if (categoryId || groupId) {
    query += ' WHERE ';
    
    if (categoryId) {
      query += `i.category_id = ${categoryId}`;
    }
    
    if (groupId && categoryId) {
      query += ` AND c.group_id = ${groupId}`;
    } else if (groupId) {
      query += `c.group_id = ${groupId}`;
    }
  }
  
  // Complete the query with ORDER BY
  query += `
    ORDER BY 
      g.group_number, c.category_number, i.item_name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// New Item Transaction History API endpoint
app.get('/api/reports/item-transactions', (req, res) => {
  const itemId = req.query.item_id;
  const itemCode = req.query.item_code;
  
  if (!itemId && !itemCode) {
    return res.status(400).json({ error: 'Item ID or item code is required' });
  }
  
  console.log('Generating transaction history for item:', itemId || itemCode);
  
  // First, get the item details
  let itemQuery = 'SELECT * FROM tbl_items WHERE ';
  let queryParam = null;
  
  if (itemId) {
    itemQuery += 'id = ?';
    queryParam = itemId;
  } else {
    itemQuery += 'item_code = ?';
    queryParam = itemCode;
  }
  
  db.get(itemQuery, [queryParam], (err, item) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const itemId = item.id;
    const itemCode = item.item_code;
    
    // Initialize transactions array
    const transactions = [];
    
    // 1. Add opening stock as first transaction
    transactions.push({
      id: 0,
      date: new Date('2023-01-01').toISOString().split('T')[0], // Use beginning of year or specific opening date
      transaction_type: 'OPENING',
      reference_no: 'OPENING-BALANCE',
      party_name: 'SELF',
      inward: 0,
      outward: 0,
      opening_stock: 0,
      closing_stock: item.opening_stock || 0
    });
    
    // Get a promise for each transaction type
    const promises = [
      // 2. Get purchase transactions
      new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            pi.id,
            p.invoice_date AS date,
            'PURCHASE' AS transaction_type,
            p.invoice_number AS reference_no,
            p.vendor_name AS party_name,
            pi.quantity AS inward,
            0 AS outward
          FROM 
            tbl_purchase_items pi
          JOIN 
            tbl_purchases p ON pi.purchase_id = p.id
          WHERE 
            pi.item_id = ? OR pi.item_code = ?
          ORDER BY 
            p.invoice_date
        `, [itemId, itemCode], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      
      // 3. Get cash sale transactions
      new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            csi.id,
            cs.invoice_date AS date,
            'CASH_SALE' AS transaction_type,
            cs.invoice_number AS reference_no,
            cs.customer_name AS party_name,
            0 AS inward,
            csi.quantity AS outward
          FROM 
            tbl_cashsale_items csi
          JOIN 
            tbl_cashsales cs ON csi.sale_id = cs.id
          WHERE 
            csi.item_id = ? OR csi.item_code = ?
          ORDER BY 
            cs.invoice_date
        `, [itemId, itemCode], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      
      // 4. Get credit sale transactions
      new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            csi.id,
            cs.invoice_date AS date,
            'CREDIT_SALE' AS transaction_type,
            cs.invoice_number AS reference_no,
            cs.customer_name AS party_name,
            0 AS inward,
            csi.quantity AS outward
          FROM 
            tbl_creditsale_items csi
          JOIN 
            tbl_creditsales cs ON csi.sale_id = cs.id
          WHERE 
            csi.item_id = ? OR csi.item_code = ?
          ORDER BY 
            cs.invoice_date
        `, [itemId, itemCode], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }),
      
      // 5. Get delivery chalan transactions
      new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            dci.id,
            dc.chalan_date AS date,
            'DELIVERY' AS transaction_type,
            dc.chalan_number AS reference_no,
            dc.party_name AS party_name,
            0 AS inward,
            dci.quantity AS outward
          FROM 
            tbl_delivery_chalan_items dci
          JOIN 
            tbl_delivery_chalans dc ON dci.chalan_id = dc.id
          WHERE 
            dci.item_id = ? OR dci.item_code = ?
          ORDER BY 
            dc.chalan_date
        `, [itemId, itemCode], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      })
    ];
    
    // Process all transaction queries
    Promise.all(promises)
      .then(results => {
        // Combine all transaction types into one array
        let allTransactions = [];
        results.forEach(result => {
          allTransactions = [...allTransactions, ...result];
        });
        
        // Sort by date
        allTransactions.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        // Add running balance
        let runningStock = item.opening_stock || 0;
        
        allTransactions.forEach(transaction => {
          const openingStock = runningStock;
          const inward = transaction.inward || 0;
          const outward = transaction.outward || 0;
          
          runningStock = openingStock + inward - outward;
          
          transactions.push({
            ...transaction,
            opening_stock: openingStock,
            closing_stock: runningStock
          });
        });
        
        res.json(transactions);
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: error.message });
      });
  });
});

// PARTIES CRUD ENDPOINTS
app.get('/api/parties', (req, res) => {
  const partyType = req.query.party_type;
  
  let query = 'SELECT * FROM tbl_parties';
  if (partyType) {
    query += ` WHERE party_type = '${partyType}'`;
  }
  query += ' ORDER BY party_name';
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Map database fields to frontend expected fields
    const mappedRows = rows.map(row => ({
      id: row.id,
      party_name: row.party_name,
      party_type: row.party_type,
      contact_person: row.party_contact || '',
      phone: '', // Not in database
      address: row.party_address || '',
      opening_balance: row.opening_balance || 0,
      balance_type: row.balance_type || 'CR',
      current_balance: row.opening_balance || 0 // Using opening_balance as current_balance
    }));
    
    res.json(mappedRows);
  });
});

app.get('/api/parties/:id', (req, res) => {
  db.get('SELECT * FROM tbl_parties WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Party not found' });
    
    // Map database fields to frontend expected fields
    const mappedRow = {
      id: row.id,
      party_name: row.party_name,
      party_type: row.party_type,
      contact_person: row.party_contact || '',
      phone: '', // Not in database
      address: row.party_address || '',
      opening_balance: row.opening_balance || 0,
      balance_type: row.balance_type || 'CR',
      current_balance: row.opening_balance || 0 // Using opening_balance as current_balance
    };
    
    res.json(mappedRow);
  });
});

app.post('/api/parties', (req, res) => {
  const { party_name, party_type, contact_person, phone, address, opening_balance, balance_type } = req.body;
  
  // Validate required fields
  if (!party_name || !party_type) {
    return res.status(400).json({ error: 'Party name and party type are required' });
  }
  
  // Map frontend fields to database fields
  const party_contact = contact_person || '';
  const party_address = address || '';
  
  db.run(
    'INSERT INTO tbl_parties (party_name, party_type, party_contact, party_address, opening_balance, balance_type) VALUES (?, ?, ?, ?, ?, ?)',
    [party_name, party_type, party_contact, party_address, opening_balance || 0, balance_type || 'CR'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        party_name, 
        party_type, 
        contact_person: party_contact,
        phone: '',
        address: party_address, 
        opening_balance: opening_balance || 0, 
        balance_type: balance_type || 'CR',
        current_balance: opening_balance || 0
      });
    }
  );
});

app.put('/api/parties/:id', (req, res) => {
  const { party_name, party_type, contact_person, phone, address, opening_balance, balance_type } = req.body;
  
  // Map frontend fields to database fields
  const party_contact = contact_person || '';
  const party_address = address || '';
  
  db.run(
    'UPDATE tbl_parties SET party_name = ?, party_type = ?, party_contact = ?, party_address = ?, opening_balance = ?, balance_type = ? WHERE id = ?',
    [party_name, party_type, party_contact, party_address, opening_balance || 0, balance_type || 'CR', req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: parseInt(req.params.id), 
        party_name, 
        party_type, 
        contact_person: party_contact,
        phone: '',
        address: party_address, 
        opening_balance: opening_balance || 0, 
        balance_type: balance_type || 'CR',
        current_balance: opening_balance || 0
      });
    }
  );
});

app.delete('/api/parties/:id', (req, res) => {
  db.run('DELETE FROM tbl_parties WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// RECEIPTS CRUD ENDPOINTS
app.get('/api/receipts', (req, res) => {
  db.all('SELECT * FROM tbl_receipts ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/receipts/:id', (req, res) => {
  db.get('SELECT * FROM tbl_receipts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Receipt not found' });
    res.json(row);
  });
});

app.post('/api/receipts', (req, res) => {
  const { 
    receipt_number, 
    receipt_date, 
    party_id, 
    party_name, 
    bank_account, 
    amount, 
    payment_mode, 
    cheque_number, 
    cheque_date, 
    bank_name, 
    neft_date, 
    is_on_account, 
    is_advance, 
    notes 
  } = req.body;
  
  // Validate required fields
  if (!receipt_number || !receipt_date || !party_id || !party_name || !bank_account || !amount || !payment_mode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `INSERT INTO tbl_receipts (
      receipt_number, receipt_date, party_id, party_name, bank_account, amount, 
      payment_mode, cheque_number, cheque_date, bank_name, neft_date, 
      is_on_account, is_advance, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      receipt_number, receipt_date, party_id, party_name, bank_account, amount, 
      payment_mode, cheque_number, cheque_date, bank_name, neft_date, 
      is_on_account ? 1 : 0, is_advance ? 1 : 0, notes
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update party's current balance
      db.get('SELECT * FROM tbl_parties WHERE id = ?', [party_id], (err, party) => {
        if (err || !party) {
          console.error('Error updating party balance:', err);
          return res.json({ id: this.lastID, ...req.body });
        }
        
        // Calculate new balance
        let newBalance = parseFloat(party.current_balance) - parseFloat(amount);
        
        // Update party balance
        db.run('UPDATE tbl_parties SET current_balance = ? WHERE id = ?', [newBalance, party_id], (err) => {
          if (err) console.error('Error updating party balance:', err);
          
          res.json({ id: this.lastID, ...req.body });
        });
      });
    }
  );
});

app.put('/api/receipts/:id', (req, res) => {
  const { 
    receipt_number, 
    receipt_date, 
    party_id, 
    party_name, 
    bank_account, 
    amount, 
    payment_mode, 
    cheque_number, 
    cheque_date, 
    bank_name, 
    neft_date, 
    is_on_account, 
    is_advance, 
    notes 
  } = req.body;
  
  db.run(
    `UPDATE tbl_receipts SET
      receipt_number = ?, receipt_date = ?, party_id = ?, party_name = ?, 
      bank_account = ?, amount = ?, payment_mode = ?, cheque_number = ?, 
      cheque_date = ?, bank_name = ?, neft_date = ?, is_on_account = ?, 
      is_advance = ?, notes = ?
    WHERE id = ?`,
    [
      receipt_number, receipt_date, party_id, party_name, bank_account, amount, 
      payment_mode, cheque_number, cheque_date, bank_name, neft_date, 
      is_on_account ? 1 : 0, is_advance ? 1 : 0, notes, req.params.id
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: parseInt(req.params.id), ...req.body });
    }
  );
});

app.delete('/api/receipts/:id', (req, res) => {
  db.run('DELETE FROM tbl_receipts WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// PAYMENTS CRUD ENDPOINTS
app.get('/api/payments', (req, res) => {
  db.all('SELECT * FROM tbl_payments ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/payments/:id', (req, res) => {
  db.get('SELECT * FROM tbl_payments WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Payment not found' });
    res.json(row);
  });
});

app.post('/api/payments', (req, res) => {
  const { 
    payment_number, 
    payment_date, 
    party_id, 
    party_name, 
    bank_account, 
    amount, 
    payment_mode, 
    cheque_number, 
    cheque_date, 
    bank_name, 
    neft_date, 
    is_advance, 
    purchase_invoice_id, 
    purchase_invoice_number, 
    notes 
  } = req.body;
  
  // Validate required fields
  if (!payment_number || !payment_date || !party_id || !party_name || !bank_account || !amount || !payment_mode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `INSERT INTO tbl_payments (
      payment_number, payment_date, party_id, party_name, bank_account, amount, 
      payment_mode, cheque_number, cheque_date, bank_name, neft_date, 
      is_advance, purchase_invoice_id, purchase_invoice_number, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payment_number, payment_date, party_id, party_name, bank_account, amount, 
      payment_mode, cheque_number, cheque_date, bank_name, neft_date, 
      is_advance ? 1 : 0, purchase_invoice_id, purchase_invoice_number, notes
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update party's current balance
      db.get('SELECT * FROM tbl_parties WHERE id = ?', [party_id], (err, party) => {
        if (err || !party) {
          console.error('Error updating party balance:', err);
          return res.json({ id: this.lastID, ...req.body });
        }
        
        // Calculate new balance
        let newBalance = parseFloat(party.current_balance) + parseFloat(amount);
        
        // Update party balance
        db.run('UPDATE tbl_parties SET current_balance = ? WHERE id = ?', [newBalance, party_id], (err) => {
          if (err) console.error('Error updating party balance:', err);
          
          res.json({ id: this.lastID, ...req.body });
        });
      });
    }
  );
});

app.put('/api/payments/:id', (req, res) => {
  const { 
    payment_number, 
    payment_date, 
    party_id, 
    party_name, 
    bank_account, 
    amount, 
    payment_mode, 
    cheque_number, 
    cheque_date, 
    bank_name, 
    neft_date, 
    is_advance, 
    purchase_invoice_id, 
    purchase_invoice_number, 
    notes 
  } = req.body;
  
  db.run(
    `UPDATE tbl_payments SET
      payment_number = ?, payment_date = ?, party_id = ?, party_name = ?, 
      bank_account = ?, amount = ?, payment_mode = ?, cheque_number = ?, 
      cheque_date = ?, bank_name = ?, neft_date = ?, is_advance = ?, 
      purchase_invoice_id = ?, purchase_invoice_number = ?, notes = ?
    WHERE id = ?`,
    [
      payment_number, payment_date, party_id, party_name, bank_account, amount, 
      payment_mode, cheque_number, cheque_date, bank_name, neft_date, 
      is_advance ? 1 : 0, purchase_invoice_id, purchase_invoice_number, notes, req.params.id
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: parseInt(req.params.id), ...req.body });
    }
  );
});

app.delete('/api/payments/:id', (req, res) => {
  db.run('DELETE FROM tbl_payments WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// EXPENSES CRUD ENDPOINTS
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM tbl_expenses ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/expenses/:id', (req, res) => {
  db.get('SELECT * FROM tbl_expenses WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Expense not found' });
    res.json(row);
  });
});

app.post('/api/expenses', (req, res) => {
  const { 
    voucher_number, 
    expense_date, 
    expense_type, 
    payment_mode, 
    bank_account, 
    amount, 
    description, 
    notes 
  } = req.body;
  
  // Validate required fields
  if (!voucher_number || !expense_date || !expense_type || !payment_mode || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `INSERT INTO tbl_expenses (
      voucher_number, expense_date, expense_type, payment_mode, 
      bank_account, amount, description, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      voucher_number, expense_date, expense_type, payment_mode, 
      bank_account, amount, description, notes
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

app.put('/api/expenses/:id', (req, res) => {
  const { 
    voucher_number, 
    expense_date, 
    expense_type, 
    payment_mode, 
    bank_account, 
    amount, 
    description, 
    notes 
  } = req.body;
  
  db.run(
    `UPDATE tbl_expenses SET
      voucher_number = ?, expense_date = ?, expense_type = ?, payment_mode = ?, 
      bank_account = ?, amount = ?, description = ?, notes = ?
    WHERE id = ?`,
    [
      voucher_number, expense_date, expense_type, payment_mode, 
      bank_account, amount, description, notes, req.params.id
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: parseInt(req.params.id), ...req.body });
    }
  );
});

app.delete('/api/expenses/:id', (req, res) => {
  db.run('DELETE FROM tbl_expenses WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get pending purchase invoices for a party
app.get('/api/pending-purchases', (req, res) => {
  const partyId = req.query.party_id;
  
  if (!partyId) {
    return res.status(400).json({ error: 'Party ID is required' });
  }
  
  // This is a simplified query to get purchase invoices
  // In a real system, you would track which invoices have been paid
  // For now, we'll just return all purchases for this party
  db.all('SELECT * FROM tbl_purchases WHERE vendor_name = (SELECT party_name FROM tbl_parties WHERE id = ?)', 
    [partyId], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Serve static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
}); 

module.exports = app; 