import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAppStore from '../../store/useAppStore';

interface Group {
  id?: number;
  group_number: number;
  group_name: string;
}

const API_URL = 'http://168.231.122.33:4000/api/groups';

const GroupForm = () => {
  const navigate = useNavigate();
  const showAlert = useAppStore((state) => state.showAlert);
  
  const [groupData, setGroupData] = useState<Group>({
    group_number: 0,
    group_name: '',
  });
  
  const [errors, setErrors] = useState({
    group_name: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastGroupNumber, setLastGroupNumber] = useState(0);
  
  useEffect(() => {
    const getLastGroupNumber = async () => {
      try {
        const res = await axios.get(API_URL);
        const groups = res.data;
        let lastNumber = 0;
        if (groups.length > 0) {
          lastNumber = Math.max(...groups.map((g: Group) => g.group_number));
        }
        setLastGroupNumber(lastNumber);
        setGroupData(prev => ({
          ...prev,
          group_number: lastNumber + 1
        }));
      } catch (error) {
        setGroupData(prev => ({
          ...prev,
          group_number: 1
        }));
      }
    };
    getLastGroupNumber();
  }, []);
  
  const validateForm = () => {
    let valid = true;
    const newErrors = { group_name: '' };
    
    if (!groupData.group_name.trim()) {
      newErrors.group_name = 'Group name is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGroupData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await axios.post(API_URL, {
        group_number: groupData.group_number,
        group_name: groupData.group_name
      });
      
      // Show success alert
      showAlert('Group saved successfully!', 'success');
      
      // Reset form for next entry
      setGroupData({
        group_number: groupData.group_number + 1,
        group_name: ''
      });
      
      setLastGroupNumber(prev => prev + 1);
    } catch (error) {
      console.error('Error saving group:', error);
      showAlert('Failed to save group. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewList = () => {
    navigate('/lists/group-list');
  };
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Group Form</h1>
        <button
          type="button"
          onClick={handleViewList}
          className="btn-secondary"
        >
          View Group List
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="form-control">
              <label htmlFor="group_number" className="label">Group Number</label>
              <input
                type="number"
                id="group_number"
                name="group_number"
                value={groupData.group_number}
                readOnly
                className="input bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated number</p>
            </div>
            
            <div className="form-control">
              <label htmlFor="group_name" className="label">Group Name</label>
              <input
                type="text"
                id="group_name"
                name="group_name"
                value={groupData.group_name}
                onChange={handleChange}
                className={`input ${errors.group_name ? 'border-red-500' : ''}`}
                placeholder="Enter group name"
                autoFocus
              />
              {errors.group_name && (
                <p className="text-red-500 text-xs mt-1">{errors.group_name}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setGroupData({
                  group_number: lastGroupNumber + 1,
                  group_name: ''
                });
              }}
              className="btn-ghost mr-3"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupForm; 