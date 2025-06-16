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

module.exports = router; 