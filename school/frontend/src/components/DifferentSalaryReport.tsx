import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Teacher {
  id: number;
  name: string;
}

interface ReportRow {
    month: number;
    year: number;
    date: string | null;
    payable_basic?: number;
    payable_gredpay?: number;
    payable_total?: number;
    payable_da_amount?: number;
    payable_hra_amount?: number;
    payable_final_total?: number;
    paid_basic?: number;
    paid_gredpay?: number;
    paid_total?: number;
    paid_da_amount?: number;
    paid_hra_amount?: number;
    paid_final_total?: number;
    diff_basic?: number;
    diff_gredpay?: number;
    diff_total?: number;
    diff_da_amount?: number;
    diff_hra_amount?: number;
    diff_final_total?: number;
}

const DifferentSalaryReport: React.FC = () => {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('');
  
  const [totals, setTotals] = useState<any>({});

  useEffect(() => {
    const session = localStorage.getItem('schoolLoginSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.cityName) {
          setCityName(sessionData.cityName);
          setIsAuthenticated(true);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const getMonthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const loadTeachers = async () => {
    if (!cityName) return;
    try {
      const response = await fetch(`http://localhost:4001/api/teachers?cityName=${encodeURIComponent(cityName)}`);
      const result = await response.json();
      if (result.success) {
        setTeachers(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load teachers');
    }
  };

  const calculateReport = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4001/api/reports/different-salary/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: selectedTeacher }),
      });
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
        calculateTotals(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to calculate report');
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    if (!selectedTeacher) return;
    try {
      const response = await fetch(`http://localhost:4001/api/reports/different-salary/${selectedTeacher}`);
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
        calculateTotals(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load report');
    }
  };
  
  const calculateTotals = (data: ReportRow[]) => {
    const calculatedTotals = {
      payable_basic: data.reduce((sum, row) => sum + (row.payable_basic || 0), 0),
      payable_gredpay: data.reduce((sum, row) => sum + (row.payable_gredpay || 0), 0),
      payable_total: data.reduce((sum, row) => sum + (row.payable_total || 0), 0),
      payable_da_amount: data.reduce((sum, row) => sum + (row.payable_da_amount || 0), 0),
      payable_hra_amount: data.reduce((sum, row) => sum + (row.payable_hra_amount || 0), 0),
      payable_final_total: data.reduce((sum, row) => sum + (row.payable_final_total || 0), 0),
      paid_basic: data.reduce((sum, row) => sum + (row.paid_basic || 0), 0),
      paid_gredpay: data.reduce((sum, row) => sum + (row.paid_gredpay || 0), 0),
      paid_total: data.reduce((sum, row) => sum + (row.paid_total || 0), 0),
      paid_da_amount: data.reduce((sum, row) => sum + (row.paid_da_amount || 0), 0),
      paid_hra_amount: data.reduce((sum, row) => sum + (row.paid_hra_amount || 0), 0),
      paid_final_total: data.reduce((sum, row) => sum + (row.paid_final_total || 0), 0),
      diff_basic: data.reduce((sum, row) => sum + (row.diff_basic || 0), 0),
      diff_gredpay: data.reduce((sum, row) => sum + (row.diff_gredpay || 0), 0),
      diff_total: data.reduce((sum, row) => sum + (row.diff_total || 0), 0),
      diff_da_amount: data.reduce((sum, row) => sum + (row.diff_da_amount || 0), 0),
      diff_hra_amount: data.reduce((sum, row) => sum + (row.diff_hra_amount || 0), 0),
      diff_final_total: data.reduce((sum, row) => sum + (row.diff_final_total || 0), 0),
    };
    setTotals(calculatedTotals);
  };

  const handleTeacherChange = (teacherId: number) => {
    setSelectedTeacher(teacherId);
    const teacher = teachers.find(t => t.id === teacherId);
    setSelectedTeacherName(teacher ? teacher.name : '');
  };

  const printReport = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Different Salary Report - ${selectedTeacherName}</title>
            <style>
              @page {
                size: legal landscape;
                margin: 0.5in;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 8px;
                margin: 0;
                padding: 0;
              }
              .print-header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 2px solid #000;
                padding-bottom: 5px;
              }
              .print-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .print-subtitle {
                font-size: 10px;
                margin-bottom: 5px;
              }
              .print-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 8px;
              }
              .print-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 7px;
              }
              .print-table th,
              .print-table td {
                border: 1px solid #000;
                padding: 2px;
                text-align: center;
              }
              .print-table th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              .payable-header {
                background-color: #ffffcc !important;
              }
              .paid-header {
                background-color: #ffcccc !important;
              }
              .diff-header {
                background-color: #cce5ff !important;
              }
              .total-row {
                background-color: #e6e6e6;
                font-weight: bold;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .font-bold {
                font-weight: bold;
              }
              @media print {
                body { margin: 0; }
                .print-table { page-break-inside: auto; }
                .print-table tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const downloadPDF = async () => {
    try {
      // Dynamic import of jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF('landscape', 'pt', 'legal');
      
      // Set font
      pdf.setFont('helvetica');
      pdf.setFontSize(12);
      
      // Add header
      pdf.setFontSize(16);
      pdf.text('DIFFERENT SALARY REPORT', pdf.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text('Government of Gujarat', pdf.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.text(`Teacher Name: ${selectedTeacherName}`, 40, 80);
      pdf.text(`City: ${cityName}`, 40, 95);
      pdf.text(`Generated Date: ${new Date().toLocaleDateString('en-IN')}`, 40, 110);
      
      // Table headers
      const startY = 130;
      const rowHeight = 20;
      let currentY = startY;
      
      // Define column positions
      const columns = [
        { x: 40, width: 30, title: 'Sr.No' },
        { x: 70, width: 50, title: 'Date' },
        { x: 120, width: 60, title: 'Month' },
        { x: 180, width: 50, title: 'P.Basic' },
        { x: 230, width: 50, title: 'P.Gred' },
        { x: 280, width: 50, title: 'P.Total' },
        { x: 330, width: 50, title: 'P.DA' },
        { x: 380, width: 50, title: 'P.HRA' },
        { x: 430, width: 50, title: 'P.Final' },
        { x: 480, width: 50, title: 'Paid.Basic' },
        { x: 530, width: 50, title: 'Paid.Gred' },
        { x: 580, width: 50, title: 'Paid.Total' },
        { x: 630, width: 50, title: 'Paid.DA' },
        { x: 680, width: 50, title: 'Paid.HRA' },
        { x: 730, width: 50, title: 'Paid.Final' },
        { x: 780, width: 50, title: 'Diff.Basic' },
        { x: 830, width: 50, title: 'Diff.Gred' },
        { x: 880, width: 50, title: 'Diff.Total' },
        { x: 930, width: 50, title: 'Diff.DA' },
        { x: 980, width: 50, title: 'Diff.HRA' },
        { x: 1030, width: 50, title: 'Diff.Final' }
      ];
      
      // Draw header row with borders
      pdf.setFillColor(240, 240, 240);
      pdf.rect(40, currentY, pdf.internal.pageSize.getWidth() - 80, rowHeight, 'F');
      
      // Draw borders for header
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(40, currentY, pdf.internal.pageSize.getWidth() - 80, rowHeight, 'S');
      
      // Draw vertical lines for columns
      columns.forEach((col, index) => {
        if (index < columns.length - 1) {
          pdf.line(col.x + col.width, currentY, col.x + col.width, currentY + rowHeight);
        }
      });
      
      pdf.setFontSize(6);
      columns.forEach(col => {
        pdf.text(col.title, col.x + 2, currentY + 12);
      });
      
      currentY += rowHeight;
      
      // Add data rows with borders
      pdf.setFontSize(6);
      reportData.forEach((row, index) => {
        // Check if we need a new page
        if (currentY > pdf.internal.pageSize.getHeight() - 100) {
          pdf.addPage();
          currentY = 40;
        }
        
        const values = [
          (index + 1).toString(),
          row.date || '-',
          `${getMonthName(row.month)} ${row.year}`,
          formatNumber(row.payable_basic),
          formatNumber(row.payable_gredpay),
          formatNumber(row.payable_total),
          formatNumber(row.payable_da_amount),
          formatNumber(row.payable_hra_amount),
          formatNumber(row.payable_final_total),
          formatNumber(row.paid_basic),
          formatNumber(row.paid_gredpay),
          formatNumber(row.paid_total),
          formatNumber(row.paid_da_amount),
          formatNumber(row.paid_hra_amount),
          formatNumber(row.paid_final_total),
          formatNumber(row.diff_basic),
          formatNumber(row.diff_gredpay),
          formatNumber(row.diff_total),
          formatNumber(row.diff_da_amount),
          formatNumber(row.diff_hra_amount),
          formatNumber(row.diff_final_total)
        ];
        
        // Draw row border
        pdf.rect(40, currentY, pdf.internal.pageSize.getWidth() - 80, rowHeight, 'S');
        
        // Draw vertical lines
        columns.forEach((col, colIndex) => {
          if (colIndex < columns.length - 1) {
            pdf.line(col.x + col.width, currentY, col.x + col.width, currentY + rowHeight);
          }
        });
        
        columns.forEach((col, colIndex) => {
          pdf.text(values[colIndex], col.x + 2, currentY + 12);
        });
        
        currentY += rowHeight;
      });
      
      // Add totals row with borders
      if (currentY > pdf.internal.pageSize.getHeight() - 100) {
        pdf.addPage();
        currentY = 40;
      }
      
      pdf.setFillColor(230, 230, 230);
      pdf.rect(40, currentY, pdf.internal.pageSize.getWidth() - 80, rowHeight, 'F');
      pdf.rect(40, currentY, pdf.internal.pageSize.getWidth() - 80, rowHeight, 'S');
      
      // Draw vertical lines for totals
      columns.forEach((col, colIndex) => {
        if (colIndex < columns.length - 1) {
          pdf.line(col.x + col.width, currentY, col.x + col.width, currentY + rowHeight);
        }
      });
      
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GRAND TOTAL', 70, currentY + 12);
      
      const totalValues = [
        '',
        '',
        '',
        formatNumber(totals.payable_basic),
        formatNumber(totals.payable_gredpay),
        formatNumber(totals.payable_total),
        formatNumber(totals.payable_da_amount),
        formatNumber(totals.payable_hra_amount),
        formatNumber(totals.payable_final_total),
        formatNumber(totals.paid_basic),
        formatNumber(totals.paid_gredpay),
        formatNumber(totals.paid_total),
        formatNumber(totals.paid_da_amount),
        formatNumber(totals.paid_hra_amount),
        formatNumber(totals.paid_final_total),
        formatNumber(totals.diff_basic),
        formatNumber(totals.diff_gredpay),
        formatNumber(totals.diff_total),
        formatNumber(totals.diff_da_amount),
        formatNumber(totals.diff_hra_amount),
        formatNumber(totals.diff_final_total)
      ];
      
      columns.forEach((col, colIndex) => {
        if (totalValues[colIndex]) {
          pdf.text(totalValues[colIndex], col.x + 2, currentY + 12);
        }
      });
      
      pdf.save(`Different_Salary_Report_${selectedTeacherName}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const downloadExcel = () => {
    try {
      // Create CSV content
      const headers = [
        'Sr.No',
        'Date',
        'Month',
        'Payable Basic',
        'Payable Gred Pay',
        'Payable Total',
        'Payable DA Amount',
        'Payable HRA Amount',
        'Payable Final Total',
        'Paid Basic',
        'Paid Gred Pay',
        'Paid Total',
        'Paid DA Amount',
        'Paid HRA Amount',
        'Paid Final Total',
        'Different Basic',
        'Different Gred Pay',
        'Different Total',
        'Different DA Amount',
        'Different HRA Amount',
        'Different Final Total'
      ];

      const csvContent = [
        headers.join(','),
        ...reportData.map((row, index) => [
          index + 1,
          row.date || '',
          `${getMonthName(row.month)} ${row.year}`,
          row.payable_basic || 0,
          row.payable_gredpay || 0,
          row.payable_total || 0,
          row.payable_da_amount || 0,
          row.payable_hra_amount || 0,
          row.payable_final_total || 0,
          row.paid_basic || 0,
          row.paid_gredpay || 0,
          row.paid_total || 0,
          row.paid_da_amount || 0,
          row.paid_hra_amount || 0,
          row.paid_final_total || 0,
          row.diff_basic || 0,
          row.diff_gredpay || 0,
          row.diff_total || 0,
          row.diff_da_amount || 0,
          row.diff_hra_amount || 0,
          row.diff_final_total || 0
        ].join(',')),
        [
          'GRAND TOTAL',
          '',
          '',
          totals.payable_basic || 0,
          totals.payable_gredpay || 0,
          totals.payable_total || 0,
          totals.payable_da_amount || 0,
          totals.payable_hra_amount || 0,
          totals.payable_final_total || 0,
          totals.paid_basic || 0,
          totals.paid_gredpay || 0,
          totals.paid_total || 0,
          totals.paid_da_amount || 0,
          totals.paid_hra_amount || 0,
          totals.paid_final_total || 0,
          totals.diff_basic || 0,
          totals.diff_gredpay || 0,
          totals.diff_total || 0,
          totals.diff_da_amount || 0,
          totals.diff_hra_amount || 0,
          totals.diff_final_total || 0
        ].join(',')
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Different_Salary_Report_${selectedTeacherName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  useEffect(() => {
    if (cityName) loadTeachers();
  }, [cityName]);

  useEffect(() => {
    if (selectedTeacher) loadReport();
  }, [selectedTeacher]);

  const formatNumber = (num?: number) => (num ? Math.round(num).toLocaleString('en-IN') : '0');

  if (!isAuthenticated) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Different Salary Report</h2>
        <div className="flex gap-2">
          {reportData.length > 0 && (
            <>
              <button 
                onClick={printReport}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Print Report
              </button>
              <button 
                onClick={downloadPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Download PDF
              </button>
              <button 
                onClick={downloadExcel}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Download Excel
              </button>
            </>
          )}
          <button onClick={() => navigate('/dashboard')} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" value={cityName} readOnly className="w-full p-2 border rounded bg-gray-100" />
        <select 
          value={selectedTeacher || ''} 
          onChange={(e) => handleTeacherChange(Number(e.target.value) || null)} 
          className="w-full p-2 border rounded"
        >
          <option value="">Select a teacher...</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selectedTeacher && (
        <button onClick={calculateReport} disabled={loading} className="mb-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'Calculating...' : 'Calculate Different Salary Report'}
        </button>
      )}

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Print/PDF Version */}
      <div ref={printRef} className="hidden">
        <div className="print-header">
          <div className="print-title">DIFFERENT SALARY REPORT</div>
          <div className="print-subtitle">Government of Gujarat</div>
          <div className="print-info">
            <div><strong>Teacher Name:</strong> {selectedTeacherName}</div>
            <div><strong>City:</strong> {cityName}</div>
            <div><strong>Generated Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>
        
        <table className="print-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{width: '30px'}}>Sr.No</th>
              <th rowSpan={2} style={{width: '50px'}}>Date</th>
              <th rowSpan={2} style={{width: '60px'}}>Month</th>
              <th colSpan={6} className="payable-header">PAYABLE</th>
              <th colSpan={6} className="paid-header">PAID</th>
              <th colSpan={6} className="diff-header">DIFFERENT</th>
            </tr>
            <tr>
              <th className="payable-header">Basic</th>
              <th className="payable-header">Gred Pay</th>
              <th className="payable-header">Total</th>
              <th className="payable-header">DA Amount</th>
              <th className="payable-header">HRA Amount</th>
              <th className="payable-header">Payable Total</th>
              <th className="paid-header">Basic</th>
              <th className="paid-header">Gred Pay</th>
              <th className="paid-header">Total</th>
              <th className="paid-header">DA Amount</th>
              <th className="paid-header">HRA Amount</th>
              <th className="paid-header">Paid Total</th>
              <th className="diff-header">Basic</th>
              <th className="diff-header">Gred Pay</th>
              <th className="diff-header">Total</th>
              <th className="diff-header">DA Amount</th>
              <th className="diff-header">HRA Amount</th>
              <th className="diff-header">Different Total</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{row.date || '-'}</td>
                <td className="text-center">{getMonthName(row.month)} {row.year}</td>
                <td className="text-right">{formatNumber(row.payable_basic)}</td>
                <td className="text-right">{formatNumber(row.payable_gredpay)}</td>
                <td className="text-right">{formatNumber(row.payable_total)}</td>
                <td className="text-right">{formatNumber(row.payable_da_amount)}</td>
                <td className="text-right">{formatNumber(row.payable_hra_amount)}</td>
                <td className="text-right font-bold">{formatNumber(row.payable_final_total)}</td>
                <td className="text-right">{formatNumber(row.paid_basic)}</td>
                <td className="text-right">{formatNumber(row.paid_gredpay)}</td>
                <td className="text-right">{formatNumber(row.paid_total)}</td>
                <td className="text-right">{formatNumber(row.paid_da_amount)}</td>
                <td className="text-right">{formatNumber(row.paid_hra_amount)}</td>
                <td className="text-right font-bold">{formatNumber(row.paid_final_total)}</td>
                <td className="text-right">{formatNumber(row.diff_basic)}</td>
                <td className="text-right">{formatNumber(row.diff_gredpay)}</td>
                <td className="text-right">{formatNumber(row.diff_total)}</td>
                <td className="text-right">{formatNumber(row.diff_da_amount)}</td>
                <td className="text-right">{formatNumber(row.diff_hra_amount)}</td>
                <td className="text-right font-bold">{formatNumber(row.diff_final_total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan={3} className="text-center font-bold">GRAND TOTAL</td>
              <td className="text-right font-bold">{formatNumber(totals.payable_basic)}</td>
              <td className="text-right font-bold">{formatNumber(totals.payable_gredpay)}</td>
              <td className="text-right font-bold">{formatNumber(totals.payable_total)}</td>
              <td className="text-right font-bold">{formatNumber(totals.payable_da_amount)}</td>
              <td className="text-right font-bold">{formatNumber(totals.payable_hra_amount)}</td>
              <td className="text-right font-bold">{formatNumber(totals.payable_final_total)}</td>
              <td className="text-right font-bold">{formatNumber(totals.paid_basic)}</td>
              <td className="text-right font-bold">{formatNumber(totals.paid_gredpay)}</td>
              <td className="text-right font-bold">{formatNumber(totals.paid_total)}</td>
              <td className="text-right font-bold">{formatNumber(totals.paid_da_amount)}</td>
              <td className="text-right font-bold">{formatNumber(totals.paid_hra_amount)}</td>
              <td className="text-right font-bold">{formatNumber(totals.paid_final_total)}</td>
              <td className="text-right font-bold">{formatNumber(totals.diff_basic)}</td>
              <td className="text-right font-bold">{formatNumber(totals.diff_gredpay)}</td>
              <td className="text-right font-bold">{formatNumber(totals.diff_total)}</td>
              <td className="text-right font-bold">{formatNumber(totals.diff_da_amount)}</td>
              <td className="text-right font-bold">{formatNumber(totals.diff_hra_amount)}</td>
              <td className="text-right font-bold">{formatNumber(totals.diff_final_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Screen Version */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border p-1">Sr.No</th>
              <th rowSpan={2} className="border p-1">Date</th>
              <th rowSpan={2} className="border p-1">Month</th>
              <th colSpan={6} className="border p-1 bg-yellow-200">Payable</th>
              <th colSpan={6} className="border p-1 bg-red-200">Paid</th>
              <th colSpan={6} className="border p-1 bg-blue-200">Different</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border p-1 bg-yellow-200">Basic</th>
              <th className="border p-1 bg-yellow-200">Gred Pay</th>
              <th className="border p-1 bg-yellow-200">Total</th>
              <th className="border p-1 bg-yellow-200">DA Amount</th>
              <th className="border p-1 bg-yellow-200">HRA Amount</th>
              <th className="border p-1 bg-yellow-200">Payable Total</th>
              <th className="border p-1 bg-red-200">Basic</th>
              <th className="border p-1 bg-red-200">Gred Pay</th>
              <th className="border p-1 bg-red-200">Total</th>
              <th className="border p-1 bg-red-200">DA Amount</th>
              <th className="border p-1 bg-red-200">HRA Amount</th>
              <th className="border p-1 bg-red-200">Paid Total</th>
              <th className="border p-1 bg-blue-200">Basic</th>
              <th className="border p-1 bg-blue-200">Gred Pay</th>
              <th className="border p-1 bg-blue-200">Total</th>
              <th className="border p-1 bg-blue-200">DA Amount</th>
              <th className="border p-1 bg-blue-200">HRA Amount</th>
              <th className="border p-1 bg-blue-200">Different Total</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-1">{index + 1}</td>
                <td className="border p-1">{row.date || '-'}</td>
                <td className="border p-1">{getMonthName(row.month)} {row.year}</td>
                <td className="border p-1 text-right">{formatNumber(row.payable_basic)}</td>
                <td className="border p-1 text-right">{formatNumber(row.payable_gredpay)}</td>
                <td className="border p-1 text-right">{formatNumber(row.payable_total)}</td>
                <td className="border p-1 text-right">{formatNumber(row.payable_da_amount)}</td>
                <td className="border p-1 text-right">{formatNumber(row.payable_hra_amount)}</td>
                <td className="border p-1 text-right font-bold">{formatNumber(row.payable_final_total)}</td>
                <td className="border p-1 text-right">{formatNumber(row.paid_basic)}</td>
                <td className="border p-1 text-right">{formatNumber(row.paid_gredpay)}</td>
                <td className="border p-1 text-right">{formatNumber(row.paid_total)}</td>
                <td className="border p-1 text-right">{formatNumber(row.paid_da_amount)}</td>
                <td className="border p-1 text-right">{formatNumber(row.paid_hra_amount)}</td>
                <td className="border p-1 text-right font-bold">{formatNumber(row.paid_final_total)}</td>
                <td className="border p-1 text-right">{formatNumber(row.diff_basic)}</td>
                <td className="border p-1 text-right">{formatNumber(row.diff_gredpay)}</td>
                <td className="border p-1 text-right">{formatNumber(row.diff_total)}</td>
                <td className="border p-1 text-right">{formatNumber(row.diff_da_amount)}</td>
                <td className="border p-1 text-right">{formatNumber(row.diff_hra_amount)}</td>
                <td className="border p-1 text-right font-bold">{formatNumber(row.diff_final_total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold">
              <td colSpan={3} className="border p-1 text-center">Grand Total</td>
              <td className="border p-1 text-right">{formatNumber(totals.payable_basic)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.payable_gredpay)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.payable_total)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.payable_da_amount)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.payable_hra_amount)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.payable_final_total)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.paid_basic)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.paid_gredpay)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.paid_total)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.paid_da_amount)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.paid_hra_amount)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.paid_final_total)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.diff_basic)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.diff_gredpay)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.diff_total)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.diff_da_amount)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.diff_hra_amount)}</td>
              <td className="border p-1 text-right">{formatNumber(totals.diff_final_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DifferentSalaryReport; 
