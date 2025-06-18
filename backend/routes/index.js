const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Get all items
router.get('/items', (req, res) => {
  const query = `
    SELECT id, item_code, item_name, mrp, gst_percentage, 
           COALESCE(current_stock, opening_stock) as stock,
           product_name, company_name, model
    FROM tbl_items
    ORDER BY item_name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get item by exact code
router.get('/item-exact', (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Item code is required' });
  }
  
  const query = `
    SELECT id, item_code, item_name, mrp, gst_percentage, 
           COALESCE(current_stock, opening_stock) as stock,
           product_name, company_name, model
    FROM tbl_items
    WHERE item_code = ?
  `;
  
  db.get(query, [code], (err, row) => {
    if (err) {
      console.error('Error fetching item by code:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    
    res.json(row);
  });
});

// Get all customers
router.get('/customers', (req, res) => {
  const query = `
    SELECT c.*,
           COUNT(DISTINCT s.id) as total_sales,
           SUM(s.grand_total) as total_amount
    FROM tbl_customers c
    LEFT JOIN tbl_sales s ON c.id = s.customer_id
    GROUP BY c.id
    ORDER BY c.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all purchases with items
router.get('/purchases', (req, res) => {
  const query = `
    SELECT p.id, p.invoice_number, p.invoice_date, p.vendor_name,
           p.subtotal, p.total_gst, p.grand_total,
           COUNT(pi.id) as items_count,
           SUM(pi.quantity) as total_quantity
    FROM tbl_purchases p
    LEFT JOIN tbl_purchase_items pi ON p.id = pi.purchase_id
    GROUP BY p.id
    ORDER BY p.invoice_date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching purchases:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all cash sales (show all, even if no items)
router.get('/cashsales', (req, res) => {
  const query = `
    SELECT cs.id, cs.invoice_number, cs.invoice_date, cs.customer_name,
           cs.sales_type, cs.subtotal, cs.total_gst, cs.grand_total
    FROM tbl_cashsales cs
    ORDER BY cs.invoice_date DESC, cs.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching cash sales:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single cash sale by ID
router.get('/cashsales/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT * FROM tbl_cashsales WHERE id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching cash sale:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Cash sale not found' });
      return;
    }
    
    res.json(row);
  });
});

// Create new cash sale
router.post('/cashsales', (req, res) => {
  const { invoice_number, invoice_date, customer_name, sales_type, subtotal, total_gst, grand_total } = req.body;
  
  const query = `
    INSERT INTO tbl_cashsales (invoice_number, invoice_date, customer_name, sales_type, subtotal, total_gst, grand_total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [invoice_number, invoice_date, customer_name, sales_type, subtotal, total_gst, grand_total], function(err) {
    if (err) {
      console.error('Error creating cash sale:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Cash sale created successfully' 
    });
  });
});

// Get cash sale items
router.get('/cashsale-items', (req, res) => {
  const { sale_id } = req.query;
  
  let query = `
    SELECT csi.*, i.item_name, i.item_code
    FROM tbl_cashsale_items csi
    LEFT JOIN tbl_items i ON csi.item_id = i.id
  `;
  
  if (sale_id) {
    query += ` WHERE csi.sale_id = ?`;
    db.all(query, [sale_id], (err, rows) => {
      if (err) {
        console.error('Error fetching cash sale items:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching cash sale items:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

// Create cash sale item
router.post('/cashsale-items', (req, res) => {
  const { sale_id, item_id, item_name, item_code, quantity, rate, amount } = req.body;
  
  const query = `
    INSERT INTO tbl_cashsale_items (sale_id, item_id, item_name, item_code, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [sale_id, item_id, item_name, item_code, quantity, rate, amount], function(err) {
    if (err) {
      console.error('Error creating cash sale item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Cash sale item created successfully' 
    });
  });
});

module.exports = router; 