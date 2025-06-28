const { getDatabase } = require('./config/database.cjs');

async function fixAllCommissionReports() {
  const db = getDatabase();
  
  try {
    console.log('🔧 Starting Commission Reports Fix...');
    
    // Get all teachers
    const teachers = db.prepare(`SELECT id, name FROM teachers`).all();
    console.log(`📋 Found ${teachers.length} teachers to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const teacher of teachers) {
      try {
        console.log(`\n👤 Processing Teacher: ${teacher.name} (ID: ${teacher.id})`);
        
        // Get teacher data
        const teacherData = db.prepare(`SELECT t.*, c.name as city_name FROM teachers t JOIN cities c ON t.city_id = c.id WHERE t.id = ?`).get(teacher.id);
        const grades = db.prepare(`SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date ASC`).all(teacher.id);
        const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacher.id);
        const seventhCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '7th'`).get(teacher.id);
        
        if (!sixthCommission) {
          console.log(`⚠️  Skipping - No 6th commission data for teacher ${teacher.name}`);
          continue;
        }
        
        // Get calculation logic
        const { 
          calculateSupPayable5thCommissionReport,
          calculateSupPaid5thCommissionReport,
          calculatePayable6thCommissionReport,
          calculatePaid6thCommissionReport
        } = require('./calculation-logic.cjs');
        
        // Fix 1: Support Payable 5th Commission (up to March 2009)
        console.log('  📊 Fixing Support Payable 5th Commission...');
        const firstGrade = grades.find(g => g.grade_type === 'first');
        if (firstGrade) {
          const firstGradeDate = new Date(firstGrade.grade_date);
          const fixedEndDate = new Date('2009-03-31');
          const retirementDate = teacherData.retirement_date ? new Date(teacherData.retirement_date) : null;
          const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
          
          const sup5thData = calculateSupPayable5thCommissionReport(teacherData, grades, sixthCommission, firstGradeDate, finalEndDate);
          
          // Delete old data and insert new
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-payable-5th'`).run(teacher.id);
          
          const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          sup5thData.forEach(row => {
            insertStmt.run(teacher.id, teacherData.city_name, 'sup-payable-5th', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
          });
          console.log(`    ✅ Inserted ${sup5thData.length} records (up to March 2009)`);
        }
        
        // Fix 2: Support Paid 5th Commission (up to March 2009)
        console.log('  📊 Fixing Support Paid 5th Commission...');
        if (firstGrade) {
          const firstGradeDate = new Date(firstGrade.grade_date);
          const fixedEndDate = new Date('2009-03-31');
          const retirementDate = teacherData.retirement_date ? new Date(teacherData.retirement_date) : null;
          const finalEndDate = retirementDate && retirementDate < fixedEndDate ? retirementDate : fixedEndDate;
          
          const sup5thPaidData = calculateSupPaid5thCommissionReport(teacherData, grades, sixthCommission, firstGradeDate, finalEndDate);
          
          // Delete old data and insert new
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-paid-5th'`).run(teacher.id);
          
          const insertStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          sup5thPaidData.forEach(row => {
            insertStmt.run(teacher.id, teacherData.city_name, 'sup-paid-5th', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
          });
          console.log(`    ✅ Inserted ${sup5thPaidData.length} records (up to March 2009)`);
        }
        
        // Fix 3: Support Payable 6th Commission (from April 2009)
        console.log('  📊 Fixing Support Payable 6th Commission...');
        const startDate6th = new Date('2009-04-01');
        const fixedEndDate6th = new Date('2022-10-11');
        const retirementDate6th = teacherData.retirement_date ? new Date(teacherData.retirement_date) : null;
        const finalEndDate6th = retirementDate6th && retirementDate6th < fixedEndDate6th ? retirementDate6th : fixedEndDate6th;
        
        const sup6thData = calculatePayable6thCommissionReport(teacherData, grades, sixthCommission, null, startDate6th, finalEndDate6th);
        
        // Delete old data and insert new
        db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-payable-6th'`).run(teacher.id);
        
        const insert6thStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        sup6thData.forEach(row => {
          insert6thStmt.run(teacher.id, teacherData.city_name, 'sup-payable-6th', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
        });
        console.log(`    ✅ Inserted ${sup6thData.length} records (from April 2009)`);
        
        // Fix 4: Support Paid 6th Commission (from April 2009)
        console.log('  📊 Fixing Support Paid 6th Commission...');
        const sup6thPaidData = calculatePaid6thCommissionReport(teacherData, grades, sixthCommission, null, startDate6th, finalEndDate6th);
        
        // Delete old data and insert new
        db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-paid-6th'`).run(teacher.id);
        
        const insert6thPaidStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        sup6thPaidData.forEach(row => {
          insert6thPaidStmt.run(teacher.id, teacherData.city_name, 'sup-paid-6th', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
        });
        console.log(`    ✅ Inserted ${sup6thPaidData.length} records (from April 2009)`);
        
        // Fix 5: Regular Payable 6th Commission (from April 2009)
        if (seventhCommission) {
          console.log('  📊 Fixing Regular Payable 6th Commission...');
          const seventhCommissionDate = new Date(seventhCommission.pay_date);
          const endDate = new Date(seventhCommissionDate);
          endDate.setDate(endDate.getDate() - 1);
          
          const retirementDate = teacherData.retirement_date ? new Date(teacherData.retirement_date) : null;
          const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
          
          const reg6thData = calculatePayable6thCommissionReport(teacherData, grades, sixthCommission, seventhCommission, startDate6th, finalEndDate);
          
          // Delete old data and insert new
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'payable' AND commission_type = '6th'`).run(teacher.id);
          
          const insertReg6thStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          reg6thData.forEach(row => {
            insertReg6thStmt.run(teacher.id, teacherData.city_name, 'payable', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
          });
          console.log(`    ✅ Inserted ${reg6thData.length} records (from April 2009)`);
        }
        
        // Fix 6: Regular Paid 6th Commission (from April 2009)
        if (seventhCommission) {
          console.log('  📊 Fixing Regular Paid 6th Commission...');
          const seventhCommissionDate = new Date(seventhCommission.pay_date);
          const endDate = new Date(seventhCommissionDate);
          endDate.setDate(endDate.getDate() - 1);
          
          const retirementDate = teacherData.retirement_date ? new Date(teacherData.retirement_date) : null;
          const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
          
          const reg6thPaidData = calculatePaid6thCommissionReport(teacherData, grades, sixthCommission, seventhCommission, startDate6th, finalEndDate);
          
          // Delete old data and insert new
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid' AND commission_type = '6th'`).run(teacher.id);
          
          const insertReg6thPaidStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          reg6thPaidData.forEach(row => {
            insertReg6thPaidStmt.run(teacher.id, teacherData.city_name, 'paid', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
          });
          console.log(`    ✅ Inserted ${reg6thPaidData.length} records (from April 2009)`);
        }
        
        processedCount++;
        console.log(`✅ Successfully processed teacher: ${teacher.name}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing teacher ${teacher.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Commission Reports Fix Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successfully processed: ${processedCount} teachers`);
    console.log(`   ❌ Errors: ${errorCount} teachers`);
    console.log(`\n🔧 Changes Made:`);
    console.log(`   • 5th Commission Reports: Now end at March 2009`);
    console.log(`   • 6th Commission Reports: Now start from April 2009`);
    console.log(`   • All old data cleared and recalculated`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the fix
fixAllCommissionReports(); 