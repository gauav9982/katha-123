import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Party {
  id?: number;
  party_name: string;
  party_type: string;
  contact_person: string;
  phone: string;
  address: string;
  opening_balance: number;
  balance_type: string;
  current_balance: number;
}

const PartyForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const isEditMode = Boolean(id);

  const [party, setParty] = useState<Party>({
    party_name: '',
    party_type: 'purchase', // Default to purchase
    contact_person: '',
    phone: '',
    address: '',
    opening_balance: 0,
    balance_type: 'cr', // Default to credit
    current_balance: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If editing, fetch the party data
    if (isEditMode && id) {
      fetchParty();
    }
  }, [id]);

  const fetchParty = async () => {
    try {
      const response = await fetch(`/api/parties/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch party');
      }
      const data = await response.json();
      setParty(data);
    } catch (error) {
      console.error('Error fetching party:', error);
      setErrorMessage('Failed to load party data');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!party.party_name.trim()) {
      newErrors.party_name = 'Party name is required';
    }
    
    if (!party.party_type) {
      newErrors.party_type = 'Party type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParty((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParty((prev) => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParty((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const url = isEditMode ? `/api/parties/${id}` : '/api/parties';
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Set current_balance to opening_balance for new parties
      if (!isEditMode) {
        party.current_balance = party.opening_balance;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(party),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save party');
      }
      
      setSuccessMessage(`Party ${isEditMode ? 'updated' : 'created'} successfully`);
      
      // Navigate back to list after 2 seconds
      setTimeout(() => {
        navigate('/lists/party-list');
      }, 2000);
    } catch (error) {
      console.error('Error saving party:', error);
      setErrorMessage(`Failed to ${isEditMode ? 'update' : 'create'} party`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Party' : 'New Party'}
      </h2>
      
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
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label htmlFor="party_name" className="label">Party Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="party_name"
              name="party_name"
              value={party.party_name}
              onChange={handleChange}
              className={`input ${errors.party_name ? 'border-red-500' : ''}`}
              placeholder="Enter party name"
            />
            {errors.party_name && (
              <p className="text-red-500 text-xs mt-1">{errors.party_name}</p>
            )}
          </div>
          
          <div className="form-control">
            <label htmlFor="party_type" className="label">Party Type <span className="text-red-500">*</span></label>
            <select
              id="party_type"
              name="party_type"
              value={party.party_type}
              onChange={handleChange}
              className={`select ${errors.party_type ? 'border-red-500' : ''}`}
            >
              <option value="purchase">Purchase Party</option>
              <option value="sales">Sales Party</option>
            </select>
            {errors.party_type && (
              <p className="text-red-500 text-xs mt-1">{errors.party_type}</p>
            )}
          </div>
          
          <div className="form-control">
            <label htmlFor="contact_person" className="label">Contact Person</label>
            <input
              type="text"
              id="contact_person"
              name="contact_person"
              value={party.contact_person}
              onChange={handleChange}
              className="input"
              placeholder="Enter contact person name"
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="phone" className="label">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={party.phone}
              onChange={handleChange}
              className="input"
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="form-control md:col-span-2">
            <label htmlFor="address" className="label">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={party.address}
              onChange={handleChange}
              className="input"
              placeholder="Enter address"
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="opening_balance" className="label">Opening Balance</label>
            <input
              type="number"
              id="opening_balance"
              name="opening_balance"
              value={party.opening_balance || ''}
              onChange={handleNumberChange}
              className="input"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div className="form-control">
            <label className="label">Balance Type</label>
            <div className="flex space-x-6 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="balance_type"
                  value="cr"
                  checked={party.balance_type === 'cr'}
                  onChange={handleRadioChange}
                  className="form-radio h-4 w-4 text-primary"
                />
                <span className="ml-2">Credit (CR)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="balance_type"
                  value="dr"
                  checked={party.balance_type === 'dr'}
                  onChange={handleRadioChange}
                  className="form-radio h-4 w-4 text-primary"
                />
                <span className="ml-2">Debit (DR)</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-8 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/lists/party-list')}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Party' : 'Save Party'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartyForm; 