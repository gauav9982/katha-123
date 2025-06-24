function calculatePayable5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentXBasic = sixthCommission.payable_basic;
  let currentGradePay = sixthCommission.payable_grade_pay;
  let currentMBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    payableBasic: g.payable_basic,
    payableGradePay: g.payable_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const firstGradeDate = new Date(firstGrade.grade_date);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChange = gradeDates.find(g => 
      g.date.getMonth() === currentDate.getMonth() && 
      g.date.getFullYear() === currentDate.getFullYear() &&
      g.date.getDate() === currentDate.getDate()
    );
    
    let yearlyIncrementApplied = false;
    let dateStr = null;
    if (gradeChange) {
      dateStr = `${gradeChange.date.getDate().toString().padStart(2, '0')}/${(gradeChange.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChange.date.getFullYear()}`;
      currentXBasic = gradeChange.payableBasic;
      currentGradePay = gradeChange.payableGradePay;
    } else {
      if (currentDate.getMonth() === firstGradeDate.getMonth() && currentDate.getFullYear() > firstGradeDate.getFullYear()) {
        currentXBasic += 150;
        yearlyIncrementApplied = true;
      }
    }

    if (year > 2004 || (year === 2004 && month >= 4)) {
      currentMBasic = currentXBasic + (currentXBasic / 2);
    } else {
      currentMBasic = currentXBasic;
    }

    const total = currentMBasic + currentGradePay;
    
    reportData.push({
      month,
      year,
      date: dateStr,
      xbasic: currentXBasic,
      mbasic: currentMBasic,
      gradePay: currentGradePay,
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

function calculatePaid5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentXBasic = sixthCommission.paid_basic;
  let currentGradePay = sixthCommission.paid_grade_pay;
  let currentMBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    paidBasic: g.paid_basic,
    paidGradePay: g.paid_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  const firstGradeDate = new Date(grades.find(g => g.grade_type === 'first').grade_date);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChange = gradeDates.find(g => 
      g.date.getMonth() === currentDate.getMonth() && 
      g.date.getFullYear() === currentDate.getFullYear() &&
      g.date.getDate() === currentDate.getDate()
    );
    
    let yearlyIncrementApplied = false;
    let dateStr = null;
    if (gradeChange) {
      dateStr = `${gradeChange.date.getDate().toString().padStart(2, '0')}/${(gradeChange.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChange.date.getFullYear()}`;
      currentXBasic = gradeChange.paidBasic;
      currentGradePay = gradeChange.paidGradePay;
    } else {
      if (currentDate.getMonth() === firstGradeDate.getMonth() && currentDate.getFullYear() > firstGradeDate.getFullYear()) {
        currentXBasic += 125;
        yearlyIncrementApplied = true;
      }
    }
    
    if (year > 2004 || (year === 2004 && month >= 4)) {
      currentMBasic = currentXBasic + (currentXBasic / 2);
    } else {
      currentMBasic = currentXBasic;
    }
    
    const total = currentMBasic + currentGradePay;
    
    reportData.push({
      month,
      year,
      date: dateStr,
      xbasic: currentXBasic,
      mbasic: currentMBasic,
      gradePay: currentGradePay,
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

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
  
  const yearlyIncrementDate = new Date(sixthCommission.yearly_increment_date);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChangeInThisMonth = gradeDates.find(g => 
      g.date.getFullYear() === year && g.date.getMonth() === month - 1
    );

    let yearlyIncrementApplied = false;
    if (!gradeChangeInThisMonth && 
        currentDate.getMonth() === yearlyIncrementDate.getMonth() &&
        (currentDate.getFullYear() > yearlyIncrementDate.getFullYear() || 
         (currentDate.getFullYear() === yearlyIncrementDate.getFullYear() && currentDate.getMonth() >= yearlyIncrementDate.getMonth()))) {
      
      const totalForIncrement = currentBasic + currentGradePay;
      const incrementAmount = totalForIncrement * 0.03;
      const roundedIncrement = Math.ceil(incrementAmount / 10) * 10;
      
      currentBasic += roundedIncrement;
      currentMBasic = currentBasic;
      yearlyIncrementApplied = true;
    }
    
    let dateStr = null;
    const gradeChangeOnThisDay = gradeDates.find(g => 
      g.date.getFullYear() === year &&
      g.date.getMonth() === month - 1 &&
      g.date.getDate() === currentDate.getDate()
    );
    
    if (gradeChangeOnThisDay) {
      dateStr = `${gradeChangeOnThisDay.date.getDate().toString().padStart(2, '0')}/${(gradeChangeOnThisDay.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChangeOnThisDay.date.getFullYear()}`;
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
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  const finalReportData = [];
  
  for (let i = 0; i < reportData.length; i++) {
    const row = reportData[i];
    const gradeChangeInMonth = gradeDates.find(g => 
      g.date.getFullYear() === row.year && g.date.getMonth() === row.month - 1
    );
    
    if (gradeChangeInMonth && gradeChangeInMonth.date.getDate() > 1) {
      const gradeChangeDay = gradeChangeInMonth.date.getDate();
      
      const previousRowIndex = reportData.findIndex(r => r.year === row.year && r.month === row.month);
      const previousRow = reportData[previousRowIndex - 1];

      const firstRowBasic = previousRow ? previousRow.basic : sixthCommission.payable_basic;
      const firstRowGradePay = previousRow ? previousRow.gradePay : sixthCommission.payable_grade_pay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${(gradeChangeDay - 1).toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: firstRowBasic,
        mbasic: firstRowBasic,
        gradePay: firstRowGradePay,
        total: firstRowBasic + firstRowGradePay,
        yearlyIncrementApplied: row.yearlyIncrementApplied
      });
      
      const secondRowBasic = gradeChangeInMonth.payableBasic;
      const secondRowGradePay = gradeChangeInMonth.payableGradePay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${gradeChangeDay.toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: secondRowBasic,
        mbasic: secondRowBasic,
        gradePay: secondRowGradePay,
        total: secondRowBasic + secondRowGradePay,
        yearlyIncrementApplied: false
      });
    } else {
      finalReportData.push(row);
    }
  }
  
  return finalReportData;
}

function calculatePaid6thCommissionReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentBasic = sixthCommission.paid_basic;
  let currentGradePay = sixthCommission.paid_grade_pay;
  let currentMBasic = currentBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    paidBasic: g.paid_basic,
    paidGradePay: g.paid_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  const yearlyIncrementDate = new Date(sixthCommission.yearly_increment_date);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChangeInThisMonth = gradeDates.find(g => 
      g.date.getFullYear() === year && g.date.getMonth() === month - 1
    );

    let yearlyIncrementApplied = false;
    if (!gradeChangeInThisMonth && 
        currentDate.getMonth() === yearlyIncrementDate.getMonth() &&
        (currentDate.getFullYear() > yearlyIncrementDate.getFullYear() || 
         (currentDate.getFullYear() === yearlyIncrementDate.getFullYear() && currentDate.getMonth() >= yearlyIncrementDate.getMonth()))) {
      
      const totalForIncrement = currentBasic + currentGradePay;
      const incrementAmount = totalForIncrement * 0.03;
      const roundedIncrement = Math.ceil(incrementAmount / 10) * 10;
      
      currentBasic += roundedIncrement;
      currentMBasic = currentBasic;
      yearlyIncrementApplied = true;
    }
    
    let dateStr = null;
    const gradeChangeOnThisDay = gradeDates.find(g => 
      g.date.getFullYear() === year &&
      g.date.getMonth() === month - 1 &&
      g.date.getDate() === currentDate.getDate()
    );
    
    if (gradeChangeOnThisDay) {
      dateStr = `${gradeChangeOnThisDay.date.getDate().toString().padStart(2, '0')}/${(gradeChangeOnThisDay.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChangeOnThisDay.date.getFullYear()}`;
      currentBasic = gradeChangeOnThisDay.paidBasic;
      currentGradePay = gradeChangeOnThisDay.paidGradePay;
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
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  const finalReportData = [];
  
  for (let i = 0; i < reportData.length; i++) {
    const row = reportData[i];
    const gradeChangeInMonth = gradeDates.find(g => 
      g.date.getFullYear() === row.year && g.date.getMonth() === row.month - 1
    );
    
    if (gradeChangeInMonth && gradeChangeInMonth.date.getDate() > 1) {
      const gradeChangeDay = gradeChangeInMonth.date.getDate();
      
      const previousRowIndex = reportData.findIndex(r => r.year === row.year && r.month === row.month);
      const previousRow = reportData[previousRowIndex - 1];

      const firstRowBasic = previousRow ? previousRow.basic : sixthCommission.paid_basic;
      const firstRowGradePay = previousRow ? previousRow.gradePay : sixthCommission.paid_grade_pay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${(gradeChangeDay - 1).toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: firstRowBasic,
        mbasic: firstRowBasic,
        gradePay: firstRowGradePay,
        total: firstRowBasic + firstRowGradePay,
        yearlyIncrementApplied: row.yearlyIncrementApplied
      });
      
      const secondRowBasic = gradeChangeInMonth.paidBasic;
      const secondRowGradePay = gradeChangeInMonth.paidGradePay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${gradeChangeDay.toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: secondRowBasic,
        mbasic: secondRowBasic,
        gradePay: secondRowGradePay,
        total: secondRowBasic + secondRowGradePay,
        yearlyIncrementApplied: false
      });
    } else {
      finalReportData.push(row);
    }
  }
  
  return finalReportData;
}

