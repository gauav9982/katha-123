const { getDatabase, closeDatabase } = require('./config/database.cjs');

function calculatePayable6thCommissionReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentBasic = sixthCommission.payable_basic;
  let currentGradePay = sixthCommission.payable_grade_pay;
  let currentMBasic = currentBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    payableBasic: g.payable_basic,
    payableGradePay: g.payable_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  // Get 6th commission yearly increment date
  const yearlyIncrementDate = new Date(sixthCommission.yearly_increment_date);
  
  console.log('Starting calculation:');
  console.log('6th Commission Date:', startDate);
  console.log('7th Commission Date (minus 1 day):', endDate);
  console.log('Yearly Increment Date:', yearlyIncrementDate);
  console.log('Initial Basic:', currentBasic);
  console.log('Initial Grade Pay:', currentGradePay);
  console.log('Grade Dates:', gradeDates.map(g => `${g.date.toDateString()} - Basic: ${g.payableBasic}, Grade Pay: ${g.payableGradePay}`));
  console.log('---');
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    // Check if a grade change occurs in the current month.
    const gradeChangeInThisMonth = gradeDates.find(g => 
      g.date.getFullYear() === year && g.date.getMonth() === month - 1
    );

    // Apply yearly increment if it's the increment month, it's on or after the increment start date,
    // and no grade change occurs in this month.
    if (!gradeChangeInThisMonth && 
        currentDate.getMonth() === yearlyIncrementDate.getMonth() &&
        (currentDate.getFullYear() > yearlyIncrementDate.getFullYear() || 
         (currentDate.getFullYear() === yearlyIncrementDate.getFullYear() && currentDate.getMonth() >= yearlyIncrementDate.getMonth()))) {
      
      // Calculate 3% of (Basic + Grade Pay)
      const totalForIncrement = currentBasic + currentGradePay;
      const incrementAmount = totalForIncrement * 0.03;
      
      // Round up to nearest 10
      const roundedIncrement = Math.ceil(incrementAmount / 10) * 10;
      
      console.log(`Yearly Increment in ${yearlyIncrementDate.toLocaleDateString('en-US', { month: 'long' })} ${year}:`);
      console.log(`  Basic: ${currentBasic}, Grade Pay: ${currentGradePay}`);
      console.log(`  Total for increment: ${totalForIncrement}`);
      console.log(`  3% increment: ${incrementAmount}`);
      console.log(`  Rounded increment: ${roundedIncrement}`);
      console.log(`  New Basic: ${currentBasic + roundedIncrement}`);
      
      // Add to basic
      currentBasic += roundedIncrement;
      currentMBasic = currentBasic;
    }
    
    let dateStr = null;
    // Check if this is a grade change date
    const gradeChangeOnThisDay = gradeDates.find(g => 
      g.date.getFullYear() === year &&
      g.date.getMonth() === month - 1 &&
      g.date.getDate() === currentDate.getDate()
    );

    if (gradeChangeOnThisDay) {
      dateStr = `${gradeChangeOnThisDay.date.getDate().toString().padStart(2, '0')}/${(gradeChangeOnThisDay.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChangeOnThisDay.date.getFullYear()}`;
      
      console.log(`Grade Change on ${dateStr}:`);
      console.log(`  Old Basic: ${currentBasic} -> New Basic: ${gradeChangeOnThisDay.payableBasic}`);
      console.log(`  Old Grade Pay: ${currentGradePay} -> New Grade Pay: ${gradeChangeOnThisDay.payableGradePay}`);
      
      // Update basic and grade pay for new grade
      currentBasic = gradeChangeOnThisDay.payableBasic;
      currentGradePay = gradeChangeOnThisDay.payableGradePay;
      currentMBasic = currentBasic;
    }
    
    const total = currentMBasic + currentGradePay;
    
    reportData.push({
      month,
      year,
      date: dateStr,
      basic: currentBasic,
      mbasic: currentMBasic,
      gradePay: currentGradePay,
      total
    });
    
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Now handle higher grade dates by inserting additional rows
  const finalReportData = [];
  
  for (let i = 0; i < reportData.length; i++) {
    const row = reportData[i];
    const currentRowDate = new Date(row.year, row.month - 1, 1); // First day of the month
    
    // Check if there's a grade change in this month
    const gradeChangeInMonth = gradeDates.find(g => 
      g.date.getMonth() === currentRowDate.getMonth() && 
      g.date.getFullYear() === currentRowDate.getFullYear()
    );
    
    if (gradeChangeInMonth && gradeChangeInMonth.date.getDate() > 1) {
      // Split the month into two rows
      const daysInMonth = new Date(row.year, row.month, 0).getDate();
      const gradeChangeDay = gradeChangeInMonth.date.getDate();
      
      console.log(`Splitting month ${row.month}/${row.year} due to grade change on ${gradeChangeDay}:`);
      
      // First row: until the day before grade change
      const previousRow = reportData.find(r => r.year === row.year && r.month === row.month - 1);
      const firstRowBasic = previousRow ? previousRow.basic : sixthCommission.payable_basic;
      const firstRowGradePay = previousRow ? previousRow.gradePay : sixthCommission.payable_grade_pay;

      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${(gradeChangeDay - 1).toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: firstRowBasic,
        mbasic: firstRowBasic,
        gradePay: firstRowGradePay,
        total: firstRowBasic + firstRowGradePay
      });
      
      // Second row: from grade change date onwards
      const secondRowBasic = gradeChangeInMonth.payableBasic;
      const secondRowGradePay = gradeChangeInMonth.payableGradePay;
      const secondRowMBasic = secondRowBasic;
      const secondRowTotal = secondRowMBasic + secondRowGradePay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${gradeChangeDay.toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: secondRowBasic,
        mbasic: secondRowMBasic,
        gradePay: secondRowGradePay,
        total: secondRowTotal
      });
      
      console.log(`  Row 1 (until ${gradeChangeDay - 1}): Basic=${firstRowBasic}, GradePay=${firstRowGradePay}, Total=${firstRowBasic + firstRowGradePay}`);
      console.log(`  Row 2 (from ${gradeChangeDay}): Basic=${secondRowBasic}, GradePay=${secondRowGradePay}, Total=${secondRowTotal}`);
    } else {
      // No grade change in this month, keep the original row
      finalReportData.push(row);
    }
  }
  
  return finalReportData;
}

