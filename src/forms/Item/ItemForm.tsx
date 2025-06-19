import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/Button';

// Add event for item creation
const ITEM_CREATED_EVENT = 'item-created';

// Custom event type
interface ItemCreatedEvent extends CustomEvent {
  detail: { itemCode: string };
}

// Create custom event for item creation
export const createItemCreatedEvent = (itemCode: string): ItemCreatedEvent => {
  return new CustomEvent(ITEM_CREATED_EVENT, {
    detail: { itemCode },
    bubbles: true,
    cancelable: true
  }) as ItemCreatedEvent;
};

// Add event listener helper
export const addItemCreatedListener = (callback: (itemCode: string) => void): () => void => {
  const handler = (event: Event) => {
    const customEvent = event as ItemCreatedEvent;
    callback(customEvent.detail.itemCode);
  };
  
  window.addEventListener(ITEM_CREATED_EVENT, handler);
  return () => window.removeEventListener(ITEM_CREATED_EVENT, handler);
};

interface Category {
  id: number;
  category_number: number;
  category_name: string;
  group_id: number;
  group_name?: string;
}

interface Group {
  id: number;
  group_number: number;
  group_name: string;
}

interface ItemFormData {
  id?: number;
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
  category_id: number;
}

// Common GST rates in India
const GST_RATES = [0, 5, 12, 18, 28];

const API_CATEGORIES = 'http://168.231.122.33:4000/api/categories';
const API_ITEMS = 'http://168.231.122.33:4000/api/items';
const API_GROUPS = 'http://168.231.122.33:4000/api/groups';

