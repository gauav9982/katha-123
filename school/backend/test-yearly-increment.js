// Test script for yearly increment logic
const db = require('./config/database.cjs');

async function testYearlyIncrement() {
  try {
    console.log('=== Testing Yearly Increment Logic ===\n');
    
    // Sample data for testing
    const teacher = {
      id: 1,
      name: 'Test Teacher',
      city: 'Ahmedabad'
    };
    
    const sixthCommission = {
      payable_basic: 1000,
      payable_grade_pay: 200
    };
    
    const grades = [
      {
        grade_date: '2023-01-15',
        grade_type: 'first',
        payable_basic: 1000,
        payable_grade_pay: 200
      },
      {
        grade_date: '2024-06-01',
        grade_type: 'second',
        payable_basic: 1200,
        payable_grade_pay: 250
      }
    ];
    
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2025-12-31');
    
    console.log('Initial Values:');
    console.log(`XBasic: ${sixthCommission.payable_basic}`);
    console.log(`MBasic: ${sixthCommission.payable_basic} (same as XBasic)`);
    console.log(`Grade Pay: ${sixthCommission.payable_grade_pay}\n`);
    
    const reportData = calculatePayable5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate);
    
    console.log('Monthly Breakdown:');
    console.log('Month | Year | Date | XBasic | MBasic | Grade Pay | Total');
    console.log('------|------|------|--------|--------|-----------|------');
    
    let totalMonths = 0;
    let finalXBasic = 0;
    let finalMBasic = 0;
    let totalAmount = 0;
    
    reportData.forEach(row => {
      console.log(`${row.month.toString().padStart(4)} | ${row.year} | ${row.date || 'N/A'.padStart(4)} | ${row.xbasic.toString().padStart(6)} | ${row.mbasic.toString().padStart(6)} | ${row.gradePay.toString().padStart(9)} | ${row.total.toString().padStart(4)}`);
      
      totalMonths++;
      finalXBasic = row.xbasic;
      finalMBasic = row.mbasic;
      totalAmount += row.total;
    });
    
    console.log('\n=== Summary ===');
    console.log(`Total Months: ${totalMonths}`);
    console.log(`Final XBasic: ${finalXBasic}`);
    console.log(`Final MBasic: ${finalMBasic} (same as XBasic)`);
    console.log(`Total Amount: ${totalAmount}`);
    
    // Show yearly increment points
    console.log('\n=== Yearly Increment Points ===');
    let currentXBasic = sixthCommission.payable_basic;
    const firstGradeDate = new Date(grades[0].grade_date);
    
    for (let year = firstGradeDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      if (year > firstGradeDate.getFullYear()) {
        currentXBasic += 150;
        console.log(`${year}-${(firstGradeDate.getMonth() + 1).toString().padStart(2, '0')}: XBasic increased to ${currentXBasic}, MBasic = ${currentXBasic}`);
      }
    }
    
  } catch (error) {
    console.error('Error testing yearly increment:', error);
  } finally {
    db.close();
  }
}

// Helper function (same as in index.cjs)
function calculatePayable5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  let currentXBasic = sixthCommission.payable_basic;
  let currentGradePay = sixthCommission.payable_grade_pay;
  let currentMBasic = currentXBasic; // MBasic starts same as XBasic
  
  // Get all grade dates for reference
  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    payableBasic: g.payable_basic,
    payableGradePay: g.payable_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  // Get 1st higher grade date for yearly increment calculation
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const firstGradeDate = new Date(firstGrade.grade_date);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    // Check if this is a grade change date
    const gradeChange = gradeDates.find(g => 
      g.date.getMonth() === currentDate.getMonth() && 
      g.date.getFullYear() === currentDate.getFullYear() &&
      g.date.getDate() === currentDate.getDate()
    );
    
    let dateStr = null;
    if (gradeChange) {
      dateStr = `${gradeChange.date.getDate().toString().padStart(2, '0')}/${(gradeChange.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChange.date.getFullYear()}`;
      
      // Update basic and grade pay for new grade
      currentXBasic = gradeChange.payableBasic;
      currentGradePay = gradeChange.payableGradePay;
      currentMBasic = currentXBasic; // MBasic follows XBasic
    } else {
      // Apply yearly increment to XBasic if it's the anniversary month
      // Check if current month is the same as 1st grade month AND it's a different year
      if (currentDate.getMonth() === firstGradeDate.getMonth() && 
          currentDate.getFullYear() > firstGradeDate.getFullYear()) {
        currentXBasic += 150;
        currentMBasic = currentXBasic; // MBasic always equals XBasic
        console.log(`Yearly increment applied to XBasic: ${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}, New XBasic: ${currentXBasic}, New MBasic: ${currentMBasic}`);
      }
    }
    
    const total = currentMBasic + currentGradePay;
    
    reportData.push({
      month,
      year,
      date: dateStr,
      xbasic: currentXBasic,
      mbasic: currentMBasic,
      gradePay: currentGradePay,
      total
    });
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

testYearlyIncrement(); 