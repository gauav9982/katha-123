import { useEffect, Suspense, lazy } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ItemQuickSearch from './components/ItemQuickSearch';

// Lazy load form components
const GroupForm = lazy(() => import('./forms/Group/GroupForm'));
const CategoryForm = lazy(() => import('./forms/Category/CategoryForm'));
const ItemForm = lazy(() => import('./forms/Item/ItemForm'));
const PurchaseForm = lazy(() => import('./forms/Purchase/PurchaseForm'));
const CashSaleForm = lazy(() => import('./forms/CashSale/CashSaleForm'));
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

// Placeholder component for unimplemented forms
const PlaceholderForm = () => (
  <div className="p-8 bg-white rounded-lg shadow">
    <div className="flex flex-col items-center justify-center">
      <div className="bg-blue-100 text-blue-800 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Coming Soon</h2>
      
      <div className="w-24 h-1 bg-blue-600 mb-6"></div>
      
      <p className="text-lg text-gray-600 mb-6 text-center max-w-2xl">
        This module is currently under development and will be available soon. 
        We're working hard to bring you the best features for your business needs.
      </p>
      
      <div className="mt-4 p-6 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 w-full max-w-2xl">
        <h3 className="font-semibold text-xl mb-3">Available Modules</h3>
        <p className="mb-3">
          The following modules are fully implemented and ready to use:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2">
          <li>Group Management</li>
          <li>Category Management</li>
          <li>Item/Product Management</li>
          <li>Purchase Invoice System</li>
        </ul>
        <p className="italic">
          Please use these modules for now. More features coming soon!
        </p>
      </div>
    </div>
  </div>
);

// Home Page component
const HomePage = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <ItemQuickSearch />
  </div>
);

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
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
      }
    };
    
    checkApiServer();
  }, []);
  
  console.log('App rendering, checking routes');
  
  // NOTE: There are Router v7 warnings in the console that can be safely ignored
  // They are deprecation warnings for future React Router v7 changes
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Home route with QuickSearch component */}
            <Route index element={<HomePage />} />
            
            {/* Implemented Form Routes */}
            <Route path="/forms/group" element={<GroupForm />} />
            <Route path="/forms/category" element={<CategoryForm />} />
            <Route path="/forms/item" element={<ItemForm />} />
            <Route path="/forms/item/edit/:id" element={<ItemForm />} />
            
            {/* Purchase Routes - main focus of this app */}
            <Route path="/forms/purchase" element={<PurchaseForm />} />
            <Route path="/forms/purchase/:id" element={<PurchaseForm />} />
            
            {/* Cash Sale Routes */}
            <Route path="/forms/cash-sale" element={<CashSaleForm />} />
            <Route path="/forms/cash-sale/:id" element={<CashSaleForm />} />
            
            {/* Credit Sale Routes */}
            <Route path="/forms/credit-sale" element={<CreditSaleForm />} />
            <Route path="/forms/credit-sale/:id" element={<CreditSaleForm />} />
            
            {/* Delivery Chalan Routes */}
            <Route path="/forms/delivery-chalan-form" element={<DeliveryChalanForm />} />
            <Route path="/forms/delivery-chalan-form/:id" element={<DeliveryChalanForm />} />
            
            {/* Placeholder Routes for unimplemented forms */}
            <Route path="/forms/cash-sales" element={<PlaceholderForm />} />
            <Route path="/forms/credit-sales" element={<PlaceholderForm />} />
            <Route path="/forms/delivery-challan" element={<PlaceholderForm />} />
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
            <Route path="/lists/cash-sales-list" element={<CashSaleList />} />
            <Route path="/lists/credit-sales-list" element={<CreditSaleList />} />
            <Route path="/lists/challan-list" element={<PlaceholderForm />} />
            <Route path="/lists/payment-list" element={<PartyList />} />
            <Route path="/lists/receipt-list" element={<PartyList />} />
            
            {/* Report Routes */}
            <Route path="/reports/stock" element={<StockReport />} />
            <Route path="/reports/item-transactions" element={<ItemTransactionReport />} />
            
            {/* Fix for incorrect routes */}
            <Route path="/lists/purchase" element={<Navigate to="/lists/purchase-list" replace />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