async function test6thCommissionCalculation() {
  try {
    const db = getDatabase();
    
    // Sample data for testing
    const teacher = {
      id: 1,
      name: 'Test Teacher',
      city_name: 'Nadiad'
    };
    
    const grades = [
      {
        grade_type: 'first',
        grade_date: '2006-07-01',
        payable_basic: 10860,
        payable_grade_pay: 4200
      },
      {
        grade_type: 'second',
        grade_date: '2012-07-20',
        payable_basic: 12000,
        payable_grade_pay: 4800
      }
    ];
    
    const sixthCommission = {
      pay_date: '2006-01-01',
      payable_basic: 10860,
      payable_grade_pay: 4200,
      yearly_increment_date: '2006-07-01'
    };
    
    const seventhCommission = {
      pay_date: '2016-01-01',
      payable_basic: 15000,
      payable_grade_pay: 6000
    };
    
    const startDate = new Date(sixthCommission.pay_date);
    const endDate = new Date(seventhCommission.pay_date);
    endDate.setDate(endDate.getDate() - 1); // One day before 7th commission
    
    console.log('=== 6th Commission Report Test ===');
    console.log('Teacher:', teacher.name);
    console.log('City:', teacher.city_name);
    console.log('Date Range:', startDate.toDateString(), 'to', endDate.toDateString());
    console.log('');
    
    const reportData = calculatePayable6thCommissionReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate);
    
    console.log('');
    console.log('=== Report Summary ===');
    console.log('Total months:', reportData.length);
    console.log('Final Basic:', reportData[reportData.length - 1]?.basic);
    console.log('Final MBasic:', reportData[reportData.length - 1]?.mbasic);
    console.log('Final Grade Pay:', reportData[reportData.length - 1]?.gradePay);
    console.log('Final Total:', reportData[reportData.length - 1]?.total);
    console.log('Total Amount:', reportData.reduce((sum, row) => sum + row.total, 0));
    
    console.log('');
    console.log('=== Sample Report Data ===');
    reportData.slice(0, 10).forEach((row, index) => {
      console.log(`${index + 1}. ${row.year}-${row.month.toString().padStart(2, '0')}: Basic=${row.basic}, MBasic=${row.mbasic}, GradePay=${row.gradePay}, Total=${row.total}${row.date ? ` (${row.date})` : ''}`);
    });
    
    if (reportData.length > 10) {
      console.log(`... and ${reportData.length - 10} more months`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    closeDatabase();
  }
}

// Run the test
test6thCommissionCalculation(); 