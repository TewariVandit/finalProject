import { lazy } from 'react';
import { Navigate } from "react-router-dom";

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from "./ProtectedRoute";
import AdminOnlyRoute from "./AdminOnlyRoute";

// existing pages
import StaffPage from '../pages/StaffPage';
import SalesPage from '../pages/SalesPage';
import ReportsPage from '../pages/ReportsPage';
import ProductManagement from '../pages/ProductManagement';
import InventoryPage from '../pages/InventoryPage';
import BillingPage from '../pages/BillingPage';
import UserManagementPage from '../pages/UserManagementPage';
import SupportCenter from '../pages/SupportCenter';
import AdminProfile from '../pages/AdminProfile';
import PrivacyCenter from '../pages/PrivacyCenter';

// 🔥 NEW PAGES
import CategoryPage from '../pages/category/CategoryPage';
import GroupPage from '../pages/group/GroupPage';

import InventoryHistoryPage from '../pages/inventory/InventoryHistoryPage';
import StockAdjustmentPage from '../pages/inventory/StockAdjustmentPage';

import CustomersPage from '../pages/customers/CustomersPage';
import SalesOrderPage from '../pages/sales/SalesOrderPage';

import DeliveryChallanPage from '../pages/sales/DeliveryChallanPage';
import SalesReturnsPage from '../pages/sales/SalesReturnsPage';

import SuppliersPage from '../pages/purchase/SuppliersPage';
import PurchaseOrderPage from '../pages/purchase/PurchaseOrderPage';
import PurchaseBillPage from '../pages/purchase/PurchaseBillPage';
import PurchaseReturnsPage from '../pages/purchase/PurchaseReturnsPage';

import SalesReportPage from '../pages/reports/SalesReportPage';
import InventoryReportPage from '../pages/reports/InventoryReportPage';
import PurchaseReportsPage from '../pages/reports/PurchaseReportsPage';

import Documentation from '../pages/documentation/Documentation';

// lazy pages
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [

    // redirect
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />
    },

    // dashboard
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },

    // ================= EXISTING =================
    { path: 'billing-page', element: <BillingPage /> },
    { path: 'inventory-page', element: <InventoryPage /> },
    { path: 'product-page', element: <ProductManagement /> },
    { path: 'report-page', element: <ReportsPage /> },
    { path: 'sales-page', element: <SalesPage /> },
    { path: 'staff-page', element: <AdminOnlyRoute><StaffPage /></AdminOnlyRoute> },
    { path: 'users-page', element: <UserManagementPage /> },

    // ================= NEW - ITEMS =================
    { path: 'category-page', element: <CategoryPage /> },
    { path: 'group-page', element: <GroupPage /> },

    // ================= NEW - INVENTORY =================
    { path: 'inventory-history-page', element: <InventoryHistoryPage /> },
    { path: 'stock-adjustment-page', element: <StockAdjustmentPage /> },

    // ================= NEW - SALES =================
    { path: 'customers-page', element: <CustomersPage /> },
    { path: 'sales-order-page', element: <SalesOrderPage /> },

    // ================= NEW - PURCHASE =================
    { path: 'suppliers-page', element: <SuppliersPage /> },
    { path: 'purchase-order-page', element: <PurchaseOrderPage /> },
    { path: 'purchase-bill-page', element: <PurchaseBillPage /> },
    { path: 'purchase-return-page', element: <PurchaseReturnsPage /> },

    // ================= NEW - REPORTS =================
    { path: 'sales-report-page', element: <SalesReportPage /> },
    { path: 'inventory-report-page', element: <InventoryReportPage /> },
    { path: 'purchase-report-page', element: <PurchaseReportsPage /> },

    { path: 'sales-return-page', element: <SalesReturnsPage /> },
    { path: 'delivery-challan-page', element: <DeliveryChallanPage /> },

    // ================= EXTRA =================
    {
      path: 'admin-profile-page',
      element: <AdminProfile page="view" />
    },
    {
      path: 'admin-edit-page',
      element: <AdminProfile page="edit" />
    },
    {
      path: 'support-page',
      element: <SupportCenter />
    },
    {
      path: 'privacy-page',
      element: <PrivacyCenter />
    },
    {
      path: 'documentation',
      element: <Documentation />
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />
    }
  ]
};

export default MainRoutes;
