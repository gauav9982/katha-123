import { useEffect, Suspense, lazy } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { Box, Container, Heading } from '@chakra-ui/react';
import MainLayout from './layouts/MainLayout';
import TestConnection from './components/TestConnection';
import CashSalesList from './components/CashSales/CashSalesList';
import CashSaleForm from './forms/CashSale/CashSaleForm';
import useAppStore from './store/useAppStore';

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

// Lazy load form components
const GroupForm = lazy(() => import('./forms/Group/GroupForm'));
const CategoryForm = lazy(() => import('./forms/Category/CategoryForm'));
const ItemForm = lazy(() => import('./forms/Item/ItemForm'));
const PurchaseForm = lazy(() => import('./forms/Purchase/PurchaseForm'));
const CreditSaleForm = lazy(() => import('./forms/CreditSale/CreditSaleForm'));
const DeliveryChalanForm = lazy(() => import('./forms/DeliveryChalan/DeliveryChalanForm'));
const PartyForm = lazy(() => import('./forms/Party/PartyForm'));
const PaymentForm = lazy(() => import('./forms/Payment/PaymentForm'));
const ReceiptForm = lazy(() => import('./forms/Receipt/ReceiptForm'));

// Lazy load list components
const GroupList = lazy(() => import('./forms/Group/GroupList'));
const CategoryList = lazy(() => import('./forms/Category/CategoryList'));
const ItemList = lazy(() => import('./forms/Item/ItemList'));
const PurchaseList = lazy(() => import('./forms/Purchase/PurchaseList'));
const CashSaleList = lazy(() => import('./forms/CashSale/CashSaleList'));
const CreditSaleList = lazy(() => import('./forms/CreditSale/CreditSaleList'));
const DeliveryChalanList = lazy(() => import('./forms/DeliveryChalan/DeliveryChalanList'));
const PartyList = lazy(() => import('./forms/Party/PartyList'));

// Lazy load reports
const StockReport = lazy(() => import('./reports/StockReport'));
const ItemTransactionReport = lazy(() => import('./reports/ItemTransactionReport'));

function App() {
  const showAlert = useAppStore((state) => state.showAlert);

  useEffect(() => {
    // Log routes for debugging
    console.log('Available routes:', [
      '/',
      '/forms/group',
      '/forms/category',
      '/forms/item',
      '/forms/purchase',
      '/forms/cash-sale',
      '/forms/credit-sale',
      '/forms/delivery-chalan-form',
      '/lists/group-list',
      '/lists/category-list', 
      '/lists/item-list',
      '/lists/purchase-list',
      '/lists/cashsale-list',
      '/lists/creditsale-list',
      '/lists/delivery-chalan-list'
    ]);
    
    // API server check
    const checkApiServer = async () => {
      try {
        // We could add a health check for the API server here if needed
        console.log('App initialized - using backend API for all operations');
      } catch (error: any) {
        console.error('Error connecting to API server:', error);
        showAlert('Error connecting to API server', 'error');
      }
    };
    
    checkApiServer();
  }, [showAlert]);
  
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Home route with QuickSearch component */}
            <Route index element={<ItemQuickSearch />} />
            
            {/* Form Routes */}
            <Route path="/forms/group" element={<GroupForm />} />
            <Route path="/forms/category" element={<CategoryForm />} />
            <Route path="/forms/item" element={<ItemForm />} />
            <Route path="/forms/item/edit/:id" element={<ItemForm />} />
            <Route path="/forms/purchase" element={<PurchaseForm />} />
            <Route path="/forms/purchase/:id" element={<PurchaseForm />} />
            <Route path="/forms/cash-sale" element={<CashSaleForm />} />
            <Route path="/forms/cash-sale/:id" element={<CashSaleForm />} />
            <Route path="/forms/credit-sale" element={<CreditSaleForm />} />
            <Route path="/forms/credit-sale/:id" element={<CreditSaleForm />} />
            <Route path="/forms/delivery-chalan-form" element={<DeliveryChalanForm />} />
            <Route path="/forms/delivery-chalan-form/:id" element={<DeliveryChalanForm />} />
            <Route path="/forms/party" element={<PartyForm />} />
            <Route path="/forms/payment" element={<PaymentForm />} />
            <Route path="/forms/receipt" element={<ReceiptForm />} />
            
            {/* List Routes */}
            <Route path="/lists/group-list" element={<GroupList />} />
            <Route path="/lists/category-list" element={<CategoryList />} />
            <Route path="/lists/item-list" element={<ItemList />} />
            <Route path="/lists/purchase-list" element={<PurchaseList />} />
            <Route path="/lists/cashsale-list" element={<CashSaleList />} />
            <Route path="/lists/creditsale-list" element={<CreditSaleList />} />
            <Route path="/lists/delivery-chalan-list" element={<DeliveryChalanList />} />
            <Route path="/lists/party-list" element={<PartyList />} />
            
            {/* Report Routes */}
            <Route path="/reports/stock" element={<StockReport />} />
            <Route path="/reports/item-transaction" element={<ItemTransactionReport />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App; 