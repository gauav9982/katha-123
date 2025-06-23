const sqlite3 = require('sqlite3').verbose();

// Create a new database connection
const db = new sqlite3.Database('katha_sales.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to database\n');
});

// Query to get all items
const query = `
  SELECT 
    i.id,
    i.item_code,
    i.item_name,
    i.mrp,
    i.gst_percentage,
    i.current_stock,
    i.product_name,
    i.company_name,
    i.model,
    i.company_barcode,
    i.barcode_2,
    i.opening_stock,
    i.opening_cost,
    c.category_name,
    g.group_name
  FROM tbl_items i
  LEFT JOIN tbl_categories c ON i.category_id = c.id
  LEFT JOIN tbl_groups g ON c.group_id = g.id
  ORDER BY i.id
`;

// Execute the query
db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error querying items:', err.message);
    return;
  }

  console.log('Total items in database:', rows.length, '\n');
  
  // Print each item's details
  rows.forEach((item) => {
    console.log('Item ID:', item.id);
    console.log('Item Code:', item.item_code);
    console.log('Item Name:', item.item_name);
    console.log('MRP:', item.mrp);
    console.log('GST %:', item.gst_percentage);
    console.log('Current Stock:', item.current_stock);
    console.log('Product Name:', item.product_name);
    console.log('Company Name:', item.company_name);
    console.log('Model:', item.model);
    console.log('Company Barcode:', item.company_barcode);
    console.log('Barcode 2:', item.barcode_2);
    console.log('Opening Stock:', item.opening_stock);
    console.log('Opening Cost:', item.opening_cost);
    console.log('Category:', item.category_name);
    console.log('Group:', item.group_name);
    console.log('----------------------------------------');
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      return;
    }
    console.log('\nDatabase connection closed');
  });
}); 