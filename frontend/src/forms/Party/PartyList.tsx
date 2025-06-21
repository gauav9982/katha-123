import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';

interface Party {
  id: number;
  party_name: string;
  party_type: string;
  contact_person: string;
  phone: string;
  address: string;
  opening_balance: number;
  balance_type: string;
  current_balance: number;
}

const PartyList: React.FC = () => {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parties');
      if (!response.ok) {
        throw new Error('Failed to fetch parties');
      }
      const data = await response.json();
      setParties(data);
    } catch (error) {
      console.error('Error fetching parties:', error);
      setErrorMessage('Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this party?')) {
      return;
    }

    try {
      const response = await fetch(`/api/parties/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete party');
      }

      setSuccessMessage('Party deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // Refresh the list
      fetchParties();
    } catch (error) {
      console.error('Error deleting party:', error);
      setErrorMessage('Failed to delete party');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/forms/party?id=${id}`);
  };

  const handleAdd = () => {
    navigate('/forms/party');
  };

  const filteredParties = parties.filter((party) => {
    // Filter by search term
    const matchesSearch = 
      party.party_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (party.contact_person && party.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (party.phone && party.phone.includes(searchTerm));
    
    // Filter by party type if a filter is selected
    const matchesType = filterType ? party.party_type === filterType : true;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Parties</h2>
        <button 
          className="btn-primary flex items-center"
          onClick={handleAdd}
        >
          <FiPlus className="mr-2" />
          Add New Party
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="relative w-3/5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, contact person or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="select w-1/3"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-4">Loading parties...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Party Name</th>
                <th className="text-left">Type</th>
                <th className="text-left">Contact Person</th>
                <th className="text-left">Phone</th>
                <th className="text-right">Current Balance</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">No parties found</td>
                </tr>
              ) : (
                filteredParties.map((party) => (
                  <tr key={party.id} className="border-t">
                    <td className="py-3">{party.party_name}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        party.party_type === 'purchase' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {party.party_type === 'purchase' ? 'Purchase' : 'Sales'}
                      </span>
                    </td>
                    <td>{party.contact_person || '-'}</td>
                    <td>{party.phone || '-'}</td>
                    <td className="text-right">
                      <div className="flex justify-end items-center">
                        <span className={party.current_balance !== 0 ? 'font-bold' : 'font-normal'}>
                          {Math.abs(party.current_balance).toFixed(2)}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          party.current_balance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {party.current_balance > 0 ? 'DR' : 'CR'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(party.id)}
                          className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                          title="Edit"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(party.id)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartyList; 