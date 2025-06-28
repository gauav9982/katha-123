import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import TopBar from './TopBar';

interface Teacher {
  id: string;
  name: string;
  cityId: string;
  teacher_id?: string;
}

interface LWPRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  leaveType: 'LWP' | 'HLWP';
  month: number;
  year: number;
  day: number;
  createdAt: string;
}

const LWPManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [leaveType, setLeaveType] = useState<'LWP' | 'HLWP'>('LWP');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [day, setDay] = useState<number>(1);
  const [lwpRecords, setLwpRecords] = useState<LWPRecord[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchLWPRecords();
  }, []);

  const fetchTeachers = async () => {
    try {
      const session = localStorage.getItem('schoolLoginSession');
      if (!session) return;

      const sessionData = JSON.parse(session);
      const cityName = sessionData.cityName;

      console.log('LWPManagement: Fetching teachers for city:', cityName);

      // Fetch teachers by city name from the backend API
      const response = await fetch(`http://localhost:4001/api/teachers?cityName=${encodeURIComponent(cityName)}`);
      const data = await response.json();

      console.log('Teachers API response:', data);

      if (data.success) {
        setTeachers(data.data);
        console.log('Teachers loaded:', data.data.length);
        if (data.data.length > 0) {
          console.log('First teacher:', data.data[0]);
        }
      } else {
        setError('Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to fetch teachers');
    }
  };

  const fetchLWPRecords = async () => {
    try {
      const session = localStorage.getItem('schoolLoginSession');
      if (!session) return;

      const sessionData = JSON.parse(session);
      const cityName = sessionData.cityName;

      console.log('LWPManagement: Fetching LWP records for city:', cityName);

      const response = await fetch(`http://localhost:4001/api/lwp-records?cityName=${encodeURIComponent(cityName)}`);
      const data = await response.json();

      if (data.success) {
        setLwpRecords(data.data);
        console.log('LWPManagement: LWP records loaded:', data.data.length);
      } else {
        setError('Failed to fetch LWP records');
      }
    } catch (error) {
      console.error('Error fetching LWP records:', error);
      setError('Failed to fetch LWP records');
    }
  };

  const handleAddLWP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('=== DEBUG INFO ===');
    console.log('Teachers array:', teachers);
    console.log('Teachers length:', teachers.length);
    console.log('Selected teacher value:', selectedTeacher);
    console.log('Selected teacher type:', typeof selectedTeacher);
    
    if (teachers.length > 0) {
      console.log('First teacher object:', teachers[0]);
      console.log('First teacher keys:', Object.keys(teachers[0]));
      console.log('First teacher id:', teachers[0].id);
      console.log('First teacher teacher_id:', teachers[0].teacher_id);
    }
    
    console.log('=== END DEBUG ===');

    if (!selectedTeacher) {
      setError('Please select a teacher');
      setIsLoading(false);
      return;
    }

    if (day < 1 || day > 31) {
      setError('Please enter a valid day (1-31)');
      setIsLoading(false);
      return;
    }

    try {
      // Universal: support both id and teacher_id, handle string/number types
      const selectedTeacherData = teachers.find(t => {
        const teacherId = t.id || t.teacher_id;
        return teacherId == selectedTeacher || teacherId === selectedTeacher;
      });
      console.log('Found teacher data:', selectedTeacherData);
      
      if (!selectedTeacherData) {
        setError('Selected teacher not found');
        setIsLoading(false);
        return;
      }

      const teacherId = selectedTeacherData.id || selectedTeacherData.teacher_id;
      const teacherName = selectedTeacherData.name;

      const response = await fetch('http://localhost:4001/api/lwp-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          teacherName,
          leaveType,
          month,
          year,
          day
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`${leaveType} record added successfully!`);
        setSelectedTeacher('');
        setDay(1);
        fetchLWPRecords();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to add LWP record');
      }
    } catch (error) {
      console.error('Error adding LWP record:', error);
      setError('Failed to add LWP record');
    }

    setIsLoading(false);
  };

  const handleDeleteLWP = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`http://localhost:4001/api/lwp-records/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('LWP record deleted successfully!');
        fetchLWPRecords();
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to delete LWP record');
      }
    } catch (error) {
      console.error('Error deleting LWP record:', error);
      setError('Failed to delete LWP record');
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getFilteredRecords = () => {
    return lwpRecords.filter(record => {
      const recordDate = new Date(record.year, record.month - 1, record.day);
      const selectedDate = new Date(year, month - 1, day);
      return record.month === month && record.year === year;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TopBar */}
      <TopBar />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">LWP & HLWP Management</h1>
                <p className="text-gray-600 mt-2">Manage Leave Without Pay and Half Leave Without Pay records</p>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-600">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add LWP/HLWP Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Record</h2>
              
              <form onSubmit={handleAddLWP} className="space-y-6">
                {/* Teacher Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Teacher
                  </label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id || teacher.teacher_id} value={teacher.id || teacher.teacher_id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leave Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="LWP"
                        checked={leaveType === 'LWP'}
                        onChange={(e) => setLeaveType(e.target.value as 'LWP' | 'HLWP')}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">LWP (Leave Without Pay)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="HLWP"
                        checked={leaveType === 'HLWP'}
                        onChange={(e) => setLeaveType(e.target.value as 'LWP' | 'HLWP')}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">HLWP (Half Leave Without Pay)</span>
                    </label>
                  </div>
                </div>

                {/* Month/Year and Day */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month/Year
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {getMonthName(m)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day
                    </label>
                    <input
                      type="number"
                      value={day}
                      onChange={(e) => setDay(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1-31"
                      min="1"
                      max="31"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add {leaveType} Record
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Current Month Records */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Records for {getMonthName(month)} {year}
              </h2>
              
              {getFilteredRecords().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No records found for this month</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredRecords().map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.leaveType === 'LWP' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {record.leaveType}
                          </span>
                          <span className="font-medium text-gray-800">{record.teacherName}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Day {record.day} • {getMonthName(record.month)} {record.year}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteLWP(record.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Records Table */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">All Records</h2>
            
            {lwpRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No LWP/HLWP records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lwpRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.teacherName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.leaveType === 'LWP' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {record.leaveType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getMonthName(record.month)} {record.day}, {record.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteLWP(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LWPManagement; 