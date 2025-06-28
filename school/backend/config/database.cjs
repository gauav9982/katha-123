const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// School application database configuration
const dbPath = path.join(__dirname, '../../database/school_salary.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
let db;

// Initialize database
const initializeDatabase = () => {
  try {
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables if they don't exist
    createTables();
    
    console.log('✅ School SQLite Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing SQLite database:', error.message);
    return false;
  }
};

// Create tables
const createTables = () => {
  // Cities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Teachers table (Basic Info)
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      birthday DATE,
      joining_date DATE,
      retirement_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES cities (id)
    )
  `);

  // Teacher Grades table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      grade_type TEXT NOT NULL, -- 'first', 'second', 'third'
      grade_date DATE,
      payable_basic DECIMAL(10,2),
      payable_grade_pay DECIMAL(10,2),
      paid_basic DECIMAL(10,2),
      paid_grade_pay DECIMAL(10,2),
      FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
      UNIQUE(teacher_id, grade_type)
    )
  `);

  // Teacher Pay Commissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_pay_commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      commission_type TEXT NOT NULL, -- '6th', '7th'
      pay_date DATE,
      payable_basic DECIMAL(10,2),
      payable_grade_pay DECIMAL(10,2),
      paid_basic DECIMAL(10,2),
      paid_grade_pay DECIMAL(10,2),
      yearly_increment_date DATE,
      FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
      UNIQUE(teacher_id, commission_type)
    )
  `);

  // Salary table
  db.exec(`
    CREATE TABLE IF NOT EXISTS salaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      basic_salary DECIMAL(10,2) NOT NULL,
      allowances DECIMAL(10,2) DEFAULT 0,
      deductions DECIMAL(10,2) DEFAULT 0,
      net_salary DECIMAL(10,2) NOT NULL,
      payment_date DATE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
      UNIQUE(teacher_id, month, year)
    )
  `);

  // DA% table (Dearness Allowance)
  db.exec(`
    CREATE TABLE IF NOT EXISTS da_percentages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      da_percentage DECIMAL(6,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(month, year)
    )
  `);

  // HRA% table (House Rent Allowance)
  db.exec(`
    CREATE TABLE IF NOT EXISTS hra_percentages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      hra_percentage DECIMAL(6,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(month, year)
    )
  `);

  // Salary Reports table for storing calculated reports
  db.exec(`
    CREATE TABLE IF NOT EXISTS salary_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      city_name TEXT NOT NULL,
      report_type TEXT NOT NULL, -- 'payable', 'paid', 'different'
      commission_type TEXT NOT NULL, -- '5th', '6th', '7th', 'old_6th'
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      date TEXT, -- Date when grade/commission changes
      xbasic DECIMAL(10,2) DEFAULT 0,
      mbasic DECIMAL(10,2) DEFAULT 0,
      grade_pay DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(10,2) DEFAULT 0,
      yearly_increment_applied BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
      UNIQUE(teacher_id, report_type, commission_type, month, year)
    )
  `);

  // Migration to add 'yearly_increment_applied' column if it doesn't exist
  try {
    const columns = db.prepare("PRAGMA table_info(salary_reports)").all();
    const hasYearlyIncrementApplied = columns.some(col => col.name === 'yearly_increment_applied');

    if (!hasYearlyIncrementApplied) {
        console.log('DB Migration: Adding "yearly_increment_applied" column to "salary_reports" table...');
        db.exec('ALTER TABLE salary_reports ADD COLUMN yearly_increment_applied BOOLEAN DEFAULT 0');
        console.log('DB Migration successful.');
    }
  } catch (err) {
      console.error('Failed to run migration for salary_reports:', err.message);
  }

  // Migration to update DA and HRA percentage columns to support values over 100
  try {
    // Check DA percentages table
    const daColumns = db.prepare("PRAGMA table_info(da_percentages)").all();
    const daPercentageColumn = daColumns.find(col => col.name === 'da_percentage');
    
    if (daPercentageColumn && daPercentageColumn.type === 'DECIMAL(5,2)') {
      console.log('DB Migration: Updating da_percentage column to support values over 100...');
      // SQLite doesn't support ALTER COLUMN TYPE, so we need to recreate the table
      db.exec(`
        CREATE TABLE da_percentages_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          da_percentage DECIMAL(6,2) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(month, year)
        )
      `);
      db.exec('INSERT INTO da_percentages_new SELECT * FROM da_percentages');
      db.exec('DROP TABLE da_percentages');
      db.exec('ALTER TABLE da_percentages_new RENAME TO da_percentages');
      console.log('DA percentages migration successful.');
    }

    // Check HRA percentages table
    const hraColumns = db.prepare("PRAGMA table_info(hra_percentages)").all();
    const hraPercentageColumn = hraColumns.find(col => col.name === 'hra_percentage');
    
    if (hraPercentageColumn && hraPercentageColumn.type === 'DECIMAL(5,2)') {
      console.log('DB Migration: Updating hra_percentage column to support values over 100...');
      // SQLite doesn't support ALTER COLUMN TYPE, so we need to recreate the table
      db.exec(`
        CREATE TABLE hra_percentages_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          hra_percentage DECIMAL(6,2) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(month, year)
        )
      `);
      db.exec('INSERT INTO hra_percentages_new SELECT * FROM hra_percentages');
      db.exec('DROP TABLE hra_percentages');
      db.exec('ALTER TABLE hra_percentages_new RENAME TO hra_percentages');
      console.log('HRA percentages migration successful.');
    }
  } catch (err) {
    console.error('Failed to run migration for DA/HRA percentages:', err.message);
  }

  // Insert default cities if not exists
  const defaultCities = [
    { name: 'Nadiad', code: 'NAD' },
    { name: 'Ahmedabad', code: 'AHM' },
    { name: 'Vadodara', code: 'VAD' },
    { name: 'Surat', code: 'SUR' },
    { name: 'Rajkot', code: 'RAJ' }
  ];

  const insertCity = db.prepare('INSERT OR IGNORE INTO cities (name, code) VALUES (?, ?)');
  defaultCities.forEach(city => {
    insertCity.run(city.name, city.code);
  });

  console.log('✅ School database tables created successfully!');
};

// Test database connection
const testConnection = () => {
  try {
    if (!db) {
      initializeDatabase();
    }
    
    const result = db.prepare('SELECT 1 as test').get();
    console.log('✅ School SQLite Database connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ School Database connection failed:', error.message);
    return false;
  }
};

// Get database instance
const getDatabase = () => {
  if (!db) {
    initializeDatabase();
  }
  return db;
};

// Close database connection
const closeDatabase = () => {
  if (db) {
    db.close();
    console.log('✅ School Database connection closed.');
  }
};

module.exports = {
  initializeDatabase,
  testConnection,
  getDatabase,
  closeDatabase,
  dbPath
}; 