function calculatePayable7thCommissionReport(teacher, grades, seventhCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentBasic = seventhCommission.payable_basic;
  let currentGradePay = seventhCommission.payable_grade_pay;
  let currentMBasic = currentBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    payableBasic: g.payable_basic,
    payableGradePay: g.payable_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  const yearlyIncrementDate = new Date(seventhCommission.yearly_increment_date);
  
  // Helper function to round to nearest 50
  const roundToNearest50 = (value) => {
    // Custom rounding: 1501→1500, 1549→1500, 1550→1500, 1551→1600, 1599→1600
    // Threshold is 1550.5: <= 1550 rounds down to 1500, > 1550 rounds up to 1600
    const base = Math.floor(value / 100) * 100;
    const remainder = value % 100;
    
    if (remainder <= 50) {
      return base;
    } else {
      return base + 100;
    }
  };
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChangeInThisMonth = gradeDates.find(g => 
      g.date.getFullYear() === year && g.date.getMonth() === month - 1
    );

    let yearlyIncrementApplied = false;
    if (!gradeChangeInThisMonth && 
        currentDate.getMonth() === yearlyIncrementDate.getMonth() &&
        (currentDate.getFullYear() > yearlyIncrementDate.getFullYear() || 
         (currentDate.getFullYear() === yearlyIncrementDate.getFullYear() && currentDate.getMonth() >= yearlyIncrementDate.getMonth()))) {
      
      const totalForIncrement = currentBasic + currentGradePay;
      const incrementAmount = totalForIncrement * 0.03; // 3%
      const roundedIncrement = roundToNearest50(incrementAmount);
      
      currentBasic += roundedIncrement;
      currentMBasic = currentBasic;
      yearlyIncrementApplied = true;
    }
    
    let dateStr = null;
    const gradeChangeOnThisDay = gradeDates.find(g => 
      g.date.getFullYear() === year &&
      g.date.getMonth() === month - 1 &&
      g.date.getDate() === currentDate.getDate()
    );
    
    if (gradeChangeOnThisDay) {
      dateStr = `${gradeChangeOnThisDay.date.getDate().toString().padStart(2, '0')}/${(gradeChangeOnThisDay.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChangeOnThisDay.date.getFullYear()}`;
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
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  const finalReportData = [];
  
  for (let i = 0; i < reportData.length; i++) {
    const row = reportData[i];
    const gradeChangeInMonth = gradeDates.find(g => 
      g.date.getFullYear() === row.year && g.date.getMonth() === row.month - 1
    );
    
    if (gradeChangeInMonth && gradeChangeInMonth.date.getDate() > 1) {
      const gradeChangeDay = gradeChangeInMonth.date.getDate();
      
      const previousRowIndex = reportData.findIndex(r => r.year === row.year && r.month === row.month);
      const previousRow = reportData[previousRowIndex - 1];

      const firstRowBasic = previousRow ? previousRow.basic : seventhCommission.payable_basic;
      const firstRowGradePay = previousRow ? previousRow.gradePay : seventhCommission.payable_grade_pay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${(gradeChangeDay - 1).toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: firstRowBasic,
        mbasic: firstRowBasic,
        gradePay: firstRowGradePay,
        total: firstRowBasic + firstRowGradePay,
        yearlyIncrementApplied: row.yearlyIncrementApplied
      });
      
      const secondRowBasic = gradeChangeInMonth.payableBasic;
      const secondRowGradePay = gradeChangeInMonth.payableGradePay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${gradeChangeDay.toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: secondRowBasic,
        mbasic: secondRowBasic,
        gradePay: secondRowGradePay,
        total: secondRowBasic + secondRowGradePay,
        yearlyIncrementApplied: false
      });
    } else {
      finalReportData.push(row);
    }
  }
  
  return finalReportData;
}

