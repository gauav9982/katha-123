const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'katha.db');
const db = new sqlite3.Database(dbPath);

const cities = [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Nadiad'
];

function setupCities() {
    return new Promise((resolve, reject) => {
        // Create table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS cities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )`, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Cities table created successfully');

            // Insert cities one by one
            const insertCity = (index) => {
                if (index >= cities.length) {
                    resolve();
                    return;
                }

                const city = cities[index];
                db.run('INSERT OR IGNORE INTO cities (name) VALUES (?)', [city], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log(`Added city: ${city}`);
                    insertCity(index + 1);
                });
            };

            insertCity(0);
        });
    });
}

// Main execution
async function main() {
    try {
        console.log('Connected to SQLite database');
        await setupCities();
        console.log('Setup completed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
                process.exit(1);
            }
            console.log('Database connection closed');
        });
    }
}

main(); 