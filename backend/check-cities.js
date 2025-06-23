const db = require('./config/database.cjs');

db.all('SELECT * FROM cities', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Cities in database:', rows);
  }
  db.close();
}); 