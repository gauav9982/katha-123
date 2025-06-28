const { getDatabase } = require('./school/backend/config/database.cjs');

try {
  console.log('🔍 Checking teachers data...');
  
  const db = getDatabase();
  
  // Check cities
  console.log('\n📋 Cities:');
  const cities = db.prepare('SELECT * FROM cities').all();
  console.table(cities);
  
  // Check teachers
  console.log('\n👥 Teachers:');
  const teachers = db.prepare('SELECT * FROM teachers').all();
  console.table(teachers);
  
  // Check teachers by city
  console.log('\n🏙️ Teachers by city:');
  const teachersByCity = db.prepare(`
    SELECT t.*, c.name as city_name 
    FROM teachers t 
    JOIN cities c ON t.city_id = c.id
  `).all();
  console.table(teachersByCity);
  
  // Check specific city (Nadiad)
  console.log('\n🏙️ Teachers in Nadiad (city_id = 1):');
  const nadiadTeachers = db.prepare('SELECT * FROM teachers WHERE city_id = 1').all();
  console.table(nadiadTeachers);
  
  console.log('\n✅ Database check completed!');
  
} catch (error) {
  console.error('❌ Error:', error);
} 