const { getDatabase } = require('./config/database.cjs');

try {
  const db = getDatabase();
  
  console.log('=== CITIES ===');
  const cities = db.prepare('SELECT * FROM cities').all();
  console.log(cities);

  // Remove duplicate city 'NADIAD' (id:51) if exists
  const duplicate = db.prepare("SELECT * FROM cities WHERE id = 51").get();
  if (duplicate) {
    db.prepare('DELETE FROM cities WHERE id = 51').run();
    console.log('Removed duplicate city NADIAD (id:51)');
  }

  // Ensure 'Nadiad' (id:46) is default and name is correct
  const nadiad = db.prepare("SELECT * FROM cities WHERE id = 46").get();
  if (nadiad && nadiad.name !== 'Nadiad') {
    db.prepare('UPDATE cities SET name = ? WHERE id = 46').run('Nadiad');
    console.log('Updated city id:46 name to Nadiad');
  }

  console.log('\n=== TEACHERS ===');
  const teachers = db.prepare('SELECT * FROM teachers').all();
  console.log(teachers);

  console.log('\n=== TEACHERS WITH CITY ===');
  const teachersWithCity = db.prepare(`
    SELECT t.*, c.name as city_name 
    FROM teachers t 
    JOIN cities c ON t.city_id = c.id
  `).all();
  console.log(teachersWithCity);
  
} catch (error) {
  console.error('Error:', error.message);
} 