// The completely rewritten component
const ItemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditMode = !!id;
  const { showAlert } = useAppStore();
  
  // Get returnTo parameter from URL query (if it exists)
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo');
  
  // Check if form is in a modal
  const isInModal = window.self !== window.top || window.frameElement || 
                    location.pathname.includes('/modal') || 
                    document.querySelector('.fixed.inset-0.z-50') !== null;
  
  // State
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormData, string>>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  
  // Form state - intentionally separate from itemData to prevent issues
  const [formData, setFormData] = useState<ItemFormData>({
    item_code: '',
    product_name: '',
    company_name: '',
    model: '',
    mrp: 0,
    item_name: '',
    gst_percentage: 18,
    company_barcode: '',
    barcode_2: '',
    opening_stock: 0,
    opening_cost: 0,
    category_id: 0
  });
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(API_CATEGORIES);
        setCategories(res.data);
      } catch (error) {
        showAlert('Failed to load categories', 'error');
      }
    };
    const fetchGroups = async () => {
      try {
        const res = await axios.get(API_GROUPS);
        setGroups(res.data);
      } catch (error) {
        showAlert('Failed to load groups', 'error');
      }
    };
    fetchCategories();
    fetchGroups();
  }, [showAlert]);

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      axios.get(`${API_ITEMS}/${id}`)
        .then(res => {
          setFormData(res.data);
          setSelectedCategory(
            categories.find(cat => cat.id === res.data.category_id) || null
          );
        })
        .catch(() => showAlert('Failed to load item', 'error'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isEditMode, id, categories, showAlert]);
  
  // Auto-generate item name
  useEffect(() => {
    if (loading) return;
    
    const { item_name } = formData;
    
    if (item_name) {
      const autoItemName = item_name;
      
      setFormData(prev => ({
        ...prev,
        item_name: autoItemName
      }));
    }
  }, [formData.item_name, loading]);
  
  // Handle category change (only in create mode)
  const handleCategoryChange = async (categoryId: string) => {
    if (isEditMode) return;
    
    const id = parseInt(categoryId, 10);
    const category = categories.find(c => c.id === id) || null;
    
    if (category) {
      setSelectedCategory(category);
      
      setFormData(prev => ({
        ...prev,
        category_id: category.id
      }));
      
      await generateItemCode(category.id);
      
      // Reset error
      setErrors(prev => ({
        ...prev,
        category_id: ''
      }));
    }
  };
  
  // Generate item code based on category
  const generateItemCode = async (categoryId: number) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category || !category.category_number) {
        console.error('Category or category_number missing:', category);
        return;
      }
      const url = `http://168.231.122.33:4000/api/items-max-code?category_number=${category.category_number}`;
      console.log('API URL:', url);
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      if (!response.data || !response.data.last_code) {
        console.error('Invalid API response:', response.data);
        showAlert('Error generating item code', 'error');
        return;
      }
      const newCode = response.data.last_code;
      setFormData(prev => ({
        ...prev,
        item_code: newCode
      }));
    } catch (error: any) {
      console.error('Error generating item code:', error);
      if (error.response?.data?.error) {
        showAlert(`Error: ${error.response.data.error}`, 'error');
      } else {
        showAlert('Failed to generate item code', 'error');
      }
      setFormData(prev => ({
        ...prev,
        item_code: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = async () => {
    let valid = true;
    const newErrors: Partial<Record<keyof ItemFormData, string>> = {};
    
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
      valid = false;
    }
    
    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
      valid = false;
    }
    
    if (formData.mrp <= 0) {
      newErrors.mrp = 'MRP must be greater than 0';
      valid = false;
    }
    
    if (formData.company_barcode) {
      try {
        // First check if company_barcode column exists
        try {
          // This will throw an error if the column doesn't exist
          axios.get(`${API_ITEMS}/check-barcode`);
          
          // If we reach here, the column exists, so check for uniqueness
          let query = `${API_ITEMS}/check-uniqueness`;
          const params = [formData.company_barcode];
          
          // If in edit mode, exclude the current item from the check
          if (isEditMode && formData.id) {
            query += '?excludeId=' + formData.id;
          }
          
          try {
            const existingResponse = await axios.get(query, { params });
            if (existingResponse.data && existingResponse.data.count > 0) {
              newErrors.company_barcode = 'This barcode is already used by another item';
              valid = false;
            }
          } catch (error) {
            console.error('Error checking barcode uniqueness:', error);
          }
        } catch (columnError) {
          // Column doesn't exist, skip the uniqueness check
          console.log('company_barcode column does not exist yet, skipping uniqueness check');
        }
      } catch (error) {
        console.error('Error checking barcode uniqueness:', error);
      }
    }
    
    if (formData.opening_stock < 0) {
      newErrors.opening_stock = 'Opening stock cannot be negative';
      valid = false;
    }
    
    if (formData.opening_cost < 0) {
      newErrors.opening_cost = 'Opening cost cannot be negative';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // First handle the direct field change
    if (['mrp', 'gst_percentage', 'opening_stock', 'opening_cost'].includes(name)) {
      // For numeric fields
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value)
      }));
    } else {
      // For text fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Auto-generate item_name when product_name, company_name, model, or mrp changes
    if (['product_name', 'company_name', 'model', 'mrp'].includes(name)) {
      setTimeout(() => {
        // Use setTimeout to ensure we have the latest state
        // Get latest form data after the update
        setFormData(current => {
          // Create the combined item name
          let generatedItemName = '';
          
          if (current.product_name) generatedItemName += current.product_name;
          if (current.company_name) generatedItemName += generatedItemName ? ' ' + current.company_name : current.company_name;
          if (current.model) generatedItemName += generatedItemName ? ' ' + current.model : current.model;
          if (current.mrp) generatedItemName += generatedItemName ? ' ' + current.mrp : String(current.mrp);
          
          return {
            ...current,
            item_name: generatedItemName || current.item_name
          };
        });
      }, 0);
    }
    
    // Clear error when user types
    if (errors[name as keyof ItemFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!await validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const lastCategoryId = formData.category_id;
      if (isEditMode && id) {
        await axios.put(`${API_ITEMS}/${id}`, formData);
        showAlert('Item updated successfully!', 'success');
      } else {
        await axios.post(API_ITEMS, formData);
        showAlert('Item saved successfully!', 'success');
      }
      
      // Dispatch custom event for item creation if in modal or when needed
      if (!isEditMode) {
        const itemCode = formData.item_code;
        if (isInModal) {
          // For modal usage, dispatch a custom event
          window.dispatchEvent(createItemCreatedEvent(itemCode));
        }
      }
      
      // Navigate based on context
      if (isInModal) {
        // Stay on the same page in modal mode
        // The parent component will handle closing
        setIsSubmitting(false);
      } else if (window.opener) {
        // If opened in a new window, send a message back to the opener
        const newItemCode = formData.item_code;
        
        // Post message to parent window
        window.opener.postMessage({ newItemCode }, window.location.origin);
        
        // Close this window after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        // Regular navigation when not in a modal or popup
        if (returnTo === 'purchase') {
          // Navigate back to purchase form with the newly created item code
          navigate(`/forms/purchase?newItemCode=${formData.item_code}`);
        } else if (returnTo === 'cash') {
          // Navigate back to cash sale form with the newly created item code
          navigate(`/forms/cash-sale?newItemCode=${formData.item_code}`);
        } else if (returnTo === 'credit') {
          // Navigate back to credit sale form with the newly created item code
          navigate(`/forms/credit-sale?newItemCode=${formData.item_code}`);
        } else if (returnTo) {
          navigate(returnTo);
        } else {
          navigate('/lists/item-list');
        }
      }
      
      // Only reset and generate next code if not edit mode and not navigating away
      if (!isEditMode && !isInModal && !window.opener && !returnTo) {
        // Store the last selected category id
        const lastCatId = formData.category_id;
        setFormData({
          item_code: '',
          product_name: '',
          company_name: '',
          model: '',
          mrp: 0,
          item_name: '',
          gst_percentage: 18,
          company_barcode: '',
          barcode_2: '',
          opening_stock: 0,
          opening_cost: 0,
          category_id: lastCatId
        });
        // Also keep the last selected category in dropdown
        const lastCat = categories.find(c => c.id === lastCatId) || null;
        setSelectedCategory(lastCat);
        setTimeout(() => {
          generateItemCode(lastCatId);
        }, 1200);
      }
    } catch (error) {
      showAlert('Failed to save item. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewList = () => {
    navigate('/lists/item-list');
  };
  
  const handleNewCategory = () => {
    navigate('/forms/category');
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    if (window.opener) {
      // If opened in a new window, just close it
      window.close();
    } else if (returnTo === 'purchase') {
      navigate('/forms/purchase');
    } else if (returnTo === 'cash') {
      navigate('/forms/cash-sale');
    } else if (returnTo === 'credit') {
      navigate('/forms/credit-sale');
    } else {
      navigate('/lists/item-list');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Item' : 'Item Master'}</h1>
        <div className="flex space-x-2">
          <Button
            onClick={handleNewCategory}
            variant="accent"
            icon={<PlusIcon className="h-5 w-5" />}
          >
            New Category
          </Button>
          <Button
            onClick={handleViewList}
            variant="secondary"
          >
            View Item List
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Category and Item Code Section */}
            <div className="form-control">
              <label htmlFor="category_id" className="label">Category</label>
              {isEditMode ? (
                <>
                  <input
                    type="text"
                    value={selectedCategory ? `${selectedCategory.category_number} - ${selectedCategory.category_name} (${selectedCategory.group_name})` : ''}
                    readOnly
                    className="input bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Category cannot be changed in edit mode</p>
                </>
              ) : (
                <>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`select ${errors.category_id ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.category_number} - {category.category_name} ({category.group_name})
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>
                  )}
                </>
              )}
            </div>
            
            <div className="form-control">
              <label htmlFor="item_code" className="label">Item Code</label>
              <input
                type="text"
                id="item_code"
                name="item_code"
                value={formData.item_code}
                onChange={handleChange}
                readOnly
                className="input bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                {isEditMode ? 'Item code cannot be changed' : 'Auto-generated based on selected category'}
              </p>
            </div>
            
            {/* Product Name */}
            <div className="form-control">
              <label htmlFor="product_name" className="label">Product Name</label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                className={`input ${errors.product_name ? 'border-red-500' : ''}`}
                placeholder="Enter product name"
              />
              {errors.product_name && (
                <p className="text-red-500 text-xs mt-1">{errors.product_name}</p>
              )}
            </div>
            
            <div className="form-control">
              <label htmlFor="company_name" className="label">Company / Brand Name</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={`input ${errors.company_name ? 'border-red-500' : ''}`}
                placeholder="Enter company name"
              />
              {errors.company_name && (
                <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
              )}
            </div>
            
            <div className="form-control">
              <label htmlFor="model" className="label">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input"
                placeholder="Enter model (optional)"
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="mrp" className="label">MRP</label>
              <input
                type="number"
                id="mrp"
                name="mrp"
                value={formData.mrp || ''}
                onChange={handleChange}
                className={`input ${errors.mrp ? 'border-red-500' : ''}`}
                placeholder="Enter MRP"
                min="0"
                step="0.01"
              />
              {errors.mrp && (
                <p className="text-red-500 text-xs mt-1">{errors.mrp}</p>
              )}
            </div>
            
            {/* Item Name moved here, after MRP */}
            <div className="form-control">
              <label htmlFor="item_name" className="label">Item Name</label>
              <input
                type="text"
                id="item_name"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                className={`input ${errors.item_name ? 'border-red-500' : ''}`}
                placeholder="Enter item name"
              />
              {errors.item_name && (
                <p className="text-red-500 text-xs mt-1">{errors.item_name}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated based on Product Name, Company Name, Model and MRP
              </p>
            </div>
            
            {/* GST, Barcode, Stock Section */}
            <div className="form-control">
              <label htmlFor="gst_percentage" className="label">GST Percentage</label>
              <select
                id="gst_percentage"
                name="gst_percentage"
                value={formData.gst_percentage}
                onChange={handleChange}
                className="select"
              >
                {GST_RATES.map(rate => (
                  <option key={rate} value={rate}>
                    {rate}%
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control">
              <label htmlFor="company_barcode" className="label">Company Barcode</label>
              <input
                type="text"
                id="company_barcode"
                name="company_barcode"
                value={formData.company_barcode}
                onChange={handleChange}
                className={`input ${errors.company_barcode ? 'border-red-500' : ''}`}
                placeholder="Enter company barcode (optional)"
              />
              {errors.company_barcode && (
                <p className="text-red-500 text-xs mt-1">{errors.company_barcode}</p>
              )}
            </div>
            
            <div className="form-control">
              <label htmlFor="barcode_2" className="label">Alternative Barcode</label>
              <input
                type="text"
                id="barcode_2"
                name="barcode_2"
                value={formData.barcode_2}
                onChange={handleChange}
                className="input"
                placeholder="Enter alternative barcode (optional)"
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="opening_stock" className="label">Opening Stock</label>
              <input
                type="number"
                id="opening_stock"
                name="opening_stock"
                value={formData.opening_stock || ''}
                onChange={handleChange}
                className={`input ${errors.opening_stock ? 'border-red-500' : ''}`}
                placeholder="Enter opening stock"
                min="0"
              />
              {errors.opening_stock && (
                <p className="text-red-500 text-xs mt-1">{errors.opening_stock}</p>
              )}
            </div>
            
            <div className="form-control">
              <label htmlFor="opening_cost" className="label">Opening Cost</label>
              <input
                type="number"
                id="opening_cost"
                name="opening_cost"
                value={formData.opening_cost || ''}
                onChange={handleChange}
                className={`input ${errors.opening_cost ? 'border-red-500' : ''}`}
                placeholder="Enter opening cost"
                min="0"
                step="0.01"
              />
              {errors.opening_cost && (
                <p className="text-red-500 text-xs mt-1">{errors.opening_cost}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            {!isEditMode && (
              <Button
                type="button"
                onClick={async () => {
                  if (selectedCategory) {
                    setFormData({
                      item_code: '',
                      product_name: '',
                      company_name: '',
                      model: '',
                      mrp: 0,
                      item_name: '',
                      gst_percentage: 18,
                      company_barcode: '',
                      barcode_2: '',
                      opening_stock: 0,
                      opening_cost: 0,
                      category_id: selectedCategory.id
                    });
                    await generateItemCode(selectedCategory.id);
                  }
                }}
                variant="ghost"
                className="mr-3"
                disabled={isSubmitting || !selectedCategory}
              >
                Reset
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Item' : 'Save Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;