import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import GlobalSearch from '../components/GlobalSearch';

export default function MainLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>ERP</h2>
        <nav>
          <NavLink to="/" end className="nav-link">Dashboard</NavLink>
          <NavLink to="/inventory" className="nav-link">Inventory</NavLink>
          <NavLink to="/sales" className="nav-link">Sales — Quotations</NavLink>
          <NavLink to="/sales/orders" className="nav-link">Sales — Orders</NavLink>
          <NavLink to="/sales/invoices" className="nav-link">Sales — Invoices</NavLink>
          <NavLink to="/finance" className="nav-link">Finance</NavLink>
          <NavLink to="/finance/ledger" className="nav-link">Finance — Ledger</NavLink>
          <NavLink to="/hr" className="nav-link">HR — Employee Master</NavLink>
          <NavLink to="/hr/attendance" className="nav-link">HR — Attendance</NavLink>
          <NavLink to="/hr/leave" className="nav-link">HR — Leave Requests</NavLink>
          <NavLink to="/hr/payroll" className="nav-link">HR — Payroll</NavLink>
          <NavLink to="/settings" className="nav-link">Settings</NavLink>
          <NavLink to="/reports" className="nav-link">Reports</NavLink>
          <NavLink to="/audit" className="nav-link">Audit Trail</NavLink>
        </nav>
        <div className="sidebar-footer">
          <p>{user?.fullName}</p>
          <button onClick={() => dispatch(logout())}>Log out</button>
        </div>
      </aside>
      <main className="content">
        <div className="top-header">
          <GlobalSearch />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
