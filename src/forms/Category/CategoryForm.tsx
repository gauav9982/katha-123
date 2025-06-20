import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/Button';

interface Group {
  id: number;
  group_number: number;
  group_name: string;
}

interface Category {
  id?: number;
  category_number: number;
  category_name: string;
  group_id: number;
}

const API_GROUPS = 'http://168.231.122.33:4000/api/groups';
const API_CATEGORIES = 'http://168.231.122.33:4000/api/categories';
const API_NEXT_CATEGORY_NUMBER = 'http://168.231.122.33:4000/api/categories-next-number';

const CategoryForm = () => {
  const navigate = useNavigate();
  const showAlert = useAppStore((state) => state.showAlert);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [categoryData, setCategoryData] = useState<Category>({
    category_number: 0,
    category_name: '',
    group_id: 0,
  });
  
  const [errors, setErrors] = useState({
    group_id: '',
    category_name: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCategoryNumber, setLastCategoryNumber] = useState(0);
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(API_GROUPS);
        setGroups(res.data);
        if (res.data.length > 0) {
          handleGroupChange(res.data[0].id.toString(), res.data);
        }
      } catch (error) {
        showAlert('Failed to load groups', 'error');
      }
    };
    fetchGroups();
    // eslint-disable-next-line
  }, []);

  const handleGroupChange = (groupId: string, groupList?: Group[]) => {
    const id = parseInt(groupId, 10);
    const groupArr = groupList || groups;
    const group = groupArr.find(g => g.id === id) || null;
    setSelectedGroup(group);
    if (group) {
      setCategoryData(prev => ({
        ...prev,
        group_id: group.id
      }));
      setErrors(prev => ({
        ...prev,
        group_id: ''
      }));
      getLastCategoryNumber(group.id, group.group_number);
    }
  };

  const getLastCategoryNumber = async (groupId: number, groupNumber: number) => {
    try {
      // Use our new API endpoint to get the next category number
      const res = await axios.get(API_NEXT_CATEGORY_NUMBER, {
        params: { group_id: groupId }
      });
      
      const nextNumber = res.data.next_number;
      console.log('Next category number from API:', nextNumber);
      
      setLastCategoryNumber(nextNumber);
      setCategoryData(prev => ({
        ...prev,
        category_number: nextNumber
      }));
    } catch (error) {
      console.error('Error fetching next category number:', error);
      // Fallback logic (original implementation)
      try {
        const res = await axios.get(API_CATEGORIES);
        const categories = res.data.filter((cat: Category) => cat.group_id === groupId);
        
        // Generate number with pattern: groupNumber + sequence
        // For group 1, should go: 11, 12, 13... 19, 110, 111, etc.
        // For group 2, should go: 21, 22, 23... 29, 210, 211, etc.
        // For group 10, should go: 101, 102, 103... 109, 1010, 1011, etc.
        // For group 11, should go: 111, 112, 113... 119, 1110, 1111, etc.
        let nextNumber;
        
        if (categories.length === 0) {
          // No categories yet, start with groupNumber + "1"
          nextNumber = parseInt(groupNumber.toString() + "1");
        } else {
          // Find categories that match our pattern (start with group number)
          const matchingCategories = categories.filter((cat: Category) => {
            const catStr = cat.category_number.toString();
            return catStr.startsWith(groupNumber.toString());
          });
          
          if (matchingCategories.length > 0) {
            // Sort by category number to find the highest
            matchingCategories.sort((a: Category, b: Category) => b.category_number - a.category_number);
            const highestCategoryNumber = matchingCategories[0].category_number;
            
            // Convert to string for analysis
            const highestStr = highestCategoryNumber.toString();
            const groupStr = groupNumber.toString();
            
            // Get the part after the group number
            const suffix = highestStr.substring(groupStr.length);
            
            // Check if we need to transition from 9 to 10 in the sequence
            // This works for all groups including multi-digit groups (10, 11, etc.)
            if (suffix === '9') {
              // We're at the last single digit (e.g., 19, 29, 109, 119), next should use 10 as suffix
              nextNumber = parseInt(groupStr + '10');
            } else {
              // Normal increment
              nextNumber = highestCategoryNumber + 1;
            }
          } else {
            // No matching categories yet, start with groupNumber + "1"
            nextNumber = parseInt(groupNumber.toString() + "1");
          }
        }
        
        setLastCategoryNumber(nextNumber);
        setCategoryData(prev => ({
          ...prev,
          category_number: nextNumber
        }));
      } catch (fallbackError) {
        // Double fallback - just use a basic pattern if everything fails
        const nextNumber = parseInt(groupNumber.toString() + "1");
        setLastCategoryNumber(nextNumber);
      setCategoryData(prev => ({
        ...prev,
          category_number: nextNumber
      }));
      }
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { group_id: '', category_name: '' };
    if (!categoryData.group_id) {
      newErrors.group_id = 'Please select a group';
      valid = false;
    }
    if (!categoryData.category_name.trim()) {
      newErrors.category_name = 'Category name is required';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
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
      await axios.post(API_CATEGORIES, {
        category_number: categoryData.category_number,
        category_name: categoryData.category_name,
        group_id: categoryData.group_id
      });
      showAlert('Category saved successfully!', 'success');
      setCategoryData(prev => ({
        ...prev,
        category_name: '',
        category_number: prev.category_number + 1
      }));
      setLastCategoryNumber(prev => prev + 1);
    } catch (error) {
      showAlert('Failed to save category. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewList = () => {
    navigate('/lists/category-list');
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Form</h1>
        <Button
          onClick={handleViewList}
          variant="secondary"
        >
          View Category List
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="form-control">
              <label htmlFor="group_id" className="label">Group</label>
              <select
                id="group_id"
                name="group_id"
                value={categoryData.group_id || ''}
                onChange={(e) => handleGroupChange(e.target.value)}
                className={`select ${errors.group_id ? 'border-red-500' : ''}`}
              >
                <option value="">Select a Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.group_number} - {group.group_name}
                  </option>
                ))}
              </select>
              {errors.group_id && (
                <p className="text-red-500 text-xs mt-1">{errors.group_id}</p>
              )}
            </div>
            
            <div className="form-control">
              <label htmlFor="category_number" className="label">Category Number</label>
              <input
                type="number"
                id="category_number"
                name="category_number"
                value={categoryData.category_number}
                readOnly
                className="input bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated based on selected group</p>
            </div>
            
            <div className="form-control sm:col-span-2">
              <label htmlFor="category_name" className="label">Category Name</label>
              <input
                type="text"
                id="category_name"
                name="category_name"
                value={categoryData.category_name}
                onChange={handleChange}
                className={`input ${errors.category_name ? 'border-red-500' : ''}`}
                placeholder="Enter category name"
                autoFocus
              />
              {errors.category_name && (
                <p className="text-red-500 text-xs mt-1">{errors.category_name}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              onClick={() => {
                if (selectedGroup) {
                  setCategoryData({
                    category_number: lastCategoryNumber,
                    category_name: '',
                    group_id: selectedGroup.id
                  });
                }
              }}
              variant="ghost"
              className="mr-3"
              disabled={isSubmitting || !selectedGroup}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm; 