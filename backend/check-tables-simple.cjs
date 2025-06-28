const sqlite3 = require('sqlite3').verbose();

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
  if (tables.length === 0) {
    console.log('No tables found');
  } else {
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
  }
  
  db.close();
}); 