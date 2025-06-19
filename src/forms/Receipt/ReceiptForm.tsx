import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  HStack,
  useToast,
  Text,
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  FormErrorMessage,
  Checkbox,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

interface Party {
  id: number;
  party_name: string;
  party_type: string;
  current_balance: number;
}

interface Receipt {
  id?: number;
  receipt_number: string;
  receipt_date: string;
  party_id: number;
  party_name: string;
  bank_account: string;
  amount: number;
  payment_mode: string;
  cheque_number: string;
  cheque_date: string;
  bank_name: string;
  neft_date: string;
  is_on_account: boolean;
  is_advance: boolean;
  notes: string;
}

const ReceiptForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Initialize with today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd');

  const [receipt, setReceipt] = useState<Receipt>({
    receipt_number: '',
    receipt_date: today,
    party_id: 0,
    party_name: '',
    bank_account: 'CASH',
    amount: 0,
    payment_mode: 'cash',
    cheque_number: '',
    cheque_date: '',
    bank_name: '',
    neft_date: '',
    is_on_account: false,
    is_advance: false,
    notes: '',
  });

  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextReceiptNumber, setNextReceiptNumber] = useState('');

  useEffect(() => {
    fetchParties();
    if (!isEditMode) {
      generateNextReceiptNumber();
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchReceipt();
    }
  }, [id]);

  const fetchParties = async () => {
    try {
      // Fetch only sales parties for receipts
      const response = await fetch('/api/parties?party_type=sales');
      if (!response.ok) {
        throw new Error('Failed to fetch parties');
      }
      const data = await response.json();
      setParties(data);
    } catch (error) {
      console.error('Error fetching parties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load parties',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const generateNextReceiptNumber = async () => {
    try {
      // Get the latest receipt to generate a number
      // This is a simplified approach - in a real system you might have a more complex numbering system
      const response = await fetch('/api/receipts');
      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }
      
      const receipts = await response.json();
      
      // If there are no receipts, start with RCT-1, otherwise increment the last one
      if (receipts.length === 0) {
        setNextReceiptNumber('RCT-1');
        setReceipt(prev => ({ ...prev, receipt_number: 'RCT-1' }));
      } else {
        // Find highest number
        const highestNumber = receipts.reduce((max: number, receipt: any) => {
          const match = receipt.receipt_number.match(/RCT-(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        
        const nextNumber = `RCT-${highestNumber + 1}`;
        setNextReceiptNumber(nextNumber);
        setReceipt(prev => ({ ...prev, receipt_number: nextNumber }));
      }
    } catch (error) {
      console.error('Error generating receipt number:', error);
      // Set a default if there's an error
      setNextReceiptNumber('RCT-1');
      setReceipt(prev => ({ ...prev, receipt_number: 'RCT-1' }));
    }
  };

  const fetchReceipt = async () => {
    try {
      const response = await fetch(`/api/receipts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch receipt');
      }
      const data = await response.json();
      setReceipt(data);
      
      // Fetch party details to show balance
      const partyResponse = await fetch(`/api/parties/${data.party_id}`);
      if (partyResponse.ok) {
        const partyData = await partyResponse.json();
        setSelectedParty(partyData);
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipt data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!receipt.receipt_number.trim()) {
      newErrors.receipt_number = 'Receipt number is required';
    }
    
    if (!receipt.receipt_date) {
      newErrors.receipt_date = 'Receipt date is required';
    }
    
    if (!receipt.party_id) {
      newErrors.party_id = 'Party is required';
    }
    
    if (!receipt.bank_account) {
      newErrors.bank_account = 'Bank account is required';
    }
    
    if (!receipt.amount || receipt.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (receipt.payment_mode === 'cheque') {
      if (!receipt.cheque_number) {
        newErrors.cheque_number = 'Cheque number is required';
      }
      if (!receipt.cheque_date) {
        newErrors.cheque_date = 'Cheque date is required';
      }
      if (!receipt.bank_name) {
        newErrors.bank_name = 'Bank name is required';
      }
    }
    
    if (receipt.payment_mode === 'neft') {
      if (!receipt.neft_date) {
        newErrors.neft_date = 'NEFT date is required';
      }
      if (!receipt.bank_name) {
        newErrors.bank_name = 'Bank name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReceipt((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReceipt((prev) => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setReceipt((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePartyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const partyId = parseInt(e.target.value);
    
    if (partyId) {
      try {
        // Get party details to get name and show balance
        const response = await fetch(`/api/parties/${partyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch party details');
        }
        
        const partyData = await response.json();
        setSelectedParty(partyData);
        
        setReceipt((prev) => ({
          ...prev,
          party_id: partyId,
          party_name: partyData.party_name
        }));
      } catch (error) {
        console.error('Error fetching party details:', error);
      }
    } else {
      setSelectedParty(null);
      setReceipt((prev) => ({
        ...prev,
        party_id: 0,
        party_name: ''
      }));
    }
  };

  const handlePaymentModeChange = (value: string) => {
    setReceipt((prev) => ({ ...prev, payment_mode: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Error',
        description: 'Please fix the errors before submitting',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const url = isEditMode ? `/api/receipts/${id}` : '/api/receipts';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receipt),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save receipt');
      }
      
      const savedReceipt = await response.json();
      
      toast({
        title: 'Success',
        description: `Receipt ${isEditMode ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to print or preview
      navigate(`/receipts/print/${savedReceipt.id}`);
    } catch (error) {
      console.error('Error saving receipt:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} receipt`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Receipt Form</h2>
      
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
        <p className="font-semibold">Development in Progress</p>
        <p>
          The Receipt form is being implemented. Basic functionality is available, 
          but additional features will be added soon. Please use the navigation menu to access other features.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">Receipt Number</label>
            <input
              type="text"
              className="input"
              placeholder="Auto-generated"
              disabled
            />
          </div>
          
          <div className="form-control">
            <label className="label">Receipt Date</label>
            <input
              type="date"
              className="input"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-control">
            <label className="label">Party Name</label>
            <select className="select">
              <option value="">Select a party</option>
              <option value="1">Customer 1</option>
              <option value="2">Customer 2</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">Amount</label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          
          <div className="form-control">
            <label className="label">Payment Mode</label>
            <select className="select">
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="neft">NEFT/RTGS</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">Bank Account</label>
            <select className="select">
              <option value="cash">CASH</option>
              <option value="bank1">AXIS BANK</option>
              <option value="bank2">KOTAK BANK</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-8 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.alert('This feature is coming soon')}
          >
            Save Receipt
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReceiptForm; 