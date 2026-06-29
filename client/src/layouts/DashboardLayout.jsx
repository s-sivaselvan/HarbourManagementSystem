import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ship, Anchor, ClipboardList, Package,
  BarChart3, Settings, LogOut, Menu, X, Moon, Sun,
  Bell, User, Wifi, WifiOff, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard',        icon: LayoutDashboard, path: '/dashboard',  roles: ['Admin', 'Port Officer', 'Ship Operator'] },
  { label: 'Ships',            icon: Ship,             path: '/ships',       roles: ['Admin', 'Port Officer', 'Ship Operator'] },
  { label: 'Berths',           icon: Anchor,           path: '/berths',      roles: ['Admin', 'Port Officer', 'Ship Operator'] },
  { label: 'Docking Requests', icon: ClipboardList,    path: '/docking',     roles: ['Admin', 'Port Officer', 'Ship Operator'] },
  { label: 'Cargo',            icon: Package,          path: '/cargo',       roles: ['Admin', 'Port Officer', 'Ship Operator'] },
  { label: 'Reports',          icon: BarChart3,        path: '/reports',     roles: ['Admin', 'Port Officer'] },
  { label: 'Settings',         icon: Settings,         path: '/settings',    roles: ['Admin', 'Port Officer', 'Ship Operator'] },
];

const roleBadgeColors = {
  'Admin': 'badge-danger',
  'Port Officer': 'badge-info',
  'Ship Operator': 'badge-success',
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      flex flex-col h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800
      ${mobile ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'hidden lg:flex'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-600 to-ocean-500 flex items-center justify-center shadow-lg shadow-navy-500/30">
          <Anchor className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">Harbour</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Management System</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy-500 to-ocean-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
            <span className={`${roleBadgeColors[user?.role]} mt-0.5`}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-rose-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <Sidebar mobile />
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <NavLink to="/profile" className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <User className="w-4 h-4" />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
