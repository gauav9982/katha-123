import { useState, useEffect } from 'react';
import axios from 'axios';
import useAppStore from '../store/useAppStore';

interface Transaction {
  id: number;
  date: string;
  transaction_type: 'PURCHASE' | 'CASH_SALE' | 'CREDIT_SALE' | 'DELIVERY' | 'OPENING';
  reference_no: string;
  party_name: string;
  inward: number;
  outward: number;
  opening_stock: number;
  closing_stock: number;
}

interface Item {
  id: number;
  item_code: string;
  item_name: string;
}

const API_ITEM_SEARCH = 'http://localhost:4000/api/items';
const API_ITEM_TRANSACTIONS = 'http://localhost:4000/api/reports/item-transactions';

const ItemTransactionReport = () => {
  const showAlert = useAppStore((state) => state.showAlert);
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Search for items
  const searchItems = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_ITEM_SEARCH}?query=${searchTerm}`);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      showAlert('Failed to search items', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };
  
  // Handle item selection
  const selectItem = (item: Item) => {
    setSelectedItem(item);
    setShowSearchResults(false);
    setSearchTerm(`${item.item_code} - ${item.item_name}`);
    fetchItemTransactions(item.id);
  };
  
  // Fetch transaction history for selected item
  const fetchItemTransactions = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ITEM_TRANSACTIONS}?item_id=${itemId}`);
      setTransactions(response.data);
    } catch (error) {
      showAlert('Failed to load transaction history', 'error');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchItems();
    }
  };
  
  // Get transaction type display text
  const getTransactionTypeText = (type: string): string => {
    switch (type) {
      case 'PURCHASE': return 'Purchase';
      case 'CASH_SALE': return 'Cash Sale';
      case 'CREDIT_SALE': return 'Credit Sale';
      case 'DELIVERY': return 'Delivery';
      case 'OPENING': return 'Opening Stock';
      default: return type;
    }
  };
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Item Transaction History</h1>
        
        {/* Item Search */}
        <div className="mb-6">
          <label htmlFor="item-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Item by Code or Name
          </label>
          <div className="relative">
            <div className="flex">
              <input
                id="item-search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter item code or name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={searchItems}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectItem(item)}
                  >
                    <div className="font-medium">{item.item_code} - {item.item_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* No Item Selected Message */}
        {!selectedItem && !loading && (
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No Item Selected</h3>
            <p className="mt-2 text-gray-500">
              Search for an item by code or name to view its transaction history.
            </p>
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Transaction History Table */}
        {selectedItem && !loading && transactions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-4">
              Transaction History for {selectedItem.item_code} - {selectedItem.item_name}
            </h2>
            
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference No</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Stock</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inward</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outward</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {getTransactionTypeText(transaction.transaction_type)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{transaction.reference_no}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{transaction.party_name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{transaction.opening_stock}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {transaction.inward > 0 ? transaction.inward : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {transaction.outward > 0 ? transaction.outward : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{transaction.closing_stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* No Transactions Message */}
        {selectedItem && !loading && transactions.length === 0 && (
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 mt-4">
            <h3 className="text-lg font-medium text-gray-900">No Transactions Found</h3>
            <p className="mt-2 text-gray-500">
              There are no recorded transactions for this item.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemTransactionReport; 