import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';

interface Group {
  id: number;
  group_number: number;
  group_name: string;
  created_at?: string;
}

interface Category {
  id: number;
  group_id: number;
}

const API_GROUPS = 'http://168.231.122.33:4000/api/groups';
const API_CATEGORIES = 'http://168.231.122.33:4000/api/categories';

const GroupList = () => {
  const navigate = useNavigate();
  const showAlert = useAppStore((state) => state.showAlert);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Group>>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchGroups();
    fetchCategories();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_GROUPS);
      setGroups(res.data);
    } catch (error) {
      showAlert('Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_CATEGORIES);
      setCategories(res.data);
    } catch (error) {
      // ignore
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredGroups = groups.filter(group => 
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.group_number.toString().includes(searchTerm)
  );

  const handleEdit = (group: Group) => {
    setEditMode(true);
    setEditData(group);
  };

  const handleSaveEdit = async () => {
    if (!editData.group_name?.trim()) {
      showAlert('Group name cannot be empty', 'error');
      return;
    }
    try {
      await axios.put(`${API_GROUPS}/${editData.id}`, {
        group_number: editData.group_number,
        group_name: editData.group_name
      });
      showAlert('Group updated successfully', 'success');
      fetchGroups();
      setEditMode(false);
      setEditData({});
    } catch (error) {
      showAlert('Failed to update group', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({});
  };

  const confirmDelete = (group: Group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;
    // Check if this group is used in any category
    const categoryCount = categories.filter(cat => cat.group_id === selectedGroup.id).length;
    if (categoryCount > 0) {
      showAlert(`Cannot delete group. It is used in ${categoryCount} categories.`, 'error');
      setShowDeleteModal(false);
      return;
    }
    try {
      await axios.delete(`${API_GROUPS}/${selectedGroup.id}`);
      showAlert('Group deleted successfully', 'success');
      fetchGroups();
    } catch (error) {
      showAlert('Failed to delete group', 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedGroup(null);
    }
  };

  const handleAddNew = () => {
    navigate('/forms/group');
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Group List</h1>
        <button
          type="button"
          onClick={handleAddNew}
          className="btn-primary"
        >
          Add New Group
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search groups..."
            className="input pl-10"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Group Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No groups found
                  </td>
                </tr>
              ) : (
                filteredGroups.map(group => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {group.group_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editMode && editData.id === group.id ? (
                        <input
                          type="text"
                          className="input py-1 px-2 text-sm"
                          value={editData.group_name || ''}
                          onChange={(e) => setEditData({...editData, group_name: e.target.value})}
                        />
                      ) : (
                        group.group_name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(group.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editMode && editData.id === group.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="text-primary hover:text-primary-dark"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(group)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(group)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Group</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete group "{selectedGroup?.group_name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList; 