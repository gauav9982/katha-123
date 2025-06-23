import React, { useState, useEffect } from 'react';
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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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
          navigate('/school');
        }
      } catch (error) {
        navigate('/school');
      }
    } else {
      navigate('/school');
    }
  }, [navigate]);

  const getMonthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const loadTeachers = async () => {
    if (!cityName) return;
    try {
      const response = await fetch(`http://localhost:4009/api/teachers?cityName=${encodeURIComponent(cityName)}`);
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
      const response = await fetch(`http://localhost:4009/api/reports/different-salary/calculate`, {
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
      const response = await fetch(`http://localhost:4009/api/reports/different-salary/${selectedTeacher}`);
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
        <button onClick={() => navigate('/school')} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" value={cityName} readOnly className="w-full p-2 border rounded bg-gray-100" />
        <select value={selectedTeacher || ''} onChange={(e) => setSelectedTeacher(Number(e.target.value) || null)} className="w-full p-2 border rounded">
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