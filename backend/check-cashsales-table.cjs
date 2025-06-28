const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./katha_sales.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Check tbl_cashsales table structure
db.all("PRAGMA table_info(tbl_cashsales)", [], (err, columns) => {
  if (err) {
    console.error('Error getting table structure:', err);
  } else {
    console.log('\nColumns in tbl_cashsales:');
    if (columns.length === 0) {
      console.log('Table tbl_cashsales does not exist');
    } else {
      columns.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
      });
    }
  }
  
  // Check if table exists
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='tbl_cashsales'", [], (err, tables) => {
    if (err) {
      console.error('Error checking table existence:', err);
    } else {
      console.log('\nTable existence check:');
      if (tables.length === 0) {
        console.log('tbl_cashsales table does not exist');
      } else {
        console.log('tbl_cashsales table exists');
        
        // Check sample data
        db.all("SELECT * FROM tbl_cashsales LIMIT 3", [], (err, rows) => {
          if (err) {
            console.error('Error fetching sample data:', err);
          } else {
            console.log('\nSample data from tbl_cashsales:');
            console.log(rows);
          }
          db.close();
        });
      }
    }
  });
}); 