import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import useAppStore from '../../store/useAppStore';
import { API_URL } from '../../config';

// API endpoints from config
const API_CASHSALES = API_URL.CASH_SALES;
const API_CASHSALE_ITEMS = API_URL.CASH_SALE_ITEMS;

const CashSaleList: React.FC = () => {
  const { showAlert } = useAppStore();
  const [cashSales, setCashSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch cash sales on component mount
  useEffect(() => {
    loadCashSales();
  }, []);

  // Load cash sales from API
  const loadCashSales = async () => {
    setLoading(true);
    try {
      console.log('Making API request to:', API_CASHSALES);
      const response = await axios.get(API_CASHSALES);
      const data = response.data;
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        dataLength: Array.isArray(data) ? data.length : 'Not an array',
        data: data
      });
      
      // Sort by invoice date descending (newest first)
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a.invoice_date).getTime();
        const dateB = new Date(b.invoice_date).getTime();
        return dateB - dateA;
      });
      
      setCashSales(sortedData);
      setFilteredSales(sortedData);
      console.log(`Loaded ${sortedData.length} cash sales`);
    } catch (error) {
      console.error('Error loading cash sales:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      showAlert('Failed to load cash sales from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter cash sales when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSales(cashSales);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = cashSales.filter(
        (sale) =>
          sale.invoice_number.toString().toLowerCase().includes(query) ||
          sale.customer_name.toLowerCase().includes(query)
      );
      setFilteredSales(filtered);
    }
  }, [searchQuery, cashSales]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle delete cash sale
  const handleDelete = async (id: number) => {
    if (isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this cash sale? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // First delete all cash sale items
      const itemsResponse = await axios.get(`${API_CASHSALE_ITEMS}?sale_id=${id}`);
      const items = itemsResponse.data;
      
      for (const item of items) {
        await axios.delete(`${API_CASHSALE_ITEMS}/${item.id}`);
      }
      
      // Then delete the cash sale
      await axios.delete(`${API_CASHSALES}/${id}`);
      
      showAlert('Cash sale deleted successfully', 'success');
      
      // Refresh the list
      loadCashSales();
    } catch (error) {
      console.error('Error deleting cash sale:', error);
      showAlert('Failed to delete cash sale', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle print cash sale
  const handlePrint = async (sale: any) => {
    try {
      // Fetch cash sale items
      const itemsResponse = await axios.get(`${API_CASHSALE_ITEMS}?sale_id=${sale.id}`);
      const items = itemsResponse.data.map((item: any) => ({
        ...item,
        total: item.amount + (item.gst_amount || 0)
      }));
      
      const saleWithItems = {
        ...sale,
        items
      };
      
      // Open a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        // Write the print content to the new window
        printWindow.document.write('<html><head><title>Cash Sale Invoice</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          /* Print styles for Cash Sale Invoice */
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

          /* Invoice container */
          .print-invoice {
            width: 100%;
            max-width: 100%;
            padding: 20px;
            box-sizing: border-box;
          }

          /* Invoice header */
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

          /* Invoice info */
          .invoice-info {
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
        `);
        printWindow.document.write('</style></head><body>');
        
        // Generate the invoice HTML
        printWindow.document.write(`
          <div class="print-invoice">
            <div class="print-header">
              <div class="company-name">KATHA SALES</div>
              <div>Cash Sale Invoice</div>
            </div>
            
            <div class="invoice-info">
              <div>
                <div><strong>Invoice Number:</strong> ${saleWithItems.invoice_number}</div>
                <div><strong>Date:</strong> ${new Date(saleWithItems.invoice_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div><strong>Customer:</strong> ${saleWithItems.customer_name}</div>
              </div>
            </div>
            
            <table class="print-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>GST %</th>
                  <th>GST Amount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${saleWithItems.items.map((item: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.item_code || ''}</td>
                    <td>${item.item_name}</td>
                    <td>${item.quantity}</td>
                    <td>${(item.rate || 0).toFixed(2)}</td>
                    <td>${(item.amount || 0).toFixed(2)}</td>
                    <td>${item.gst_percentage}%</td>
                    <td>${(item.gst_amount || 0).toFixed(2)}</td>
                    <td>${(item.total || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="text-align: center;"><strong>${saleWithItems.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</strong></td>
                  <td></td>
                  <td style="text-align: right;"><strong>${saleWithItems.subtotal.toFixed(2)}</strong></td>
                  <td></td>
                  <td style="text-align: right;"><strong>${saleWithItems.total_gst.toFixed(2)}</strong></td>
                  <td style="text-align: right;"><strong>${saleWithItems.grand_total.toFixed(2)}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="8" style="text-align: right;"><strong>Grand Total:</strong></td>
                  <td style="text-align: right;"><strong>${saleWithItems.grand_total.toFixed(2)}</strong></td>
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
        
        // Print after a short delay to ensure content is fully loaded
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        showAlert('Could not open print window. Please check if pop-up is blocked.', 'error');
      }
    } catch (error) {
      console.error('Error printing cash sale:', error);
      showAlert('Failed to print cash sale', 'error');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Loading Cash Sales...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* List Header */}
      <div className="bg-primary text-white px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold mb-3 md:mb-0">Cash Sales List</h2>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by invoice number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 pr-4 py-2 w-full md:w-60 rounded-md text-gray-800 border-gray-300 focus:ring-primary focus:border-primary"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={loadCashSales}
              className="btn flex items-center justify-center bg-white/10 text-white px-4 py-2 rounded-md hover:bg-white/20 transition-colors"
              title="Refresh List"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            
            <Link
              to="/forms/cash-sale"
              className="btn flex items-center justify-center bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              <span>New Cash Sale</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* List Content */}
      <div style={{ maxHeight: 'none', overflow: 'visible' }}>
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                GST Amount
              </th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grand Total
              </th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {searchQuery ? 'No cash sales match your search criteria' : 'No cash sales found'}
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sale.invoice_number}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(sale.invoice_date)}
                  </td>
                  <td className="px-4 py-3">
                    {sale.customer_name}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {formatCurrency(sale.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {formatCurrency(sale.total_gst)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-medium">
                    {formatCurrency(sale.grand_total)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handlePrint(sale)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Print"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/forms/cash-sale/${sale.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                        disabled={isDeleting}
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
      
      {/* List Footer with Pagination (future enhancement) */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredSales.length}</span> sales
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashSaleList; 