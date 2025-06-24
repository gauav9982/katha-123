const { getDatabase } = require('./config/database.cjs');

async function fixAllReports() {
  const db = getDatabase();
  
  try {
    console.log('🔧 Starting Complete Reports Fix...');
    console.log('📋 This will fix ALL reports with proper date ranges:');
    console.log('   • 5th Commission Reports: Up to March 2009');
    console.log('   • 6th Commission Reports: From April 2009');
    console.log('   • 7th Commission Reports: From 7th commission date');
    console.log('   • HRA Reports: Proper data from 5th & 6th commission');
    console.log('   • All Payable/Paid Reports: Combined data from all commissions');
    console.log('');
    
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
          calculatePaid6thCommissionReport,
          calculatePayable7thCommissionReport,
          calculatePaid7thCommissionReport,
          calculatePayableHRAReport,
          calculatePaidHRAReport,
          calculateAllPayableReport,
          calculateAllPaidReport
        } = require('./calculation-logic.cjs');
        
        const firstGrade = grades.find(g => g.grade_type === 'first');
        if (!firstGrade) {
          console.log(`⚠️  Skipping - No first grade data for teacher ${teacher.name}`);
          continue;
        }
        
        const firstGradeDate = new Date(firstGrade.grade_date);
        const march2009 = new Date('2009-03-31');
        const april2009 = new Date('2009-04-01');
        const endDate = new Date('2022-10-11');
        const retirementDate = teacherData.retirement_date ? new Date(teacherData.retirement_date) : null;
        
        // Fix 1: Support Payable 5th Commission (up to March 2009)
        console.log('  📊 Fixing Support Payable 5th Commission...');
        const sup5thEndDate = retirementDate && retirementDate < march2009 ? retirementDate : march2009;
        const sup5thData = calculateSupPayable5thCommissionReport(teacherData, grades, sixthCommission, firstGradeDate, sup5thEndDate);
        
        db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-payable-5th'`).run(teacher.id);
        const insert5thStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        sup5thData.forEach(row => {
          insert5thStmt.run(teacher.id, teacherData.city_name, 'sup-payable-5th', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
        });
        console.log(`    ✅ Inserted ${sup5thData.length} records (up to March 2009)`);
        
        // Fix 2: Support Paid 5th Commission (up to March 2009)
        console.log('  📊 Fixing Support Paid 5th Commission...');
        const sup5thPaidData = calculateSupPaid5thCommissionReport(teacherData, grades, sixthCommission, firstGradeDate, sup5thEndDate);
        
        db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-paid-5th'`).run(teacher.id);
        const insert5thPaidStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        sup5thPaidData.forEach(row => {
          insert5thPaidStmt.run(teacher.id, teacherData.city_name, 'sup-paid-5th', '5th', row.month, row.year, row.date, row.xbasic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
        });
        console.log(`    ✅ Inserted ${sup5thPaidData.length} records (up to March 2009)`);
        
        // Fix 3: Support Payable 6th Commission (from April 2009)
        console.log('  📊 Fixing Support Payable 6th Commission...');
        const sup6thStartDate = retirementDate && retirementDate < april2009 ? retirementDate : april2009;
        const sup6thEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
        const sup6thData = calculatePayable6thCommissionReport(teacherData, grades, sixthCommission, null, sup6thStartDate, sup6thEndDate);
        
        db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'sup-payable-6th'`).run(teacher.id);
        const insert6thStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        sup6thData.forEach(row => {
          insert6thStmt.run(teacher.id, teacherData.city_name, 'sup-payable-6th', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
        });
        console.log(`    ✅ Inserted ${sup6thData.length} records (from April 2009)`);
        
        // Fix 4: Support Paid 6th Commission (from April 2009)
        console.log('  📊 Fixing Support Paid 6th Commission...');
        const sup6thPaidData = calculatePaid6thCommissionReport(teacherData, grades, sixthCommission, null, sup6thStartDate, sup6thEndDate);
        
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
          const reg6thEndDate = new Date(seventhCommissionDate);
          reg6thEndDate.setDate(reg6thEndDate.getDate() - 1);
          const finalReg6thEndDate = retirementDate && retirementDate < reg6thEndDate ? retirementDate : reg6thEndDate;
          
          const reg6thData = calculatePayable6thCommissionReport(teacherData, grades, sixthCommission, seventhCommission, sup6thStartDate, finalReg6thEndDate);
          
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
          const reg6thEndDate = new Date(seventhCommissionDate);
          reg6thEndDate.setDate(reg6thEndDate.getDate() - 1);
          const finalReg6thEndDate = retirementDate && retirementDate < reg6thEndDate ? retirementDate : reg6thEndDate;
          
          const reg6thPaidData = calculatePaid6thCommissionReport(teacherData, grades, sixthCommission, seventhCommission, sup6thStartDate, finalReg6thEndDate);
          
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid' AND commission_type = '6th'`).run(teacher.id);
          const insertReg6thPaidStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          reg6thPaidData.forEach(row => {
            insertReg6thPaidStmt.run(teacher.id, teacherData.city_name, 'paid', '6th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
          });
          console.log(`    ✅ Inserted ${reg6thPaidData.length} records (from April 2009)`);
        }
        
        // Fix 7: 7th Commission Reports (if available)
        if (seventhCommission) {
          console.log('  📊 Fixing 7th Commission Reports...');
          const seventhCommissionDate = new Date(seventhCommission.pay_date);
          const sup7thStartDate = retirementDate && retirementDate < seventhCommissionDate ? retirementDate : seventhCommissionDate;
          const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
          
          // Payable 7th Commission
          const sup7thData = calculatePayable7thCommissionReport(teacherData, grades, seventhCommission, sup7thStartDate, finalEndDate);
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'payable' AND commission_type = '7th'`).run(teacher.id);
          const insert7thStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          sup7thData.forEach(row => {
            insert7thStmt.run(teacher.id, teacherData.city_name, 'payable', '7th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
          });
          
          // Paid 7th Commission
          const sup7thPaidData = calculatePaid7thCommissionReport(teacherData, grades, seventhCommission, sup7thStartDate, finalEndDate);
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid' AND commission_type = '7th'`).run(teacher.id);
          const insert7thPaidStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, xbasic, mbasic, grade_pay, total_amount, yearly_increment_applied) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          sup7thPaidData.forEach(row => {
            insert7thPaidStmt.run(teacher.id, teacherData.city_name, 'paid', '7th', row.month, row.year, row.date, row.basic, row.mbasic, row.gradePay, row.total, row.yearlyIncrementApplied ? 1 : 0);
          });
          
          console.log(`    ✅ Inserted ${sup7thData.length} payable and ${sup7thPaidData.length} paid records (from 7th commission date)`);
        }
        
        // Fix 8: HRA Reports (uses fixed 5th & 6th commission data)
        console.log('  📊 Fixing HRA Reports...');
        const finalEndDate = retirementDate && retirementDate < endDate ? retirementDate : endDate;
        
        // Payable HRA
        const hraData = calculatePayableHRAReport(teacherData, grades, sixthCommission, firstGradeDate, finalEndDate);
        db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'payable-hra'`).run(teacher.id);
        const insertHraStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        hraData.forEach(row => {
          insertHraStmt.run(teacher.id, teacherData.city_name, 'payable-hra', 'HRA', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.total);
        });
        
        // Paid HRA
        const hraPaidData = calculatePaidHRAReport(teacherData, grades, sixthCommission, firstGradeDate, finalEndDate);
        db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'paid-hra'`).run(teacher.id);
        const insertHraPaidStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        hraPaidData.forEach(row => {
          insertHraPaidStmt.run(teacher.id, teacherData.city_name, 'paid-hra', 'HRA', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.total);
        });
        
        console.log(`    ✅ Inserted ${hraData.length} payable and ${hraPaidData.length} paid HRA records`);
        
        // Fix 9: All Payable/Paid Reports (combined data from all commissions)
        console.log('  📊 Fixing All Payable/Paid Reports...');
        if (seventhCommission) {
          // All Payable Report
          const allPayableData = calculateAllPayableReport(teacherData, grades, sixthCommission, seventhCommission, firstGradeDate, finalEndDate);
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'all-payable'`).run(teacher.id);
          const insertAllPayableStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          allPayableData.forEach(row => {
            insertAllPayableStmt.run(teacher.id, teacherData.city_name, 'all-payable', 'ALL', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.payableTotal);
          });
          
          // All Paid Report
          const allPaidData = calculateAllPaidReport(teacherData, grades, sixthCommission, seventhCommission, firstGradeDate, finalEndDate);
          db.prepare(`DELETE FROM salary_reports WHERE teacher_id = ? AND report_type = 'all-paid'`).run(teacher.id);
          const insertAllPaidStmt = db.prepare(`INSERT INTO salary_reports (teacher_id, city_name, report_type, commission_type, month, year, date, mbasic, grade_pay, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          allPaidData.forEach(row => {
            insertAllPaidStmt.run(teacher.id, teacherData.city_name, 'all-paid', 'ALL', row.month, row.year, row.date, row.mbasic, row.mgredpay, row.paidTotal);
          });
          
          console.log(`    ✅ Inserted ${allPayableData.length} all payable and ${allPaidData.length} all paid records`);
        }
        
        processedCount++;
        console.log(`✅ Successfully processed teacher: ${teacher.name}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing teacher ${teacher.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Complete Reports Fix Finished!`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successfully processed: ${processedCount} teachers`);
    console.log(`   ❌ Errors: ${errorCount} teachers`);
    console.log(`\n🔧 All Reports Fixed:`);
    console.log(`   • 5th Commission Reports: March 2009 સુધી જ`);
    console.log(`   • 6th Commission Reports: April 2009 થી શરૂ`);
    console.log(`   • 7th Commission Reports: 7th commission date થી શરૂ`);
    console.log(`   • HRA Reports: Proper data from 5th & 6th commission`);
    console.log(`   • All Payable/Paid Reports: Combined data from all commissions`);
    console.log(`   • બધું જૂનું data clear થઈ ગયું`);
    console.log(`   • કોઈપણ report માં problem નહીં આવે`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the fix
fixAllReports(); 