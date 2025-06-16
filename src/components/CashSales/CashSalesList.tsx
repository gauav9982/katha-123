import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../../config/api';

interface CashSale {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  grand_total: number;
}

const CashSalesList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sales, setSales] = useState<CashSale[]>([]);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await endpoints.sales.list({ type: 'cash' });
      setSales(response.data);
    } catch (error) {
      toast({
        title: 'Error loading sales',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;

    try {
      await endpoints.sales.delete(id);
      toast({
        title: 'Sale deleted successfully',
        status: 'success',
        duration: 3000
      });
      loadSales();
    } catch (error) {
      toast({
        title: 'Error deleting sale',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={5}>
        <Heading size="lg">Cash Sales</Heading>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/cash-sales/new')}
        >
          Add New Sale
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Invoice No</Th>
            <Th>Date</Th>
            <Th>Customer Name</Th>
            <Th isNumeric>Amount</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sales.map(sale => (
            <Tr key={sale.id}>
              <Td>{sale.invoice_number}</Td>
              <Td>{new Date(sale.invoice_date).toLocaleDateString()}</Td>
              <Td>{sale.customer_name}</Td>
              <Td isNumeric>₹{sale.grand_total.toFixed(2)}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => navigate(`/cash-sales/${sale.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(sale.id)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CashSalesList; 