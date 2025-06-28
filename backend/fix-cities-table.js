const { getDatabase } = require('./config/database.cjs');
const path = require('path');
const Database = require('better-sqlite3');

console.log('Clearing cities tables...');

try {
  // Clear main database cities
  const mainDb = getDatabase();
  
  // Temporarily disable foreign key checks
  mainDb.pragma('foreign_keys = OFF');
  
  // Begin transaction
  mainDb.prepare('BEGIN TRANSACTION').run();
  
  try {
    mainDb.prepare('DELETE FROM cities').run();
    console.log('✅ Cleared main database cities table');
    
    // Clear school database cities
    const schoolDbPath = path.join(__dirname, '../school/database/school_salary.db');
    const schoolDb = new Database(schoolDbPath);
    
    // Temporarily disable foreign key checks
    schoolDb.pragma('foreign_keys = OFF');
    
    // Begin transaction
    schoolDb.prepare('BEGIN TRANSACTION').run();
    
    try {
      schoolDb.prepare('DELETE FROM cities').run();
      
      // Commit changes
      schoolDb.prepare('COMMIT').run();
      
      // Re-enable foreign key checks
      schoolDb.pragma('foreign_keys = ON');
      
      console.log('✅ Cleared school database cities table');
      schoolDb.close();
      
      // Commit main database changes
      mainDb.prepare('COMMIT').run();
      
      // Re-enable foreign key checks for main database
      mainDb.pragma('foreign_keys = ON');
      
      console.log('✅ Cities tables cleared successfully!');
      process.exit(0);
    } catch (error) {
      schoolDb.prepare('ROLLBACK').run();
      schoolDb.close();
      throw error;
    }
  } catch (error) {
    mainDb.prepare('ROLLBACK').run();
    throw error;
  }
} catch (error) {
  console.error('❌ Error clearing cities tables:', error.message);
  process.exit(1);
} 