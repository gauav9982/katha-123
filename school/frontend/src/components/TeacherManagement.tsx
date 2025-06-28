import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, UserPlusIcon, ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import TopBar from './TopBar';

interface Teacher {
  id: number;
  name: string;
  joining_date: string;
  birthday: string;
  status: string;
}

const TeacherManagement = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Set default city if not present
  if (!localStorage.getItem('schoolCityId')) {
    localStorage.setItem('schoolCityId', '46'); // cityId for Nadiad
  }
  if (!localStorage.getItem('schoolCityName')) {
    localStorage.setItem('schoolCityName', 'Nadiad');
  }
  
  const cityId = localStorage.getItem('schoolCityId');
  const cityName = localStorage.getItem('schoolCityName') || 'Nadiad';

  useEffect(() => {
    if (!cityId) {
      setError('No city selected. Please login again.');
      setIsLoading(false);
      navigate('/dashboard');
      return;
    }

    const fetchTeachers = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Improved API URL logic
        let apiBase = '/api';
        if (window.location.hostname === 'localhost') {
          apiBase = 'http://localhost:4001/api';
        } else if (window.location.pathname.startsWith('/school-app')) {
          apiBase = '/school-app/api';
        }
        
        console.log('Fetching teachers from:', `${apiBase}/teachers?cityName=${encodeURIComponent(cityName)}`);
        
        const response = await fetch(`${apiBase}/teachers?cityName=${encodeURIComponent(cityName)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success) {
          setTeachers(data.data);
        } else {
          setError(data.error || 'Failed to fetch teachers.');
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Could not connect to the server. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, [cityId, cityName, navigate]);

  const handleEdit = (teacherId) => {
    // Navigate to edit page
    navigate(`/teachers/edit/${teacherId}`);
  };

  const handleDelete = (teacherId) => {
    // Handle delete logic (to be implemented)
    console.log(`Delete teacher ${teacherId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      {/* Header */}
      <div className="bg-blue-600 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Teacher Management</h1>
            <p className="text-blue-200">City: {cityName}</p>
          </div>
          <button
            onClick={() => navigate('/teachers/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4 md:p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {isLoading && <p className="text-center text-gray-500">Loading teachers...</p>}
          {error && (
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}
          
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birthday</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.length > 0 ? (
                    teachers.map((teacher: Teacher) => (
                      <tr key={teacher.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.joining_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.birthday}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => handleEdit(teacher.id)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No teachers found for this city.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement; 