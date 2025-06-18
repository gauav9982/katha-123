const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database('./katha_sales.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Get all table names
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('Error getting tables:', err);
    return;
  }
  
  console.log('\nTables in database:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
    
    // Get table structure
    db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
      if (err) {
        console.error(`Error getting columns for ${table.name}:`, err);
        return;
      }
      
      console.log(`\nColumns in ${table.name}:`);
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
      console.log('');
    });
  });
}); 