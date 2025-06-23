import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import TopBar from './TopBar';

interface HRAPercentage {
  id: number;
  month: number;
  year: number;
  hra_percentage: number;
  created_at: string;
}

const HRAManagement = () => {
  const navigate = useNavigate();
  const [hraPercentages, setHRAPercentages] = useState<HRAPercentage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    month: '',
    year: '',
    hraPercentage: ''
  });

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  useEffect(() => {
    fetchHRAPercentages();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    console.log('hraPercentages:', hraPercentages);
  }, [hraPercentages]);

  const fetchHRAPercentages = async () => {
    try {
      const response = await fetch('http://localhost:4009/api/hra-percentages');
      const data = await response.json();
      if (data.success) {
        setHRAPercentages(data.data);
      } else {
        setError(data.error || 'Failed to fetch HRA percentages.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.month || !formData.year || formData.hraPercentage === '') {
      setError('All fields are required.');
      return;
    }

    try {
      const url = editingId 
        ? `/api/hra-percentages/${editingId}`
        : '/api/hra-percentages';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: parseInt(formData.month),
          year: parseInt(formData.year),
          hraPercentage: parseFloat(formData.hraPercentage)
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData({ month: '', year: '', hraPercentage: '' });
        setShowAddForm(false);
        setEditingId(null);
        fetchHRAPercentages();
        setError('');
        setSuccessMessage('HRA percentage saved successfully!');
      } else {
        setError(data.error || 'Failed to save HRA percentage.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (item: HRAPercentage) => {
    setFormData({
      month: item.month.toString(),
      year: item.year.toString(),
      hraPercentage: item.hra_percentage.toString()
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    const itemToDelete = hraPercentages.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const confirmMessage = `Are you sure you want to delete HRA% entry for ${getMonthName(itemToDelete.month)} ${itemToDelete.year} (${itemToDelete.hra_percentage}%)?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`http://localhost:4009/api/hra-percentages/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchHRAPercentages();
        setSuccessMessage('HRA percentage deleted successfully!');
      } else {
        setError(data.error || 'Failed to delete HRA percentage.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getMonthName = (month: number) => {
    return months.find(m => m.value === month)?.name || 'Unknown';
  };

  const getEffectivePeriod = (month: number, year: number, index: number) => {
    const currentDate = new Date(year, month - 1, 1);
    const nextEntry = hraPercentages[index + 1];
    
    if (nextEntry) {
      const nextDate = new Date(nextEntry.year, nextEntry.month - 1, 1);
      const endDate = new Date(nextDate.getTime() - 1); // One day before next entry
      return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else {
      return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Present`;
    }
  };

  const getCurrentHRAPercentage = () => {
    if (hraPercentages.length === 0) return null;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Find the most recent entry that is effective now
    const currentEntry = hraPercentages.find(entry => {
      const entryDate = new Date(entry.year, entry.month - 1, 1);
      const nowDate = new Date(currentYear, currentMonth - 1, 1);
      return entryDate <= nowDate;
    });
    
    return currentEntry || hraPercentages[0]; // Return first entry if no current entry found
  };

  const currentHRA = getCurrentHRAPercentage();

  const exportToCSV = () => {
    if (hraPercentages.length === 0) {
      setError('No data to export.');
      return;
    }

    const headers = ['Month', 'Year', 'HRA%', 'Effective Period', 'Created Date'];
    const csvData = hraPercentages.map((item, index) => [
      getMonthName(item.month),
      item.year,
      `${item.hra_percentage}%`,
      getEffectivePeriod(item.month, item.year, index),
      new Date(item.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `HRA_Percentages_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      
      {/* Header */}
      <div className="bg-green-600 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">HRA% Management</h1>
            <p className="text-green-200">Manage House Rent Allowance percentages</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ month: '', year: '', hraPercentage: '' });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add HRA%
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        {/* Current HRA% Display */}
        {currentHRA && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">Current HRA%</h3>
                <p className="text-green-600">
                  {getMonthName(currentHRA.month)} {currentHRA.year} - Present: 
                  <span className="font-bold text-green-800 ml-2">{currentHRA.hra_percentage}%</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">{currentHRA.hra_percentage}%</div>
                <div className="text-sm text-green-600">Currently Active</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How HRA% Works</h3>
          <p className="text-yellow-700 mb-2">
            HRA% (House Rent Allowance) is applied to all teachers based on the month/year you set. 
            Each entry becomes effective from that month and continues until the next entry.
          </p>
          <div className="bg-white p-3 rounded border border-yellow-300">
            <p className="text-sm text-yellow-800 font-medium">Example:</p>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• January 1996: 8% HRA% → Effective from Jan 1996 to Feb 2001</li>
              <li>• March 2001: 12% HRA% → Effective from Mar 2001 to Present</li>
            </ul>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{hraPercentages.length}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {hraPercentages.length > 0 ? `${getMonthName(hraPercentages[0].month)} ${hraPercentages[0].year}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Earliest Entry</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {hraPercentages.length > 0 ? `${getMonthName(hraPercentages[hraPercentages.length - 1].month)} ${hraPercentages[hraPercentages.length - 1].year}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Latest Entry</div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit HRA%' : 'Add New HRA%'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g., 2024"
                    min="1900"
                    max="2100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HRA%</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.hraPercentage}
                    onChange={(e) => setFormData({ ...formData, hraPercentage: e.target.value })}
                    placeholder="e.g., 8.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({ month: '', year: '', hraPercentage: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingId ? 'Update' : 'Add'} HRA%
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* HRA% List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">HRA% List</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading HRA percentages...</p>
            </div>
          ) : hraPercentages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No HRA percentages found. Add your first HRA% entry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HRA%</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Period</th>
                    <th className="px-6 py-3 relative">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hraPercentages.map((item, index) => (
                    <tr key={item.id ?? `${item.month}-${item.year}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getMonthName(item.month)} {item.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.hra_percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getEffectivePeriod(item.month, item.year, index)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
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
  );
};

export default HRAManagement; 