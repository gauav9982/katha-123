const express = require('express');
const router = express.Router();
const db = require('../config/database.cjs');
const getDb = require('../config/database.cjs').getDatabase;

// Base route for API health check
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

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

// Get all categories
router.get('/categories', (req, res) => {
  const query = `
    SELECT c.id, c.category_number, c.category_name, c.group_id, g.group_name
    FROM tbl_categories c
    LEFT JOIN tbl_groups g ON c.group_id = g.id
    ORDER BY c.category_number
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get next category number for a group
router.get('/categories-next-number', (req, res) => {
  const groupId = req.query.group_id;
  if (!groupId) {
    return res.status(400).json({ error: 'group_id is required' });
  }
  db.get(
    `SELECT MAX(category_number) as max_number FROM tbl_categories WHERE group_id = ?`,
    [groupId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      const next_number = (row?.max_number || 0) + 1;
      res.json({ next_number });
    }
  );
});

// Get all purchase items (for checking usage)
router.get('/purchase-items', (req, res) => {
  const query = `
    SELECT id, item_id
    FROM tbl_purchase_items
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching purchase items:', err);
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

// --- Groups Routes ---

// Get all groups
router.get('/groups', (req, res) => {
  const query = `
    SELECT id, group_number, group_name 
    FROM tbl_groups 
    ORDER BY group_number
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching groups:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new group
router.post('/groups', (req, res) => {
  const { group_number, group_name } = req.body;
  
  if (!group_number || !group_name) {
    return res.status(400).json({ error: 'Group number and name are required' });
  }

  const query = `
    INSERT INTO tbl_groups (group_number, group_name) 
    VALUES (?, ?)
  `;
  db.run(query, [group_number, group_name], function (err) {
    if (err) {
      console.error('Error creating group:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, group_number, group_name });
  });
});

// Update a group
router.put('/groups/:id', (req, res) => {
  const { id } = req.params;
  const { group_number, group_name } = req.body;
  
  if (!group_number || !group_name) {
    return res.status(400).json({ error: 'Group number and name are required' });
  }

  const query = `
    UPDATE tbl_groups 
    SET group_number = ?, group_name = ?
    WHERE id = ?
  `;
  db.run(query, [group_number, group_name, id], function (err) {
    if (err) {
      console.error('Error updating group:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Group updated successfully' });
  });
});

// Delete a group
router.delete('/groups/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM tbl_groups WHERE id = ?`;
  
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting group:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Group deleted successfully' });
  });
});

// --- Categories Routes ---

// Create a new category
router.post('/categories', (req, res) => {
  const { category_number, category_name, group_id } = req.body;
  
  if (!category_number || !category_name || !group_id) {
    return res.status(400).json({ error: 'Category number, name and group are required' });
  }

  const query = `
    INSERT INTO tbl_categories (category_number, category_name, group_id) 
    VALUES (?, ?, ?)
  `;
  db.run(query, [category_number, category_name, group_id], function (err) {
    if (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, category_number, category_name, group_id });
  });
});

// Update a category
router.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { category_number, category_name, group_id } = req.body;
  
  if (!category_number || !category_name || !group_id) {
    return res.status(400).json({ error: 'Category number, name and group are required' });
  }

  const query = `
    UPDATE tbl_categories 
    SET category_number = ?, category_name = ?, group_id = ?
    WHERE id = ?
  `;
  db.run(query, [category_number, category_name, group_id, id], function (err) {
    if (err) {
      console.error('Error updating category:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Category updated successfully' });
  });
});

// Delete a category
router.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM tbl_categories WHERE id = ?`;
  
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting category:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Category deleted successfully' });
  });
});

// --- Items Routes ---

// Create a new item
router.post('/items', (req, res) => {
  const { item_code, item_name, mrp, gst_percentage, opening_stock, product_name, company_name, model, group_id, category_id } = req.body;
  
  if (!item_code || !item_name) {
    return res.status(400).json({ error: 'Item code and name are required' });
  }

  const query = `
    INSERT INTO tbl_items (item_code, item_name, mrp, gst_percentage, opening_stock, product_name, company_name, model, group_id, category_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [item_code, item_name, mrp || 0, gst_percentage || 0, opening_stock || 0, product_name, company_name, model, group_id, category_id], function (err) {
    if (err) {
      console.error('Error creating item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, item_code, item_name });
  });
});

