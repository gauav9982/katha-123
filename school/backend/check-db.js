const { getDatabase } = require('./config/database.cjs');

try {
  const db = getDatabase();
  
  console.log('=== CITIES ===');
  const cities = db.prepare('SELECT * FROM cities').all();
  console.log(cities);
  
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