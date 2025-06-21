import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import './ReceiptPrint.css';

interface Receipt {
  id: number;
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

const convertNumberToWords = (amount: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const numToWords = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + numToWords(num % 100) : '');
    if (num < 100000) return numToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
    if (num < 10000000) return numToWords(Math.floor(num / 100000)) + ' lakh' + (num % 100000 !== 0 ? ' ' + numToWords(num % 100000) : '');
    return numToWords(Math.floor(num / 10000000)) + ' crore' + (num % 10000000 !== 0 ? ' ' + numToWords(num % 10000000) : '');
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = numToWords(rupees);
  if (paise > 0) {
    result += ' and ' + numToWords(paise) + ' paise';
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const ReceiptPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/receipts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch receipt');
      }
      const data = await response.json();
      setReceipt(data);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipt data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/receipts');
  };

  if (loading || !receipt) {
    return <Text>Loading receipt...</Text>;
  }

  const formattedDate = receipt.receipt_date 
    ? format(new Date(receipt.receipt_date), 'dd-MM-yyyy')
    : '';

  const formatPaymentDetails = () => {
    if (receipt.payment_mode === 'cash') {
      return `by cash Date - ${formattedDate}`;
    } else if (receipt.payment_mode === 'cheque') {
      return `by cheque No. ${receipt.cheque_number} dated ${format(new Date(receipt.cheque_date), 'dd-MM-yyyy')} drawn on ${receipt.bank_name}`;
    } else if (receipt.payment_mode === 'neft') {
      return `by NEFT transfer dated ${format(new Date(receipt.neft_date), 'dd-MM-yyyy')} through ${receipt.bank_name}`;
    }
    return '';
  };

  return (
    <div>
      <div className="receipt-print-container">
        <Box className="receipt-print a5-landscape">
          <VStack spacing={2} align="stretch">
            <Heading as="h1" size="lg" textAlign="center" mb={1}>
              KATHA SALES
            </Heading>
            
            <Heading as="h2" size="md" textAlign="center" mb={2}>
              RECEIPT
            </Heading>
            
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold">Receipt No: {receipt.receipt_number}</Text>
              <Text fontWeight="bold">Date: {formattedDate}</Text>
            </HStack>
            
            <Divider />
            
            <Box my={4}>
              <Text>
                Received with thanks from <strong>{receipt.party_name}</strong>{' '}
                the sum of Rupees <strong>{convertNumberToWords(receipt.amount)}</strong>{' '}
                {formatPaymentDetails()} amount <strong>₹{receipt.amount.toFixed(2)}/-</strong> in payment{' '}
                {receipt.is_on_account ? 'on Account' : ''}{' '}
                {receipt.is_advance ? 'as Advance' : ''} 
                {!receipt.is_on_account && !receipt.is_advance ? 'for ' + receipt.bank_account : ''}
              </Text>
            </Box>
            
            <Divider />
            
            <HStack justify="space-between" mt={4}>
              <Box>
                <Text fontWeight="bold">For KATHA SALES</Text>
                <Box height="80px" />
                <Text>Authorized Signatory</Text>
              </Box>
              
              <Box textAlign="right">
                <Text>E. & O.E.</Text>
              </Box>
            </HStack>
          </VStack>
        </Box>
      </div>

      <HStack mt={4} spacing={4} className="no-print">
        <Button colorScheme="blue" onClick={handlePrint}>
          Print
        </Button>
        <Button onClick={handleBack}>
          Back to Receipts
        </Button>
      </HStack>
    </div>
  );
};

export default ReceiptPrint; 