// Update an item
router.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { item_code, item_name, mrp, gst_percentage, current_stock, product_name, company_name, model, group_id, category_id } = req.body;
  
  if (!item_code || !item_name) {
    return res.status(400).json({ error: 'Item code and name are required' });
  }

  const query = `
    UPDATE tbl_items 
    SET item_code = ?, item_name = ?, mrp = ?, gst_percentage = ?, current_stock = ?, product_name = ?, company_name = ?, model = ?, group_id = ?, category_id = ?
    WHERE id = ?
  `;
  db.run(query, [item_code, item_name, mrp || 0, gst_percentage || 0, current_stock || 0, product_name, company_name, model, group_id, category_id, id], function (err) {
    if (err) {
      console.error('Error updating item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Item updated successfully' });
  });
});

// Delete an item
router.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM tbl_items WHERE id = ?`;
  
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

// Get max item code for a category
router.get('/items-max-code', (req, res) => {
  const { category_number } = req.query;
  
  if (!category_number) {
    return res.status(400).json({ error: 'category_number is required' });
  }
  
  const query = `
    SELECT MAX(CAST(SUBSTR(item_code, LENGTH(?) + 1) AS INTEGER)) as max_number
    FROM tbl_items 
    WHERE item_code LIKE ? || '%'
  `;
  
  const categoryPrefix = category_number.toString();
  const searchPattern = categoryPrefix + '%';
  
  db.get(query, [categoryPrefix, searchPattern], (err, row) => {
    if (err) {
      console.error('Error getting max item code:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    const maxNumber = row?.max_number || 0;
    const nextNumber = maxNumber + 1;
    const lastCode = `${categoryPrefix}${nextNumber.toString().padStart(3, '0')}`;
    
    res.json({ 
      max_number: maxNumber,
      next_number: nextNumber,
      last_code: lastCode
    });
  });
});

// --- Purchases Routes ---

// Create new purchase
router.post('/purchases', (req, res) => {
  const { invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total } = req.body;
  
  const query = `
    INSERT INTO tbl_purchases (invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total], function(err) {
    if (err) {
      console.error('Error creating purchase:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Purchase created successfully' 
    });
  });
});

