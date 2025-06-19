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
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  FormErrorMessage,
  Textarea,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';

interface Expense {
  id?: number;
  voucher_number: string;
  expense_date: string;
  expense_type: string;
  payment_mode: string;
  bank_account: string;
  amount: number;
  description: string;
  notes: string;
}

const expenseTypes = [
  'Rent',
  'Electricity',
  'Phone',
  'Internet',
  'Office Supplies',
  'Salaries',
  'Travel',
  'Meals',
  'Entertainment',
  'Miscellaneous',
];

const ExpenseForm: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Initialize with today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd');

  const [expense, setExpense] = useState<Expense>({
    voucher_number: '',
    expense_date: today,
    expense_type: '',
    payment_mode: 'cash',
    bank_account: 'CASH',
    amount: 0,
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextVoucherNumber, setNextVoucherNumber] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchExpense();
    } else {
      generateNextVoucherNumber();
    }
  }, [id]);

  const generateNextVoucherNumber = async () => {
    try {
      // Get the latest expense to generate a number
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const expenses = await response.json();
      
      // If there are no expenses, start with EXP-1, otherwise increment the last one
      if (expenses.length === 0) {
        setNextVoucherNumber('EXP-1');
        setExpense(prev => ({ ...prev, voucher_number: 'EXP-1' }));
      } else {
        // Find highest number
        const highestNumber = expenses.reduce((max: number, expense: any) => {
          const match = expense.voucher_number.match(/EXP-(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            return num > max ? num : max;
          }
          return max;
        }, 0);
        
        const nextNumber = `EXP-${highestNumber + 1}`;
        setNextVoucherNumber(nextNumber);
        setExpense(prev => ({ ...prev, voucher_number: nextNumber }));
      }
    } catch (error) {
      console.error('Error generating voucher number:', error);
      // Set a default if there's an error
      setNextVoucherNumber('EXP-1');
      setExpense(prev => ({ ...prev, voucher_number: 'EXP-1' }));
    }
  };

  const fetchExpense = async () => {
    try {
      const response = await fetch(`/api/expenses/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expense');
      }
      const data = await response.json();
      setExpense(data);
    } catch (error) {
      console.error('Error fetching expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expense data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!expense.voucher_number.trim()) {
      newErrors.voucher_number = 'Voucher number is required';
    }
    
    if (!expense.expense_date) {
      newErrors.expense_date = 'Date is required';
    }
    
    if (!expense.expense_type) {
      newErrors.expense_type = 'Expense type is required';
    }
    
    if (!expense.payment_mode) {
      newErrors.payment_mode = 'Payment mode is required';
    }
    
    if (expense.payment_mode !== 'cash' && !expense.bank_account) {
      newErrors.bank_account = 'Bank account is required for non-cash payments';
    }
    
    if (!expense.amount || expense.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value === '' ? 0 : parseFloat(value) }));
  };

  const handlePaymentModeChange = (value: string) => {
    setExpense((prev) => {
      // If changing to cash, clear bank account
      if (value === 'cash') {
        return { ...prev, payment_mode: value, bank_account: 'CASH' };
      }
      return { ...prev, payment_mode: value };
    });
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
      const url = isEditMode ? `/api/expenses/${id}` : '/api/expenses';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save expense');
      }
      
      const savedExpense = await response.json();
      
      toast({
        title: 'Success',
        description: `Expense ${isEditMode ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to expense list
      navigate('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} expense`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>
        {isEditMode ? 'Edit Expense' : 'New Expense'}
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="start">
          <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
            <GridItem colSpan={1}>
              <FormControl isRequired isInvalid={!!errors.voucher_number}>
                <FormLabel>Voucher Number</FormLabel>
                <Input
                  name="voucher_number"
                  value={expense.voucher_number}
                  onChange={handleChange}
                  placeholder="Enter voucher number"
                />
                <FormErrorMessage>{errors.voucher_number}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={1}>
              <FormControl isRequired isInvalid={!!errors.expense_date}>
                <FormLabel>Expense Date</FormLabel>
                <Input
                  name="expense_date"
                  type="date"
                  value={expense.expense_date}
                  onChange={handleChange}
                />
                <FormErrorMessage>{errors.expense_date}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={1}>
              <FormControl isRequired isInvalid={!!errors.expense_type}>
                <FormLabel>Expense Type</FormLabel>
                <Select
                  name="expense_type"
                  value={expense.expense_type}
                  onChange={handleChange}
                  placeholder="Select expense type"
                >
                  {expenseTypes.map((type) => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </Select>
                <FormErrorMessage>{errors.expense_type}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={1}>
              <FormControl isRequired isInvalid={!!errors.amount}>
                <FormLabel>Amount</FormLabel>
                <Input
                  name="amount"
                  type="number"
                  value={expense.amount}
                  onChange={handleNumberChange}
                  placeholder="0.00"
                />
                <FormErrorMessage>{errors.amount}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={2}>
              <FormControl as="fieldset" isRequired isInvalid={!!errors.payment_mode}>
                <FormLabel as="legend">Payment Mode</FormLabel>
                <RadioGroup
                  onChange={handlePaymentModeChange}
                  value={expense.payment_mode}
                >
                  <HStack spacing={6}>
                    <Radio value="cash">Cash</Radio>
                    <Radio value="bank">Bank</Radio>
                    <Radio value="neft">NEFT Transfer</Radio>
                    <Radio value="other">Other</Radio>
                  </HStack>
                </RadioGroup>
                <FormErrorMessage>{errors.payment_mode}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            {expense.payment_mode !== 'cash' && (
              <GridItem colSpan={2}>
                <FormControl isRequired isInvalid={!!errors.bank_account}>
                  <FormLabel>Bank Account</FormLabel>
                  <Select
                    name="bank_account"
                    value={expense.bank_account}
                    onChange={handleChange}
                  >
                    <option value="AXIS BANK">AXIS BANK</option>
                    <option value="KOTAK BANK">KOTAK BANK</option>
                    <option value="KOTAK BANK (MANTRA SALES)">KOTAK BANK (MANTRA SALES)</option>
                  </Select>
                  <FormErrorMessage>{errors.bank_account}</FormErrorMessage>
                </FormControl>
              </GridItem>
            )}
            
            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={expense.description}
                  onChange={handleChange}
                  placeholder="Enter expense description"
                  rows={3}
                />
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  name="notes"
                  value={expense.notes}
                  onChange={handleChange}
                  placeholder="Enter additional notes (optional)"
                />
              </FormControl>
            </GridItem>
          </Grid>
          
          <HStack spacing={4} pt={4}>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
            >
              {isEditMode ? 'Update' : 'Save'}
            </Button>
            <Button onClick={() => navigate('/expenses')}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default ExpenseForm; 