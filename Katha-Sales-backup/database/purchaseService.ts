/**
 * Get all items for selection in purchase form
 */
getAllItems: () => {
  try {
    return db.all(`
      SELECT id, item_code, item_name, mrp as rate, gst_percentage, current_stock, 
             company_barcode, barcode_2, product_name, company_name, model
      FROM tbl_items
      ORDER BY item_name
    `);
  } catch (error) {
    console.error('Error getting items:', error);
    return [];
  }
} 