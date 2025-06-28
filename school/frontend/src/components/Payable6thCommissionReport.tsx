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
  // Alternative field names from API
  xbasic?: number;
  gradePay?: number;
  total?: number;
  yearly_increment_applied?: boolean | number;
}

const Payable6thCommissionReport: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Load teachers for the city
  useEffect(() => {
    if (cityName) {
      loadTeachers();
    }
  }, [cityName]);

  const loadTeachers = async () => {
    try {
      const response = await fetch(`http://localhost:4001/api/teachers?cityName=${encodeURIComponent(cityName)}`);
      const result = await response.json();
      
      if (result.success) {
        setTeachers(result.data);
      } else {
        setError(result.error || 'Failed to load teachers');
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      setError('Failed to load teachers');
    }
  };

  // Load existing report when teacher is selected
  useEffect(() => {
    if (selectedTeacher) {
      loadExistingReport();
    }
  }, [selectedTeacher]);

  const loadExistingReport = async () => {
    if (!selectedTeacher) return;
    
    try {
      const response = await fetch(`http://localhost:4001/api/reports/payable-6th-commission/${selectedTeacher}`);
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.error || 'Failed to load existing report');
      }
    } catch (error) {
      console.error('Error loading existing report:', error);
      setError('Failed to load existing report');
    }
  };

  const calculateReport = async () => {
    if (!selectedTeacher) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:4001/api/reports/payable-6th-commission/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId: selectedTeacher }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        setError(result.error || 'Failed to calculate report');
      }
    } catch (error) {
      console.error('Error calculating report:', error);
      setError('Failed to calculate report');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payable 6th Commission Report
        </h1>
        <p className="text-gray-600">
          Calculate and view payable 6th commission report for teachers
        </p>
      </div>

      {/* City Display */}
      {cityName && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">
            <strong>City:</strong> {cityName}
          </p>
        </div>
      )}

      {/* Teacher Selection */}
      {cityName && teachers.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Teacher
          </label>
          <select
            value={selectedTeacher || ''}
            onChange={(e) => setSelectedTeacher(Number(e.target.value))}
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

      {/* Loading Teachers Message */}
      {cityName && teachers.length === 0 && !error && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded">
          Loading teachers for {cityName}...
        </div>
      )}

      {/* No Teachers Message */}
      {cityName && teachers.length === 0 && error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
          No teachers found for {cityName}. Please add teachers first.
        </div>
      )}

      {/* Calculate Button */}
      {selectedTeacher && (
        <div className="mb-6">
          <button
            onClick={calculateReport}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Calculating...' : 'Calculate Report'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Report Table */}
      {reportData.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Sr.No</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Month</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Basic</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">MBasic</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Grade Pay</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, index) => {
                  // Handle both API response format and database format
                  const basic = row.basic || row.xbasic || 0;
                  const mbasic = row.mbasic || 0;
                  const gradePay = row.grade_pay || row.gradePay || 0;
                  const total = row.total_amount || row.total || 0;
                  
                  const isIncrementRow = row.yearly_increment_applied;
                  const isGradeChangeRow = row.date;

                  let rowClassName = 'hover:bg-gray-50';
                  if (isIncrementRow) {
                    rowClassName = 'bg-yellow-100 hover:bg-yellow-200';
                  } else if (isGradeChangeRow) {
                    rowClassName = 'bg-green-100 hover:bg-green-200';
                  }
                  
                  return (
                    <tr key={row.id || index} className={rowClassName}>
                      <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {row.date || ''}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {getMonthName(row.month)} {row.year}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {Math.round(basic || 0)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {Math.round(mbasic || 0)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {Math.round(gradePay || 0)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        {Math.round(total || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Report Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Months</p>
                <p className="text-xl font-bold">{reportData.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Final Basic</p>
                <p className="text-xl font-bold text-blue-600">
                  {Math.round(reportData[reportData.length - 1]?.basic || reportData[reportData.length - 1]?.xbasic || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Final MBasic</p>
                <p className="text-xl font-bold text-green-600">
                  {Math.round(reportData[reportData.length - 1]?.mbasic || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-purple-600">
                  {Math.round(reportData.reduce((sum, row) => sum + (row.total_amount || row.total || 0), 0))}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Yearly increment is 3% of (Basic + Grade Pay) rounded up to nearest 10, applied every year from the teacher's 6th commission yearly increment date.
              </p>
            </div>
          </div>
        </>
      )}

      {/* No Data Message */}
      {selectedTeacher && reportData.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          No report data available. Click "Calculate Report" to generate the report.
        </div>
      )}
    </div>
  );
};

export default Payable6thCommissionReport; 
