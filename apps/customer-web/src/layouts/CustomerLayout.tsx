import {
  BriefcaseBusiness,
  CirclePlus,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import {
  Navigate,
  NavLink,
  Outlet,
} from 'react-router-dom';

import { useCustomerSession } from '../session/CustomerSession';

export function CustomerLayout() {
  const session = useCustomerSession();

  if (!session.configured) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="customer-shell">
      <aside className="customer-sidebar">
        <div className="customer-brand">
          <div>W</div>
          <span>
            <strong>WorkLink</strong>
            <small>Customer Portal</small>
          </span>
        </div>

        <nav>
          <NavLink to="/dashboard">
            <LayoutDashboard size={18} />
            Tổng quan
          </NavLink>
          <NavLink to="/jobs">
            <BriefcaseBusiness size={18} />
            Công việc
          </NavLink>
          <NavLink to="/jobs/new">
            <CirclePlus size={18} />
            Đăng việc mới
          </NavLink>
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={session.logout}
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </aside>

      <main>
        <header className="customer-topbar">
          <div>
            <strong>Cổng dành cho người thuê</strong>
            <span>{session.fullName || session.email}</span>
          </div>
        </header>
        <div className="customer-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