function calculatePaid7thCommissionReport(teacher, grades, seventhCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentBasic = seventhCommission.paid_basic;
  let currentGradePay = seventhCommission.paid_grade_pay;
  let currentMBasic = currentBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    paidBasic: g.paid_basic,
    paidGradePay: g.paid_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  const yearlyIncrementDate = new Date(seventhCommission.yearly_increment_date);
  
  // Helper function to round to nearest 50
  const roundToNearest50 = (value) => {
    // Custom rounding: 1501→1500, 1549→1500, 1550→1500, 1551→1600, 1599→1600
    // Threshold is 1550.5: <= 1550 rounds down to 1500, > 1550 rounds up to 1600
    const base = Math.floor(value / 100) * 100;
    const remainder = value % 100;
    
    if (remainder <= 50) {
      return base;
    } else {
      return base + 100;
    }
  };
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChangeInThisMonth = gradeDates.find(g => 
      g.date.getFullYear() === year && g.date.getMonth() === month - 1
    );

    let yearlyIncrementApplied = false;
    if (!gradeChangeInThisMonth && 
        currentDate.getMonth() === yearlyIncrementDate.getMonth() &&
        (currentDate.getFullYear() > yearlyIncrementDate.getFullYear() || 
         (currentDate.getFullYear() === yearlyIncrementDate.getFullYear() && currentDate.getMonth() >= yearlyIncrementDate.getMonth()))) {
      
      const totalForIncrement = currentBasic + currentGradePay;
      const incrementAmount = totalForIncrement * 0.03; // 3%
      const roundedIncrement = roundToNearest50(incrementAmount);
      
      currentBasic += roundedIncrement;
      currentMBasic = currentBasic;
      yearlyIncrementApplied = true;
    }
    
    let dateStr = null;
    const gradeChangeOnThisDay = gradeDates.find(g => 
      g.date.getFullYear() === year &&
      g.date.getMonth() === month - 1 &&
      g.date.getDate() === currentDate.getDate()
    );
    
    if (gradeChangeOnThisDay) {
      dateStr = `${gradeChangeOnThisDay.date.getDate().toString().padStart(2, '0')}/${(gradeChangeOnThisDay.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChangeOnThisDay.date.getFullYear()}`;
      currentBasic = gradeChangeOnThisDay.paidBasic;
      currentGradePay = gradeChangeOnThisDay.paidGradePay;
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
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  const finalReportData = [];
  
  for (let i = 0; i < reportData.length; i++) {
    const row = reportData[i];
    const gradeChangeInMonth = gradeDates.find(g => 
      g.date.getFullYear() === row.year && g.date.getMonth() === row.month - 1
    );
    
    if (gradeChangeInMonth && gradeChangeInMonth.date.getDate() > 1) {
      const gradeChangeDay = gradeChangeInMonth.date.getDate();
      
      const previousRowIndex = reportData.findIndex(r => r.year === row.year && r.month === row.month);
      const previousRow = reportData[previousRowIndex - 1];

      const firstRowBasic = previousRow ? previousRow.basic : seventhCommission.paid_basic;
      const firstRowGradePay = previousRow ? previousRow.gradePay : seventhCommission.paid_grade_pay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${(gradeChangeDay - 1).toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: firstRowBasic,
        mbasic: firstRowBasic,
        gradePay: firstRowGradePay,
        total: firstRowBasic + firstRowGradePay,
        yearlyIncrementApplied: row.yearlyIncrementApplied
      });
      
      const secondRowBasic = gradeChangeInMonth.paidBasic;
      const secondRowGradePay = gradeChangeInMonth.paidGradePay;
      
      finalReportData.push({
        month: row.month,
        year: row.year,
        date: `${gradeChangeDay.toString().padStart(2, '0')}/${row.month.toString().padStart(2, '0')}/${row.year}`,
        basic: secondRowBasic,
        mbasic: secondRowBasic,
        gradePay: secondRowGradePay,
        total: secondRowBasic + secondRowGradePay,
        yearlyIncrementApplied: false
      });
    } else {
      finalReportData.push(row);
    }
  }
  
  return finalReportData;
}

