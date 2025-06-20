import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../../config';
import useAppStore from '../../store/useAppStore';

// API endpoints
const API_PARTIES = 'http://168.231.122.33:4000/api/parties';
const API_PAYMENTS = 'http://168.231.122.33:4000/api/payments';
const API_PENDING_PURCHASES = 'http://168.231.122.33:4000/api/pending-purchases';

interface Party {
  id: number;
  party_name: string;
  party_type: string;
  current_balance: number;
}

interface PurchaseInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  grand_total: number;
}

interface Payment {
  id?: number;
  payment_number: string;
  payment_date: string;
  party_id: number;
  party_name: string;
  bank_account: string;
  amount: number;
  payment_mode: string;
  cheque_number: string;
  cheque_date: string;
  bank_name: string;
  neft_date: string;
  is_advance: boolean;
  purchase_invoice_id: number | null;
  purchase_invoice_number: string;
  notes: string;
}

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Initialize with today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd');

  const [payment, setPayment] = useState<Payment>({
    payment_number: '',
    payment_date: today,
    party_id: 0,
    party_name: '',
    bank_account: 'CASH',
    amount: 0,
    payment_mode: 'cash',
    cheque_number: '',
    cheque_date: '',
    bank_name: '',
    neft_date: '',
    is_advance: false,
    purchase_invoice_id: null,
    purchase_invoice_number: '',
    notes: '',
  });

  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextPaymentNumber, setNextPaymentNumber] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchParties();
    if (!isEditMode) {
      generateNextPaymentNumber();
    }
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      fetchPayment();
    }
  }, [id]);

  const fetchParties = async () => {
    try {
      // Try to fetch from API first
      try {
        const response = await axios.get(`${API_PARTIES}?party_type=purchase`);
        setParties(response.data);
        return;
      } catch (apiError) {
        console.error('API error:', apiError);
      }
      
      // If API fails, use mock data
      console.log('Using mock party data');
      const mockParties: Party[] = [
        { id: 1, party_name: 'ABC Suppliers', party_type: 'purchase', current_balance: 25000 },
        { id: 2, party_name: 'XYZ Traders', party_type: 'purchase', current_balance: 15000 },
        { id: 3, party_name: 'Global Imports', party_type: 'purchase', current_balance: 50000 },
        { id: 4, party_name: 'Local Distributors', party_type: 'purchase', current_balance: 10000 }
      ];
      setParties(mockParties);
    } catch (error) {
      console.error('Error fetching parties:', error);
      setErrorMessage('Failed to load parties');
    }
  };

  const generateNextPaymentNumber = async () => {
    try {
      // Get the latest payment to generate a number
      const response = await axios.get(API_PAYMENTS);
      const payments = response.data;
      
      // If there are no payments, start with PMT-1, otherwise increment the last one
      if (payments.length === 0) {
        setNextPaymentNumber('PMT-1');
        setPayment(prev => ({ ...prev, payment_number: 'PMT-1' }));
      } else {
        // Find highest number
        const highestNumber = payments.reduce((max: number, payment: any) => {
          const match = payment.payment_number.match(/PMT-(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        
        const nextNumber = `PMT-${highestNumber + 1}`;
        setNextPaymentNumber(nextNumber);
        setPayment(prev => ({ ...prev, payment_number: nextNumber }));
      }
    } catch (error) {
      console.error('Error generating payment number:', error);
      // Set a default if there's an error
      setNextPaymentNumber('PMT-1');
      setPayment(prev => ({ ...prev, payment_number: 'PMT-1' }));
    }
  };

  const fetchPayment = async () => {
    if (!id) return;
    
    try {
      const response = await axios.get(`${API_PAYMENTS}/${id}`);
      setPayment(response.data);
      
      // Fetch party details to show balance
      try {
        const partyResponse = await axios.get(`${API_PARTIES}/${response.data.party_id}`);
        setSelectedParty(partyResponse.data);
        
        // Also fetch the purchase invoices for this party
        fetchPurchaseInvoices(partyResponse.data.id);
      } catch (partyError) {
        console.error('Error fetching party details:', partyError);
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      setErrorMessage('Failed to load payment data');
    }
  };

  const fetchPurchaseInvoices = async (partyId: number) => {
    try {
      // Try to fetch from API first
      try {
        const response = await axios.get(`${API_PENDING_PURCHASES}?party_id=${partyId}`);
        setPurchaseInvoices(response.data);
        return;
      } catch (apiError) {
        console.error('API error:', apiError);
      }
      
      // If API fails, use mock data
      console.log('Using mock invoice data');
      const mockInvoices: PurchaseInvoice[] = [
        { 
          id: 1, 
          invoice_number: 'INV-001', 
          invoice_date: format(new Date(), 'yyyy-MM-dd'), 
          grand_total: 5000 
        },
        { 
          id: 2, 
          invoice_number: 'INV-002', 
          invoice_date: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), 
          grand_total: 7500 
        }
      ];
      setPurchaseInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching purchase invoices:', error);
      setErrorMessage('Failed to load purchase invoices');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!payment.payment_number.trim()) {
      newErrors.payment_number = 'Payment number is required';
    }
    
    if (!payment.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }
    
    if (!payment.party_id) {
      newErrors.party_id = 'Party is required';
    }
    
    if (!payment.bank_account) {
      newErrors.bank_account = 'Bank account is required';
    }
    
    if (!payment.amount || payment.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!payment.is_advance && !payment.purchase_invoice_id) {
      newErrors.purchase_invoice_id = 'Purchase invoice is required unless payment is marked as advance';
    }
    
    if (payment.payment_mode === 'cheque') {
      if (!payment.cheque_number) {
        newErrors.cheque_number = 'Cheque number is required';
      }
      if (!payment.cheque_date) {
        newErrors.cheque_date = 'Cheque date is required';
      }
      if (!payment.bank_name) {
        newErrors.bank_name = 'Bank name is required';
      }
    }
    
    if (payment.payment_mode === 'neft') {
      if (!payment.neft_date) {
        newErrors.neft_date = 'NEFT date is required';
      }
      if (!payment.bank_name) {
        newErrors.bank_name = 'Bank name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayment((prev) => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setPayment((prev) => ({ ...prev, [name]: checked }));
    
    // Clear purchase invoice selection if advance payment is checked
    if (name === 'is_advance' && checked) {
      setPayment((prev) => ({
        ...prev,
        purchase_invoice_id: null,
        purchase_invoice_number: ''
      }));
    }
  };

  const handlePartyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const partyId = parseInt(e.target.value);
    
    if (partyId) {
      try {
        // Get party details to get name and show balance
        const response = await axios.get(`${API_PARTIES}/${partyId}`);
        const partyData = response.data;
        setSelectedParty(partyData);
        
        setPayment((prev) => ({
          ...prev,
          party_id: partyId,
          party_name: partyData.party_name
        }));
        
        // Also fetch purchase invoices for this party
        fetchPurchaseInvoices(partyId);
      } catch (error) {
        console.error('Error fetching party details:', error);
      }
    } else {
      setSelectedParty(null);
      setPayment((prev) => ({
        ...prev,
        party_id: 0,
        party_name: ''
      }));
      setPurchaseInvoices([]);
    }
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceId = parseInt(e.target.value);
    
    if (invoiceId) {
      const selectedInvoice = purchaseInvoices.find(inv => inv.id === invoiceId);
      
      if (selectedInvoice) {
        setPayment((prev) => ({
          ...prev,
          purchase_invoice_id: invoiceId,
          purchase_invoice_number: selectedInvoice.invoice_number,
          // Optionally set the amount to the invoice amount
          amount: selectedInvoice.grand_total
        }));
      }
    } else {
      setPayment((prev) => ({
        ...prev,
        purchase_invoice_id: null,
        purchase_invoice_number: ''
      }));
    }
  };

  const handlePaymentModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPayment((prev) => ({ ...prev, payment_mode: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let savedPayment;
      
      if (isEditMode) {
        // Update existing payment
        const response = await axios.put(`${API_PAYMENTS}/${id}`, payment);
        savedPayment = response.data;
      } else {
        // Create new payment
        const response = await axios.post(API_PAYMENTS, payment);
        savedPayment = response.data;
      }
      
      setSuccessMessage(`Payment ${isEditMode ? 'updated' : 'created'} successfully`);
      
      // Navigate back to list after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error saving payment:', error);
      setErrorMessage(`Failed to ${isEditMode ? 'update' : 'create'} payment`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Form</h2>
      
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
        <p className="font-semibold">Development in Progress</p>
        <p>
          The Payment form is being implemented. Basic functionality is available, 
          but additional features will be added soon. Please use the navigation menu to access other features.
        </p>
      </div>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">Payment Number</label>
            <input
              type="text"
              name="payment_number"
              value={payment.payment_number}
              onChange={handleChange}
              className="input"
              placeholder="Auto-generated"
              disabled
            />
            {errors.payment_number && (
              <p className="text-red-500 text-sm mt-1">{errors.payment_number}</p>
            )}
          </div>
          
          <div className="form-control">
            <label className="label">Payment Date</label>
            <input
              type="date"
              name="payment_date"
              value={payment.payment_date}
              onChange={handleChange}
              className="input"
            />
            {errors.payment_date && (
              <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>
            )}
          </div>
          
          <div className="form-control">
            <label className="label">Party Name</label>
            <select 
              name="party_id"
              value={payment.party_id || ''}
              onChange={handlePartyChange}
              className="select"
            >
              <option value="">Select a party</option>
              {parties.map(party => (
                <option key={party.id} value={party.id}>{party.party_name}</option>
              ))}
            </select>
            {errors.party_id && (
              <p className="text-red-500 text-sm mt-1">{errors.party_id}</p>
            )}
          </div>
          
          <div className="form-control">
            <label className="label">Amount</label>
            <input
              type="number"
              name="amount"
              value={payment.amount}
              onChange={handleNumberChange}
              className="input"
              placeholder="0.00"
              step="0.01"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>
          
          <div className="form-control">
            <label className="label">Payment Mode</label>
            <select
              name="payment_mode"
              value={payment.payment_mode}
              onChange={handleChange}
              className="select"
            >
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="neft">NEFT/RTGS</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">Bank Account</label>
            <select
              name="bank_account"
              value={payment.bank_account}
              onChange={handleChange}
              className="select"
            >
              <option value="cash">CASH</option>
              <option value="bank1">AXIS BANK</option>
              <option value="bank2">KOTAK BANK</option>
            </select>
            {errors.bank_account && (
              <p className="text-red-500 text-sm mt-1">{errors.bank_account}</p>
            )}
          </div>
          
          <div className="form-control">
            <label className="label">Is Advance Payment</label>
            <div className="mt-2">
              <input
                type="checkbox"
                checked={payment.is_advance}
                onChange={(e) => handleCheckboxChange('is_advance', e.target.checked)}
                className="checkbox"
              />
              <span className="ml-2">Mark as advance payment</span>
            </div>
          </div>
          
          {!payment.is_advance && (
            <div className="form-control">
              <label className="label">Purchase Invoice</label>
              <select
                name="purchase_invoice_id"
                value={payment.purchase_invoice_id || ''}
                onChange={handleInvoiceChange}
                className="select"
              >
                <option value="">Select an invoice</option>
                {purchaseInvoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} ({format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}) - ₹{invoice.grand_total.toFixed(2)}
                  </option>
                ))}
              </select>
              {errors.purchase_invoice_id && (
                <p className="text-red-500 text-sm mt-1">{errors.purchase_invoice_id}</p>
              )}
            </div>
          )}
          
          {payment.payment_mode === 'cheque' && (
            <>
              <div className="form-control">
                <label className="label">Cheque Number</label>
                <input
                  type="text"
                  name="cheque_number"
                  value={payment.cheque_number}
                  onChange={handleChange}
                  className="input"
                />
                {errors.cheque_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.cheque_number}</p>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">Cheque Date</label>
                <input
                  type="date"
                  name="cheque_date"
                  value={payment.cheque_date}
                  onChange={handleChange}
                  className="input"
                />
                {errors.cheque_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.cheque_date}</p>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={payment.bank_name}
                  onChange={handleChange}
                  className="input"
                />
                {errors.bank_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>
                )}
              </div>
            </>
          )}
          
          {payment.payment_mode === 'neft' && (
            <>
              <div className="form-control">
                <label className="label">NEFT/RTGS Date</label>
                <input
                  type="date"
                  name="neft_date"
                  value={payment.neft_date}
                  onChange={handleChange}
                  className="input"
                />
                {errors.neft_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.neft_date}</p>
                )}
              </div>
              
              <div className="form-control">
                <label className="label">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={payment.bank_name}
                  onChange={handleChange}
                  className="input"
                />
                {errors.bank_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>
                )}
              </div>
            </>
          )}
          
          <div className="form-control md:col-span-2">
            <label className="label">Notes</label>
            <textarea
              name="notes"
              value={payment.notes}
              onChange={handleChange}
              className="textarea h-24"
              placeholder="Any additional notes..."
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end mt-8 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-ghost"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 