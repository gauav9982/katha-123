import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import useAppStore from '../store/useAppStore';

// Define interfaces for the data
interface Group {
  group_id: number;
  group_number: number;
  group_name: string;
  category_count: number;
  item_count: number;
  total_stock: number;
}

interface Category {
  category_id: number;
  category_number: number;
  category_name: string;
  group_id: number;
  group_number: number;
  group_name: string;
  item_count: number;
  total_stock: number;
}

interface Item {
  item_id: number;
  item_code: string;
  item_name: string;
  current_stock: number;
  mrp: number;
  gst_percentage: number;
  category_id: number;
  category_number: number;
  category_name: string;
  group_id: number;
  group_number: number;
  group_name: string;
  opening_cost: number;
  last_purchase_date?: string;
  last_purchase_cost?: number;
}

const StockReport = () => {
  const showAlert = useAppStore((state) => state.showAlert);
  
  // State variables
  const [activeTab, setActiveTab] = useState<'group' | 'category' | 'item'>('group');
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsWithPurchaseInfo, setItemsWithPurchaseInfo] = useState<any[]>([]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchGroupData();
  }, []);
  
  // Effect for fetching category data when a group is selected
  useEffect(() => {
    if (selectedGroupId) {
      fetchCategoryData(selectedGroupId);
    } else if (activeTab === 'category') {
      fetchCategoryData();
    }
  }, [selectedGroupId, activeTab]);
  
  // Effect for fetching item data when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      fetchItemData(selectedCategoryId);
    } else if (selectedGroupId && activeTab === 'item') {
      fetchItemData(null, selectedGroupId);
    } else if (activeTab === 'item') {
      fetchItemData();
    }
  }, [selectedCategoryId, selectedGroupId, activeTab]);
  
  // Effect for getting last purchase details when items change
  useEffect(() => {
    if (items.length > 0) {
      fetchLastPurchaseDetails();
    }
  }, [items]);
  
  // Fetch functions
  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL.REPORTS.STOCK_BY_GROUP);
      setGroups(response.data);
    } catch (error) {
      showAlert('Failed to load group stock data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategoryData = async (groupId?: number) => {
    setLoading(true);
    try {
      let url = API_URL.REPORTS.STOCK_BY_CATEGORY;
      if (groupId) {
        url += `?group_id=${groupId}`;
      }
      const response = await axios.get(url);
      setCategories(response.data);
    } catch (error) {
      showAlert('Failed to load category stock data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchItemData = async (categoryId?: number | null, groupId?: number | null) => {
    setLoading(true);
    try {
      let url = API_URL.REPORTS.STOCK_BY_ITEM;
      const params = [];
      
      if (categoryId) {
        params.push(`category_id=${categoryId}`);
      }
      
      if (groupId) {
        params.push(`group_id=${groupId}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await axios.get(url);
      setItems(response.data);
    } catch (error) {
      showAlert('Failed to load item stock data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch last purchase details for all items
  const fetchLastPurchaseDetails = async () => {
    try {
      const itemsWithPurchase = await Promise.all(
        items.map(async (item) => {
          try {
            // Use the correct endpoint for last purchase details
            const response = await axios.get(`${API_URL.BASE}/last-purchase-by-code?item_code=${item.item_code}`);
            
            return {
              ...item,
              last_purchase_date: response.data.lastPurchaseDate || 'No purchase',
              last_purchase_cost: response.data.lastCost || item.opening_cost || 0
            };
          } catch (error) {
            // If API fails, use item's opening cost
            return {
              ...item,
              last_purchase_date: 'No purchase',
              last_purchase_cost: item.opening_cost || 0
            };
          }
        })
      );
      
      setItemsWithPurchaseInfo(itemsWithPurchase);
    } catch (error) {
      showAlert('Failed to load purchase details', 'error');
    }
  };
  
  const fetchLastPurchase = async (item: any) => {
    try {
      const response = await axios.get(`${API_URL.BASE}/last-purchase-by-code?item_code=${item.item_code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching last purchase:', error);
      return null;
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: 'group' | 'category' | 'item') => {
    setActiveTab(tab);
  };
  
  // Handle group click
  const handleGroupClick = (groupId: number) => {
    setSelectedGroupId(groupId);
    setSelectedCategoryId(null);
    setActiveTab('category');
  };
  
  // Handle category click
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setActiveTab('item');
  };
  
  // Handle back button click
  const handleBackClick = () => {
    if (activeTab === 'item' && selectedCategoryId) {
      setSelectedCategoryId(null);
      setActiveTab('category');
    } else if (activeTab === 'category' && selectedGroupId) {
      setSelectedGroupId(null);
      setActiveTab('group');
    }
  };
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter items based on search query
  const filteredItems = searchQuery 
    ? itemsWithPurchaseInfo.filter(item => 
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : itemsWithPurchaseInfo;
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Report</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => handleTabChange('group')}
            className={`px-4 py-2 rounded ${activeTab === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            By Group
          </button>
          <button
            onClick={() => handleTabChange('category')}
            className={`px-4 py-2 rounded ${activeTab === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            By Category
          </button>
          <button
            onClick={() => handleTabChange('item')}
            className={`px-4 py-2 rounded ${activeTab === 'item' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            By Item
          </button>
        </div>
      </div>
      
      {/* Search Box - Only show for items view */}
      {activeTab === 'item' && (
        <div className="mb-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search items by name, code, category or group..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Breadcrumbs / Filter Info */}
      {(selectedGroupId || selectedCategoryId) && (
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <button 
            onClick={handleBackClick}
            className="text-blue-600 hover:text-blue-800 mr-2"
          >
            &larr; Back
          </button>
          
          {selectedGroupId && (
            <span>
              Filtered by Group: {groups.find(g => g.group_id === selectedGroupId)?.group_name}
              {selectedCategoryId && (
                <span>
                  {' > '}
                  Category: {categories.find(c => c.category_id === selectedCategoryId)?.category_name}
                </span>
              )}
            </span>
          )}
        </div>
      )}
      
      {/* Data Tables */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <>
            {/* Group Data */}
            {activeTab === 'group' && (
              <table className="min-w-full divide-y divide-gray-200" key="group-table">
                <thead className="bg-gray-50" key="group-thead">
                  <tr key="group-header-row">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200" key="group-tbody">
                  {groups.length === 0
                    ? [
                        <tr key="no-groups-data">
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                        </tr>
                      ] as React.ReactElement<any, any>[]
                    : groups.map((group) => (
                        <tr
                          key={group.group_id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleGroupClick(group.group_id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.group_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.group_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.category_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.item_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.total_stock}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            )}
            
            {/* Category Data */}
            {activeTab === 'category' && (
              <table className="min-w-full divide-y divide-gray-200" key="category-table">
                <thead className="bg-gray-50" key="category-thead">
                  <tr key="category-header-row">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200" key="category-tbody">
                  {categories.length === 0
                    ? [
                        <tr key="no-categories-data">
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                        </tr>
                      ] as React.ReactElement<any, any>[]
                    : categories.map((category) => (
                        <tr
                          key={category.category_id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCategoryClick(category.category_id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.category_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.group_name} ({category.group_number})</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.item_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.total_stock}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            )}
            
            {/* Item Data - Enhanced with additional columns */}
            {activeTab === 'item' && (
              <div className="overflow-x-auto" key="item-container">
                <table className="min-w-full divide-y divide-gray-200" key="item-table">
                  <thead className="bg-gray-50" key="item-thead">
                    <tr key="item-header-row">
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.No</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST%</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Purchase Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Item Cost</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200" key="item-tbody">
                    {filteredItems.length === 0
                      ? [
                          <tr key="no-items-data">
                            <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
                          </tr>
                        ] as React.ReactElement<any, any>[]
                      : filteredItems.map((item, index) => (
                          <tr key={item.item_id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.item_code}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.item_name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.group_name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.category_name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{item.mrp.toFixed(2)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.gst_percentage || 0}%</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.last_purchase_date || 'No purchase'}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{(item.last_purchase_cost || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.current_stock}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StockReport; 