import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { Ship, Anchor, ClipboardList, Package, Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444'];

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-800 dark:text-white">{value ?? '—'}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-emerald-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const pieData = (stats?.shipStatusBreakdown || []).map(s => ({ name: s._id, value: s.count }));

  const monthlyData = (stats?.monthlyDockings || []).map(d => ({
    month: MONTHS[(d._id.month || 1) - 1],
    Total: d.total,
    Approved: d.approved,
    Rejected: d.rejected
  }));

  const cargoData = [
    { name: 'Total Weight', value: stats?.totalCargoWeight || 0 }
  ];

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome back, <span className="font-semibold text-navy-600 dark:text-ocean-400">{user?.name}</span> — Here's your port overview
          </p>
        </div>
        <div className="badge badge-info text-sm px-3 py-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Ship} label="Total Ships" value={stats?.totalShips} color="bg-gradient-to-br from-navy-500 to-navy-700" />
        <StatCard icon={TrendingUp} label="Active Ships" value={stats?.activeShips} color="bg-gradient-to-br from-ocean-500 to-ocean-700" sub="In port or registered" />
        <StatCard icon={Anchor} label="Available Berths" value={stats?.availableBerths} color="bg-gradient-to-br from-emerald-500 to-emerald-700" sub={`${stats?.occupiedBerths} occupied`} />
        <StatCard icon={Package} label="Total Cargo (t)" value={stats?.totalCargoWeight?.toLocaleString()} color="bg-gradient-to-br from-amber-500 to-amber-700" />
        <StatCard icon={ClipboardList} label="Pending Requests" value={stats?.pendingRequests} color="bg-gradient-to-br from-rose-500 to-rose-700" />
        <StatCard icon={CheckCircle2} label="Approved Requests" value={stats?.approvedRequests} color="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="bg-gradient-to-br from-fuchsia-500 to-fuchsia-700" />
        <StatCard icon={AlertCircle} label="Docked Ships" value={stats?.dockedShips} color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart - Ship Status */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4">Ship Status Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-12">No ship data yet</p>}
        </div>

        {/* Line Chart - Monthly Dockings */}
        <div className="glass-card p-6 col-span-2">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4">Monthly Docking Requests</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9' }} />
                <Legend />
                <Line type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                <Line type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                <Line type="monotone" dataKey="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-12">No docking data yet</p>}
        </div>
      </div>

      {/* Bar Chart - Berth Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4">Berth Utilization</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Available', count: stats?.availableBerths || 0 },
              { name: 'Occupied', count: stats?.occupiedBerths || 0 },
              { name: 'Total', count: stats?.totalBerths || 0 },
            ]} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {[<Cell key="0" fill="#10b981" />, <Cell key="1" fill="#ef4444" />, <Cell key="2" fill="#6366f1" />]}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-700 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {(stats?.recentLogs || []).length > 0 ? stats.recentLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-navy-100 dark:bg-navy-900/40 flex items-center justify-center flex-shrink-0 text-navy-600 dark:text-ocean-400 font-bold text-xs">
                  {log.userId?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-tight">{log.action}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{log.userId?.name} · {new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )) : <p className="text-slate-400 text-sm">No recent activity</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
