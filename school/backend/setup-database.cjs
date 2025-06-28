const { initializeDatabase, testConnection } = require('./config/database.cjs');

console.log('Setting up School Salary Database...');

try {
  // Initialize the database
  const success = initializeDatabase();
  
  if (success) {
    // Test the connection
    testConnection();
    console.log('✅ School database setup completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ Failed to initialize school database');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error during school database setup:', error.message);
  process.exit(1);
} 