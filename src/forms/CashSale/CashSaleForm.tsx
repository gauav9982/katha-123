import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  useToast,
  Text
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

interface Item {
  id: number;
  item_code: string;
  item_name: string;
  mrp: number;
  current_stock: number;
}

interface SaleItem {
  item_id: number;
  item_code: string;
  item_name: string;
  quantity: number;
  rate: number;
  amount: number;
}

const CashSaleForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  
  // Items state
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SaleItem>({
    item_id: 0,
    item_code: '',
    item_name: '',
    quantity: 1,
    rate: 0,
    amount: 0
  });

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Load items on mount
  useEffect(() => {
    loadItems();
    if (id) {
      loadSale(id);
    }
  }, [id]);

  // Load items from API
  const loadItems = async () => {
    try {
      const response = await endpoints.items.list();
      setItems(response.data);
    } catch (error) {
      toast({
        title: 'Error loading items',
        status: 'error',
        duration: 3000
      });
    }
  };

  // Load existing sale
  const loadSale = async (saleId: string) => {
    try {
      const response = await endpoints.sales.getById(parseInt(saleId));
      const sale = response.data;
      
      setInvoiceNumber(sale.invoice_number);
      setInvoiceDate(sale.invoice_date);
      setCustomerName(sale.customer_name);
      setSelectedItems(sale.items);
      calculateTotals(sale.items);
    } catch (error) {
      toast({
        title: 'Error loading sale',
        status: 'error',
        duration: 3000
      });
    }
  };

  // Handle item selection
  const handleItemSelect = (itemCode: string) => {
    const item = items.find(i => i.item_code === itemCode);
    if (item) {
      setCurrentItem({
        item_id: item.id,
        item_code: item.item_code,
        item_name: item.item_name,
        quantity: 1,
        rate: item.mrp,
        amount: item.mrp
      });
    }
  };

  // Add item to sale
  const addItem = () => {
    if (currentItem.item_id === 0) return;
    
    setSelectedItems(prev => [...prev, currentItem]);
    calculateTotals([...selectedItems, currentItem]);
    
    // Reset current item
    setCurrentItem({
      item_id: 0,
      item_code: '',
      item_name: '',
      quantity: 1,
      rate: 0,
      amount: 0
    });
  };

  // Remove item from sale
  const removeItem = (index: number) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);
    calculateTotals(newItems);
  };

  // Calculate totals
  const calculateTotals = (items: SaleItem[]) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    setSubtotal(total);
    setGrandTotal(total);
  };

  // Save sale
  const handleSave = async () => {
    try {
      const saleData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        customer_name: customerName,
        sales_type: 'cash',
        subtotal,
        grand_total: grandTotal,
        items: selectedItems
      };

      if (id) {
        await endpoints.sales.update(parseInt(id), saleData);
      } else {
        await endpoints.sales.create(saleData);
      }

      toast({
        title: 'Sale saved successfully',
        status: 'success',
        duration: 3000
      });

      navigate('/cash-sales');
    } catch (error) {
      toast({
        title: 'Error saving sale',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Invoice Number</FormLabel>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Customer Name</FormLabel>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </FormControl>
        </HStack>

        <Box borderWidth={1} p={4} borderRadius="md">
          <HStack spacing={4} mb={4}>
            <FormControl>
              <FormLabel>Item Code</FormLabel>
              <Input
                value={currentItem.item_code}
                onChange={(e) => handleItemSelect(e.target.value)}
                list="items-list"
              />
              <datalist id="items-list">
                {items.map(item => (
                  <option key={item.id} value={item.item_code}>
                    {item.item_name}
                  </option>
                ))}
              </datalist>
            </FormControl>

            <FormControl>
              <FormLabel>Item Name</FormLabel>
              <Input value={currentItem.item_name} isReadOnly />
            </FormControl>

            <FormControl>
              <FormLabel>Quantity</FormLabel>
              <NumberInput
                value={currentItem.quantity}
                onChange={(_, value) => {
                  setCurrentItem(prev => ({
                    ...prev,
                    quantity: value,
                    amount: value * prev.rate
                  }));
                }}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Rate</FormLabel>
              <NumberInput
                value={currentItem.rate}
                onChange={(_, value) => {
                  setCurrentItem(prev => ({
                    ...prev,
                    rate: value,
                    amount: prev.quantity * value
                  }));
                }}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={currentItem.amount} isReadOnly>
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <Button colorScheme="blue" onClick={addItem} mt={8}>
              Add Item
            </Button>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Item Code</Th>
                <Th>Item Name</Th>
                <Th isNumeric>Quantity</Th>
                <Th isNumeric>Rate</Th>
                <Th isNumeric>Amount</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {selectedItems.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.item_code}</Td>
                  <Td>{item.item_name}</Td>
                  <Td isNumeric>{item.quantity}</Td>
                  <Td isNumeric>{item.rate}</Td>
                  <Td isNumeric>{item.amount}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box borderWidth={1} p={4} borderRadius="md">
          <HStack justify="flex-end" spacing={8}>
            <Text fontWeight="bold">
              Subtotal: ₹{subtotal.toFixed(2)}
            </Text>
            <Text fontWeight="bold">
              Grand Total: ₹{grandTotal.toFixed(2)}
            </Text>
          </HStack>
        </Box>

        <HStack justify="flex-end" spacing={4}>
          <Button onClick={() => navigate('/cash-sales')}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default CashSaleForm; 