import axios from 'axios';

// IMPORTANT: Only the server IP, do NOT include /api here
const API_URL = 'http://168.231.122.33:4000';

/**
 * Function to handle item lookup on Tab or Enter key press
 * This can be used in Purchase, Cash Sales, and Credit Sales forms
 */
export const handleItemLookupOnKey = async (
  event: React.KeyboardEvent<HTMLInputElement>,
  itemCode: string,
  onItemFound: (data: any) => void,
  onError: (error: any) => void
) => {
  // Only process if Tab or Enter key was pressed
  if (event.key === 'Tab' || event.key === 'Enter') {
    // Prevent default behavior for Enter key (form submission)
    if (event.key === 'Enter') {
      event.preventDefault();
    }
    
    // Don't do anything if code is empty
    if (!itemCode || itemCode.trim() === '') {
      return;
    }
    
    try {
      console.log('Looking up item with exact code:', itemCode);
      
      // Call the exact match endpoint
      const response = await axios.get(`${API_URL}/api/item-exact`, {
        params: { code: itemCode.trim() }
      });
      
      // Call the success handler with the data
      onItemFound(response.data);
      
    } catch (error) {
      console.error('Error in item lookup:', error);
      onError(error);
      
      // If you want to show a notification or alert, you can do it here
      // or in the onError callback
    }
  }
};

export default handleItemLookupOnKey; 