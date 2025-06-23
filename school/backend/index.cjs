const express = require('express');
const cors = require('cors');
const { initializeDatabase, testConnection } = require('./config/database.cjs');

const app = express();
const PORT = process.env.PORT || 4009;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... (All other routes and middleware from before)

// Calculate Payable 5th Commission Report for a teacher
app.post('/api/reports/payable-5th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const sixthCommissionDate = new Date(sixthCommission.pay_date);
    
    if (firstGradeDate > sixthCommissionDate) {
      return res.status(400).json({ success: false, error: '1st higher grade date is after 6th commission date. No report can be generated.' });
    }
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const endDate = retirementDate && retirementDate < sixthCommissionDate ? retirementDate : sixthCommissionDate;
    
    // Force re-read of the calculation logic to break cache
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePayable5thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePayable5thCommissionReport(teacher, grades, sixthCommission, firstGradeDate, endDate);
    
    // Re-enabling database saving
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'payable' AND commission_type = '5th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'payable', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total);
    });
    
    // Return the freshly calculated data
    res.json({
      success: true,
      message: 'Payable 5th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Payable 5th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// THIS IS THE MISSING ROUTE
app.get('/api/reports/payable-5th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'payable' AND commission_type = '5th'
      ORDER BY year, month
    `).all(teacherId);

    if (existingReport && existingReport.length > 0) {
      res.json({ success: true, data: existingReport });
    } else {
      res.json({ success: true, data: [] }); // Send empty array if no report exists
    }
  } catch (error) {
    console.error('Error loading existing report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// PAID 5th COMMISSION REPORT
// =================================================================

// Calculate Paid 5th Commission Report
app.post('/api/reports/paid-5th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const sixthCommissionDate = new Date(sixthCommission.pay_date);
    
    if (firstGradeDate > sixthCommissionDate) {
      return res.status(400).json({ success: false, error: '1st higher grade date is after 6th commission date. No report can be generated.' });
    }
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const endDate = retirementDate && retirementDate < sixthCommissionDate ? retirementDate : sixthCommissionDate;
    
    // Force re-read of the calculation logic to break cache
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePaid5thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePaid5thCommissionReport(teacher, grades, sixthCommission, firstGradeDate, endDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid' AND commission_type = '5th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'paid', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total);
    });
    
    res.json({
      success: true,
      message: 'Paid 5th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Paid 5th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Paid 5th Commission Report
app.get('/api/reports/paid-5th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'paid' AND commission_type = '5th'
      ORDER BY year, month
    `).all(teacherId);

    if (existingReport && existingReport.length > 0) {
      res.json({ success: true, data: existingReport });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Error loading existing paid report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// PAYABLE 6th COMMISSION REPORT
// =================================================================

// Calculate Payable 6th Commission Report
app.post('/api/reports/payable-6th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    if (!seventhCommission) {
      return res.status(400).json({ success: false, error: '7th commission data not found for this teacher.' });
    }
    
    const sixthCommissionDate = new Date(sixthCommission.pay_date);
    const seventhCommissionDate = new Date(seventhCommission.pay_date);
    
    // End date is one day before 7th commission date
    const endDate = new Date(seventhCommissionDate);
    endDate.setDate(endDate.getDate() - 1);
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
    
    // Force re-read of the calculation logic to break cache
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePayable6thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePayable6thCommissionReport(teacher, grades, sixthCommission, seventhCommission, sixthCommissionDate, finalEndDate);
    
    // Save to database
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'payable' AND commission_type = '6th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'payable', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Payable 6th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Payable 6th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Payable 6th Commission Report
app.get('/api/reports/payable-6th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'payable' AND commission_type = '6th'
      ORDER BY year, month
    `).all(teacherId);

    if (existingReport && existingReport.length > 0) {
      res.json({ success: true, data: existingReport });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Error loading existing report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// PAID 6th COMMISSION REPORT
// =================================================================

// Calculate Paid 6th Commission Report
app.post('/api/reports/paid-6th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacherId);
    
    if (!sixthCommission || !seventhCommission) {
      return res.status(400).json({ success: false, error: '6th or 7th commission data not found for this teacher.' });
    }
    
    const sixthCommissionDate = new Date(sixthCommission.pay_date);
    const seventhCommissionDate = new Date(seventhCommission.pay_date);
    
    const endDate = new Date(seventhCommissionDate);
    endDate.setDate(endDate.getDate() - 1);
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePaid6thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePaid6thCommissionReport(teacher, grades, sixthCommission, seventhCommission, sixthCommissionDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid' AND commission_type = '6th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'paid', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Paid 6th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Paid 6th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Paid 6th Commission Report
app.get('/api/reports/paid-6th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'paid' AND commission_type = '6th'
      ORDER BY year, month
    `).all(teacherId);

    if (existingReport && existingReport.length > 0) {
      res.json({ success: true, data: existingReport });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Error loading existing paid 6th commission report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// SUPPORT PAYABLE 6th COMMISSION REPORT
// =================================================================

// Calculate Support Payable 6th Commission Report
app.post('/api/reports/sup-payable-6th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const startDate = new Date(sixthCommission.pay_date);
    const fixedEndDate = new Date('2022-10-11');
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    // We can reuse the same calculation logic, just with a different end date
    const { calculatePayable6thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePayable6thCommissionReport(teacher, grades, sixthCommission, null, startDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-payable-6th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'sup-payable-6th', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Support Payable 6th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Support Payable 6th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Support Payable 6th Commission Report
app.get('/api/reports/sup-payable-6th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'sup-payable-6th'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing support report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// SUPPORT PAID 6th COMMISSION REPORT
// =================================================================

// Calculate Support Paid 6th Commission Report
app.post('/api/reports/sup-paid-6th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const startDate = new Date(sixthCommission.pay_date);
    const fixedEndDate = new Date('2022-10-11');
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePaid6thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePaid6thCommissionReport(teacher, grades, sixthCommission, null, startDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-paid-6th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'sup-paid-6th', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Support Paid 6th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Support Paid 6th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Support Paid 6th Commission Report
app.get('/api/reports/sup-paid-6th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'sup-paid-6th'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing support report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// PAYABLE 7th COMMISSION REPORT
// =================================================================

// Calculate Payable 7th Commission Report
app.post('/api/reports/payable-7th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacherId);
    
    if (!seventhCommission) {
      return res.status(400).json({ success: false, error: '7th commission data not found for this teacher.' });
    }
    
    const startDate = new Date(seventhCommission.pay_date);
    const fixedEndDate = new Date('2022-10-11');
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePayable7thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePayable7thCommissionReport(teacher, grades, seventhCommission, startDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'payable-7th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'payable-7th', '7th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Payable 7th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Payable 7th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Payable 7th Commission Report
app.get('/api/reports/payable-7th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'payable-7th'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing 7th commission report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// PAID 7th COMMISSION REPORT
// =================================================================

// Calculate Paid 7th Commission Report
app.post('/api/reports/paid-7th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacherId);
    
    if (!seventhCommission) {
      return res.status(400).json({ success: false, error: '7th commission data not found for this teacher.' });
    }
    
    const startDate = new Date(seventhCommission.pay_date);
    const fixedEndDate = new Date('2022-10-11');
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePaid7thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculatePaid7thCommissionReport(teacher, grades, seventhCommission, startDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid-7th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'paid-7th', '7th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Paid 7th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Paid 7th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Paid 7th Commission Report
app.get('/api/reports/paid-7th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'paid-7th'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing paid 7th commission report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// SUPPORT PAYABLE 5th COMMISSION REPORT
// =================================================================

// Calculate Support Payable 5th Commission Report
app.post('/api/reports/sup-payable-5th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const fixedEndDate = new Date('2009-03-31');
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculateSupPayable5thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculateSupPayable5thCommissionReport(teacher, grades, sixthCommission, firstGradeDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-payable-5th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'sup-payable-5th', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Support Payable 5th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Support Payable 5th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Support Payable 5th Commission Report
app.get('/api/reports/sup-payable-5th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'sup-payable-5th'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing support payable 5th commission report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// SUPPORT PAID 5th COMMISSION REPORT
// =================================================================

// Calculate Support Paid 5th Commission Report
app.post('/api/reports/sup-paid-5th-commission/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const fixedEndDate = new Date('2009-03-31');
    
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculateSupPaid5thCommissionReport } = require('./calculation-logic.cjs');

    const reportData = calculateSupPaid5thCommissionReport(teacher, grades, sixthCommission, firstGradeDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-paid-5th'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'sup-paid-5th', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
    });
    
    res.json({
      success: true,
      message: 'Support Paid 5th Commission Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Support Paid 5th Commission Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Support Paid 5th Commission Report
app.get('/api/reports/sup-paid-5th-commission/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'sup-paid-5th'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing support paid 5th commission report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// PAYABLE HRA REPORT
// =================================================================

// Calculate Payable HRA Report
app.post('/api/reports/payable-hra/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const endDate = new Date('2022-10-11'); // 11-10-2022
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
    
    // Force re-read of the calculation logic to break cache
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePayableHRAReport } = require('./calculation-logic.cjs');

    const reportData = calculatePayableHRAReport(teacher, grades, sixthCommission, firstGradeDate, finalEndDate);
    
    // Save to database
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'payable-hra'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'payable-hra', 'HRA', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.total);
    });
    
    res.json({
      success: true,
      message: 'Payable HRA Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Payable HRA Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Payable HRA Report
app.get('/api/reports/payable-hra/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, mbasic, grade_pay, total_amount 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'payable-hra'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing payable HRA report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// PAID HRA REPORT
// =================================================================

// Calculate Paid HRA Report
app.post('/api/reports/paid-hra/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const endDate = new Date('2022-10-11'); // 11-10-2022
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
    
    // Force re-read of the calculation logic to break cache
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculatePaidHRAReport } = require('./calculation-logic.cjs');

    const reportData = calculatePaidHRAReport(teacher, grades, sixthCommission, firstGradeDate, finalEndDate);
    
    // Save to database
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid-hra'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'paid-hra', 'HRA', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.total);
    });
    
    res.json({
      success: true,
      message: 'Paid HRA Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating Paid HRA Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing Paid HRA Report
app.get('/api/reports/paid-hra/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, mbasic, grade_pay, total_amount 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'paid-hra'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing paid HRA report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// ALL PAYABLE REPORT
// =================================================================

// Calculate All Payable Report
app.post('/api/reports/all-payable/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const endDate = new Date('2022-10-11'); // 11-10-2022
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
    
    // Force re-read of the calculation logic to break cache
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculateAllPayableReport } = require('./calculation-logic.cjs');

    const reportData = calculateAllPayableReport(teacher, grades, sixthCommission, seventhCommission, firstGradeDate, finalEndDate);
    
    // Save to database
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'all-payable'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'all-payable', 'ALL', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.payableTotal);
    });
    
    res.json({
      success: true,
      message: 'All Payable Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating All Payable Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing All Payable Report
app.get('/api/reports/all-payable/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, mbasic, grade_pay, total_amount 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'all-payable'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing all payable report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// ALL PAID REPORT
// =================================================================

// Calculate All Paid Report
app.post('/api/reports/all-paid/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }
    
    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }
    
    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacherId);
    
    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }
    
    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }
    
    const firstGradeDate = new Date(firstGrade.grade_date);
    const endDate = new Date('2022-10-11'); // 11-10-2022
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
    
    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculateAllPaidReport } = require('./calculation-logic.cjs');

    const reportData = calculateAllPaidReport(teacher, grades, sixthCommission, seventhCommission, firstGradeDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'all-paid'`);
    deleteStmt.run(teacherId);
    
    const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    reportData.forEach(row => {
      insertStmt.run(teacherId, teacher.city_name, 'all-paid', 'ALL', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.paidTotal);
    });
    
    res.json({
      success: true,
      message: 'All Paid Report calculated and saved successfully.',
      data: reportData
    });
    
  } catch (error) {
    console.error('Error calculating All Paid Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Load existing All Paid Report
app.get('/api/reports/all-paid/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT month, year, date, mbasic, grade_pay, total_amount 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'all-paid'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing all paid report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// DIFFERENT SALARY REPORT
// =================================================================

app.post('/api/reports/different-salary/calculate', (req, res) => {
  try {
    const { teacherId } = req.body;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'Teacher ID is required.' });
    }

    const teacher = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found.' });
    }

    const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacherId);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacherId);
    const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacherId);

    if (!sixthCommission) {
      return res.status(400).json({ success: false, error: '6th commission data not found for this teacher.' });
    }

    const firstGrade = grades.find(g => g.grade_type === 'first');
    if (!firstGrade) {
      return res.status(400).json({ success: false, error: '1st higher grade not found for this teacher.' });
    }

    const firstGradeDate = new Date(firstGrade.grade_date);
    const endDate = new Date('2022-10-11');
    const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
    const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;

    delete require.cache[require.resolve('./calculation-logic.cjs')];
    const { calculateDifferentSalaryReport } = require('./calculation-logic.cjs');

    const reportData = calculateDifferentSalaryReport(teacher, grades, sixthCommission, seventhCommission, firstGradeDate, finalEndDate);
    
    const deleteStmt = db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'different-salary'`);
    deleteStmt.run(teacherId);

    const insertStmt = db.prepare(`
      INSERT INTO salary_reports (
        teacher_id, city_name, report_type, commission_type, month, year, date,
        payable_basic, payable_gredpay, payable_total, payable_da_amount, payable_hra_amount, payable_final_total,
        paid_basic, paid_gredpay, paid_total, paid_da_amount, paid_hra_amount, paid_final_total,
        diff_basic, diff_gredpay, diff_total, diff_da_amount, diff_hra_amount, diff_final_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    reportData.forEach(row => {
      insertStmt.run(
        teacherId, teacher.city_name, 'different-salary', 'ALL', row.month, row.year, row.date,
        row.payable_basic, row.payable_gredpay, row.payable_total, row.payable_da_amount, row.payable_hra_amount, row.payable_final_total,
        row.paid_basic, row.paid_gredpay, row.paid_total, row.paid_da_amount, row.paid_hra_amount, row.paid_final_total,
        row.diff_basic, row.diff_gredpay, row.diff_total, row.diff_da_amount, row.diff_hra_amount, row.diff_final_total
      );
    });

    res.json({
      success: true,
      message: 'Different Salary Report calculated and saved successfully.',
      data: reportData
    });

  } catch (error) {
    console.error('Error calculating Different Salary Report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/reports/different-salary/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const existingReport = db.prepare(`
      SELECT * 
      FROM salary_reports 
      WHERE teacher_id = ? AND report_type = 'different-salary'
      ORDER BY year, month
    `).all(teacherId);

    res.json({ success: true, data: existingReport || [] });
  } catch (error) {
    console.error('Error loading existing different salary report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// In-memory storage for demo (replace with DB logic as needed)
let hraPercentages = [];

// In-memory storage for DA percentages
let daPercentages = [];

// POST: Add new HRA percentage
app.post('/api/hra-percentages', (req, res) => {
  try {
    const { city = 'Nadiad', month, year, hraPercentage } = req.body;
    if (!month || !year || hraPercentage === null || hraPercentage === undefined || hraPercentage === '') {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    const stmt = db.prepare('INSERT INTO hra_percentages (month, year, hra_percentage) VALUES (?, ?, ?)');
    const result = stmt.run(parseInt(month), parseInt(year), parseFloat(hraPercentage));
    
    const newEntry = {
      id: result.lastInsertRowid,
      city,
      month: parseInt(month),
      year: parseInt(year),
      hra_percentage: parseFloat(hraPercentage),
      created_at: new Date().toISOString()
    };
    
    res.json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Error adding HRA percentage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT: Edit HRA percentage
app.put('/api/hra-percentages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, hraPercentage } = req.body;
    if (!month || !year || hraPercentage === null || hraPercentage === undefined || hraPercentage === '') {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    const stmt = db.prepare('UPDATE hra_percentages SET month = ?, year = ?, hra_percentage = ? WHERE id = ?');
    const result = stmt.run(parseInt(month), parseInt(year), parseFloat(hraPercentage), id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found.' });
    }
    
    const updatedEntry = {
      id: parseInt(id),
      month: parseInt(month),
      year: parseInt(year),
      hra_percentage: parseFloat(hraPercentage),
      created_at: new Date().toISOString()
    };
    
    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Error updating HRA percentage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove HRA percentage
app.delete('/api/hra-percentages/:id', (req, res) => {
  const { id } = req.params;
  const index = hraPercentages.findIndex(h => h.id == id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Entry not found.' });
  hraPercentages.splice(index, 1);
  res.json({ success: true });
});

// POST: Add new DA percentage
app.post('/api/da-percentages', (req, res) => {
  try {
    const { city = 'Nadiad', month, year, daPercentage } = req.body;
    if (!month || !year || daPercentage === null || daPercentage === undefined || daPercentage === '') {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    const stmt = db.prepare('INSERT INTO da_percentages (month, year, da_percentage) VALUES (?, ?, ?)');
    const result = stmt.run(parseInt(month), parseInt(year), parseFloat(daPercentage));
    
    const newEntry = {
      id: result.lastInsertRowid,
      city,
      month: parseInt(month),
      year: parseInt(year),
      da_percentage: parseFloat(daPercentage),
      created_at: new Date().toISOString()
    };
    
    res.json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Error adding DA percentage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT: Edit DA percentage
app.put('/api/da-percentages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { month, year, daPercentage } = req.body;
    if (!month || !year || daPercentage === null || daPercentage === undefined || daPercentage === '') {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    const stmt = db.prepare('UPDATE da_percentages SET month = ?, year = ?, da_percentage = ? WHERE id = ?');
    const result = stmt.run(parseInt(month), parseInt(year), parseFloat(daPercentage), id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found.' });
    }
    
    const updatedEntry = {
      id: parseInt(id),
      month: parseInt(month),
      year: parseInt(year),
      da_percentage: parseFloat(daPercentage),
      created_at: new Date().toISOString()
    };
    
    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Error updating DA percentage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove DA percentage
app.delete('/api/da-percentages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    const stmt = db.prepare('DELETE FROM da_percentages WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found.' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting DA percentage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions are now moved to calculation-logic.cjs

// ... (The rest of the file: other endpoints, error handling, startServer)
// Make sure to include the full original file content here
// For brevity, I am only showing the relevant parts.

const initializeApp = () => {
  console.log('🚀 Initializing School Salary Management System...');
  const dbInitialized = initializeDatabase();
  if (!dbInitialized) {
    console.error('❌ Failed to initialize database.');
    process.exit(1);
  }
  const isConnected = testConnection();
  if (!isConnected) {
    console.error('❌ Failed to connect to database.');
    process.exit(1);
  }
  const { getDatabase } = require('./config/database.cjs');
  const db = getDatabase();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city_id INTEGER NOT NULL,
      retirement_date DATE,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `).run();
  
  db.prepare(`
  CREATE TABLE IF NOT EXISTS teacher_grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    grade_type TEXT CHECK(grade_type IN ('first', 'second', 'third')) NOT NULL,
    grade_date DATE NOT NULL,
    payable_basic REAL NOT NULL,
    payable_grade_pay REAL NOT NULL,
    paid_basic REAL NOT NULL DEFAULT 0,
    paid_grade_pay REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )
  `).run();

  db.prepare(`
  CREATE TABLE IF NOT EXISTS teacher_pay_commissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    commission_type TEXT CHECK(commission_type IN ('6th', '7th')) NOT NULL,
    pay_date DATE NOT NULL,
    payable_basic REAL NOT NULL,
    payable_grade_pay REAL NOT NULL,
    paid_basic REAL NOT NULL DEFAULT 0,
    paid_grade_pay REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )
  `).run();

  db.prepare(`
  CREATE TABLE IF NOT EXISTS salary_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    city_name TEXT,
    report_type TEXT,
    commission_type TEXT,
    month INTEGER,
    year INTEGER,
    date TEXT,
    xbasic REAL,
    mbasic REAL,
    grade_pay REAL,
    total_amount REAL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )
  `).run();

  // Add new columns to salary_reports if they don't exist
  const columns = [
    'yearly_increment_applied INTEGER',
    'payable_basic REAL',
    'payable_gredpay REAL',
    'payable_total REAL',
    'payable_da_amount REAL',
    'payable_hra_amount REAL',
    'payable_final_total REAL',
    'paid_basic REAL',
    'paid_gredpay REAL',
    'paid_total REAL',
    'paid_da_amount REAL',
    'paid_hra_amount REAL',
    'paid_final_total REAL',
    'diff_basic REAL',
    'diff_gredpay REAL',
    'diff_total REAL',
    'diff_da_amount REAL',
    'diff_hra_amount REAL',
    'diff_final_total REAL'
  ];

  for (const column of columns) {
    try {
      db.prepare(`ALTER TABLE salary_reports ADD COLUMN ${column}`).run();
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        console.error(`Failed to add column ${column}:`, error);
      }
    }
  }

  db.prepare(`
    CREATE TABLE IF NOT EXISTS lwp_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id TEXT NOT NULL,
      teacher_name TEXT NOT NULL,
      leave_type TEXT NOT NULL CHECK (leave_type IN ('LWP', 'HLWP')),
      month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
      year INTEGER NOT NULL,
      day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
      city_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
};

app.get('/', (req, res) => {
  res.json({
    message: 'School Salary Management System API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'school-salary-backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/cities', (req, res) => {
  try {
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    const cities = db.prepare('SELECT * FROM cities').all();
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/teachers', (req, res) => {
  try {
    const { cityName } = req.query;
    if (!cityName) {
      return res.status(400).json({ success: false, error: 'City name is required' });
    }

    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const city = db.prepare('SELECT id FROM cities WHERE name = ?').get(cityName);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }

    const teachers = db.prepare('SELECT * FROM teachers WHERE city_id = ?').all(city.id);
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/cities/login', (req, res) => {
  try {
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ success: false, error: 'City name is required' });
    }

    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();

    const city = db.prepare('SELECT * FROM cities WHERE name = ?').get(cityName);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }

    // Success: return city info
    res.json({ success: true, data: city });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hra-percentages', (req, res) => {
  try {
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    const hraPercentages = db.prepare('SELECT * FROM hra_percentages ORDER BY year, month').all();
    res.json({ success: true, data: hraPercentages });
  } catch (error) {
    console.error('Error fetching HRA percentages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/da-percentages', (req, res) => {
  try {
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    const daPercentages = db.prepare('SELECT * FROM da_percentages ORDER BY year, month').all();
    res.json({ success: true, data: daPercentages });
  } catch (error) {
    console.error('Error fetching DA percentages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found in school backend',
    path: req.originalUrl
  });
});

const startServer = () => {
  try {
    initializeApp();
    app.listen(PORT, () => {
      console.log(`✅ School Salary Backend running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 