// Create purchase item
router.post('/purchase-items', (req, res) => {
  const { purchase_id, item_id, item_name, item_code, quantity, rate, amount } = req.body;
  
  const query = `
    INSERT INTO tbl_purchase_items (purchase_id, item_id, item_name, item_code, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [purchase_id, item_id, item_name, item_code, quantity, rate, amount], function(err) {
    if (err) {
      console.error('Error creating purchase item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Purchase item created successfully' 
    });
  });
});

// Delete purchase item
router.delete('/purchase-items/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM tbl_purchase_items WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting purchase item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      message: 'Purchase item deleted successfully' 
    });
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
           cs.sales_type, cs.subtotal, cs.grand_total
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
    INSERT INTO tbl_cashsales (invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total], function(err) {
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

// --- Credit Sales Routes ---

// Get all credit sales
router.get('/creditsales', (req, res) => {
  const query = `
    SELECT cs.id, cs.invoice_number, cs.invoice_date, cs.customer_name,
           cs.sales_type, cs.subtotal, cs.grand_total
    FROM tbl_creditsales cs
    ORDER BY cs.invoice_date DESC, cs.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching credit sales:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new credit sale
router.post('/creditsales', (req, res) => {
  const { invoice_number, invoice_date, customer_name, sales_type, subtotal, total_gst, grand_total } = req.body;
  
  const query = `
    INSERT INTO tbl_creditsales (invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [invoice_number, invoice_date, customer_name, sales_type, subtotal, grand_total], function(err) {
    if (err) {
      console.error('Error creating credit sale:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Credit sale created successfully' 
    });
  });
});

// Get credit sale items
router.get('/creditsale-items', (req, res) => {
  const { sale_id } = req.query;
  
  let query = `
    SELECT csi.*, i.item_name, i.item_code
    FROM tbl_creditsale_items csi
    LEFT JOIN tbl_items i ON csi.item_id = i.id
  `;
  
  if (sale_id) {
    query += ` WHERE csi.sale_id = ?`;
    db.all(query, [sale_id], (err, rows) => {
      if (err) {
        console.error('Error fetching credit sale items:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching credit sale items:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

// Create credit sale item
router.post('/creditsale-items', (req, res) => {
  const { sale_id, item_id, item_name, item_code, quantity, rate, amount } = req.body;
  
  const query = `
    INSERT INTO tbl_creditsale_items (sale_id, item_id, item_name, item_code, quantity, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [sale_id, item_id, item_name, item_code, quantity, rate, amount], function(err) {
    if (err) {
      console.error('Error creating credit sale item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Credit sale item created successfully' 
    });
  });
});

// --- Parties Routes ---

// Get all parties
router.get('/parties', (req, res) => {
  const query = `
    SELECT id, party_name, party_type, current_balance
    FROM tbl_parties
    ORDER BY party_name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching parties:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new party
router.post('/parties', (req, res) => {
  const { party_name, party_type, current_balance } = req.body;
  
  const query = `
    INSERT INTO tbl_parties (party_name, party_type, current_balance)
    VALUES (?, ?, ?)
  `;
  
  db.run(query, [party_name, party_type, current_balance || 0], function(err) {
    if (err) {
      console.error('Error creating party:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Party created successfully' 
    });
  });
});

// --- Delivery Chalan Routes ---

// Get all delivery chalans
router.get('/delivery-chalans', (req, res) => {
  const query = `
    SELECT id, chalan_number, chalan_date, party_name
    FROM tbl_delivery_chalans
    ORDER BY chalan_date DESC, id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching delivery chalans:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new delivery chalan
router.post('/delivery-chalans', (req, res) => {
  const { chalan_number, chalan_date, party_name } = req.body;
  
  const query = `
    INSERT INTO tbl_delivery_chalans (chalan_number, chalan_date, party_name)
    VALUES (?, ?, ?)
  `;
  
  db.run(query, [chalan_number, chalan_date, party_name], function(err) {
    if (err) {
      console.error('Error creating delivery chalan:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Delivery chalan created successfully' 
    });
  });
});

// Update delivery chalan
router.put('/delivery-chalans/:id', (req, res) => {
  const { id } = req.params;
  const { chalan_number, chalan_date, party_name } = req.body;
  
  const query = `
    UPDATE tbl_delivery_chalans 
    SET chalan_number = ?, chalan_date = ?, party_name = ?
    WHERE id = ?
  `;
  
  db.run(query, [chalan_number, chalan_date, party_name, id], function(err) {
    if (err) {
      console.error('Error updating delivery chalan:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      message: 'Delivery chalan updated successfully' 
    });
  });
});

// Delete delivery chalan
router.delete('/delivery-chalans/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM tbl_delivery_chalans WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting delivery chalan:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      message: 'Delivery chalan deleted successfully' 
    });
  });
});

