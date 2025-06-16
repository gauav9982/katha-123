import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container, Heading } from '@chakra-ui/react';
import MainLayout from './layouts/MainLayout';
import TestConnection from './components/TestConnection';
import CashSalesList from './components/CashSales/CashSalesList';
import CashSaleForm from './forms/CashSale/CashSaleForm';

// Placeholder components
const Dashboard = () => (
  <Box>
    <Heading mb={5}>Dashboard</Heading>
    <TestConnection />
  </Box>
);

const CreditSales = () => <Heading>Credit Sales</Heading>;
const DeliveryChalans = () => <Heading>Delivery Chalans</Heading>;
const Items = () => <Heading>Items</Heading>;
const Parties = () => <Heading>Parties</Heading>;
const Reports = () => <Heading>Reports</Heading>;

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cash-sales" element={<CashSalesList />} />
              <Route path="/cash-sales/new" element={<CashSaleForm />} />
              <Route path="/cash-sales/:id" element={<CashSaleForm />} />
              <Route path="/credit-sales" element={<CreditSales />} />
              <Route path="/delivery-chalans" element={<DeliveryChalans />} />
              <Route path="/items" element={<Items />} />
              <Route path="/parties" element={<Parties />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
};

export default App; 