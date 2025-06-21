import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import { API_URL } from '../../config';

interface Category {
  id: number;
  category_name: string;
}

interface Item {
  id: number;
  item_code: string;
  product_name: string;
  company_name: string;
  model: string;
  mrp: number;
  item_name: string;
  gst_percentage: number;
  company_barcode: string;
  barcode_2: string;
  opening_stock: number;
  opening_cost: number;
  current_stock: number;
  category_id: number;
  category_name: string;
  created_at?: string;
}

interface PurchaseItem {
  id: number;
  item_id: number;
}

const ItemList = () => {
  const navigate = useNavigate();
  const showAlert = useAppStore((state) => state.showAlert);
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  
  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchPurchaseItems();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL.CATEGORIES);
      setCategories(res.data);
    } catch (error) {
      // ignore
    }
  };
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL.ITEMS);
      setItems(res.data);
    } catch (error) {
      showAlert('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPurchaseItems = async () => {
    try {
      const res = await axios.get(API_URL.PURCHASE_ITEMS);
      setPurchaseItems(res.data);
    } catch (error) {
      // ignore
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value ? parseInt(value) : null);
  };
  
  const filteredItems = items.filter(item => {
    // Apply search filter
    const matchesSearch = 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.company_barcode && item.company_barcode.includes(searchTerm));
    
    // Apply category filter if selected
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  const viewItem = (item: Item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };
  
  const handleEdit = (item: Item) => {
    console.log("Editing item:", item);
    console.log("Item ID:", item.id, "Type:", typeof item.id);
    
    // Generate the correct URL
    const editUrl = `/forms/item/edit/${item.id}`;
    console.log("Navigating to:", editUrl);
    
    navigate(editUrl);
  };
  
  const confirmDelete = (item: Item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };
  
  const handleDelete = async () => {
    if (!selectedItem) return;
    // Check if this item is used in any purchases
    const usageCount = purchaseItems.filter(pi => pi.item_id === selectedItem.id).length;
    if (usageCount > 0) {
      showAlert(`Cannot delete item. It is used in ${usageCount} purchases.`, 'error');
      setShowDeleteModal(false);
      return;
    }
    try {
      await axios.delete(`${API_URL.ITEMS}/${selectedItem.id}`);
      showAlert('Item deleted successfully', 'success');
      fetchItems();
    } catch (error) {
      showAlert('Failed to delete item', 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };
  
  const handleAddNew = () => {
    navigate('/forms/item');
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Item List</h1>
        <div className="flex gap-2">
          {/* Debug button */}
          <button
            type="button"
            onClick={() => {
              console.log("DEBUG - All items in DB:", axios.get(API_URL.ITEMS));
              console.log("DEBUG - All categories in DB:", axios.get(API_URL.CATEGORIES));
              console.log("DEBUG - localStorage data:", localStorage.getItem('katha_sales_database') ? 'Exists (too large to print)' : 'None');
              alert("Database debugging information logged to console.");
            }}
            className="btn-secondary mr-2"
          >
            Debug DB
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="btn-primary"
          >
            Add New Item
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              className="input pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-600" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                <select
                  className="select"
                  value={selectedCategory || ''}
                  onChange={handleCategoryFilter}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="btn-ghost text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Item Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.mrp.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.current_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => viewItem(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Item
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the item "{selectedItem?.product_name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Item Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Item Code</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.item_code}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.category_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Product Name</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.product_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company Name</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.company_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Model</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.model || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">MRP</p>
                        <p className="mt-1 text-sm text-gray-900">₹{selectedItem.mrp.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">GST %</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.gst_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Stock</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.current_stock}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Company Barcode</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.company_barcode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Secondary Barcode</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedItem.barcode_2 || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Full Item Name</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedItem.item_name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList; 