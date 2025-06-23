const db = require('./config/database.cjs');

// Create cities table
db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    username TEXT,
    password TEXT
  )
`, (err) => {
  if (err) {
    console.error('Error creating cities table:', err);
    return;
  }
  console.log('Cities table created successfully');
  
  // Add some sample cities
  const sampleCities = [
    { name: 'Ahmedabad', username: 'ahmedabad', password: 'ahmedabad123' },
    { name: 'Surat', username: 'surat', password: 'surat123' },
    { name: 'Vadodara', username: 'vadodara', password: 'vadodara123' },
    { name: 'Nadiad', username: 'nadiad', password: 'nadiad123' }
  ];
  
  const insertStmt = db.prepare('INSERT OR IGNORE INTO cities (name, username, password) VALUES (?, ?, ?)');
  
  sampleCities.forEach(city => {
    insertStmt.run(city.name, city.username, city.password, (err) => {
      if (err) {
        console.error(`Error inserting ${city.name}:`, err);
      } else {
        console.log(`Added city: ${city.name}`);
      }
    });
  });
  
  insertStmt.finalize(() => {
    console.log('Setup completed');
    db.close();
  });
}); 