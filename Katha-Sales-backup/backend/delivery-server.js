const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// SQLite DB setup
const dbPath = path.join(__dirname, 'katha_sales.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create delivery chalan tables if they don't exist
db.serialize(() => {
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
});

// Basic test route
app.get('/api', (req, res) => {
  console.log('API info route hit');
  res.send('Delivery Chalan API Running');
});

// DELIVERY CHALAN ENDPOINTS
app.get('/api/delivery-chalans', (req, res) => {
  console.log('GET request to /api/delivery-chalans');
  db.all('SELECT * FROM tbl_delivery_chalans ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching chalans:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Returning ${rows.length} chalans`);
    res.json(rows);
  });
});

app.get('/api/delivery-chalans/:id', (req, res) => {
  console.log(`GET request to /api/delivery-chalans/${req.params.id}`);
  db.get('SELECT * FROM tbl_delivery_chalans WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching chalan:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      console.log('Chalan not found');
      return res.status(404).json({ error: 'Delivery Chalan not found' });
    }
    console.log('Returning chalan:', row);
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
    [chalan_number, chalan_date, party_name, total_quantity || 0],
    function(err) {
      if (err) {
        console.error('Database error in delivery-chalans POST:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log('Successfully created delivery chalan with ID:', this.lastID);
      res.json({ 
        id: this.lastID, 
        chalan_number, 
        chalan_date, 
        party_name, 
        total_quantity: total_quantity || 0 
      });
    }
  );
});

app.put('/api/delivery-chalans/:id', (req, res) => {
  console.log(`PUT request to /api/delivery-chalans/${req.params.id}`);
  console.log('Request body:', req.body);
  
  const { chalan_number, chalan_date, party_name, total_quantity } = req.body;
  
  // Validate required fields
  if (!chalan_number || !chalan_date || !party_name) {
    console.log('Missing required fields in request');
    return res.status(400).json({ error: 'Missing required fields: chalan_number, chalan_date, and party_name are required' });
  }
  
  db.run(
    'UPDATE tbl_delivery_chalans SET chalan_number = ?, chalan_date = ?, party_name = ?, total_quantity = ? WHERE id = ?',
    [chalan_number, chalan_date, party_name, total_quantity || 0, req.params.id],
    function(err) {
      if (err) {
        console.error('Database error in delivery-chalans PUT:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log('Successfully updated delivery chalan with ID:', req.params.id);
      res.json({
        id: parseInt(req.params.id),
        chalan_number,
        chalan_date,
        party_name,
        total_quantity: total_quantity || 0
      });
    }
  );
});

app.delete('/api/delivery-chalans/:id', (req, res) => {
  console.log(`DELETE request to /api/delivery-chalans/${req.params.id}`);
  
  db.run('DELETE FROM tbl_delivery_chalans WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Database error in delivery-chalans DELETE:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Successfully deleted delivery chalan with ID:', req.params.id);
    res.json({ success: true });
  });
});

// DELIVERY CHALAN ITEMS ENDPOINTS
app.get('/api/delivery-chalan-items', (req, res) => {
  console.log('GET request to /api/delivery-chalan-items');
  console.log('Query params:', req.query);
  
  // Filter by chalan_id if provided
  const chalanId = req.query.chalan_id;
  
  if (chalanId) {
    db.all('SELECT * FROM tbl_delivery_chalan_items WHERE chalan_id = ?', 
      [chalanId], 
      (err, rows) => {
        if (err) {
          console.error('Error fetching chalan items:', err);
          return res.status(500).json({ error: err.message });
        }
        console.log(`Returning ${rows.length} items for chalan ID ${chalanId}`);
        res.json(rows);
      }
    );
  } else {
    db.all('SELECT * FROM tbl_delivery_chalan_items', [], (err, rows) => {
      if (err) {
        console.error('Error fetching all chalan items:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Returning ${rows.length} total chalan items`);
      res.json(rows);
    });
  }
});

app.get('/api/delivery-chalan-items/:id', (req, res) => {
  console.log(`GET request to /api/delivery-chalan-items/${req.params.id}`);
  
  db.get('SELECT * FROM tbl_delivery_chalan_items WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching chalan item:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      console.log('Chalan item not found');
      return res.status(404).json({ error: 'Delivery Chalan Item not found' });
    }
    console.log('Returning chalan item:', row);
    res.json(row);
  });
});

app.post('/api/delivery-chalan-items', (req, res) => {
  console.log('POST request to /api/delivery-chalan-items');
  console.log('Request body:', req.body);
  
  const { chalan_id, item_id, item_code, item_name, quantity } = req.body;
  
  // Validate required fields
  if (!chalan_id || !item_id || !item_name || !quantity) {
    console.log('Missing required fields in request');
    return res.status(400).json({ error: 'Missing required fields: chalan_id, item_id, item_name, and quantity are required' });
  }
  
  db.run(
    'INSERT INTO tbl_delivery_chalan_items (chalan_id, item_id, item_code, item_name, quantity) VALUES (?, ?, ?, ?, ?)',
    [chalan_id, item_id, item_code || '', item_name, quantity],
    function(err) {
      if (err) {
        console.error('Database error in delivery-chalan-items POST:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log('Successfully created delivery chalan item with ID:', this.lastID);
      res.json({ 
        id: this.lastID, 
        chalan_id, 
        item_id, 
        item_code: item_code || '', 
        item_name, 
        quantity 
      });
    }
  );
});

app.delete('/api/delivery-chalan-items/:id', (req, res) => {
  console.log(`DELETE request to /api/delivery-chalan-items/${req.params.id}`);
  
  db.run('DELETE FROM tbl_delivery_chalan_items WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Database error in delivery-chalan-items DELETE:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Successfully deleted delivery chalan item with ID:', req.params.id);
    res.json({ success: true });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Delivery Chalan Server is running on http://localhost:${PORT}`);
}); 