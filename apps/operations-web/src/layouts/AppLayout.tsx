import {
  BriefcaseBusiness,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/jobs', label: 'Công việc', icon: BriefcaseBusiness },
  { to: '/workers', label: 'Nhân sự', icon: Users, disabled: true },
  { to: '/settings', label: 'Thiết lập', icon: Settings, disabled: true },
];

export function AppLayout() {
  const location = useLocation();
  const pageLabel =
    location.pathname.startsWith('/jobs')
      ? 'Công việc'
      : 'Tổng quan';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <strong>WorkLink</strong>
            <span>Workforce Operations</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div className="nav-item disabled" key={item.to}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <small>Sắp có</small>
                </div>
              );
            }

            return (
              <NavLink
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
                key={item.to}
                to={item.to}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">NN</div>
          <div>
            <strong>Điều phối viên</strong>
            <span>Operations</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>WorkLink</span>
            <ChevronRight size={15} />
            <strong>{pageLabel}</strong>
          </div>
          <div className="environment-pill">MVP • Local</div>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
