const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./katha_sales.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Check groups table
db.all("SELECT * FROM tbl_groups", [], (err, groups) => {
  if (err) {
    console.error('Error getting groups:', err);
  } else {
    console.log('\nGroups in database:');
    console.log(`Found ${groups.length} groups`);
    groups.forEach(group => {
      console.log(`- ID: ${group.id}, Number: ${group.group_number}, Name: ${group.group_name}`);
    });
  }
  
  // Check categories table
  db.all("SELECT * FROM tbl_categories", [], (err, categories) => {
    if (err) {
      console.error('Error getting categories:', err);
    } else {
      console.log('\nCategories in database:');
      console.log(`Found ${categories.length} categories`);
      categories.forEach(category => {
        console.log(`- ID: ${category.id}, Number: ${category.category_number}, Name: ${category.category_name}, Group ID: ${category.group_id}`);
      });
    }
    
    db.close();
  });
}); 