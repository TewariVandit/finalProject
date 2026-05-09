// assets
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SummarizeIcon from '@mui/icons-material/Summarize';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ReceiptIcon from '@mui/icons-material/Receipt';
import GroupsIcon from '@mui/icons-material/Groups';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
// icons
const icons = {
  DashboardIcon,
  AdminPanelSettingsIcon,
  MonetizationOnIcon,
  SummarizeIcon,
  CheckroomIcon,
  WarehouseIcon,
  ReceiptIcon,
  GroupsIcon,
  DocumentScannerIcon
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [

    // 🏠 DASHBOARD
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardIcon,
      breadcrumbs: false
    },

    // 👥 USER MANAGEMENT
    {
      id: 'user-management',
      title: 'User Management',
      type: 'collapse',
      icon: icons.GroupsIcon,
      children: [
        {
          id: 'users',
          title: 'Users',
          type: 'item',
          url: '/users-page'
        },
        {
          id: 'staff',
          title: 'Staff',
          type: 'item',
          url: '/staff-page'
        }
      ]
    },

    // 📦 ITEMS / PRODUCTS
    {
      id: 'items',
      title: 'Items',
      type: 'collapse',
      icon: icons.CheckroomIcon,
      children: [
        {
          id: 'product',
          title: 'Products',
          type: 'item',
          url: '/product-page'
        },
        {
          id: 'category',
          title: 'Categories',
          type: 'item',
          url: '/category-page' // NEW
        },
        {
          id: 'group',
          title: 'Groups',
          type: 'item',
          url: '/group-page' // NEW
        }
      ]
    },

    // 🏬 INVENTORY
    {
      id: 'inventory-section',
      title: 'Inventory',
      type: 'collapse',
      icon: icons.WarehouseIcon,
      children: [
        {
          id: 'inventory',
          title: 'Stock',
          type: 'item',
          url: '/inventory-page'
        },
        {
          id: 'inventory-history',
          title: 'Inventory History',
          type: 'item',
          url: '/inventory-history-page' // NEW
        },
        {
          id: 'stock-adjustment',
          title: 'Stock Adjustment',
          type: 'item',
          url: '/stock-adjustment-page' // NEW
        }
      ]
    },

    // 💰 SALES
    {
      id: 'sales-section',
      title: 'Sales',
      type: 'collapse',
      icon: icons.MonetizationOnIcon,
      children: [
        {
          id: 'sales',
          title: 'Sales Overview',
          type: 'item',
          url: '/sales-page'
        },
        {
          id: 'billing',
          title: 'Invoices / Billing',
          type: 'item',
          url: '/billing-page'
        },
        // {
        //   id: 'customers',
        //   title: 'Customers',
        //   type: 'item',
        //   url: '/customers-page' // NEW
        // },
        // {
        //   id: 'sales-order',
        //   title: 'Sales Orders',
        //   type: 'item',
        //   url: '/sales-order-page' // NEW
        // },
        {
          id: 'delivery-challan-page',
          title: 'Delivery Challan',
          type: 'item',
          url: '/delivery-challan-page' // NEW
        },
        {
          id: 'sales-return-page',
          title: 'Sales Return',
          type: 'item',
          url: '/sales-return-page' // NEW
        },
      ]
    },

    // 🛒 PURCHASE (NEW IMPORTANT MODULE)
    {
      id: 'purchase-section',
      title: 'Purchases',
      type: 'collapse',
      icon: icons.ReceiptIcon,
      children: [
        {
          id: 'suppliers',
          title: 'Suppliers',
          type: 'item',
          url: '/suppliers-page' // NEW
        },
        {
          id: 'purchase-order',
          title: 'Purchase Orders',
          type: 'item',
          url: '/purchase-order-page' // NEW
        },
        {
          id: 'purchase-bill',
          title: 'Purchase Bills',
          type: 'item',
          url: '/purchase-bill-page' // NEW
        },
        {
          id: 'purchase-return-page',
          title: 'Purchase Return',
          type: 'item',
          url: '/purchase-return-page' // NEW
        }
      ]
    },

    // 📊 REPORTS
    {
      id: 'reports',
      title: 'Reports',
      type: 'collapse',
      icon: icons.SummarizeIcon,
      children: [
        {
          id: 'sales-report',
          title: 'Sales Report',
          type: 'item',
          url: '/sales-report-page' // NEW
        },
        {
          id: 'inventory-report',
          title: 'Inventory Report',
          type: 'item',
          url: '/inventory-report-page' // NEW
        },
        {
          id: 'purchase-report-page',
          title: 'Purchase Report',
          type: 'item',
          url: '/purchase-report-page' // NEW
        }
      ]
    },

  ]
};

export default dashboard;
