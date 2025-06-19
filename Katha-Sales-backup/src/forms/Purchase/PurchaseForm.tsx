import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/Button';
import useAppStore from '../../store/useAppStore';
import './PurchasePrint.css';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, PlusIcon } from '@heroicons/react/24/outline';
import { handleItemLookupOnKey } from '../../utils/itemLookup';

// API endpoints
const API_ITEMS = 'http://localhost:4000/api/items';
const API_PURCHASES = 'http://localhost:4000/api/purchases';
const API_PURCHASE_ITEMS = 'http://localhost:4000/api/purchase-items';

// This is our simplified component for a basic working example
const PurchaseForm: React.FC = () => {
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
  const [vendor, setVendor] = useState('');
  
  // Items related state
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState<any>({
    item_id: 0,
    item_name: '',
    item_code: '',
    quantity: 1,
    rate: 0,
    amount: 0,
    gst_percentage: 0,
    gst_amount: 0,
    transport_charge: 0,
    other_charge: 0,
    total: 0,
    per_item_cost: 0
  });
  
  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [totalGst, setTotalGst] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  // Vendor options
  const vendorOptions = [
    'Vendor 1', 
    'Vendor 2', 
    'Vendor 3', 
    'ABC Trading',
    'XYZ Suppliers'
  ];
  
  // Completely new approach with a string-based amount input
  const [amountAsString, setAmountAsString] = useState("");
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  
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
    
    // If editing, fetch the purchase data
    if (isEditing && id) {
      fetchPurchase(id);
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
          const response = await axios.get(`http://168.231.122.33:4000/api/item-exact`, {
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
      navigate('/forms/purchase-form', { replace: true });
    }
  }, [location]);
  
  // Generate invoice number
  const generateInvoiceNumber = async () => {
    if (isEditing) return; // Don't generate new number when editing
    
    try {
      // Fetch all purchases to find the highest invoice number
      const response = await axios.get(API_PURCHASES);
      const purchases = response.data || [];
      
      // Filter purchase numbers that match our format "p-X"
      const invoiceNumbers = purchases
        .map((purchase: any) => purchase.invoice_number)
        .filter((number: string) => /^p-\d+$/i.test(number))
        .map((number: string) => {
          // Extract the numeric part after "p-"
          const match = number.match(/^p-(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        });
      
      // Find the highest number
      const highestNumber = invoiceNumbers.length > 0 
        ? Math.max(...invoiceNumbers) 
        : 0;
      
      // Generate the next number in sequence
      const nextNumber = highestNumber + 1;
      const newInvoiceNumber = `p-${nextNumber}`;
      
      setInvoiceNumber(newInvoiceNumber);
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to a basic "p-1" if we can't fetch the list
      setInvoiceNumber('p-1');
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
  
  // Fetch a single purchase for editing
  const fetchPurchase = async (purchaseId: string) => {
    setLoading(true);
    try {
      // Fetch purchase header
      const purchaseResponse = await axios.get(`${API_PURCHASES}/${purchaseId}`);
      const purchase = purchaseResponse.data;
      
      // Set purchase header data
      setInvoiceNumber(purchase.invoice_number);
      setInvoiceDate(purchase.invoice_date);
      setVendor(purchase.vendor_name);
      
      // Fetch purchase items
      const itemsResponse = await axios.get(`${API_PURCHASE_ITEMS}?purchase_id=${purchaseId}`);
      
      // Format purchase items with the required structure
      const items = itemsResponse.data.map((item: any) => ({
        id: item.id,
        item_id: item.item_id,
        item_code: item.item_code || '',
        item_name: item.item_name,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        gst_percentage: item.gst_percentage || 0,
        gst_amount: item.gst_amount || 0,
        transport_charge: item.transport_charge || 0,
        other_charge: item.other_charge || 0,
        total: (item.amount + (item.gst_amount || 0) + (item.transport_charge || 0) + (item.other_charge || 0)),
        per_item_cost: (item.amount + (item.gst_amount || 0) + (item.transport_charge || 0) + (item.other_charge || 0)) / item.quantity
      }));
      
      setPurchaseItems(items);
      
    } catch (error) {
      console.error('Error fetching purchase for editing:', error);
      showAlert('Failed to load purchase data', 'error');
      // Navigate back to list on error
      navigate('/lists/purchase-list');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate totals when purchase items change
  useEffect(() => {
    const newSubtotal = purchaseItems.reduce((sum, item) => sum + item.amount, 0);
    const newTotalGst = purchaseItems.reduce((sum, item) => sum + item.gst_amount, 0);
    const newGrandTotal = purchaseItems.reduce((sum, item) => sum + (item.total || 0), 0);
    
    setSubtotal(newSubtotal);
    setTotalGst(newTotalGst);
    setGrandTotal(newGrandTotal);
  }, [purchaseItems]);
  
  // Helper function to format numbers according to requirements:
  // - If whole number (125), display as "125" 
  // - If 1-2 decimal places (125.10), display as "125.10"
  const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) {
      // For whole numbers, just return the number without decimal places
      return num.toString();
    } else {
      // For decimals, format to 2 places
      return num.toFixed(2);
    }
  };
  
  // Handle barcode/item code search
  const handleBarcodeSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    setBarcodeInput(inputValue);
    
    if (inputValue === '') {
      // Reset current item if input is cleared
      setCurrentItem({
        item_id: 0,
        item_name: '',
        item_code: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        gst_percentage: 0,
        gst_amount: 0,
        transport_charge: 0,
        other_charge: 0,
        total: 0,
        per_item_cost: 0
      });
      return;
    }

    try {
      // Search for item as user types
      const response = await axios.get(`http://168.231.122.33:4000/api/item-exact`, {
        params: { code: inputValue }
      });
      
      if (response.data && response.data.item) {
        console.log("Item found while typing:", response.data.item.item_name);
        updateCurrentItem(response.data.item);
      }
    } catch (error) {
      console.log("No exact match found while typing");
      // Don't show error while typing, just reset the item
      setCurrentItem({
        item_id: 0,
        item_name: '',
        item_code: inputValue,
        quantity: 1,
        rate: 0,
        amount: 0,
        gst_percentage: 0,
        gst_amount: 0,
        transport_charge: 0,
        other_charge: 0,
        total: 0,
        per_item_cost: 0
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
          transport_charge: 0,
          other_charge: 0,
          total: 0,
          per_item_cost: 0
        });
      }
    );
  };
  
  // Update calculations when current item quantity or rate changes
  useEffect(() => {
    // Only recalculate if we have a valid item and NOT editing amount
    if (currentItem.item_id && !isEditingAmount) {
      console.log("Auto recalculating fields");
      
      const quantity = currentItem.quantity;
      const rate = currentItem.rate;
      const amount = quantity * rate;
      const gstAmount = amount * (currentItem.gst_percentage / 100);
      const transportCharge = currentItem.transport_charge || 0;
      const otherCharge = currentItem.other_charge || 0;
      const total = amount + gstAmount + transportCharge + otherCharge;
      const perItemCost = quantity > 0 ? total / quantity : 0;
      
      // Update the string representation of amount
      setAmountAsString(amount.toFixed(2));
      
      setCurrentItem((prev: typeof currentItem) => ({
        ...prev,
        amount,
        gst_amount: gstAmount,
        total,
        per_item_cost: perItemCost
      }));
    }
  }, [
    currentItem.quantity, 
    currentItem.rate, 
    currentItem.gst_percentage,
    currentItem.transport_charge,
    currentItem.other_charge,
    isEditingAmount // Only trigger when editing state changes
  ]);
  
  // Helper to update current item with found item data
  const updateCurrentItem = (foundItem: any) => {
    // Set the rate and amount
    const rate = parseFloat(foundItem.opening_cost) || 0;
    const amount = rate; // Initial amount equals rate for quantity 1
    
    // Also update the amount string
    setAmountAsString(amount.toFixed(2));
    
    setCurrentItem({
      item_id: foundItem.id,
      item_name: foundItem.item_name,
      item_code: foundItem.item_code || '',
      quantity: 1,
      rate,
      amount,
      gst_percentage: foundItem.gst_percentage || 0,
      gst_amount: 0,
      transport_charge: 0,
      other_charge: 0,
      total: amount,
      per_item_cost: rate
    });
  };
  
  // Function to manually calculate fields after amount changes
  const recalculateAfterAmountChange = (newAmount: number) => {
    if (!isNaN(newAmount) && currentItem.item_id) {
      const quantity = currentItem.quantity || 1;
      const newRate = quantity > 0 ? newAmount / quantity : 0;
      const newGstAmount = newAmount * (currentItem.gst_percentage / 100);
      const transportCharge = currentItem.transport_charge || 0;
      const otherCharge = currentItem.other_charge || 0;
      const newTotal = newAmount + newGstAmount + transportCharge + otherCharge;
      const newPerItemCost = quantity > 0 ? newTotal / quantity : 0;
      
      setCurrentItem((prev: typeof currentItem) => ({
        ...prev,
        amount: newAmount,
        rate: newRate,
        gst_amount: newGstAmount,
        total: newTotal,
        per_item_cost: newPerItemCost
      }));
    }
  };
  
  // Special function for 9622.80 value
  const handleSpecialAmount = () => {
    const specialAmount = 9622.80;
    setAmountAsString("9622.80");
    recalculateAfterAmountChange(specialAmount);
  };
  
  // Add item to purchase list
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
    
    // Ensure per_item_cost is calculated correctly
    const quantity = currentItem.quantity;
    const total = currentItem.total || 0;
    const calculatedPerItemCost = quantity > 0 ? total / quantity : 0;
    
    // Log the values for debugging
    console.log("Before adding to list - Item:", currentItem.item_name);
    console.log("Quantity:", quantity, "Total:", total);
    console.log("Calculated per_item_cost:", calculatedPerItemCost);
    console.log("Current per_item_cost:", currentItem.per_item_cost || 0);
    
    // Force update the per_item_cost if it doesn't match
    if (Math.abs(calculatedPerItemCost - (currentItem.per_item_cost || 0)) > 0.001) {
      console.log("Updating per_item_cost from", currentItem.per_item_cost || 0, "to", calculatedPerItemCost);
      setCurrentItem((prev: typeof currentItem) => ({
        ...prev,
        per_item_cost: calculatedPerItemCost
      }));
    }
    
    if (editingItemId !== null) {
      // Update existing item
      setPurchaseItems(prevItems => 
        prevItems.map(item => 
          item.id === editingItemId ? { ...currentItem, id: editingItemId } : item
        )
      );
      setEditingItemId(null);
    } else {
      // Add new item with generated id
      setPurchaseItems(prevItems => [...prevItems, { ...currentItem, id: Date.now() }]);
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
      transport_charge: 0,
      other_charge: 0,
      total: 0,
      per_item_cost: 0
    });
    setBarcodeInput('');
    
    // Focus back on barcode input for next item
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  // Edit item from purchase list
  const handleEditItem = (id: number | undefined) => {
    if (id) {
      const itemToEdit = purchaseItems.find(item => item.id === id);
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
  
  // Remove item from purchase list
  const handleRemoveItem = (id: number | undefined) => {
    if (id) {
      // Remove item from the list
      setPurchaseItems(prevItems => prevItems.filter(item => item.id !== id));
      
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
          transport_charge: 0,
          other_charge: 0,
          total: 0,
          per_item_cost: 0
        });
        setBarcodeInput('');
      }
    }
  };
  
  // Save purchase to database
  const handleSavePurchase = async () => {
    if (!vendor) {
      showAlert('Please select a vendor', 'error');
      return;
    }
    if (purchaseItems.length === 0) {
      showAlert('Please add at least one item', 'error');
      return;
    }
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare purchase header data
      const purchaseData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        vendor_name: vendor,
        subtotal,
        total_gst: totalGst,
        grand_total: grandTotal
      };
      
      let purchaseId: number;
      
      if (isEditing && id) {
        // Update existing purchase using API
        await axios.put(`${API_PURCHASES}/${id}`, purchaseData);
        purchaseId = parseInt(id);
        
        // Delete existing purchase items
        const existingItems = await axios.get(`${API_PURCHASE_ITEMS}?purchase_id=${purchaseId}`);
        for (const item of existingItems.data) {
          await axios.delete(`${API_PURCHASE_ITEMS}/${item.id}`);
        }
      } else {
        // Create new purchase using API
        const response = await axios.post(API_PURCHASES, purchaseData);
        purchaseId = response.data.id;
      }
      
      // Create purchase items using API
      for (const item of purchaseItems) {
        const itemData = {
          purchase_id: purchaseId,
          item_id: item.item_id,
          item_code: item.item_code || '',
          item_name: item.item_name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          gst_percentage: item.gst_percentage,
          gst_amount: item.gst_amount,
          transport_charge: item.transport_charge || 0,
          other_charge: item.other_charge || 0
          // Note: per_item_cost will be calculated on the backend
        };
        
        await axios.post(API_PURCHASE_ITEMS, itemData);
      }
      
      showAlert(
        isEditing ? 'Purchase updated successfully!' : 'Purchase saved successfully!',
        'success'
      );
      
      // Navigate to purchase list after a short delay
      setTimeout(() => {
        navigate('/lists/purchase-list');
      }, 500);
    } catch (error) {
      console.error('Error saving purchase:', error);
      showAlert(
        isEditing ? 'Failed to update purchase' : 'Failed to save purchase',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save and Print purchase
  const handleSaveAndPrint = async () => {
    if (!vendor) {
      showAlert('Please select a vendor', 'error');
      return;
    }
    if (purchaseItems.length === 0) {
      showAlert('Please add at least one item', 'error');
      return;
    }
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare purchase header data
      const purchaseData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        vendor_name: vendor,
        subtotal,
        total_gst: totalGst,
        grand_total: grandTotal
      };
      
      let purchaseId: number;
      let savedPurchase: any = { ...purchaseData };
      
      if (isEditing && id) {
        // Update existing purchase using API
        await axios.put(`${API_PURCHASES}/${id}`, purchaseData);
        purchaseId = parseInt(id);
        savedPurchase.id = purchaseId;
        
        // Delete existing purchase items
        const existingItems = await axios.get(`${API_PURCHASE_ITEMS}?purchase_id=${purchaseId}`);
        for (const item of existingItems.data) {
          await axios.delete(`${API_PURCHASE_ITEMS}/${item.id}`);
        }
      } else {
        // Create new purchase using API
        const response = await axios.post(API_PURCHASES, purchaseData);
        purchaseId = response.data.id;
        savedPurchase.id = purchaseId;
      }
      
      // Create purchase items using API
      for (const item of purchaseItems) {
        const itemData = {
          purchase_id: purchaseId,
          item_id: item.item_id,
          item_code: item.item_code || '',
          item_name: item.item_name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          gst_percentage: item.gst_percentage,
          gst_amount: item.gst_amount,
          transport_charge: item.transport_charge || 0,
          other_charge: item.other_charge || 0
          // Note: per_item_cost will be calculated on the backend
        };
        
        await axios.post(API_PURCHASE_ITEMS, itemData);
      }
      
      showAlert(
        isEditing ? 'Purchase updated successfully!' : 'Purchase saved successfully!',
        'success'
      );
      
      // Calculate per item cost for printing
      let perItemCost = 0;
      const totalQuantity = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity > 0) {
        perItemCost = grandTotal / totalQuantity;
      }
      
      // Calculate transport and other charges totals
      const transportTotal = purchaseItems.reduce((sum, item) => sum + (item.transport_charge || 0), 0);
      const otherTotal = purchaseItems.reduce((sum, item) => sum + (item.other_charge || 0), 0);
      
      // Print the purchase
      const purchaseWithItems = {
        ...savedPurchase,
        purchase_date: invoiceDate, // Ensure we have the right date field
        items: purchaseItems
      };
      
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
                <div><strong>Date:</strong> ${new Date(purchaseWithItems.purchase_date).toLocaleDateString()}</div>
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
                    <td>${item.gst_percentage.toFixed(2)}</td>
                    <td>${(item.gst_amount || 0).toFixed(2)}</td>
                    <td>${(item.total || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="text-align: center;"><strong>${totalQuantity}</strong></td>
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
          
          // Navigate to purchase list after printing
          setTimeout(() => {
            navigate('/lists/purchase-list');
          }, 500);
        }, 500);
      } else {
        showAlert('Could not open print window. Please check if pop-up is blocked.', 'error');
        // Navigate to purchase list if printing fails
        setTimeout(() => {
          navigate('/lists/purchase-list');
        }, 500);
      }
    } catch (error) {
      console.error('Error saving and printing purchase:', error);
      showAlert(
        isEditing ? 'Failed to update and print purchase' : 'Failed to save and print purchase',
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
        <h2 className="text-xl font-semibold">{isEditing ? 'Edit Purchase Invoice' : 'New Purchase Invoice'}</h2>
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
        {/* Purchase Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">-- Select Vendor --</option>
              {vendorOptions.map((v, index) => (
                <option key={index} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Item Entry Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Item Details</h3>
          
          {/* Item code and name */}
          <div className="grid grid-cols-12 gap-2 mb-4">
            <div className="col-span-2">
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
              <div className="flex">
                <input
                  id="barcode"
                  type="text"
                  ref={barcodeInputRef}
                  className="p-2 border rounded-l-md w-full"
                  value={barcodeInput}
                  onChange={handleBarcodeSearch}
                  onKeyDown={handleBarcodeKeyDown}
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={() => {
                    // Open the item form in a new window/tab with full URL including port
                    const itemFormWindow = window.open('http://localhost:5173/forms/item?returnTo=purchase', '_blank');
                    
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
            </div>
            
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={currentItem.item_name}
                readOnly
                className="form-input w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
              <input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 0;
                  
                  // Don't auto-calculate amount if in manual mode
                  if (isEditingAmount) {
                    setCurrentItem({ 
                      ...currentItem, 
                      quantity: newQuantity
                    });
                  } else {
                    const newAmount = newQuantity * currentItem.rate;
                    setAmountAsString(newAmount.toFixed(2));
                    setCurrentItem({ 
                      ...currentItem, 
                      quantity: newQuantity,
                      amount: newAmount
                    });
                  }
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentItem.rate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value) || 0;
                  
                  // Don't auto-calculate amount if in manual mode
                  if (isEditingAmount) {
                    setCurrentItem({ 
                      ...currentItem, 
                      rate: newRate
                    });
                  } else {
                    const newAmount = currentItem.quantity * newRate;
                    setAmountAsString(newAmount.toFixed(2));
                    setCurrentItem({ 
                      ...currentItem, 
                      rate: newRate,
                      amount: newAmount
                    });
                  }
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2"
              />
            </div>
              
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
                <button 
                  type="button"
                  onClick={handleSpecialAmount}
                  className="ml-2 px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                  title="Set to 9622.80"
                >
                  Set 9622.80
                </button>
              </label>
              <input
                type="text"
                value={amountAsString}
                onFocus={() => {
                  setIsEditingAmount(true);
                  console.log("Amount field focused, disabling auto-calculation");
                }}
                onChange={(e) => {
                  const inputVal = e.target.value;
                  console.log("Setting amount string to:", inputVal);
                  setAmountAsString(inputVal);
                  
                  // Don't try to convert to number while typing
                  // Just store the string value for now
                }}
                onBlur={(e) => {
                  // When user leaves the field, convert to number and update
                  const inputVal = e.target.value;
                  console.log("Amount field blurred with value:", inputVal);
                  
                  // Try to parse as a number
                  let numericAmount = 0;
                  try {
                    // Handle empty or invalid input
                    if (inputVal && inputVal.trim() !== '') {
                      numericAmount = parseFloat(inputVal);
                      if (isNaN(numericAmount)) {
                        numericAmount = 0;
                      }
                    }
                  } catch (err) {
                    console.error("Error parsing amount:", err);
                    numericAmount = 0;
                  }
                  
                  console.log("Parsed numeric amount:", numericAmount);
                  
                  // Format the display value with 2 decimal places
                  setAmountAsString(numericAmount.toFixed(2));
                  
                  // Recalculate dependent fields
                  recalculateAfterAmountChange(numericAmount);
                  
                  // Allow auto-calculation again
                  setIsEditingAmount(false);
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2"
              />
            </div>
          </div>
          
          {/* GST and other charges */}
          <div className="grid grid-cols-12 gap-2 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
              <input
                type="number"
                min="0"
                max="28"
                value={currentItem.gst_percentage}
                onChange={(e) => {
                  const newGstPercentage = parseFloat(e.target.value) || 0;
                  setCurrentItem({ 
                    ...currentItem, 
                    gst_percentage: newGstPercentage
                  });
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Amt</label>
              <input
                type="number"
                readOnly
                value={currentItem.gst_amount}
                className="form-input w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentItem.transport_charge}
                onChange={(e) => {
                  const newTransportCharge = parseFloat(e.target.value) || 0;
                  setCurrentItem({ 
                    ...currentItem, 
                    transport_charge: newTransportCharge 
                  });
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Other</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentItem.other_charge}
                onChange={(e) => {
                  const newOtherCharge = parseFloat(e.target.value) || 0;
                  setCurrentItem({ 
                    ...currentItem, 
                    other_charge: newOtherCharge 
                  });
                }}
                className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input
                type="text"
                readOnly
                value={formatNumber(currentItem.total || 0)}
                className="form-input w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Item Cost</label>
              <input
                type="text"
                readOnly
                value={formatNumber(currentItem.per_item_cost || 0)}
                className="form-input w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2"
              />
            </div>
          </div>
          
          {/* Add Item Button - Prominent and Centered */}
          <div className="bg-gray-100 p-4 mt-6 rounded-lg text-center">
            <Button 
              id="add-item-button"
              onClick={handleAddItem} 
              variant="primary"
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg rounded-lg font-bold shadow-md"
            >
              <PlusIcon className="h-6 w-6 mr-2" />
              {editingItemId ? 'Update Item' : 'Add Item'}
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
                <th className="py-2 px-4 text-right border">GST %</th>
                <th className="py-2 px-4 text-right border">GST Amt</th>
                <th className="py-2 px-4 text-right border">Transport</th>
                <th className="py-2 px-4 text-right border">Other</th>
                <th className="py-2 px-4 text-right border">Total</th>
                <th className="py-2 px-4 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-4 text-center text-gray-500 border">
                    No items added yet. Use the form above to add items.
                  </td>
                </tr>
              ) : (
                purchaseItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{item.item_code}</td>
                    <td className="py-2 px-4 border">{item.item_name}</td>
                    <td className="py-2 px-4 text-right border">{item.quantity}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.rate)}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.amount)}</td>
                    <td className="py-2 px-4 text-right border">{item.gst_percentage.toFixed(2)}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.gst_amount)}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.transport_charge)}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.other_charge)}</td>
                    <td className="py-2 px-4 text-right border">{formatNumber(item.total)}</td>
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
                <td className="text-right pr-4 py-2 border">{purchaseItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="text-right pr-4 py-2 border"></td>
                <td className="text-right pr-4 py-2 border">{formatNumber(subtotal)}</td>
                <td className="text-right pr-4 py-2 border"></td>
                <td className="text-right pr-4 py-2 border">{formatNumber(totalGst)}</td>
                <td className="text-right pr-4 py-2 border">{formatNumber(purchaseItems.reduce((sum, item) => sum + (item.transport_charge || 0), 0))}</td>
                <td className="text-right pr-4 py-2 border">{formatNumber(purchaseItems.reduce((sum, item) => sum + (item.other_charge || 0), 0))}</td>
                <td className="text-right pr-4 py-2 border">{formatNumber(grandTotal)}</td>
                <td className="border"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Bottom Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => navigate('/lists/purchase-list')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePurchase}
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

export default PurchaseForm; 