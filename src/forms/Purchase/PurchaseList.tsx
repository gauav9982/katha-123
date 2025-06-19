import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/Button';
import useAppStore from '../../store/useAppStore';

// Import the same print style
import './PurchasePrint.css';

// API endpoints
const API_PURCHASES = 'http://168.231.122.33:4000/api/purchases';
const API_PURCHASE_ITEMS = 'http://168.231.122.33:4000/api/purchase-items';

const PurchaseList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0); // Add a key to force reload
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    showAlert, 
    updatedPurchase, 
    clearUpdatedPurchase,
    purchases,
    setPurchases,
    updatePurchase
  } = useAppStore();
  
  // Memoize the loadPurchases function to prevent re-renders
  const loadPurchases = useCallback(async () => {
    try {
      console.log('Loading purchases from API...'); // Debug log
      setLoading(true);
      
      // Load purchases from API
      const response = await axios.get(API_PURCHASES);
      const purchasesData = response.data || [];
      
      console.log('Purchases loaded from API:', purchasesData);
      setPurchases(purchasesData);
      
      // Check for updated purchase data (immediate updates)
      console.log('Checking store for updated purchase:', updatedPurchase);
      if (updatedPurchase && updatedPurchase.id) {
        console.log('Found updated purchase in store:', updatedPurchase);
        // Update in the persistent store
        updatePurchase(updatedPurchase);
        // Clear from temporary store
        clearUpdatedPurchase();
        
        // Show notification
        showAlert('Purchase list updated with latest changes', 'success');
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
      showAlert('Failed to load purchases from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [setPurchases, updatedPurchase, updatePurchase, clearUpdatedPurchase, showAlert]);
  
  // Load purchases on initial render and when reloadKey changes
  useEffect(() => {
    loadPurchases();
  }, [reloadKey, loadPurchases]);
  
  // Reload data when navigating back to this page
  useEffect(() => {
    const isInitialLoad = document.referrer === '';
    if (location.pathname === '/lists/purchase-list' && !isInitialLoad && location.key !== undefined) {
      console.log('Back to purchase list, forcing reload'); // Debug log
      setReloadKey(prev => prev + 1); // Increment key to force reload
    }
  }, [location]);
  
  // Handle viewing purchase details
  const handleViewPurchase = (id: number) => {
    // In a real implementation, would navigate to a detail view
    navigate(`/forms/purchase-view/${id}`);
  };
  
  // Handle editing a purchase
  const handleEditPurchase = (id: number) => {
    // Clear any existing data before navigating
    localStorage.removeItem('updatedPurchase');
    clearUpdatedPurchase(); // Also clear from store
    navigate(`/forms/purchase/${id}`);
  };
  
  // Handle deleting a purchase
  const handleDeletePurchase = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        setLoading(true);
        
        // 1. Get purchase items to delete them first
        const itemsResponse = await axios.get(`${API_PURCHASE_ITEMS}?purchase_id=${id}`);
        const items = itemsResponse.data || [];
        
        // 2. Delete all purchase items
        for (const item of items) {
          await axios.delete(`${API_PURCHASE_ITEMS}/${item.id}`);
        }
        
        // 3. Delete the purchase
        await axios.delete(`${API_PURCHASES}/${id}`);
        
        // 4. Update the store
        const updatedPurchases = purchases.filter(purchase => purchase.id !== id);
        setPurchases(updatedPurchases);
        
        showAlert('Purchase deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting purchase:', error);
        showAlert('Failed to delete purchase', 'error');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle printing a purchase
  const handlePrintPurchase = async (purchase: any) => {
    try {
      // Load the full purchase with items if we need to
      let purchaseWithItems = purchase;
      
      if (!purchase.items || purchase.items.length === 0) {
        if (purchase.id) {
          // Load full purchase with items
          const purchaseResponse = await axios.get(`${API_PURCHASES}/${purchase.id}`);
          const itemsResponse = await axios.get(`${API_PURCHASE_ITEMS}?purchase_id=${purchase.id}`);
          
          // Process items to ensure all calculated values are present
          const processedItems = itemsResponse.data.map((item: any) => {
            // Calculate total for each item if it's not present
            if (!item.total) {
              const amount = item.amount || 0;
              const gstAmount = item.gst_amount || 0;
              const transportCharge = item.transport_charge || 0;
              const otherCharge = item.other_charge || 0;
              item.total = amount + gstAmount + transportCharge + otherCharge;
            }
            return item;
          });
          
          purchaseWithItems = {
            ...purchaseResponse.data,
            items: processedItems || []
          };
        }
      }
      
      // Calculate per item cost
      let perItemCost = 0;
      if (purchaseWithItems.items && purchaseWithItems.items.length > 0) {
        const totalQuantity = purchaseWithItems.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        if (totalQuantity > 0) {
          perItemCost = purchaseWithItems.grand_total / totalQuantity;
        }
      }
      
      // Calculate transport and other charges totals
      const transportTotal = purchaseWithItems.items.reduce((sum: number, item: any) => sum + (item.transport_charge || 0), 0);
      const otherTotal = purchaseWithItems.items.reduce((sum: number, item: any) => sum + (item.other_charge || 0), 0);
      
      // Open a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        // Write the print content to the new window
        printWindow.document.write('<html><head><title>Purchase Invoice</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          /* Print styles for Purchase Invoice */
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

          /* Hide page elements when printing */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        `);
        printWindow.document.write('</style></head><body>');
        
        // Generate the invoice HTML
        printWindow.document.write(`
          <div class="print-invoice">
            <div class="print-header">
              <div class="company-name">KATHA SALES</div>
              <div>Purchase Invoice</div>
            </div>
            
            <div class="invoice-info">
              <div>
                <div><strong>Invoice Number:</strong> ${purchaseWithItems.invoice_number}</div>
                <div><strong>Date:</strong> ${new Date(purchaseWithItems.invoice_date || purchaseWithItems.purchase_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div><strong>Vendor:</strong> ${purchaseWithItems.vendor_name}</div>
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
                ${purchaseWithItems.items.map((item: any, index: number) => `
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
                  <td style="text-align: center;"><strong>${purchaseWithItems.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</strong></td>
                  <td></td>
                  <td style="text-align: right;"><strong>${purchaseWithItems.subtotal.toFixed(2)}</strong></td>
                  <td></td>
                  <td style="text-align: right;"><strong>${purchaseWithItems.total_gst.toFixed(2)}</strong></td>
                  <td style="text-align: right;"><strong>${purchaseWithItems.grand_total.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Transport & Other:</strong></td>
                  <td colspan="5"></td>
                  <td style="text-align: right;">
                    <strong>Transport: ${transportTotal.toFixed(2)}</strong><br>
                    <strong>Other: ${otherTotal.toFixed(2)}</strong>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="8" style="text-align: right;"><strong>Grand Total:</strong></td>
                  <td style="text-align: right;"><strong>${purchaseWithItems.grand_total.toFixed(2)}</strong></td>
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
      console.error('Error printing purchase:', error);
      showAlert('Failed to print purchase', 'error');
    }
  };
  
  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Loading purchases...</p>
      </div>
    );
  }
  
  // Continue with the rest of the component
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center bg-primary text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Purchase List</h2>
        <div>
          <Link to="/forms/purchase">
            <Button className="bg-white text-primary hover:bg-gray-100">
              Create New Purchase
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        {purchases.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Purchases Found</h3>
            <p className="text-gray-400 mb-4">Create your first purchase to get started.</p>
            <Link to="/forms/purchase">
              <Button className="bg-primary text-white hover:bg-primary-dark">
                Create Purchase
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchase.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.invoice_date ? new Date(purchase.invoice_date).toLocaleDateString() : 'No date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.vendor_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {purchase.subtotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {purchase.total_gst.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                      {purchase.grand_total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePrintPurchase(purchase)}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        title="Print"
                      >
                        🖨️
                      </button>
                      <button
                        onClick={() => handleEditPurchase(purchase.id || 0)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeletePurchase(purchase.id || 0)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseList; 