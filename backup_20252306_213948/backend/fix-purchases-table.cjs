const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'katha_sales.db');
const db = new sqlite3.Database(dbPath);

console.log('Database connection established...');

// Function to fix the purchases table
const fixPurchasesTable = () => {
  return new Promise((resolve, reject) => {
    // First, check if table exists and get its current structure
    db.all("PRAGMA table_info(tbl_purchases)", [], (err, rows) => {
      if (err) {
        console.error('Error checking table structure:', err);
        reject(err);
        return;
      }
      
      console.log('Current tbl_purchases structure:');
      if (rows.length === 0) {
        console.log('  - Table does not exist or has no columns');
      } else {
        rows.forEach(row => {
          console.log(`  - ${row.name} (${row.type})`);
        });
      }
      
      // Check if we need to recreate the table
      const hasRequiredColumns = rows.some(row => 
        ['subtotal', 'total_gst', 'grand_total'].includes(row.name)
      );
      
      if (!hasRequiredColumns) {
        console.log('\nRecreating tbl_purchases table with correct structure...');
        
        // Drop the existing table if it exists
        db.run("DROP TABLE IF EXISTS tbl_purchases", (err) => {
          if (err) {
            console.error('Error dropping table:', err);
            reject(err);
            return;
          }
          
          // Create the table with correct structure
          const createTableSQL = `
            CREATE TABLE tbl_purchases (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              invoice_number TEXT NOT NULL,
              invoice_date TEXT,
              vendor_name TEXT NOT NULL,
              subtotal REAL DEFAULT 0,
              total_gst REAL DEFAULT 0,
              grand_total REAL DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `;
          
          db.run(createTableSQL, (err) => {
            if (err) {
              console.error('Error creating table:', err);
              reject(err);
              return;
            }
            
            console.log('✅ tbl_purchases table created successfully!');
            
            // Verify the new structure
            db.all("PRAGMA table_info(tbl_purchases)", [], (err, newRows) => {
              if (err) {
                console.error('Error verifying table structure:', err);
                reject(err);
                return;
              }
              
              console.log('\nNew tbl_purchases structure:');
              newRows.forEach(row => {
                console.log(`  - ${row.name} (${row.type})`);
              });
              
              // Insert a sample record for testing
              const sampleData = {
                invoice_number: 'PUR-001',
                invoice_date: new Date().toISOString().split('T')[0],
                vendor_name: 'Sample Vendor',
                subtotal: 1000.00,
                total_gst: 180.00,
                grand_total: 1180.00
              };
              
              const insertSQL = `
                INSERT INTO tbl_purchases (invoice_number, invoice_date, vendor_name, subtotal, total_gst, grand_total)
                VALUES (?, ?, ?, ?, ?, ?)
              `;
              
              db.run(insertSQL, [
                sampleData.invoice_number,
                sampleData.invoice_date,
                sampleData.vendor_name,
                sampleData.subtotal,
                sampleData.total_gst,
                sampleData.grand_total
              ], function(err) {
                if (err) {
                  console.error('Error inserting sample data:', err);
                  reject(err);
                  return;
                }
                
                console.log('✅ Sample purchase record inserted successfully!');
                console.log(`   Invoice: ${sampleData.invoice_number}`);
                console.log(`   Vendor: ${sampleData.vendor_name}`);
                console.log(`   Total: ₹${sampleData.grand_total}`);
                
                resolve();
              });
            });
          });
        });
      } else {
        console.log('✅ tbl_purchases table already has correct structure!');
        resolve();
      }
    });
  });
};

// Run the fix
fixPurchasesTable()
  .then(() => {
    console.log('\n🎉 Purchase table fix completed successfully!');
    console.log('You can now restart your backend server.');
    db.close();
  })
  .catch((error) => {
    console.error('❌ Error fixing purchase table:', error);
    db.close();
    process.exit(1);
  });
