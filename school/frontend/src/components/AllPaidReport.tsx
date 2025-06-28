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
  daPercentage?: number;
  daAmount?: number;
  hraPercentage?: number;
  hraAmount?: number;
  paidTotal?: number;
  workingDays?: number;
  // Alternative field names from API
  mbasic_amount?: number;
  grade_pay?: number;
  total_amount?: number;
}

const AllPaidReport: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [summary, setSummary] = useState({
    totalBasic: 0,
    totalGradePay: 0,
    totalDA: 0,
    totalHRA: 0,
    grandTotal: 0
  });

  console.log('AllPaidReport component rendering...');

  // Load city name from session on component mount
  useEffect(() => {
    console.log('AllPaidReport: Loading session...');
    try {
      const session = localStorage.getItem('schoolLoginSession');
      console.log('AllPaidReport: Session data:', session);
      
      if (session) {
        const sessionData = JSON.parse(session);
        console.log('AllPaidReport: Parsed session data:', sessionData);
        
        if (sessionData.cityName) {
          setCityName(sessionData.cityName);
          console.log('AllPaidReport: City loaded:', sessionData.cityName);
        } else {
          console.log('AllPaidReport: No city name in session');
          setError('No city information found. Please login again.');
        }
      } else {
        console.log('AllPaidReport: No session found');
        setError('No session found. Please login again.');
      }
    } catch (error) {
      console.error('AllPaidReport: Error parsing session:', error);
      setError('Invalid session. Please login again.');
    }
  }, []);

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
    if (!cityName) {
      console.log('AllPaidReport: No city name, skipping teacher load');
      return;
    }
    
    console.log('AllPaidReport: Loading teachers for city:', cityName);
    
    try {
      const response = await fetch(`http://localhost:4001/api/teachers?cityName=${encodeURIComponent(cityName)}`);
      const result = await response.json();
      
      console.log('AllPaidReport: Teachers API response:', result);
      
      if (result.success) {
        setTeachers(result.data);
        console.log('AllPaidReport: Teachers loaded:', result.data.length);
      } else {
        console.error('AllPaidReport: Failed to load teachers:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('AllPaidReport: Error loading teachers:', error);
      setError('Failed to load teachers');
    }
  };

  // Calculate report
  const calculateReport = async () => {
    if (!selectedTeacher) {
      console.log('AllPaidReport: No teacher selected for calculation');
      return;
    }
    
    console.log('AllPaidReport: Calculating report for teacher:', selectedTeacher);
    setLoading(true);
    setError(null);
    
    try {
      const cacheBuster = `&t=${new Date().getTime()}`;
      const response = await fetch(`http://localhost:4001/api/reports/all-paid/calculate?cacheBuster=true${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId: selectedTeacher }),
      });
      
      const result = await response.json();
      console.log('AllPaidReport: Calculate API response:', result);
      
      if (result.success) {
        setReportData(result.data);
        calculateSummary(result.data);
        console.log('AllPaidReport: Report calculated successfully');
      } else {
        console.error('AllPaidReport: Calculate failed:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('AllPaidReport: Error calculating report:', error);
      setError('Failed to calculate report');
    } finally {
      setLoading(false);
    }
  };

  // Load existing report
  const loadReport = async () => {
    if (!selectedTeacher) {
      console.log('AllPaidReport: No teacher selected for report load');
      return;
    }
    
    console.log('AllPaidReport: Loading report for teacher:', selectedTeacher);
    
    try {
      const response = await fetch(`http://localhost:4001/api/reports/all-paid/${selectedTeacher}`);
      const result = await response.json();
      
      console.log('AllPaidReport: Load report API response:', result);
      
      if (result.success) {
        setReportData(result.data);
        calculateSummary(result.data);
        console.log('AllPaidReport: Report loaded successfully');
      } else {
        console.error('AllPaidReport: Load report failed:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('AllPaidReport: Error loading report:', error);
      setError('Failed to load report');
    }
  };

  const calculateSummary = (data: ReportRow[]) => {
    console.log('AllPaidReport: Calculating summary for data:', data);
    
    const totalBasic = data.reduce((sum, row) => sum + (row.basic || 0), 0);
    const totalGradePay = data.reduce((sum, row) => sum + (row.gredpay || 0), 0);
    const totalDA = data.reduce((sum, row) => sum + (row.daAmount || 0), 0);
    const totalHRA = data.reduce((sum, row) => sum + (row.hraAmount || 0), 0);
    const grandTotal = data.reduce((sum, row) => sum + (row.paidTotal || 0), 0);

    setSummary({
      totalBasic,
      totalGradePay,
      totalDA,
      totalHRA,
      grandTotal
    });
    
    console.log('AllPaidReport: Summary calculated:', { totalBasic, totalGradePay, totalDA, totalHRA, grandTotal });
  };

  useEffect(() => {
    if (cityName) {
      console.log('AllPaidReport: City name changed, loading teachers...');
      loadTeachers();
    }
  }, [cityName]);

  useEffect(() => {
    if (selectedTeacher) {
      console.log('AllPaidReport: Teacher selected, loading report...');
      loadReport();
    }
  }, [selectedTeacher]);

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString('en-IN');
  };

  console.log('AllPaidReport: Render state:', { 
    cityName, 
    teachersCount: teachers.length, 
    selectedTeacher, 
    reportDataCount: reportData.length,
    error,
    loading 
  });

  console.log('AllPaidReport: Rendering main component...');

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-600">
          All Paid Report
        </h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Teacher:
        </label>
        <select
          value={selectedTeacher || ''}
          onChange={(e) => setSelectedTeacher(Number(e.target.value) || null)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a teacher...</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name} ({teacher.city_name})
            </option>
          ))}
        </select>
      </div>

      {selectedTeacher && (
        <div className="mb-6">
          <button
            onClick={calculateReport}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Report'}
          </button>
        </div>
      )}

      {reportData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Month/Year</th>
                <th className="border border-gray-300 px-4 py-2">Basic</th>
                <th className="border border-gray-300 px-4 py-2">Grade Pay</th>
                <th className="border border-gray-300 px-4 py-2">DA Amount</th>
                <th className="border border-gray-300 px-4 py-2">HRA Amount</th>
                <th className="border border-gray-300 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {getMonthName(row.month)} {row.year}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatNumber(row.basic || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatNumber(row.gredpay || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatNumber(row.daAmount || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {formatNumber(row.hraAmount || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                    {formatNumber(row.paidTotal || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Basic</p>
                <p className="text-lg font-bold">{formatNumber(summary.totalBasic)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Grade Pay</p>
                <p className="text-lg font-bold">{formatNumber(summary.totalGradePay)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total DA</p>
                <p className="text-lg font-bold">{formatNumber(summary.totalDA)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total HRA</p>
                <p className="text-lg font-bold">{formatNumber(summary.totalHRA)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grand Total</p>
                <p className="text-lg font-bold text-green-600">{formatNumber(summary.grandTotal)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPaidReport; 

