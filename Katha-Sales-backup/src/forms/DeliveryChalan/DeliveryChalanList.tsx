import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/Button';
import { PlusIcon, PrinterIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

// API endpoint
const API_DELIVERY_CHALANS = 'http://168.231.122.33:4000/api/delivery-chalans';
const API_DELIVERY_CHALAN_ITEMS = 'http://168.231.122.33:4000/api/delivery-chalan-items';

// DeliveryChalan List Component
const DeliveryChalanList: React.FC = () => {
  const { showAlert } = useAppStore();
  const navigate = useNavigate();
  
  // State
  const [deliveryChalans, setDeliveryChalans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChalans, setFilteredChalans] = useState<any[]>([]);
  
  // Load delivery chalans on component mount
  useEffect(() => {
    fetchDeliveryChalans();
  }, []);
  
  // Filter delivery chalans when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChalans(deliveryChalans);
      return;
    }
    
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = deliveryChalans.filter(chalan => 
      chalan.chalan_number.toLowerCase().includes(lowercasedQuery) ||
      chalan.party_name.toLowerCase().includes(lowercasedQuery) ||
      chalan.chalan_date.includes(lowercasedQuery)
    );
    
    setFilteredChalans(filtered);
  }, [searchQuery, deliveryChalans]);
  
  // Fetch all delivery chalans from API
  const fetchDeliveryChalans = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_DELIVERY_CHALANS);
      
      // Format dates and ensure consistent data types
      const processedChalans = response.data.map((chalan: any) => ({
        ...chalan,
        chalan_date: new Date(chalan.chalan_date).toLocaleDateString()
      }));
      
      setDeliveryChalans(processedChalans);
      setFilteredChalans(processedChalans);
    } catch (error) {
      console.error('Error fetching delivery chalans:', error);
      showAlert('Failed to load delivery chalans', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete delivery chalan
  const handleDeleteDeliveryChalan = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this delivery chalan? This action cannot be undone.')) {
      return;
    }
    
    try {
      // First delete all related delivery chalan items
      const itemsResponse = await axios.get(`${API_DELIVERY_CHALAN_ITEMS}?chalan_id=${id}`);
      for (const item of itemsResponse.data) {
        await axios.delete(`${API_DELIVERY_CHALAN_ITEMS}/${item.id}`);
      }
      
      // Then delete the delivery chalan
      await axios.delete(`${API_DELIVERY_CHALANS}/${id}`);
      
      // Update state to remove the deleted chalan
      setDeliveryChalans(prevChalans => prevChalans.filter(chalan => chalan.id !== id));
      showAlert('Delivery chalan deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting delivery chalan:', error);
      showAlert('Failed to delete delivery chalan', 'error');
    }
  };
  
  // Handle printing a delivery chalan
  const handlePrintChalan = async (chalanId: number) => {
    try {
      // Fetch the delivery chalan data
      const chalanResponse = await axios.get(`${API_DELIVERY_CHALANS}/${chalanId}`);
      const chalan = chalanResponse.data;
      
      // Fetch the delivery chalan items
      const itemsResponse = await axios.get(`${API_DELIVERY_CHALAN_ITEMS}?chalan_id=${chalanId}`);
      const items = itemsResponse.data;
      
      // Combine chalan and items for printing
      const chalanWithItems = {
        ...chalan,
        items
      };
      
      // Open a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        // Write the print content to the new window
        printWindow.document.write('<html><head><title>Delivery Chalan</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          /* Print styles for Delivery Chalan */
          @page {
            size: A4;
            margin: 0.5cm;
          }
          
          body, html {
            margin: 0;
            padding: 0;
            background: white;
            font-size: 12pt;
            color: black;
            font-family: Arial, sans-serif;
          }

          /* Chalan container */
          .print-chalan {
            width: 100%;
            max-width: 100%;
            padding: 20px;
            box-sizing: border-box;
          }

          /* Chalan header */
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }

          /* Company name */
          .company-name {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 5px;
          }

          /* Chalan info */
          .chalan-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #000;
          }

          /* Table styles */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .print-table th, .print-table td {
            border: 1px solid #000;
            padding: 8px;
          }

          .print-table th {
            background-color: #f2f2f2;
            text-align: left;
            font-weight: bold;
          }

          /* Total row */
          .total-row {
            font-weight: bold;
          }

          /* Signature section */
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
          }

          .signature-box {
            border-top: 1px solid #000;
            width: 200px;
            padding-top: 5px;
            text-align: center;
          }

          /* Hide page elements when printing */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .no-print {
              display: none;
            }
          }
          
          /* Print controls */
          .print-controls {
            padding: 15px;
            background-color: #f0f4f8;
            border-bottom: 1px solid #ccc;
            text-align: center;
          }
          
          .print-button {
            background-color: #4CAF50;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 10px;
          }
          
          .print-button:hover {
            background-color: #45a049;
          }
          
          .close-button {
            background-color: #f44336;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          
          .close-button:hover {
            background-color: #d32f2f;
          }
        `);
        printWindow.document.write('</style></head><body>');
        
        // Add print controls
        printWindow.document.write(`
          <div class="print-controls no-print">
            <button class="print-button" onclick="window.print()">Print</button>
            <button class="close-button" onclick="window.close()">Close</button>
          </div>
        `);
        
        // Generate the chalan HTML
        printWindow.document.write(`
          <div class="print-chalan">
            <div class="print-header">
              <div class="company-name">KATHA SALES</div>
              <div>Delivery Chalan</div>
            </div>
            
            <div class="chalan-info">
              <div>
                <div><strong>Chalan Number:</strong> ${chalan.chalan_number}</div>
                <div><strong>Date:</strong> ${chalan.chalan_date}</div>
              </div>
              <div>
                <div><strong>Party Name:</strong> ${chalan.party_name}</div>
              </div>
            </div>
            
            <table class="print-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.item_code || ''}</td>
                    <td>${item.item_name}</td>
                    <td>${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>Total Quantity:</strong></td>
                  <td><strong>${chalan.total_quantity}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <div class="signature-section">
              <div class="signature-box">Authorized Signature</div>
              <div class="signature-box">Received By</div>
            </div>
          </div>
        `);
        
        printWindow.document.write('</body></html>');
        printWindow.document.close();
      } else {
        showAlert('Could not open print window. Please check if pop-up is blocked.', 'error');
      }
    } catch (error) {
      console.error('Error printing delivery chalan:', error);
      showAlert('Failed to print delivery chalan', 'error');
    }
  };
  
  // Show loading spinner while data is being loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Loading delivery chalans...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Delivery Chalans</h2>
        <Link to="/forms/delivery-chalan-form">
          <Button className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Delivery Chalan
          </Button>
        </Link>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by chalan number, party name, or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      
      {/* Delivery Chalans Table */}
      <div className="overflow-x-auto">
        {filteredChalans.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            {searchQuery 
              ? 'No delivery chalans found matching your search' 
              : 'No delivery chalans found. Click "New Delivery Chalan" to create one.'}
          </p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left border">Chalan Number</th>
                <th className="py-2 px-4 text-left border">Date</th>
                <th className="py-2 px-4 text-left border">Party Name</th>
                <th className="py-2 px-4 text-right border">Total Quantity</th>
                <th className="py-2 px-4 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChalans.map((chalan) => (
                <tr key={chalan.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{chalan.chalan_number}</td>
                  <td className="py-2 px-4 border">{chalan.chalan_date}</td>
                  <td className="py-2 px-4 border">{chalan.party_name}</td>
                  <td className="py-2 px-4 text-right border">{chalan.total_quantity}</td>
                  <td className="py-2 px-4 text-center border">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => navigate(`/forms/delivery-chalan-form/${chalan.id}`)}
                        title="Edit"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePrintChalan(chalan.id)}
                        title="Print"
                        className="text-green-600 hover:text-green-800"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeliveryChalan(chalan.id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DeliveryChalanList; 