function calculateSupPayable5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentXBasic = sixthCommission.payable_basic;
  let currentGradePay = sixthCommission.payable_grade_pay;
  let currentMBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    payableBasic: g.payable_basic,
    payableGradePay: g.payable_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const firstGradeDate = new Date(firstGrade.grade_date);
  const sixthCommissionDate = new Date(sixthCommission.pay_date);
  
  // Filter out grades that are between 6th commission date and 31-03-2009
  const filteredGradeDates = gradeDates.filter(g => {
    const gradeDate = g.date;
    const cutoffDate = new Date('2009-03-31');
    return !(gradeDate > sixthCommissionDate && gradeDate <= cutoffDate);
  });
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChange = filteredGradeDates.find(g => 
      g.date.getMonth() === currentDate.getMonth() && 
      g.date.getFullYear() === currentDate.getFullYear() &&
      g.date.getDate() === currentDate.getDate()
    );
    
    let yearlyIncrementApplied = false;
    let dateStr = null;
    if (gradeChange) {
      dateStr = `${gradeChange.date.getDate().toString().padStart(2, '0')}/${(gradeChange.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChange.date.getFullYear()}`;
      currentXBasic = gradeChange.payableBasic;
      currentGradePay = gradeChange.payableGradePay;
    } else {
      if (currentDate.getMonth() === firstGradeDate.getMonth() && currentDate.getFullYear() > firstGradeDate.getFullYear()) {
        currentXBasic += 150;
        yearlyIncrementApplied = true;
      }
    }

    if (year > 2004 || (year === 2004 && month >= 4)) {
      currentMBasic = currentXBasic + (currentXBasic / 2);
    } else {
      currentMBasic = currentXBasic;
    }
    
    const total = currentMBasic + currentGradePay;
    
    reportData.push({
      month,
      year,
      date: dateStr,
      xbasic: currentXBasic,
      mbasic: currentMBasic,
      gradePay: currentGradePay,
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

function calculateSupPaid5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  let currentXBasic = sixthCommission.paid_basic;
  let currentGradePay = sixthCommission.paid_grade_pay;
  let currentMBasic;

  const gradeDates = grades.map(g => ({
    date: new Date(g.grade_date),
    type: g.grade_type,
    paidBasic: g.paid_basic,
    paidGradePay: g.paid_grade_pay
  })).sort((a, b) => a.date - b.date);
  
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const firstGradeDate = new Date(firstGrade.grade_date);
  const sixthCommissionDate = new Date(sixthCommission.pay_date);
  
  // Filter out grades that are between 6th commission date and 31-03-2009
  const filteredGradeDates = gradeDates.filter(g => {
    const gradeDate = g.date;
    const cutoffDate = new Date('2009-03-31');
    return !(gradeDate > sixthCommissionDate && gradeDate <= cutoffDate);
  });
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const gradeChange = filteredGradeDates.find(g => 
      g.date.getMonth() === currentDate.getMonth() && 
      g.date.getFullYear() === currentDate.getFullYear() &&
      g.date.getDate() === currentDate.getDate()
    );
    
    let yearlyIncrementApplied = false;
    let dateStr = null;
    if (gradeChange) {
      dateStr = `${gradeChange.date.getDate().toString().padStart(2, '0')}/${(gradeChange.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChange.date.getFullYear()}`;
      currentXBasic = gradeChange.paidBasic;
      currentGradePay = gradeChange.paidGradePay;
    } else {
      if (currentDate.getMonth() === firstGradeDate.getMonth() && currentDate.getFullYear() > firstGradeDate.getFullYear()) {
        currentXBasic += 125;
        yearlyIncrementApplied = true;
      }
    }

    if (year > 2004 || (year === 2004 && month >= 4)) {
      currentMBasic = currentXBasic + (currentXBasic / 2);
    } else {
      currentMBasic = currentXBasic;
    }
    
    const total = currentMBasic + currentGradePay;
    
    reportData.push({
      month,
      year,
      date: dateStr,
      xbasic: currentXBasic,
      mbasic: currentMBasic,
      gradePay: currentGradePay,
      total,
      yearlyIncrementApplied
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

function calculatePayableHRAReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  // Get teacher's higher grade date
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const higherGradeDate = new Date(firstGrade.grade_date);
  
  // FIXED: Use proper date ranges for 5th and 6th commission data
  const march2009 = new Date('2009-03-31');
  const april2009 = new Date('2009-04-01');
  const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
  
  // 5th Commission data: from start date to March 2009
  const sup5thEndDate = retirementDate && retirementDate < march2009 ? retirementDate : march2009;
  const sup5thData = calculateSupPayable5thCommissionReport(teacher, grades, sixthCommission, startDate, sup5thEndDate);
  
  // 6th Commission data: from April 2009 to end date
  const sup6thStartDate = retirementDate && retirementDate < april2009 ? retirementDate : april2009;
  const sup6thData = calculatePayable6thCommissionReport(teacher, grades, sixthCommission, null, sup6thStartDate, endDate);
  
  // Create a map for easy lookup
  const sup5thMap = new Map();
  const sup6thMap = new Map();
  
  sup5thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup5thMap.set(key, item);
  });
  
  sup6thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup6thMap.set(key, item);
  });
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const key = `${year}-${month}`;
    
    let mbasic, mgredpay, basic, gredpay, total;
    let used5th = false;
    if (sup5thMap.has(key)) {
    const sup5thItem = sup5thMap.get(key);
      mbasic = sup5thItem.mbasic;
      mgredpay = sup5thItem.gradePay;
      total = sup5thItem.total;
      used5th = true;
    } else if (sup6thMap.has(key)) {
      const sup6thItem = sup6thMap.get(key);
      mbasic = sup6thItem.mbasic;
      mgredpay = sup6thItem.gradePay;
      total = sup6thItem.total;
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
      continue;
    }
    
    // Get LWP and HLWP data for this month
    const lwpDays = getLWPForMonth(teacher.id, year, month);
    const hlwpDays = getHLWPForMonth(teacher.id, year, month);
    
    // Calculate working days
    const daysInMonth = new Date(year, month, 0).getDate();
    const teacherDateInMonth = higherGradeDate.getDate();
    
    // Check if there's a date in the date column (grade change)
    const sup5thItem = sup5thMap.get(key);
    const sup6thItem = sup6thMap.get(key);
    const hasDateInColumn = sup5thItem?.date || sup6thItem?.date;
    
    // Check if this is the last row (October 2022)
    const isLastRow = (year === 2022 && month === 10);
    
    let workingDays;
    if (hasDateInColumn) {
      workingDays = daysInMonth - (teacherDateInMonth - 1) - lwpDays - (hlwpDays / 2);
    } else if (isLastRow) {
      workingDays = daysInMonth - (11 - 1) - lwpDays - (hlwpDays / 2);
    } else {
      workingDays = daysInMonth - lwpDays - (hlwpDays / 2);
    }
    
    // Calculate basic and gredpay as per working days
    basic = Math.round((mbasic / daysInMonth) * workingDays);
    gredpay = Math.round((mgredpay / daysInMonth) * workingDays);

    const calculatedTotal = basic + gredpay;
    
    // Get DA and HRA percentages
    const daPercentage = getDAForMonth(teacher.id, year, month);
    const hraPercentage = getHRAForMonth(teacher.id, year, month);
    
    // Calculate DA and HRA amounts
    const daAmount = Math.round((calculatedTotal * daPercentage) / 100);
    const hraAmount = Math.round((calculatedTotal * hraPercentage) / 100);
    
    // Calculate final payable total
    const payableTotal = calculatedTotal + daAmount + hraAmount;
    
    // Format date for display
    let dateStr = hasDateInColumn ? (sup5thItem?.date || sup6thItem?.date) : null;
    
    // Check if this is the last row (October 2022) and set the end date
    if (isLastRow) {
      dateStr = "11/10/2022";
    }
    
    reportData.push({
      month,
      year,
      date: dateStr,
      mbasic,
      mgredpay,
      total,
      lwpDays,
      hlwpDays,
      basic,
      gredpay,
      calculatedTotal,
      daPercentage,
      daAmount,
      hraPercentage,
      hraAmount,
      payableTotal,
      workingDays
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

// Helper functions for LWP, HLWP, and HRA data
function getLWPForMonth(teacherId, year, month) {
  // This would query the database for LWP days
  // For now, return 0 as placeholder
  return 0;
}

function getHLWPForMonth(teacherId, year, month) {
  // This would query the database for HLWP days
  // For now, return 0 as placeholder
  return 0;
}

function getHRAForMonth(teacherId, year, month) {
  try {
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    // Find the most recent HRA percentage entry that is effective for this month/year
    const hraEntry = db.prepare(`
      SELECT hra_percentage 
      FROM hra_percentages 
      WHERE (year < ?) OR (year = ? AND month <= ?)
      ORDER BY year DESC, month DESC 
      LIMIT 1
    `).get(year, year, month);
    
    return hraEntry ? hraEntry.hra_percentage : 0;
  } catch (error) {
    console.error('Error fetching HRA percentage:', error);
    return 0;
  }
}

function calculateAllPayableReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  // Get teacher's higher grade date
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const higherGradeDate = new Date(firstGrade.grade_date);
  
  // FIXED: Use proper date ranges for all commission reports
  const march2009 = new Date('2009-03-31');
  const april2009 = new Date('2009-04-01');
  const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
  
  // 5th Commission data: from start date to March 2009
  const sup5thEndDate = retirementDate && retirementDate < march2009 ? retirementDate : march2009;
  const sup5thData = calculateSupPayable5thCommissionReport(teacher, grades, sixthCommission, startDate, sup5thEndDate);
  
  // 6th Commission data: from April 2009 to 7th commission date
  const sup6thStartDate = retirementDate && retirementDate < april2009 ? retirementDate : april2009;
  const sup6thData = calculatePayable6thCommissionReport(teacher, grades, sixthCommission, seventhCommission, sup6thStartDate, endDate);
  
  // 7th Commission data: from 7th commission date to end date
  const seventhCommissionDate = new Date(seventhCommission.commission_date);
  const sup7thStartDate = retirementDate && retirementDate < seventhCommissionDate ? retirementDate : seventhCommissionDate;
  const sup7thData = calculatePayable7thCommissionReport(teacher, grades, seventhCommission, sup7thStartDate, endDate);
  
  // HRA data: uses the same logic as HRA report
  const hraData = calculatePayableHRAReport(teacher, grades, sixthCommission, startDate, endDate);
  
  // Create maps for easy lookup
  const sup5thMap = new Map();
  const sup6thMap = new Map();
  const sup7thMap = new Map();
  const hraMap = new Map();
  
  sup5thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup5thMap.set(key, item);
  });
  
  sup6thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup6thMap.set(key, item);
  });
  
  sup7thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup7thMap.set(key, item);
  });
  
  hraData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    hraMap.set(key, item);
  });
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const key = `${year}-${month}`;
    
    // Get data from commission reports (priority: 5th -> 6th -> 7th)
    let mbasic, mgredpay, total;
    const sup5thItem = sup5thMap.get(key);
    const sup6thItem = sup6thMap.get(key);
    const sup7thItem = sup7thMap.get(key);
    const hraItem = hraMap.get(key);
    
    if (sup5thItem) {
      mbasic = sup5thItem.mbasic;
      mgredpay = sup5thItem.gradePay;
      total = sup5thItem.total;
    } else if (sup6thItem) {
      mbasic = sup6thItem.mbasic;
      mgredpay = sup6thItem.gradePay;
      total = sup6thItem.total;
    } else if (sup7thItem) {
      mbasic = sup7thItem.mbasic;
      mgredpay = sup7thItem.gradePay;
      total = sup7thItem.total;
    } else {
      // Skip if no data available
      currentDate.setMonth(currentDate.getMonth() + 1);
      continue;
    }
    
    // Get LWP and HLWP data for this month
    const lwpDays = getLWPForMonth(teacher.id, year, month);
    const hlwpDays = getHLWPForMonth(teacher.id, year, month);
    
    // Calculate working days
    const daysInMonth = new Date(year, month, 0).getDate();
    const teacherDateInMonth = higherGradeDate.getDate();
    
    // Check if there's a date in the date column (grade change)
    const hasDateInColumn = sup5thItem?.date || sup6thItem?.date || sup7thItem?.date;
    
    // Check if this is the last row (October 2022)
    const isLastRow = (year === 2022 && month === 10);
    
    let workingDays;
    if (hasDateInColumn) {
      // When there's a date: Working Days = Total days - (Teacher's date - 1) - LWP - (HLWP/2)
      workingDays = daysInMonth - (teacherDateInMonth - 1) - lwpDays - (hlwpDays / 2);
    } else if (isLastRow) {
      // For the last row (October 2022): Working Days = Total days - (11 - 1) - LWP - (HLWP/2)
      workingDays = daysInMonth - (11 - 1) - lwpDays - (hlwpDays / 2);
    } else {
      // When no date: Working Days = Total days - LWP - (HLWP/2)
      workingDays = daysInMonth - lwpDays - (hlwpDays / 2);
    }
    
    // Calculate Basic and Grade Pay based on working days
    const basic = Math.round((total / daysInMonth) * workingDays);
    const gredpay = Math.round((mgredpay / daysInMonth) * workingDays);
    const calculatedTotal = basic + gredpay;
    
    // Get DA and HRA percentages
    const daPercentage = getDAForMonth(teacher.id, year, month);
    const hraPercentage = getHRAForMonth(teacher.id, year, month);
    
    // Calculate DA and HRA amounts
    const daAmount = Math.round((calculatedTotal * daPercentage) / 100);
    const hraAmount = hraItem ? hraItem.hraAmount : Math.round((calculatedTotal * hraPercentage) / 100);
    
    // Calculate final payable total
    const payableTotal = calculatedTotal + daAmount + hraAmount;
    
    // Format date for display
    let dateStr = hasDateInColumn ? (sup5thItem?.date || sup6thItem?.date || sup7thItem?.date) : null;
    
    // Check if this is the last row (October 2022) and set the end date
    if (isLastRow) {
      dateStr = "11/10/2022";
    }
    
    reportData.push({
      month,
      year,
      date: dateStr,
      mbasic,
      mgredpay,
      total,
      lwpDays,
      hlwpDays,
      basic,
      gredpay,
      calculatedTotal,
      daPercentage,
      daAmount,
      hraPercentage,
      hraAmount,
      payableTotal,
      workingDays
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

// Helper function for DA data
function getDAForMonth(teacherId, year, month) {
  try {
    const { getDatabase } = require('./config/database.cjs');
    const db = getDatabase();
    
    // Find the most recent DA percentage entry that is effective for this month/year
    const daEntry = db.prepare(`
      SELECT da_percentage 
      FROM da_percentages 
      WHERE (year < ?) OR (year = ? AND month <= ?)
      ORDER BY year DESC, month DESC 
      LIMIT 1
    `).get(year, year, month);
    
    return daEntry ? daEntry.da_percentage : 0;
  } catch (error) {
    console.error('Error fetching DA percentage:', error);
    return 0;
  }
}

// Calculate Paid HRA Report (same logic as Payable HRA Report)
function calculatePaidHRAReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  // Get teacher's higher grade date
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const higherGradeDate = new Date(firstGrade.grade_date);
  
  // FIXED: Use proper date ranges for 5th and 6th commission data
  const march2009 = new Date('2009-03-31');
  const april2009 = new Date('2009-04-01');
  const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
  
  // 5th Commission data: from start date to March 2009
  const sup5thEndDate = retirementDate && retirementDate < march2009 ? retirementDate : march2009;
  const sup5thData = calculateSupPaid5thCommissionReport(teacher, grades, sixthCommission, startDate, sup5thEndDate);
  
  // 6th Commission data: from April 2009 to end date
  const sup6thStartDate = retirementDate && retirementDate < april2009 ? retirementDate : april2009;
  const sup6thData = calculatePaid6thCommissionReport(teacher, grades, sixthCommission, null, sup6thStartDate, endDate);

  // Create a map for easy lookup
  const sup5thMap = new Map();
  const sup6thMap = new Map();
  
  sup5thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup5thMap.set(key, item);
  });
  
  sup6thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup6thMap.set(key, item);
  });
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const key = `${year}-${month}`;
    
    let mbasic, mgredpay, basic, gredpay, total;
    let used5th = false;
    if (sup5thMap.has(key)) {
    const sup5thItem = sup5thMap.get(key);
      mbasic = sup5thItem.mbasic;
      mgredpay = sup5thItem.gradePay;
      total = sup5thItem.total;
      used5th = true;
    } else if (sup6thMap.has(key)) {
      const sup6thItem = sup6thMap.get(key);
      mbasic = sup6thItem.mbasic;
      mgredpay = sup6thItem.gradePay;
      total = sup6thItem.total;
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
      continue;
    }
    
    // Get LWP and HLWP data for this month
    const lwpDays = getLWPForMonth(teacher.id, year, month);
    const hlwpDays = getHLWPForMonth(teacher.id, year, month);
    
    // Calculate working days
    const daysInMonth = new Date(year, month, 0).getDate();
    const teacherDateInMonth = higherGradeDate.getDate();
    
    // Check if there's a date in the date column (grade change)
    const sup5thItem = sup5thMap.get(key);
    const sup6thItem = sup6thMap.get(key);
    const hasDateInColumn = sup5thItem?.date || sup6thItem?.date;

    // Check if this is the last row (October 2022)
    const isLastRow = (year === 2022 && month === 10);
    
    let workingDays;
    if (hasDateInColumn) {
      workingDays = daysInMonth - (teacherDateInMonth - 1) - lwpDays - (hlwpDays / 2);
    } else if (isLastRow) {
      workingDays = daysInMonth - (11 - 1) - lwpDays - (hlwpDays / 2);
    } else {
      workingDays = daysInMonth - lwpDays - (hlwpDays / 2);
    }
    
    // Calculate basic and gredpay as per working days
    basic = Math.round((mbasic / daysInMonth) * workingDays);
    gredpay = Math.round((mgredpay / daysInMonth) * workingDays);

    const calculatedTotal = basic + gredpay;
    
    // Get HRA percentage and calculate HRA amount
    const hraPercentage = getHRAForMonth(teacher.id, year, month);
    const hraAmount = Math.round((calculatedTotal * hraPercentage) / 100);

    // Format date for display
    let dateStr = hasDateInColumn ? (sup5thItem?.date || sup6thItem?.date) : null;
    if (isLastRow) {
      dateStr = "11/10/2022";
    }
    
    reportData.push({
      month,
      year,
      date: dateStr,
      mbasic,
      mgredpay,
      total,
      lwpDays,
      hlwpDays,
      basic,
      gredpay,
      calculatedTotal,
      hraPercentage,
      hraAmount,
      workingDays
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

// Calculate All Paid Report (similar to All Payable Report but using paid functions)
function calculateAllPaidReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  // Get teacher's higher grade date
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const higherGradeDate = new Date(firstGrade.grade_date);
  
  // FIXED: Use proper date ranges for all commission reports
  const march2009 = new Date('2009-03-31');
  const april2009 = new Date('2009-04-01');
  const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
  
  // 5th Commission data: from start date to March 2009
  const sup5thEndDate = retirementDate && retirementDate < march2009 ? retirementDate : march2009;
  const sup5thData = calculateSupPaid5thCommissionReport(teacher, grades, sixthCommission, startDate, sup5thEndDate);
  
  // 6th Commission data: from April 2009 to 7th commission date
  const sup6thStartDate = retirementDate && retirementDate < april2009 ? retirementDate : april2009;
  const sup6thData = calculatePaid6thCommissionReport(teacher, grades, sixthCommission, seventhCommission, sup6thStartDate, endDate);
  
  // 7th Commission data: from 7th commission date to end date
  const seventhCommissionDate = new Date(seventhCommission.commission_date);
  const sup7thStartDate = retirementDate && retirementDate < seventhCommissionDate ? retirementDate : seventhCommissionDate;
  const sup7thData = calculatePaid7thCommissionReport(teacher, grades, seventhCommission, sup7thStartDate, endDate);
  
  // HRA data: uses the same logic as HRA report
  const hraData = calculatePaidHRAReport(teacher, grades, sixthCommission, startDate, endDate);
  
  // Create maps for easy lookup
  const sup5thMap = new Map();
  const sup6thMap = new Map();
  const sup7thMap = new Map();
  const hraMap = new Map();
  
  sup5thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup5thMap.set(key, item);
  });
  
  sup6thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup6thMap.set(key, item);
  });
  
  sup7thData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    sup7thMap.set(key, item);
  });
  
  hraData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    hraMap.set(key, item);
  });
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const key = `${year}-${month}`;
    
    // Get data from commission reports (priority: 5th -> 6th -> 7th)
    let mbasic, mgredpay, total;
    const sup5thItem = sup5thMap.get(key);
    const sup6thItem = sup6thMap.get(key);
    const sup7thItem = sup7thMap.get(key);
    const hraItem = hraMap.get(key);
    
    if (sup5thItem) {
      mbasic = sup5thItem.mbasic;
      mgredpay = sup5thItem.gradePay;
      total = sup5thItem.total;
    } else if (sup6thItem) {
      mbasic = sup6thItem.mbasic;
      mgredpay = sup6thItem.gradePay;
      total = sup6thItem.total;
    } else if (sup7thItem) {
      mbasic = sup7thItem.mbasic;
      mgredpay = sup7thItem.gradePay;
      total = sup7thItem.total;
    } else {
      // Skip if no data available
      currentDate.setMonth(currentDate.getMonth() + 1);
      continue;
    }
    
    // Get LWP and HLWP data for this month
    const lwpDays = getLWPForMonth(teacher.id, year, month);
    const hlwpDays = getHLWPForMonth(teacher.id, year, month);
    
    // Calculate working days
    const daysInMonth = new Date(year, month, 0).getDate();
    const teacherDateInMonth = higherGradeDate.getDate();
    
    // Check if there's a date in the date column (grade change)
    const hasDateInColumn = sup5thItem?.date || sup6thItem?.date || sup7thItem?.date;
    
    // Check if this is the last row (October 2022)
    const isLastRow = (year === 2022 && month === 10);
    
    let workingDays;
    if (hasDateInColumn) {
      // When there's a date: Working Days = Total days - (Teacher's date - 1) - LWP - (HLWP/2)
      workingDays = daysInMonth - (teacherDateInMonth - 1) - lwpDays - (hlwpDays / 2);
    } else if (isLastRow) {
      // For the last row (October 2022): Working Days = Total days - (11 - 1) - LWP - (HLWP/2)
      workingDays = daysInMonth - (11 - 1) - lwpDays - (hlwpDays / 2);
    } else {
      // When no date: Working Days = Total days - LWP - (HLWP/2)
      workingDays = daysInMonth - lwpDays - (hlwpDays / 2);
    }
    
    // Calculate Basic and Grade Pay based on working days
    const basic = Math.round((total / daysInMonth) * workingDays);
    const gredpay = Math.round((mgredpay / daysInMonth) * workingDays);
    const calculatedTotal = basic + gredpay;
    
    // Get DA and HRA percentages
    const daPercentage = getDAForMonth(teacher.id, year, month);
    const hraPercentage = getHRAForMonth(teacher.id, year, month);
    
    // Calculate DA and HRA amounts
    const daAmount = Math.round((calculatedTotal * daPercentage) / 100);
    const hraAmount = hraItem ? hraItem.hraAmount : Math.round((calculatedTotal * hraPercentage) / 100);
    
    // Calculate final paid total
    const paidTotal = calculatedTotal + daAmount + hraAmount;
    
    // Format date for display
    let dateStr = hasDateInColumn ? (sup5thItem?.date || sup6thItem?.date || sup7thItem?.date) : null;
    
    // Check if this is the last row (October 2022) and set the end date
    if (isLastRow) {
      dateStr = "11/10/2022";
    }
    
    reportData.push({
      month,
      year,
      date: dateStr,
      mbasic,
      mgredpay,
      total,
      lwpDays,
      hlwpDays,
      basic,
      gredpay,
      calculatedTotal,
      daPercentage,
      daAmount,
      hraPercentage,
      hraAmount,
      paidTotal,
      workingDays
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

// Calculate Different Salary Report (difference between payable and paid)
function calculateDifferentSalaryReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  
  // Get teacher's higher grade date
  const firstGrade = grades.find(g => g.grade_type === 'first');
  const higherGradeDate = new Date(firstGrade.grade_date);
  
  // FIXED: Use proper date ranges for all commission reports
  const march2009 = new Date('2009-03-31');
  const april2009 = new Date('2009-04-01');
  const retirementDate = teacher.retirement_date ? new Date(teacher.retirement_date) : null;
  
  // Get payable data
  const payableData = calculateAllPayableReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate);
  
  // Get paid data
  const paidData = calculateAllPaidReport(teacher, grades, sixthCommission, seventhCommission, startDate, endDate);
  
  // Create maps for easy lookup
  const payableMap = new Map();
  const paidMap = new Map();
  
  payableData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    payableMap.set(key, item);
  });
  
  paidData.forEach(item => {
    const key = `${item.year}-${item.month}`;
    paidMap.set(key, item);
  });
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const key = `${year}-${month}`;
    
    const payableItem = payableMap.get(key);
    const paidItem = paidMap.get(key);
    
    if (!payableItem || !paidItem) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      continue;
    }
    
    // Calculate differences
    const diff_basic = payableItem.basic - paidItem.basic;
    const diff_gredpay = payableItem.gredpay - paidItem.gredpay;
    const diff_total = payableItem.calculatedTotal - paidItem.calculatedTotal;
    const diff_da_amount = payableItem.daAmount - paidItem.daAmount;
    const diff_hra_amount = payableItem.hraAmount - paidItem.hraAmount;
    const diff_final_total = payableItem.payableTotal - paidItem.paidTotal;
    
    reportData.push({
      month,
      year,
      date: payableItem.date,
      payable_basic: payableItem.basic,
      payable_gredpay: payableItem.gredpay,
      payable_total: payableItem.calculatedTotal,
      payable_da_amount: payableItem.daAmount,
      payable_hra_amount: payableItem.hraAmount,
      payable_final_total: payableItem.payableTotal,
      paid_basic: paidItem.basic,
      paid_gredpay: paidItem.gredpay,
      paid_total: paidItem.calculatedTotal,
      paid_da_amount: paidItem.daAmount,
      paid_hra_amount: paidItem.hraAmount,
      paid_final_total: paidItem.paidTotal,
      diff_basic,
      diff_gredpay,
      diff_total,
      diff_da_amount,
      diff_hra_amount,
      diff_final_total
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}

module.exports = {
  calculatePayable5thCommissionReport,
  calculatePaid5thCommissionReport,
  calculatePayable6thCommissionReport,
  calculatePaid6thCommissionReport,
  calculatePayable7thCommissionReport,
  calculatePaid7thCommissionReport,
  calculateSupPayable5thCommissionReport,
  calculateSupPaid5thCommissionReport,
  calculatePayableHRAReport,
  calculatePaidHRAReport,
  calculateAllPayableReport,
  calculateAllPaidReport,
  calculateDifferentSalaryReport
}; 