// Get delivery chalan items
router.get('/delivery-chalan-items', (req, res) => {
  const { chalan_id } = req.query;
  
  let query = `
    SELECT dci.*, i.item_name, i.item_code
    FROM tbl_delivery_chalan_items dci
    LEFT JOIN tbl_items i ON dci.item_id = i.id
  `;
  
  if (chalan_id) {
    query += ` WHERE dci.chalan_id = ?`;
    db.all(query, [chalan_id], (err, rows) => {
      if (err) {
        console.error('Error fetching delivery chalan items:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching delivery chalan items:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

// Create delivery chalan item
router.post('/delivery-chalan-items', (req, res) => {
  const { chalan_id, item_id, item_name, item_code, quantity } = req.body;
  
  const query = `
    INSERT INTO tbl_delivery_chalan_items (chalan_id, item_id, item_name, item_code, quantity)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(query, [chalan_id, item_id, item_name, item_code, quantity], function(err) {
    if (err) {
      console.error('Error creating delivery chalan item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Delivery chalan item created successfully' 
    });
  });
});

// Delete delivery chalan item
router.delete('/delivery-chalan-items/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM tbl_delivery_chalan_items WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting delivery chalan item:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      message: 'Delivery chalan item deleted successfully' 
    });
  });
});

// --- Payments Routes ---

// Get all payments
router.get('/payments', (req, res) => {
  const query = `
    SELECT p.*, pt.party_name
    FROM tbl_payments p
    LEFT JOIN tbl_parties pt ON p.party_id = pt.id
    ORDER BY p.payment_date DESC, p.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching payments:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new payment
router.post('/payments', (req, res) => {
  const { party_id, payment_date, amount, payment_type, reference_number, notes } = req.body;
  
  const query = `
    INSERT INTO tbl_payments (party_id, payment_date, amount, payment_type, reference_number, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [party_id, payment_date, amount, payment_type, reference_number, notes], function(err) {
    if (err) {
      console.error('Error creating payment:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      id: this.lastID,
      message: 'Payment created successfully' 
    });
  });
});

// --- Pending Purchases Routes ---

// Get pending purchases
router.get('/pending-purchases', (req, res) => {
  const { party_id } = req.query;
  
  let query = `
    SELECT p.id, p.invoice_number, p.invoice_date, p.vendor_name,
           p.grand_total, COALESCE(SUM(pay.amount), 0) as paid_amount,
           (p.grand_total - COALESCE(SUM(pay.amount), 0)) as pending_amount
    FROM tbl_purchases p
    LEFT JOIN tbl_payments pay ON p.vendor_name = pay.party_name
    WHERE p.grand_total > COALESCE(SUM(pay.amount), 0)
  `;
  
  if (party_id) {
    query += ` AND p.vendor_name = (SELECT party_name FROM tbl_parties WHERE id = ?)`;
    db.all(query, [party_id], (err, rows) => {
      if (err) {
        console.error('Error fetching pending purchases:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching pending purchases:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

// --- Reports Routes ---

// Stock by group report
router.get('/reports/stock-by-group', (req, res) => {
  const query = `
    SELECT g.group_name, COUNT(i.id) as item_count, SUM(COALESCE(i.current_stock, i.opening_stock)) as total_stock
    FROM tbl_groups g
    LEFT JOIN tbl_categories c ON g.id = c.group_id
    LEFT JOIN tbl_items i ON c.id = i.category_id
    GROUP BY g.id, g.group_name
    ORDER BY g.group_name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching stock by group report:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Stock by category report
router.get('/reports/stock-by-category', (req, res) => {
  const { group_id } = req.query;
  
  let query = `
    SELECT c.category_name, COUNT(i.id) as item_count, SUM(COALESCE(i.current_stock, i.opening_stock)) as total_stock
    FROM tbl_categories c
    LEFT JOIN tbl_items i ON c.id = i.category_id
  `;
  
  if (group_id) {
    query += ` WHERE c.group_id = ?`;
    query += ` GROUP BY c.id, c.category_name ORDER BY c.category_name`;
    db.all(query, [group_id], (err, rows) => {
      if (err) {
        console.error('Error fetching stock by category report:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  } else {
    query += ` GROUP BY c.id, c.category_name ORDER BY c.category_name`;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching stock by category report:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  }
});

// Stock by item report
router.get('/reports/stock-by-item', (req, res) => {
  const { group_id, category_id } = req.query;
  
  let query = `
    SELECT i.item_code, i.item_name, i.product_name, i.company_name,
           COALESCE(i.current_stock, i.opening_stock) as stock,
           i.mrp, g.group_name, c.category_name
    FROM tbl_items i
    LEFT JOIN tbl_categories c ON i.category_id = c.id
    LEFT JOIN tbl_groups g ON c.group_id = g.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (group_id) {
    conditions.push('c.group_id = ?');
    params.push(group_id);
  }
  
  if (category_id) {
    conditions.push('i.category_id = ?');
    params.push(category_id);
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  query += ` ORDER BY i.item_name`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching stock by item report:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Item transactions report
router.get('/reports/item-transactions', (req, res) => {
  const { item_id, start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      'Purchase' as transaction_type,
      pi.purchase_id as reference_id,
      p.invoice_date as transaction_date,
      pi.quantity,
      pi.rate,
      pi.amount
    FROM tbl_purchase_items pi
    JOIN tbl_purchases p ON pi.purchase_id = p.id
    WHERE pi.item_id = ?
    
    UNION ALL
    
    SELECT 
      'Cash Sale' as transaction_type,
      csi.sale_id as reference_id,
      cs.invoice_date as transaction_date,
      -csi.quantity as quantity,
      csi.rate,
      csi.amount
    FROM tbl_cashsale_items csi
    JOIN tbl_cashsales cs ON csi.sale_id = cs.id
    WHERE csi.item_id = ?
    
    UNION ALL
    
    SELECT 
      'Credit Sale' as transaction_type,
      csi.sale_id as reference_id,
      cs.invoice_date as transaction_date,
      -csi.quantity as quantity,
      csi.rate,
      csi.amount
    FROM tbl_creditsale_items csi
    JOIN tbl_creditsales cs ON csi.sale_id = cs.id
    WHERE csi.item_id = ?
  `;
  
  const params = [item_id, item_id, item_id];
  
  if (start_date) {
    query += ` AND transaction_date >= ?`;
    params.push(start_date);
  }
  
  if (end_date) {
    query += ` AND transaction_date <= ?`;
    params.push(end_date);
  }
  
  query += ` ORDER BY transaction_date DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching item transactions report:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// --- Last Purchase by Code ---

// Get last purchase by item code
router.get('/last-purchase-by-code', (req, res) => {
  const { item_code } = req.query;
  
  if (!item_code) {
    return res.status(400).json({ error: 'Item code is required' });
  }
  
  const query = `
    SELECT pi.rate, pi.amount, p.invoice_date
    FROM tbl_purchase_items pi
    JOIN tbl_purchases p ON pi.purchase_id = p.id
    JOIN tbl_items i ON pi.item_id = i.id
    WHERE i.item_code = ?
    ORDER BY p.invoice_date DESC
    LIMIT 1
  `;
  
  db.get(query, [item_code], (err, row) => {
    if (err) {
      console.error('Error fetching last purchase by code:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'No purchase found for this item code' });
      return;
    }
    
    res.json(row);
  });
});

// Get all cities (for login dropdown)
router.get('/cities', (req, res) => {
  const query = 'SELECT id, name FROM cities ORDER BY name';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching cities:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }
    res.json({ success: true, data: rows });
  });
});

// Add a new city
router.post('/cities', (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'City name, username, and password are required' });
  }

  const query = 'INSERT INTO cities (name, username, password) VALUES (?, ?, ?)';
  
  db.run(query, [name, username, password], function (err) {
    if (err) {
      console.error('Error adding city:', err);
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'City or username already exists' });
      }
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.status(201).json({ id: this.lastID, name });
  });
});

// Delete a city
router.delete('/cities/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM cities WHERE id = ?';
  
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting city:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }
    
    if (this.changes > 0) {
      res.json({ success: true, message: 'City deleted' });
    } else {
      res.status(404).json({ success: false, error: 'City not found' });
    }
  });
});

// City Login
router.post('/cities/login', (req, res) => {
  const { cityName, username, password } = req.body;
  if (!cityName || !username || !password) {
    return res.status(400).json({ success: false, error: 'City, username, and password are required' });
  }

  const query = 'SELECT * FROM cities WHERE name = ? AND username = ? AND password = ?';
  
  db.get(query, [cityName, username, password], (err, row) => {
    if (err) {
      console.error('Error during city login:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }
    
    if (row) {
      res.json({ success: true, data: { id: row.id, name: row.name } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });
});

module.exports = router;