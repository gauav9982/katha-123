import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/Button';
import useAppStore from '../../store/useAppStore';
import './CashSalePrint.css';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, PlusIcon } from '@heroicons/react/24/outline';
import { handleItemLookupOnKey } from '../../utils/itemLookup';
import { API_URL } from '../../config';

// API endpoints from config
const API_ITEMS = API_URL.ITEMS;
const API_CASHSALES = API_URL.CASHSALES;
const API_CASHSALE_ITEMS = API_URL.CASHSALE_ITEMS;
const API_PURCHASES = API_URL.PURCHASES;
const API_PURCHASE_ITEMS = API_URL.PURCHASE_ITEMS;
const API_LAST_PURCHASE = `${API_URL.PURCHASES}/last-purchase-by-code`;

// Cash Sale Form Component
const CashSaleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showAlert } = useAppStore();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form data state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [customer, setCustomer] = useState('');
  const [salesType, setSalesType] = useState('MRP Sales');
  
  // Items related state
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState<any>({
    item_id: 0,
    item_name: '',
    item_code: '',
    quantity: 1,
    rate: 0,
    amount: 0
  });
  
  // Item details for display
  const [itemDetails, setItemDetails] = useState<any>({
    name: '',
    lastCost: 0,
    lastPurchaseDate: ''
  });
  
  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  // Sales type options
  const salesTypeOptions = [
    'MRP Sales',
    '5% Sales',
    '10% Sales',
    '20% Sales',
    '30% Sales',
    '40% Sales'
  ];
  
  // Customer options
  const customerOptions = [
    'Customer 1', 
    'Customer 2', 
    'Customer 3', 
    'Walk-in Customer',
    'Regular Customer'
  ];
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Load data on initialization
  useEffect(() => {
    fetchItems();
    
    // Call generateInvoiceNumber as async function
    const initInvoiceNumber = async () => {
      if (!isEditing) {
        await generateInvoiceNumber();
      }
    };
    
    initInvoiceNumber();
    
    // If editing, fetch the cash sale data
    if (isEditing && id) {
      fetchCashSale(id);
    }
  }, [isEditing, id]);
  
  // Check for returning from item form with a new item code
  const location = useLocation();
  useEffect(() => {
    // Check if there's a newItemCode in the search params
    const searchParams = new URLSearchParams(location.search);
    const newItemCode = searchParams.get('newItemCode');
    
    if (newItemCode) {
      // Set the barcode input to the new item code
      setBarcodeInput(newItemCode);
      
      // Trigger a search for this item code
      const searchForNewItem = async () => {
        try {
          // Use the itemLookup utility to find the item
          const response = await axios.get(`${API_URL.BASE}/item-exact`, {
            params: { code: newItemCode.trim() }
          });
          
          if (response.data && response.data.item) {
            // Update the current item with the found item
            updateCurrentItem(response.data.item);
            
            // Focus on the quantity field next
            if (barcodeInputRef.current) {
              barcodeInputRef.current.focus();
            }
          }
        } catch (error) {
          console.error('Error fetching new item:', error);
          showAlert('Error fetching the newly added item', 'error');
        }
      };
      
      searchForNewItem();
      
      // Clear the URL parameter after processing
      navigate('/forms/cashsale-form', { replace: true });
    }
  }, [location]);
  
  // Generate invoice number
  const generateInvoiceNumber = async () => {
    if (isEditing) return; // Don't generate new number when editing
    
    try {
      // Fetch all cash sales to find the highest invoice number
      const response = await axios.get(API_CASHSALES);
      const sales = response.data || [];
      
      // Extract numeric values from invoice numbers (assuming simple numbers)
      const invoiceNumbers = sales
        .map((sale: any) => sale.invoice_number)
        .filter((number: string) => /^\d+$/.test(number))
        .map((number: string) => parseInt(number, 10));
      
      // Find the highest number
      const highestNumber = invoiceNumbers.length > 0 
        ? Math.max(...invoiceNumbers) 
        : 0;
      
      // Generate the next number in sequence
      const nextNumber = highestNumber + 1;
      
      setInvoiceNumber(nextNumber.toString());
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to a basic "1" if we can't fetch the list
      setInvoiceNumber('1');
    }
  };
  
  // Fetch all items from API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ITEMS);
      
      // Process items to ensure consistent data types
      const processedItems = response.data.map((item: any) => {
        if (item.item_code !== undefined && item.item_code !== null) {
          item.item_code = item.item_code.toString().trim();
        }
        return item;
      });
      
      setAvailableItems(processedItems);
      console.log(`Loaded ${processedItems.length} items from backend API`);
    } catch (error) {
      console.error('Error loading items:', error);
      showAlert('Failed to load items from server', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch a single cash sale for editing
  const fetchCashSale = async (saleId: string) => {
    setLoading(true);
    try {
      // Fetch cash sale header
      const saleResponse = await axios.get(`${API_CASHSALES}/${saleId}`);
      const sale = saleResponse.data;
      
      // Set cash sale header data
      setInvoiceNumber(sale.invoice_number);
      setInvoiceDate(sale.invoice_date);
      setCustomer(sale.customer_name);
      setSalesType(sale.sales_type);
      
      // Fetch cash sale items
      const itemsResponse = await axios.get(`${API_CASHSALE_ITEMS}?sale_id=${saleId}`);
      
      // Format cash sale items with the required structure
      const items = itemsResponse.data.map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name,
        item_code: item.item_code || '',
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      }));
      
      setSaleItems(items);
      
    } catch (error) {
      console.error('Error fetching cash sale for editing:', error);
      showAlert('Failed to load cash sale data', 'error');
      // Navigate back to list on error
      navigate('/lists/cashsale-list');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate totals when sale items change
  useEffect(() => {
    const newSubtotal = saleItems.reduce((sum, item) => sum + item.amount, 0);
    setSubtotal(newSubtotal);
    setGrandTotal(newSubtotal);
  }, [saleItems]);
  
  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) {
      // For whole numbers, just return the number without decimal places
      return num.toString();
    } else {
      // For decimals, format to 2 places
      return num.toFixed(2).replace(/\.00$/, '').replace(/\.(\d)0$/, '.$1');
    }
  };
  
  // Handle barcode/item code search
  const handleBarcodeSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setBarcodeInput(inputValue);
    
    if (!inputValue.trim()) {
      setCurrentItem({
        item_id: 0,
        item_name: '',
        item_code: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        gst_percentage: 0,
        gst_amount: 0,
        discount_percentage: 0,
        discount_amount: 0,
        total: 0
      });
      return;
    }
    
    try {
      // Search for item as user types
      const response = await axios.get(`${API_URL.BASE}/item-exact`, {
        params: { code: inputValue }
      });
      
      if (response.data && response.data.item) {
        // Update the current item with the found item
        updateCurrentItem(response.data.item);
        
        // Update the item details display
        if (response.data.lastCost || response.data.lastPurchaseDate) {
          setItemDetails({
            name: response.data.item.item_name,
            lastCost: response.data.lastCost || 0,
            lastPurchaseDate: response.data.lastPurchaseDate || 'No purchase'
          });
        }
        
        // Focus on the quantity field next
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      showAlert('Item not found with this code', 'error');
      
      // Keep the entered code but reset other fields
      setCurrentItem({
        item_id: 0,
        item_name: '',
        item_code: barcodeInput,
        quantity: 1,
        rate: 0,
        amount: 0
      });
      setItemDetails({
        name: '',
        lastCost: 0,
        lastPurchaseDate: ''
      });
    }
  };
  
  // Handle Tab and Enter key for exact item lookup
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleItemLookupOnKey(
      e,
      barcodeInput,
      (data) => {
        // Success handler - update the current item with the found item
        console.log("Exact match found on Tab/Enter:", data.item.item_name);
        
        // Update the item details display
        setItemDetails({
          name: data.item.item_name,
          lastCost: data.lastCost || 0,
          lastPurchaseDate: data.lastPurchaseDate || 'No purchase'
        });
        
        // Use the existing updateCurrentItem function with the found item
        updateCurrentItem(data.item);
        
        // If Tab key was pressed, let the natural tab behavior continue
        // If Enter key was pressed, add the item to the list
        if (e.key === 'Enter') {
          // Skip to the next line by programmatically clicking the Add Item button
          document.getElementById('add-item-button')?.click();
        }
      },
      (error) => {
        // Error handler - show alert and keep the barcode but reset other fields
        console.error("Error in exact item lookup:", error);
        showAlert('Item not found with this exact code', 'error');
        
        // Keep the entered code but reset other fields
        setCurrentItem({
          item_id: 0,
          item_name: '',
          item_code: barcodeInput,
          quantity: 1,
          rate: 0,
          amount: 0
        });
        setItemDetails({
          name: '',
          lastCost: 0,
          lastPurchaseDate: ''
        });
      }
    );
  };
  
  // Helper to update current item with found item data
  const updateCurrentItem = (foundItem: any) => {
    let rate = 0;
    
    // Calculate rate based on sales type
    if (salesType === 'MRP Sales') {
      // Use MRP for MRP Sales type
      rate = foundItem.mrp || 0;
    } else {
      // For percentage-based sales types (5%, 10%, 20%, 30%, 40% Sales)
      const percentMatch = salesType.match(/(\d+)% Sales/);
      if (percentMatch && percentMatch[1]) {
        const percentage = parseInt(percentMatch[1], 10);
        
        // Check if itemDetails.lastCost exists (item exists in purchase history)
        if (itemDetails.lastCost && itemDetails.lastCost > 0) {
          // Use last purchase cost + percentage
          rate = itemDetails.lastCost + (itemDetails.lastCost * percentage / 100);
        } else {
          // Use opening cost + percentage if no purchase history
          const openingCost = foundItem.opening_cost || 0;
          rate = openingCost + (openingCost * percentage / 100);
        }
      } else {
        // Fallback to MRP if sales type is not recognized
        rate = foundItem.mrp || 0;
      }
    }
    
    const amount = rate; // Initial amount equals rate for quantity 1
    
    setCurrentItem({
      item_id: foundItem.id,
      item_name: foundItem.item_name,
      item_code: foundItem.item_code || '',
      quantity: 1,
      rate,
      amount
    });
  };
  
  // Update calculations when current item quantity or rate changes
  useEffect(() => {
    // Only recalculate if we have a valid item
    if (currentItem.item_id) {
      const quantity = currentItem.quantity;
      const rate = currentItem.rate;
      const amount = quantity * rate;
      
      setCurrentItem((prev: typeof currentItem) => ({
        ...prev,
        amount
      }));
    }
  }, [
    currentItem.quantity, 
    currentItem.rate
  ]);
  
  // Recalculate rate when sales type changes if there's a current item
  useEffect(() => {
    // Only proceed if we have a valid item selected
    if (currentItem.item_id) {
      // Find the item in the available items list
      const item = availableItems.find(i => i.id === currentItem.item_id);
      if (item) {
        // Update the item with the new sales type applied
        updateCurrentItem(item);
      }
    }
  }, [salesType]);
  
  // Add item to sale list
  const handleAddItem = () => {
    if (currentItem.item_id === 0) {
      showAlert('Please select an item', 'error');
      return;
    }
    
    if (currentItem.quantity <= 0) {
      showAlert('Quantity must be greater than zero', 'error');
      return;
    }
    
    if (currentItem.rate <= 0) {
      showAlert('Rate must be greater than zero', 'error');
      return;
    }
    
    if (editingItemId !== null) {
      // Update existing item
      setSaleItems(prevItems => 
        prevItems.map(item => 
          item.id === editingItemId ? { ...currentItem, id: editingItemId } : item
        )
      );
      setEditingItemId(null);
    } else {
      // Add new item with generated id
      setSaleItems(prevItems => [...prevItems, { ...currentItem, id: Date.now() }]);
    }
    
    // Reset current item form
    setCurrentItem({
      item_id: 0,
      item_name: '',
      item_code: '',
      quantity: 1,
      rate: 0,
      amount: 0
    });
    setBarcodeInput('');
    
    // Focus back on barcode input for next item
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  // Edit item from sale list
  const handleEditItem = (id: number | undefined) => {
    if (id) {
      const itemToEdit = saleItems.find(item => item.id === id);
      if (itemToEdit) {
        setCurrentItem(itemToEdit);
        setEditingItemId(id);
        
        if (itemToEdit.item_code) {
          setBarcodeInput(itemToEdit.item_code);
        }
        
        // Focus on the barcode input
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }
    }
  };
  
  // Remove item from sale list
  const handleRemoveItem = (id: number | undefined) => {
    if (id) {
      // Remove item from the list
      setSaleItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // If currently editing this item, reset the form
      if (editingItemId === id) {
        setEditingItemId(null);
        setCurrentItem({
          item_id: 0,
          item_name: '',
          item_code: '',
          quantity: 1,
          rate: 0,
          amount: 0
        });
        setBarcodeInput('');
      }
    }
  };
  
  // Save cash sale to database
  const handleSaveCashSale = async () => {
    if (!customer) {
      showAlert('Please select a customer', 'error');
      return;
    }
    if (saleItems.length === 0) {
      showAlert('Please add at least one item', 'error');
      return;
    }
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare cash sale header data
      const saleData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        customer_name: customer,
        sales_type: salesType,
        subtotal,
        grand_total: grandTotal
      };
      
      let saleId: number;
      
      if (isEditing && id) {
        // Update existing cash sale using API
        await axios.put(`${API_CASHSALES}/${id}`, saleData);
        saleId = parseInt(id);
        
        // Delete existing cash sale items
        const existingItems = await axios.get(`${API_CASHSALE_ITEMS}?sale_id=${saleId}`);
        for (const item of existingItems.data) {
          await axios.delete(`${API_CASHSALE_ITEMS}/${item.id}`);
        }
      } else {
        // Create new cash sale using API
        const response = await axios.post(API_CASHSALES, saleData);
        saleId = response.data.id;
      }
      
      // Create cash sale items using API
      for (const item of saleItems) {
        const itemData = {
          sale_id: saleId,
          item_id: item.item_id,
          item_name: item.item_name,
          item_code: item.item_code || '',
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        };
        
        await axios.post(API_CASHSALE_ITEMS, itemData);
      }
      
      showAlert(
        isEditing ? 'Cash Sale updated successfully!' : 'Cash Sale saved successfully!',
        'success'
      );
      
      // Navigate to cash sale list after a short delay
      setTimeout(() => {
        navigate('/lists/cashsale-list');
      }, 500);
    } catch (error) {
      console.error('Error saving cash sale:', error);
      showAlert(
        isEditing ? 'Failed to update cash sale' : 'Failed to save cash sale',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save and Print cash sale
  const handleSaveAndPrint = async () => {
    if (!customer) {
      showAlert('Please select a customer', 'error');
      return;
    }
    if (saleItems.length === 0) {
      showAlert('Please add at least one item', 'error');
      return;
    }
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare cash sale header data
      const saleData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        customer_name: customer,
        sales_type: salesType,
        subtotal,
        grand_total: grandTotal
      };
      
      let saleId: number;
      let savedSale: any = { ...saleData };
      
      if (isEditing && id) {
        // Update existing cash sale using API
        await axios.put(`${API_CASHSALES}/${id}`, saleData);
        saleId = parseInt(id);
        savedSale.id = saleId;
        
        // Delete existing cash sale items
        const existingItems = await axios.get(`${API_CASHSALE_ITEMS}?sale_id=${saleId}`);
        for (const item of existingItems.data) {
          await axios.delete(`${API_CASHSALE_ITEMS}/${item.id}`);
        }
      } else {
        // Create new cash sale using API
        const response = await axios.post(API_CASHSALES, saleData);
        saleId = response.data.id;
        savedSale.id = saleId;
      }
      
      // Create cash sale items using API
      for (const item of saleItems) {
        const itemData = {
          sale_id: saleId,
          item_id: item.item_id,
          item_name: item.item_name,
          item_code: item.item_code || '',
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        };
        
        await axios.post(API_CASHSALE_ITEMS, itemData);
      }
      
      showAlert(
        isEditing ? 'Cash Sale updated successfully!' : 'Cash Sale saved successfully!',
        'success'
      );
      
      // Print the cash sale
      const saleWithItems = {
        ...savedSale,
        items: saleItems
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

          /* Fullscreen form */
          .fullscreen-form {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            overflow: auto;
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
                <div><strong>Sales Type:</strong> ${saleWithItems.sales_type}</div>
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
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                  <td style="text-align: center;"><strong>${saleWithItems.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</strong></td>
                  <td></td>
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
        
        // No auto-print - let the user initiate the print from print preview
        
        // Only navigate back after the printWindow is closed
        printWindow.onafterprint = () => {
          setTimeout(() => {
            navigate('/lists/cashsale-list');
          }, 500);
        };
      } else {
        showAlert('Could not open print window. Please check if pop-up is blocked.', 'error');
        // Navigate to cash sale list if printing fails
        setTimeout(() => {
          navigate('/lists/cashsale-list');
        }, 500);
      }
    } catch (error) {
      console.error('Error saving and printing cash sale:', error);
      showAlert(
        isEditing ? 'Failed to update and print cash sale' : 'Failed to save and print cash sale',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading spinner while data is being loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <div ref={formRef} className={`bg-white rounded-lg shadow-md ${isFullscreen ? 'fullscreen-form' : ''}`}>
      {/* Form Header */}
      <div className="bg-primary text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">{isEditing ? 'Edit Cash Sale Invoice' : 'New Cash Sale Invoice'}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-md transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? 
              <ArrowsPointingInIcon className="h-5 w-5" /> : 
              <ArrowsPointingOutIcon className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Sale Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Type</label>
            <select
              value={salesType}
              onChange={(e) => setSalesType(e.target.value)}
              className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              {salesTypeOptions.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No.</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">-- Select Customer --</option>
              {customerOptions.map((c, index) => (
                <option key={index} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Item Entry Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Item Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
            <div className="md:col-span-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
              <div className="flex">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={handleBarcodeSearch}
                  onKeyDown={handleBarcodeKeyDown}
                  className={`form-input w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${currentItem.item_id ? 'border-green-500' : barcodeInput && !currentItem.item_id ? 'border-red-500' : ''}`}
                  placeholder="Enter item code or barcode"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Open the item form in a new window/tab with full URL including port
                    const itemFormWindow = window.open('http://localhost:5173/forms/item?returnTo=cash', '_blank');
                    
                    // Add event listener to receive the newly created item code
                    const handleMessage = (event: MessageEvent) => {
                      // Check if the message is from our application and contains newItemCode
                      if (event.data && event.data.newItemCode) {
                        const newItemCode = event.data.newItemCode;
                        
                        // Update the barcode input with the new code
                        setBarcodeInput(newItemCode);
                        
                        // Trigger search for this item
                        const searchForItem = async () => {
                          try {
                            const response = await axios.get(`http://168.231.122.33:4000/api/item-exact`, {
                              params: { code: newItemCode.trim() }
                            });
                            
                            if (response.data && response.data.item) {
                              updateCurrentItem(response.data.item);
                              
                              // Focus on the quantity field next
                              if (barcodeInputRef.current) {
                                barcodeInputRef.current.focus();
                              }
                            }
                          } catch (error) {
                            console.error("Error fetching new item:", error);
                            showAlert('Error fetching the newly added item', 'error');
                          }
                        };
                        
                        searchForItem();
                        
                        // Remove the event listener
                        window.removeEventListener('message', handleMessage);
                      }
                    };
                    
                    window.addEventListener('message', handleMessage);
                  }}
                  className="bg-green-600 text-white px-3 rounded-r-md hover:bg-green-700 flex items-center justify-center"
                  title="Add New Item"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              {barcodeInput && !currentItem.item_id && (
                <p className="text-xs text-red-500 mt-1">Item not found. Try adding it.</p>
              )}
              
              {/* Item Details Display */}
              {itemDetails.name && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                  <div className="font-semibold text-blue-800">Item Details:</div>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>
                      <span className="font-medium">Name:</span> {itemDetails.name}
                    </div>
                    <div>
                      <span className="font-medium">Per Item Cost:</span> ₹{parseFloat(itemDetails.lastCost).toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Last Purchase:</span> {itemDetails.lastPurchaseDate}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={currentItem.item_name}
                readOnly
                className="form-input w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            
            <div className="md:col-span-1" style={{maxWidth: "100px"}}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
              <input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 0;
                  setCurrentItem({ 
                    ...currentItem, 
                    quantity: newQuantity
                  });
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentItem.rate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value) || 0;
                  setCurrentItem({ 
                    ...currentItem, 
                    rate: newRate
                  });
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={currentItem.amount}
                onChange={(e) => {
                  const newAmount = parseFloat(e.target.value) || 0;
                  const quantity = currentItem.quantity || 1;
                  const newRate = quantity > 0 ? newAmount / quantity : 0;
                  setCurrentItem({ 
                    ...currentItem, 
                    amount: newAmount,
                    rate: newRate
                  });
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              id="add-item-button"
              onClick={handleAddItem}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              {editingItemId !== null ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </div>
        
        {/* Items Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left border">Item Code</th>
                <th className="py-2 px-4 text-left border">Item Name</th>
                <th className="py-2 px-4 text-right border">Qty</th>
                <th className="py-2 px-4 text-right border">Rate</th>
                <th className="py-2 px-4 text-right border">Amount</th>
                <th className="py-2 px-4 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500 border">
                    No items added yet. Use the form above to add items.
                  </td>
                </tr>
              ) : (
                saleItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{item.item_code}</td>
                    <td className="py-2 px-4 border">{item.item_name}</td>
                    <td className="py-2 px-4 text-right border">{item.quantity}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.rate)}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.amount)}</td>
                    <td className="py-2 px-4 text-center border">
                      <button
                        onClick={() => handleEditItem(item.id)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-medium">
                <td colSpan={2} className="text-right pr-4 py-2 border">Total:</td>
                <td className="text-right pr-4 border">{saleItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="text-right pr-4 border"></td>
                <td className="text-right pr-4 border">{formatNumber(grandTotal)}</td>
                <td className="border"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Bottom Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => navigate('/lists/cashsale-list')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCashSale}
            disabled={isSaving}
            className={`bg-green-600 text-white px-6 py-2 rounded-md transition-colors ${
              isSaving 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-green-700 cursor-pointer'
            }`}
          >
            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Update'
                : 'Save'
            }
          </Button>
          <Button
            onClick={handleSaveAndPrint}
            disabled={isSaving}
            className={`bg-blue-600 text-white px-6 py-2 rounded-md transition-colors ${
              isSaving 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {isSaving
              ? 'Processing...'
              : 'Save & Print'
            }
          </Button>
        </div>
      </div>
      
      {/* Hidden print template */}
      <div ref={printRef} className="hidden"></div>
    </div>
  );
};

export default CashSaleForm; 