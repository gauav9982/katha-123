const { getDatabase } = require('./school/backend/config/database.cjs');

try {
  console.log('🔧 Fixing teacher city assignment...');
  
  const db = getDatabase();
  
  // Check current teacher data
  console.log('\n📋 Current teacher data:');
  const currentTeacher = db.prepare('SELECT * FROM teachers').all();
  console.table(currentTeacher);
  
  // Check cities
  console.log('\n🏙️ Available cities:');
  const cities = db.prepare('SELECT * FROM cities').all();
  console.table(cities);
  
  // Find Nadiad city (should be ID 46)
  const nadiadCity = db.prepare('SELECT * FROM cities WHERE name = ?').get('Nadiad');
  console.log('\n🏙️ Nadiad city found:', nadiadCity);
  
  if (nadiadCity) {
    // Update teacher's city_id to Nadiad
    const updateStmt = db.prepare('UPDATE teachers SET city_id = ? WHERE id = 1');
    const result = updateStmt.run(nadiadCity.id);
    
    console.log('\n✅ Teacher city updated!');
    console.log('Rows affected:', result.changes);
    
    // Verify the update
    console.log('\n📋 Updated teacher data:');
    const updatedTeacher = db.prepare('SELECT * FROM teachers').all();
    console.table(updatedTeacher);
    
    // Check teachers by city
    console.log('\n🏙️ Teachers by city (after update):');
    const teachersByCity = db.prepare(`
      SELECT t.*, c.name as city_name 
      FROM teachers t 
      JOIN cities c ON t.city_id = c.id
    `).all();
    console.table(teachersByCity);
    
  } else {
    console.log('\n❌ Nadiad city not found!');
  }
  
  console.log('\n✅ Fix completed!');
  
} catch (error) {
  console.error('❌ Error:', error);
} 