import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import TopBar from './TopBar';

interface DAPercentage {
  id: number;
  month: number;
  year: number;
  da_percentage: number;
  created_at: string;
}

const DAManagement = () => {
  const navigate = useNavigate();
  const [daPercentages, setDAPercentages] = useState<DAPercentage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    month: '',
    year: '',
    daPercentage: ''
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
    fetchDAPercentages();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchDAPercentages = async () => {
    try {
      const response = await fetch('http://localhost:4009/api/da-percentages');
      const data = await response.json();
      if (data.success) {
        setDAPercentages(data.data);
      } else {
        setError(data.error || 'Failed to fetch DA percentages.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.month || !formData.year || formData.daPercentage === '') {
      setError('All fields are required.');
      return;
    }

    try {
      const url = editingId 
        ? `/api/da-percentages/${editingId}`
        : '/api/da-percentages';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: parseInt(formData.month),
          year: parseInt(formData.year),
          daPercentage: parseFloat(formData.daPercentage)
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData({ month: '', year: '', daPercentage: '' });
        setShowAddForm(false);
        setEditingId(null);
        fetchDAPercentages();
        setError('');
        setSuccessMessage('DA percentage saved successfully!');
      } else {
        setError(data.error || 'Failed to save DA percentage.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (item: DAPercentage) => {
    setFormData({
      month: item.month.toString(),
      year: item.year.toString(),
      daPercentage: item.da_percentage.toString()
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    const itemToDelete = daPercentages.find(item => item.id === id);
    if (!itemToDelete) return;
    
    const confirmMessage = `Are you sure you want to delete DA% entry for ${getMonthName(itemToDelete.month)} ${itemToDelete.year} (${itemToDelete.da_percentage}%)?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`http://localhost:4009/api/da-percentages/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchDAPercentages();
        setSuccessMessage('DA percentage deleted successfully!');
      } else {
        setError(data.error || 'Failed to delete DA percentage.');
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
    const nextEntry = daPercentages[index + 1];
    
    if (nextEntry) {
      const nextDate = new Date(nextEntry.year, nextEntry.month - 1, 1);
      const endDate = new Date(nextDate.getTime() - 1); // One day before next entry
      return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else {
      return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Present`;
    }
  };

  const getCurrentDAPercentage = () => {
    if (daPercentages.length === 0) return null;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Find the most recent entry that is effective now
    const currentEntry = daPercentages.find(entry => {
      const entryDate = new Date(entry.year, entry.month - 1, 1);
      const nowDate = new Date(currentYear, currentMonth - 1, 1);
      return entryDate <= nowDate;
    });
    
    return currentEntry || daPercentages[0]; // Return first entry if no current entry found
  };

  const currentDA = getCurrentDAPercentage();

  const exportToCSV = () => {
    if (daPercentages.length === 0) {
      setError('No data to export.');
      return;
    }

    const headers = ['Month', 'Year', 'DA%', 'Effective Period', 'Created Date'];
    const csvData = daPercentages.map((item, index) => [
      getMonthName(item.month),
      item.year,
      `${item.da_percentage}%`,
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
    link.setAttribute('download', `DA_Percentages_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      
      {/* Header */}
      <div className="bg-blue-600 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">DA% Management</h1>
            <p className="text-blue-200">Manage Dearness Allowance percentages</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                setFormData({ month: '', year: '', daPercentage: '' });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add DA%
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        {/* Current DA% Display */}
        {currentDA && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Current DA%</h3>
                <p className="text-blue-600">
                  {getMonthName(currentDA.month)} {currentDA.year} - Present: 
                  <span className="font-bold text-blue-800 ml-2">{currentDA.da_percentage}%</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800">{currentDA.da_percentage}%</div>
                <div className="text-sm text-blue-600">Currently Active</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How DA% Works</h3>
          <p className="text-yellow-700 mb-2">
            DA% (Dearness Allowance) is applied to all teachers based on the month/year you set. 
            Each entry becomes effective from that month and continues until the next entry.
          </p>
          <div className="bg-white p-3 rounded border border-yellow-300">
            <p className="text-sm text-yellow-800 font-medium">Example:</p>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• January 1996: 5% DA% → Effective from Jan 1996 to Feb 2001</li>
              <li>• March 2001: 15% DA% → Effective from Mar 2001 to Present</li>
            </ul>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{daPercentages.length}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {daPercentages.length > 0 ? `${getMonthName(daPercentages[0].month)} ${daPercentages[0].year}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Earliest Entry</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {daPercentages.length > 0 ? `${getMonthName(daPercentages[daPercentages.length - 1].month)} ${daPercentages[daPercentages.length - 1].year}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Latest Entry</div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit DA%' : 'Add New DA%'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DA%</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.daPercentage}
                    onChange={(e) => setFormData({ ...formData, daPercentage: e.target.value })}
                    placeholder="e.g., 5.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    setFormData({ month: '', year: '', daPercentage: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Add'} DA%
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

        {/* DA% List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">DA% List</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by month, year, or %..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading DA percentages...</p>
            </div>
          ) : daPercentages.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No DA percentages found. Add your first DA% entry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DA%</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Period</th>
                    <th className="px-6 py-3 relative">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {daPercentages.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getMonthName(item.month)} {item.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.da_percentage}%
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
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
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

export default DAManagement; 