const { getDatabase, closeDatabase } = require('./config/database.cjs');

function calculatePayable5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate) {
  const reportData = [];
  let currentDate = new Date(startDate);
  let currentXBasic = sixthCommission.payable_basic;
  let currentGradePay = sixthCommission.payable_grade_pay;
  let currentMBasic = currentXBasic;

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
    
    let dateStr = null;
    if (gradeChange) {
      dateStr = `${gradeChange.date.getDate().toString().padStart(2, '0')}/${(gradeChange.date.getMonth() + 1).toString().padStart(2, '0')}/${gradeChange.date.getFullYear()}`;
      
      currentXBasic = gradeChange.payableBasic;
      currentGradePay = gradeChange.payableGradePay;
      currentMBasic = currentXBasic;
    } else {
      // This is the key logic part
      if (currentDate.getMonth() === firstGradeDate.getMonth() && currentDate.getFullYear() > firstGradeDate.getFullYear()) {
        currentXBasic += 150;
        currentMBasic = currentXBasic; // MBasic must follow XBasic
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
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return reportData;
}


async function runDebug() {
  const db = getDatabase();
  try {
    console.log('--- Running Debug Script ---');
    const teacher = db.prepare(`SELECT * FROM teachers WHERE name LIKE 'CHETANBHAI B PATEL'`).get();
    if (!teacher) {
      console.log('Teacher not found!');
      return;
    }

    const grades = db.prepare('SELECT * FROM teacher_grades WHERE teacher_id = ? ORDER BY grade_date').all(teacher.id);
    const sixthCommission = db.prepare(`SELECT * FROM teacher_pay_commissions WHERE teacher_id = ? AND commission_type = '6th'`).get(teacher.id);

    if (!grades.length || !sixthCommission) {
        console.log('Required grade or commission data missing for the teacher.');
        return;
    }

    const firstGrade = grades.find(g => g.grade_type === 'first');
    const startDate = new Date(firstGrade.grade_date);
    const endDate = new Date(sixthCommission.pay_date);

    console.log(`Calculating for ${teacher.name} from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    const report = calculatePayable5thCommissionReport(teacher, grades, sixthCommission, startDate, endDate);

    console.log('\n--- Calculation Result ---');
    console.log('Month/Year | XBasic | MBasic | Grade Pay | Total');
    console.log('----------------------------------------------------');
    report.forEach(row => {
        if (row.month === 2 && row.year === 2002) {
            console.log('>>> CHECKPOINT: Data for Feb 2002 <<<');
        }
        console.log(`${String(row.month).padStart(2, '0')}/${row.year}   | ${String(row.xbasic).padEnd(6)} | ${String(row.mbasic).padEnd(6)} | ${String(row.gradePay).padEnd(9)} | ${row.total}`);
    });

  } catch (error) {
    console.error('An error occurred during debug run:', error);
  } finally {
    closeDatabase();
    console.log('\n--- Debug Script Finished ---');
  }
}

runDebug(); 