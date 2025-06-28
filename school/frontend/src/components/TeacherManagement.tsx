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
  
  const cityId = localStorage.getItem('schoolCityId');
  const cityName = localStorage.getItem('schoolCityName') || 'Unknown City';

  useEffect(() => {
    if (!cityId) {
      setError('No city selected. Please login again.');
      setIsLoading(false);
      // Optional: Redirect to dashboard or login page
      navigate('/dashboard'); 
      return;
    }

    const fetchTeachers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:4001/api/teachers?cityName=${encodeURIComponent(cityName)}`);
        const data = await response.json();
        if (data.success) {
          setTeachers(data.data);
        } else {
          setError(data.error || 'Failed to fetch teachers.');
        }
      } catch (err) {
        setError('Could not connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, [cityId, navigate]);

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
          {error && <p className="text-center text-red-500">{error}</p>}
          
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