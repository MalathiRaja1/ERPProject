import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ProductListPage from './modules/inventory/ProductListPage';
import EmployeeListPage from './modules/hr/EmployeeListPage';
import AttendancePage from './modules/hr/AttendancePage';
import QuotationListPage from './modules/sales/QuotationListPage';
import SalesOrderListPage from './modules/sales/SalesOrderListPage';
import InvoiceListPage from './modules/sales/InvoiceListPage';
import ChartOfAccountsPage from './modules/finance/ChartOfAccountsPage';
import LedgerPage from './modules/finance/LedgerPage';
import LeaveRequestsPage from './modules/hr/LeaveRequestsPage';
import PayrollPage from './modules/hr/PayrollPage';
import SettingsPage from './modules/settings/SettingsPage';
import DashboardPage from './modules/dashboard/DashboardPage';

// Placeholder for modules not yet built out — replace as each module ships
function ComingSoon({ title }) {
  return <div><h1>{title}</h1><p>This module is coming in a follow-up build.</p></div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
<Route index element={<DashboardPage />} />
<Route path="inventory" element={<ProductListPage />} />
<Route path="sales" element={<QuotationListPage />} />
<Route path="sales/orders" element={<SalesOrderListPage />} />
<Route path="sales/invoices" element={<InvoiceListPage />} />
<Route path="finance" element={<ChartOfAccountsPage />} />
<Route path="finance/ledger" element={<LedgerPage />} />
<Route path="hr" element={<EmployeeListPage />} />
<Route path="hr/attendance" element={<AttendancePage />} />
<Route path="hr/leave" element={<LeaveRequestsPage />} />
<Route path="hr/payroll" element={<PayrollPage />} />
<Route path="settings" element={<SettingsPage />} />

      </Route>
    </Routes>
  );
}
