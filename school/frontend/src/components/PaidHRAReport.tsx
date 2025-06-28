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
  mbasic?: number;
  mgredpay?: number;
  total?: number;
  lwpDays?: number;
  hlwpDays?: number;
  basic?: number;
  gredpay?: number;
  calculatedTotal?: number;
  hraPercentage?: number;
  hraAmount?: number;
  workingDays?: number;
  // Alternative field names from API
  mbasic_amount?: number;
  grade_pay?: number;
  total_amount?: number;
}

const PaidHRAReport: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summary, setSummary] = useState({
    totalBasic: 0,
    totalGradePay: 0,
    totalHRA: 0,
    grandTotal: 0
  });

  // Load city name from session on component mount
  useEffect(() => {
    const session = localStorage.getItem('schoolLoginSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.cityName) {
          setCityName(sessionData.cityName);
          setIsAuthenticated(true);
          console.log('City loaded from session:', sessionData.cityName);
        } else {
          // No city name in session, redirect to login
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        navigate('/dashboard');
      }
    } else {
      // No session, redirect to login
      navigate('/dashboard');
    }
  }, [navigate]);

  // Get month name
  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  // Load teachers for selected city
  const loadTeachers = async () => {
    if (!cityName) return;
    
    try {
      const response = await fetch(`http://localhost:4001/api/teachers?cityName=${encodeURIComponent(cityName)}`);
      const result = await response.json();
      
      if (result.success) {
        setTeachers(result.data);
        console.log('Teachers loaded:', result.data.length);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load teachers');
    }
  };

  // Calculate report
  const calculateReport = async () => {
    if (!selectedTeacher) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cacheBuster = `&t=${new Date().getTime()}`;
      const response = await fetch(`http://localhost:4001/api/reports/paid-hra/calculate?cacheBuster=true${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId: selectedTeacher }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Use the data directly from the calculation response
        setReportData(result.data);
        calculateSummary(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to calculate report');
    } finally {
      setLoading(false);
    }
  };

  // Load existing report
  const loadReport = async () => {
    if (!selectedTeacher) return;
    
    try {
      const response = await fetch(`http://localhost:4001/api/reports/paid-hra/${selectedTeacher}`);
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
        calculateSummary(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load report');
    }
  };

  const calculateSummary = (data: ReportRow[]) => {
    const totalBasic = data.reduce((sum, row) => sum + (row.basic || 0), 0);
    const totalGradePay = data.reduce((sum, row) => sum + (row.gredpay || 0), 0);
    const totalHRA = data.reduce((sum, row) => sum + (row.hraAmount || 0), 0);
    const grandTotal = totalBasic + totalGradePay + totalHRA;

    setSummary({
      totalBasic,
      totalGradePay,
      totalHRA,
      grandTotal
    });
  };

  useEffect(() => {
    if (cityName) {
      loadTeachers();
    }
  }, [cityName]);

  useEffect(() => {
    if (selectedTeacher) {
      loadReport();
    }
  }, [selectedTeacher]);

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString('en-IN');
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-600">
          Paid HRA Report
        </h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>

      {/* City Display (Read-only) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <input
          type="text"
          value={cityName}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
          placeholder="City will be loaded from your login session..."
        />
      </div>

      {/* Teacher Selection */}
      {cityName && teachers.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Teacher
          </label>
          <select
            value={selectedTeacher || ''}
            onChange={(e) => setSelectedTeacher(Number(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a teacher...</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Calculate Button */}
      {selectedTeacher && (
        <div className="mb-6">
          <button
            onClick={calculateReport}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Calculating...' : 'Calculate Report'}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {reportData.length > 0 && (
        <>
          {/* Summary Section */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Basic</p>
                <p className="text-lg font-bold">â‚¹{formatNumber(summary.totalBasic)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Grade Pay</p>
                <p className="text-lg font-bold">â‚¹{formatNumber(summary.totalGradePay)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total HRA</p>
                <p className="text-lg font-bold">â‚¹{formatNumber(summary.totalHRA)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grand Total</p>
                <p className="text-lg font-bold text-green-600">â‚¹{formatNumber(summary.grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* Report Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Sr.No</th>
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Month</th>
                  <th className="border px-3 py-2 text-right">M-Basic</th>
                  <th className="border px-3 py-2 text-right">M-Grade Pay</th>
                  <th className="border px-3 py-2 text-right">Total</th>
                  <th className="border px-3 py-2 text-right">LWP</th>
                  <th className="border px-3 py-2 text-right">HLWP</th>
                  <th className="border px-3 py-2 text-right">Basic</th>
                  <th className="border px-3 py-2 text-right">Grade Pay</th>
                  <th className="border px-3 py-2 text-right">Total</th>
                  <th className="border px-3 py-2 text-right">HRA %</th>
                  <th className="border px-3 py-2 text-right">HRA Amount</th>
                  <th className="border px-3 py-2 text-right">Working Days</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{index + 1}</td>
                    <td className="border px-3 py-2">{row.date || '-'}</td>
                    <td className="border px-3 py-2">{getMonthName(row.month)} {row.year}</td>
                    <td className="border px-3 py-2 text-right">{formatNumber(row.mbasic || row.mbasic_amount || 0)}</td>
                    <td className="border px-3 py-2 text-right">{formatNumber(row.mgredpay || row.grade_pay || 0)}</td>
                    <td className="border px-3 py-2 text-right">{formatNumber(row.total || row.total_amount || 0)}</td>
                    <td className="border px-3 py-2 text-right">{row.lwpDays || 0}</td>
                    <td className="border px-3 py-2 text-right">{row.hlwpDays || 0}</td>
                    <td className="border px-3 py-2 text-right">{formatNumber(row.basic || 0)}</td>
                    <td className="border px-3 py-2 text-right">{formatNumber(row.gredpay || 0)}</td>
                    <td className="border px-3 py-2 text-right">{formatNumber(row.calculatedTotal || 0)}</td>
                    <td className="border px-3 py-2 text-right">{row.hraPercentage || 0}%</td>
                    <td className="border px-3 py-2 text-right">{formatNumber(row.hraAmount || 0)}</td>
                    <td className="border px-3 py-2 text-right">{row.workingDays || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!selectedTeacher && (
        <div className="text-center py-8 text-gray-500">
          Please select a teacher to generate the Paid HRA Report.
        </div>
      )}
    </div>
  );
};

export default PaidHRAReport; 
