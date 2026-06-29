import DashboardLayout from '../layouts/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Moon, Sun, Bell, Info } from 'lucide-react';

const Settings = () => {
  const { dark, toggleTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><SettingsIcon className="w-7 h-7 text-navy-600 dark:text-ocean-400" /> Settings</h1>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dark ? <Moon className="w-5 h-5 text-ocean-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
                <p className="text-sm text-slate-400">{dark ? 'Currently using dark theme' : 'Currently using light theme'}</p>
              </div>
            </div>
            <button onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${dark ? 'bg-navy-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${dark ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time notifications are enabled via Socket.IO. You will receive toasts for ship arrivals, docking approvals/rejections, and cargo updates.</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Info className="w-5 h-5" /> System Info</h3>
          <div className="space-y-2 text-sm">
            {[['System', 'Harbour Management System v1.0'],['Stack', 'MERN (MongoDB, Express, React, Node)'],['Backend', 'https://harbourmanagementbackend.onrender.com'],['Frontend', window.location.origin]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-slate-500 dark:text-slate-400">{k}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 font-mono text-xs">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
