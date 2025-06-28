import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import Button from '../../components/Button';
import useAppStore from '../../store/useAppStore';
import './DeliveryChalanPrint.css';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, PlusIcon } from '@heroicons/react/24/outline';
import { handleItemLookupOnKey } from '../../utils/itemLookup';

// API endpoints
const API_ITEMS = 'http://localhost:4000/api/items';
const API_DELIVERY_CHALANS = 'http://localhost:4000/api/delivery-chalans';
const API_DELIVERY_CHALAN_ITEMS = 'http://localhost:4000/api/delivery-chalan-items';

// Delivery Chalan Form Component
const DeliveryChalanForm: React.FC = () => {
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
  const [chalanNumber, setChalanNumber] = useState('');
  const [chalanDate, setChalanDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyName, setPartyName] = useState('');
  
  // Items related state
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [chalanItems, setChalanItems] = useState<any[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState<any>({
    item_id: 0,
    item_name: '',
    item_code: '',
    quantity: 1
  });
  
  // Total quantity
  const [totalQuantity, setTotalQuantity] = useState(0);
  
  // Party name options
  const partyNameOptions = [
    'Party 1', 
    'Party 2', 
    'Party 3', 
    'Regular Party',
    'New Party'
  ];
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Load data on initialization
  useEffect(() => {
    fetchItems();
    
    // Call generateChalanNumber as async function
    const initChalanNumber = async () => {
      if (!isEditing) {
        await generateChalanNumber();
      }
    };
    
    initChalanNumber();
    
    // If editing, fetch the delivery chalan data
    if (isEditing && id) {
      fetchDeliveryChalan(id);
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
      navigate('/forms/delivery-chalan-form', { replace: true });
    }
  }, [location]);
  
  // Generate chalan number
  const generateChalanNumber = async () => {
    if (isEditing) return; // Don't generate new number when editing
    
    try {
      // Fetch all delivery chalans to find the highest chalan number
      const response = await axios.get(API_URL.DELIVERY_CHALANS);
      const chalans = response.data || [];
      
      // Extract numeric values from chalan numbers (assuming simple numbers)
      const chalanNumbers = chalans
        .map((chalan: any) => chalan.chalan_number)
        .filter((number: string) => /^\d+$/.test(number))
        .map((number: string) => parseInt(number, 10));
      
      // Find the highest number
      const highestNumber = chalanNumbers.length > 0 
        ? Math.max(...chalanNumbers) 
        : 0;
      
      // Generate the next number in sequence
      const nextNumber = highestNumber + 1;
      
      setChalanNumber(nextNumber.toString());
    } catch (error) {
      console.error('Error generating chalan number:', error);
      // Fallback to a basic "1" if we can't fetch the list
      setChalanNumber('1');
    }
  };
  
  // Fetch all items from API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL.ITEMS);
      
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
  
  // Fetch a single delivery chalan for editing
  const fetchDeliveryChalan = async (chalanId: string) => {
    setLoading(true);
    try {
      // Fetch delivery chalan header
      const chalanResponse = await axios.get(`${API_URL.DELIVERY_CHALANS}/${chalanId}`);
      const chalan = chalanResponse.data;
      
      // Set delivery chalan header data
      setChalanNumber(chalan.chalan_number);
      setChalanDate(chalan.chalan_date);
      setPartyName(chalan.party_name);
      
      // Fetch delivery chalan items
      const itemsResponse = await axios.get(`${API_URL.DELIVERY_CHALAN_ITEMS}?chalan_id=${chalanId}`);
      
      // Format delivery chalan items with the required structure
      const items = itemsResponse.data.map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        item_name: item.item_name,
        item_code: item.item_code || '',
        quantity: item.quantity
      }));
      
      setChalanItems(items);
      
    } catch (error) {
      console.error('Error fetching delivery chalan for editing:', error);
      showAlert('Failed to load delivery chalan data', 'error');
      // Navigate back to list on error
      navigate('/lists/delivery-chalan-list');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total quantity when chalan items change
  useEffect(() => {
    const newTotalQuantity = chalanItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalQuantity(newTotalQuantity);
  }, [chalanItems]);
  
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
        
        // Focus on the quantity field next
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Error in item lookup:", error);
      showAlert('Item not found with this code', 'error');
      
      // Keep the entered code but reset other fields
      setCurrentItem({
        item_id: 0,
        item_name: '',
        item_code: inputValue,
        quantity: 1,
        rate: 0,
        amount: 0,
        gst_percentage: 0,
        gst_amount: 0,
        discount_percentage: 0,
        discount_amount: 0,
        total: 0
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
          amount: 0,
          gst_percentage: 0,
          gst_amount: 0,
          discount_percentage: 0,
          discount_amount: 0,
          total: 0
        });
      }
    );
  };
  
  // Helper to update current item with found item data
  const updateCurrentItem = (foundItem: any) => {
    setCurrentItem({
      item_id: foundItem.id,
      item_name: foundItem.item_name,
      item_code: foundItem.item_code || '',
      quantity: 1,
      rate: foundItem.rate || 0,
      amount: foundItem.amount || 0,
      gst_percentage: foundItem.gst_percentage || 0,
      gst_amount: foundItem.gst_amount || 0,
      discount_percentage: foundItem.discount_percentage || 0,
      discount_amount: foundItem.discount_amount || 0,
      total: foundItem.total || 0
    });
  };
  
  // Add item to chalan list
  const handleAddItem = () => {
    if (currentItem.item_id === 0) {
      showAlert('Please select an item', 'error');
      return;
    }
    
    if (currentItem.quantity <= 0) {
      showAlert('Quantity must be greater than zero', 'error');
      return;
    }
    
    if (editingItemId !== null) {
      // Update existing item
      setChalanItems(prevItems => 
        prevItems.map(item => 
          item.id === editingItemId ? { ...currentItem, id: editingItemId } : item
        )
      );
      setEditingItemId(null);
    } else {
      // Add new item with generated id
      setChalanItems(prevItems => [...prevItems, { ...currentItem, id: Date.now() }]);
    }
    
    // Reset current item form
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
    setBarcodeInput('');
    
    // Focus back on barcode input for next item
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  // Edit item from chalan list
  const handleEditItem = (id: number | undefined) => {
    if (id) {
      const itemToEdit = chalanItems.find(item => item.id === id);
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
  
  // Remove item from chalan list
  const handleRemoveItem = (id: number | undefined) => {
    if (id) {
      // Remove item from the list
      setChalanItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // If currently editing this item, reset the form
      if (editingItemId === id) {
        setEditingItemId(null);
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
        setBarcodeInput('');
      }
    }
  };
  
  // Save delivery chalan to database
  const handleSaveDeliveryChalan = async () => {
    if (!partyName) {
      showAlert('Please select a party name', 'error');
      return;
    }
    if (chalanItems.length === 0) {
      showAlert('Please add at least one item', 'error');
      return;
    }
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare delivery chalan header data
      const chalanData = {
        chalan_number: chalanNumber,
        chalan_date: chalanDate,
        party_name: partyName,
        total_quantity: totalQuantity
      };
      
      let chalanId: number;
      
      if (isEditing && id) {
        // Update existing delivery chalan using API
        await axios.put(`${API_URL.DELIVERY_CHALANS}/${id}`, chalanData);
        chalanId = parseInt(id);
        
        // Delete existing delivery chalan items
        const existingItems = await axios.get(`${API_URL.DELIVERY_CHALAN_ITEMS}?chalan_id=${chalanId}`);
        for (const item of existingItems.data) {
          await axios.delete(`${API_URL.DELIVERY_CHALAN_ITEMS}/${item.id}`);
        }
      } else {
        // Create new delivery chalan using API
        const response = await axios.post(API_URL.DELIVERY_CHALANS, chalanData);
        chalanId = response.data.id;
      }
      
      // Create delivery chalan items using API
      for (const item of chalanItems) {
        const itemData = {
          chalan_id: chalanId,
          item_id: item.item_id,
          item_name: item.item_name,
          item_code: item.item_code || '',
          quantity: item.quantity
        };
        
        await axios.post(API_URL.DELIVERY_CHALAN_ITEMS, itemData);
      }
      
      showAlert(
        isEditing ? 'Delivery Chalan updated successfully!' : 'Delivery Chalan saved successfully!',
        'success'
      );
      
      // Navigate to delivery chalan list after a short delay
      setTimeout(() => {
        navigate('/lists/delivery-chalan-list');
      }, 500);
    } catch (error) {
      console.error('Error saving delivery chalan:', error);
      showAlert(
        isEditing ? 'Failed to update delivery chalan' : 'Failed to save delivery chalan',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save and Print delivery chalan
  const handleSaveAndPrint = async () => {
    if (!partyName) {
      showAlert('Please select a party name', 'error');
      return;
    }
    if (chalanItems.length === 0) {
      showAlert('Please add at least one item', 'error');
      return;
    }
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare delivery chalan header data
      const chalanData = {
        chalan_number: chalanNumber,
        chalan_date: chalanDate,
        party_name: partyName,
        total_quantity: totalQuantity
      };
      
      console.log('Submitting delivery chalan data:', chalanData);
      
      let chalanId: number;
      let savedChalan: any = { ...chalanData };
      
      if (isEditing && id) {
        console.log('Updating existing chalan:', id);
        // Update existing delivery chalan using API
        await axios.put(`${API_URL.DELIVERY_CHALANS}/${id}`, chalanData);
        chalanId = parseInt(id);
        savedChalan.id = chalanId;
        
        // Delete existing delivery chalan items
        const existingItems = await axios.get(`${API_URL.DELIVERY_CHALAN_ITEMS}?chalan_id=${chalanId}`);
        for (const item of existingItems.data) {
          await axios.delete(`${API_URL.DELIVERY_CHALAN_ITEMS}/${item.id}`);
        }
      } else {
        console.log('Creating new chalan with data:', chalanData);
        // Create new delivery chalan using API
        try {
          const response = await axios.post(API_URL.DELIVERY_CHALANS, chalanData);
          console.log('API response:', response.data);
          chalanId = response.data.id;
          savedChalan.id = chalanId;
        } catch (error) {
          console.error('Error creating delivery chalan:', error);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
          }
          throw error; // Rethrow to be caught by the outer try/catch
        }
      }
      
      // Create delivery chalan items using API
      console.log('Saving chalan items:', chalanItems.length);
      for (const item of chalanItems) {
        const itemData = {
          chalan_id: chalanId,
          item_id: item.item_id,
          item_name: item.item_name,
          item_code: item.item_code || '',
          quantity: item.quantity
        };
        
        console.log('Adding chalan item:', itemData);
        await axios.post(API_URL.DELIVERY_CHALAN_ITEMS, itemData);
      }
      
      showAlert(
        isEditing ? 'Delivery Chalan updated successfully!' : 'Delivery Chalan saved successfully!',
        'success'
      );
      
      // Print the delivery chalan
      const chalanWithItems = {
        ...savedChalan,
        items: chalanItems
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

          /* Invoice container */
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
                <div><strong>Chalan Number:</strong> ${chalanWithItems.chalan_number}</div>
                <div><strong>Date:</strong> ${new Date(chalanWithItems.chalan_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div><strong>Party Name:</strong> ${chalanWithItems.party_name}</div>
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
                ${chalanWithItems.items.map((item: any, index: number) => `
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
                  <td><strong>${chalanWithItems.total_quantity}</strong></td>
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
            navigate('/lists/delivery-chalan-list');
          }, 500);
        };
      } else {
        showAlert('Could not open print window. Please check if pop-up is blocked.', 'error');
        // Navigate to delivery chalan list if printing fails
        setTimeout(() => {
          navigate('/lists/delivery-chalan-list');
        }, 500);
      }
    } catch (error) {
      console.error('Error saving and printing delivery chalan:', error);
      showAlert(
        isEditing ? 'Failed to update and print delivery chalan' : 'Failed to save and print delivery chalan',
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
        <h2 className="text-xl font-semibold">{isEditing ? 'Edit Delivery Chalan' : 'New Delivery Chalan'}</h2>
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
        {/* Chalan Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chalan Number</label>
            <input
              type="text"
              value={chalanNumber}
              onChange={(e) => setChalanNumber(e.target.value)}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chalan Date</label>
            <input
              type="date"
              value={chalanDate}
              onChange={(e) => setChalanDate(e.target.value)}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
            <select
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">-- Select Party --</option>
              {partyNameOptions.map((name, index) => (
                <option key={index} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Item Entry Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Item Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
            <div className="md:col-span-6 relative">
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
                    const itemFormWindow = window.open('http://localhost:5173/forms/item?returnTo=delivery', '_blank');
                    
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
                            const response = await axios.get(`${API_URL.BASE}/item-exact`, {
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
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
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
                <th className="py-2 px-4 text-right border">Quantity</th>
                <th className="py-2 px-4 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chalanItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 border">
                    No items added yet. Use the form above to add items.
                  </td>
                </tr>
              ) : (
                chalanItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{item.item_code}</td>
                    <td className="py-2 px-4 border">{item.item_name}</td>
                    <td className="py-2 px-4 text-right border">{item.quantity}</td>
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
                <td colSpan={2} className="text-right pr-4 py-2 border">Total Quantity:</td>
                <td className="text-right pr-4 border">{totalQuantity}</td>
                <td className="border"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Bottom Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => navigate('/lists/delivery-chalan-list')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDeliveryChalan}
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

export default DeliveryChalanForm; 