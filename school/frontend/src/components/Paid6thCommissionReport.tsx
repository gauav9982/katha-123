import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Teacher {
  id: number;
  name: string;
  city_name: string;
}

interface ReportRow {
  id?: number;
  month: number;
  year: number;
  date: string | null;
  basic?: number;
  mbasic?: number;
  grade_pay?: number;
  total_amount?: number;
  xbasic?: number;
  gradePay?: number;
  total?: number;
  yearly_increment_applied?: boolean | number;
}

const Paid6thCommissionReport: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('schoolLoginSession');
    if (session) {
      const sessionData = JSON.parse(session);
      if (sessionData.cityName) {
        setCityName(sessionData.cityName);
        setIsAuthenticated(true);
      } else {
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

  useEffect(() => {
    if (cityName) {
      const loadTeachers = async () => {
        try {
          const response = await fetch(`http://localhost:4001/api/teachers?cityName=${encodeURIComponent(cityName)}`);
          const result = await response.json();
          setTeachers(result.success ? result.data : []);
        } catch (err) {
          setError('Failed to load teachers');
        }
      };
      loadTeachers();
    }
  }, [cityName]);

  useEffect(() => {
    if (selectedTeacher) {
      const loadExistingReport = async () => {
        try {
          const response = await fetch(`http://localhost:4001/api/reports/paid-6th-commission/${selectedTeacher}`);
          const result = await response.json();
          setReportData(result.success ? result.data : []);
        } catch (err) {
          setError('Failed to load existing report');
        }
      };
      loadExistingReport();
    }
  }, [selectedTeacher]);

  const calculateReport = async () => {
    if (!selectedTeacher) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4001/api/reports/paid-6th-commission/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: selectedTeacher }),
      });
      const result = await response.json();
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.error || 'Failed to calculate report');
      }
    } catch (err) {
      setError('Failed to calculate report');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Paid 6th Commission Report</h1>
      <p className="text-gray-600 mb-6">Calculate and view paid 6th commission report for teachers in {cityName}</p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
        <select value={selectedTeacher || ''} onChange={(e) => setSelectedTeacher(Number(e.target.value))} className="w-full px-3 py-2 border rounded">
          <option value="">Select a teacher...</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
          ))}
        </select>
      </div>

      {selectedTeacher && (
        <div className="mb-6">
          <button onClick={calculateReport} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
            {loading ? 'Calculating...' : 'Calculate Paid Report'}
          </button>
        </div>
      )}

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {reportData.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Sr.No</th>
                  <th className="border px-4 py-2 text-left">Date</th>
                  <th className="border px-4 py-2 text-left">Month</th>
                  <th className="border px-4 py-2 text-right">Basic</th>
                  <th className="border px-4 py-2 text-right">MBasic</th>
                  <th className="border px-4 py-2 text-right">Grade Pay</th>
                  <th className="border px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => {
                  const basic = row.basic || row.xbasic || 0;
                  const mbasic = row.mbasic || 0;
                  const gradePay = row.grade_pay || row.gradePay || 0;
                  const total = row.total_amount || row.total || 0;

                  const isIncrementRow = row.yearly_increment_applied;
                  const isGradeChangeRow = row.date;

                  let rowClassName = '';
                  if (isIncrementRow) {
                    rowClassName = 'bg-yellow-100';
                  } else if (isGradeChangeRow) {
                    rowClassName = 'bg-green-100';
                  }

                  return (
                    <tr key={row.id || index} className={rowClassName}>
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{row.date || ''}</td>
                      <td className="border px-4 py-2">{getMonthName(row.month)} {row.year}</td>
                      <td className="border px-4 py-2 text-right">{Math.round(basic)}</td>
                      <td className="border px-4 py-2 text-right">{Math.round(mbasic)}</td>
                      <td className="border px-4 py-2 text-right">{Math.round(gradePay)}</td>
                      <td className="border px-4 py-2 text-right font-semibold">{Math.round(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Report Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center"><p className="text-sm text-gray-600">Total Months</p><p className="text-xl font-bold">{reportData.length}</p></div>
              <div className="text-center"><p className="text-sm text-gray-600">Final Basic</p><p className="text-xl font-bold text-blue-600">{Math.round(reportData[reportData.length - 1]?.basic || reportData[reportData.length - 1]?.xbasic || 0)}</p></div>
              <div className="text-center"><p className="text-sm text-gray-600">Final MBasic</p><p className="text-xl font-bold text-green-600">{Math.round(reportData[reportData.length - 1]?.mbasic || 0)}</p></div>
              <div className="text-center"><p className="text-sm text-gray-600">Total Amount</p><p className="text-xl font-bold text-purple-600">{Math.round(reportData.reduce((sum, row) => sum + (row.total_amount || row.total || 0), 0))}</p></div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800"><strong>Note:</strong> Yearly increment logic is the same as the payable report, using paid values.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Paid6thCommissionReport; 
