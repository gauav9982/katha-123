import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import useAppStore from '../store/useAppStore';

interface Item {
  id: number;
  item_code: string;
  item_name: string;
  company_barcode: string;
  barcode_2: string;
  mrp: number;
  gst_percentage: number;
  current_stock: number;
}

interface LastPurchaseInfo {
  lastPurchaseDate: string;
  lastCost: number;
}

const ItemQuickSearch = () => {
  const showAlert = useAppStore((state) => state.showAlert);
  
  // State variables
  const [codeSearchValue, setCodeSearchValue] = useState('');
  const [nameSearchValue, setNameSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [lastPurchaseInfo, setLastPurchaseInfo] = useState<LastPurchaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Search by item code or barcode
  const searchByCode = async () => {
    if (!codeSearchValue.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL.BASE}/item-exact?code=${codeSearchValue}`);
      
      // API returns item with lastPurchase details
      if (response.data && response.data.item) {
        setSelectedItem(response.data.item);
        setLastPurchaseInfo({
          lastPurchaseDate: response.data.lastPurchaseDate || 'No purchase',
          lastCost: response.data.lastCost || 0
        });
        setNameSearchValue(response.data.item.item_name);
        setShowResults(false);
      }
    } catch (error) {
      showAlert('Item not found with this code', 'error');
      setSelectedItem(null);
      setLastPurchaseInfo(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Search by item name
  const searchByName = async () => {
    if (!nameSearchValue.trim() || nameSearchValue.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setLoading(true);
    try {
      // Using the existing API endpoint that can search items
      const response = await axios.get(`${API_URL.ITEMS}?query=${nameSearchValue}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      showAlert('Failed to search items', 'error');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle item code/barcode search input change
  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeSearchValue(e.target.value);
  };
  
  // Handle item name search input change
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameSearchValue(e.target.value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchByName();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };
  
  // Handle item selection from dropdown
  const handleSelectItem = async (item: Item) => {
    setSelectedItem(item);
    setCodeSearchValue(item.item_code);
    setNameSearchValue(item.item_name);
    setShowResults(false);
    
    // Get last purchase info
    try {
      const response = await axios.get(`${API_URL.BASE}/last-purchase-by-code?item_code=${item.item_code}`);
      setLastPurchaseInfo({
        lastPurchaseDate: response.data.lastPurchaseDate || 'No purchase',
        lastCost: response.data.lastCost || 0
      });
    } catch (error) {
      setLastPurchaseInfo({
        lastPurchaseDate: 'No purchase',
        lastCost: 0
      });
    }
  };
  
  // Handle keydown events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if ((e.target as HTMLInputElement).name === 'codeSearch') {
        searchByCode();
      } else {
        searchByName();
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Quick Item Search</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Item Code/Barcode Search */}
        <div>
          <label htmlFor="codeSearch" className="block text-sm font-medium text-gray-700 mb-1">
            Item Code / Company Barcode / Alternative Barcode
          </label>
          <div className="flex">
            <input
              id="codeSearch"
              name="codeSearch"
              type="text"
              value={codeSearchValue}
              onChange={handleCodeInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter code or scan barcode..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={searchByCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        
        {/* Item Name Search */}
        <div className="relative">
          <label htmlFor="nameSearch" className="block text-sm font-medium text-gray-700 mb-1">
            Item Name
          </label>
          <input
            id="nameSearch"
            name="nameSearch"
            type="text"
            value={nameSearchValue}
            onChange={handleNameInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search by item name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div 
              ref={resultsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {searchResults.map(item => (
                <div
                  key={item.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="font-medium">{item.item_name}</div>
                  <div className="text-xs text-gray-500">Code: {item.item_code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Item Details Section */}
      {selectedItem && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Item Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Item Name:</span>
              <span>{selectedItem.item_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Item Code:</span>
              <span>{selectedItem.item_code}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Company Barcode:</span>
              <span>{selectedItem.company_barcode || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Alternative Barcode:</span>
              <span>{selectedItem.barcode_2 || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">MRP:</span>
              <span>₹{selectedItem.mrp.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">GST:</span>
              <span>{selectedItem.gst_percentage || 0}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Current Stock:</span>
              <span>{selectedItem.current_stock}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Last Purchase:</span>
              <span>{lastPurchaseInfo?.lastPurchaseDate || 'No purchase'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Per Item Cost:</span>
              <span>₹{(lastPurchaseInfo?.lastCost || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemQuickSearch; 