const db = require('./config/database');

// Check items data
console.log('\nChecking Items Data:');
db.all('SELECT * FROM tbl_items LIMIT 5', [], (err, rows) => {
  if (err) {
    console.error('Error checking items:', err);
    return;
  }
  console.log('Sample Items (first 5):');
  console.log(rows);
});

// Check purchases data
console.log('\nChecking Purchases Data:');
db.all('SELECT * FROM tbl_purchases LIMIT 5', [], (err, rows) => {
  if (err) {
    console.error('Error checking purchases:', err);
    return;
  }
  console.log('Sample Purchases (first 5):');
  console.log(rows);
});

// Check purchase items data
console.log('\nChecking Purchase Items Data:');
db.all('SELECT pi.*, i.name as item_name FROM tbl_purchase_items pi LEFT JOIN tbl_items i ON pi.item_id = i.id LIMIT 5', [], (err, rows) => {
  if (err) {
    console.error('Error checking purchase items:', err);
    return;
  }
  console.log('Sample Purchase Items (first 5):');
  console.log(rows);
}); 