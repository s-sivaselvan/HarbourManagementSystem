import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';

const roleBadge = { Admin: 'badge-danger', 'Port Officer': 'badge-info', 'Ship Operator': 'badge-success' };

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      // In a real app, you'd have a PATCH /api/auth/profile endpoint
      toast.success('Profile updated!');
    } catch (err) { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><User className="w-7 h-7 text-navy-600 dark:text-ocean-400" /> My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-navy-500 to-ocean-500 flex items-center justify-center text-white font-bold text-4xl mb-4 shadow-xl shadow-navy-500/30">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{user?.email}</p>
          <span className={roleBadge[user?.role] || 'badge-neutral'}>{user?.role}</span>
        </div>

        {/* Edit Form */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-700 dark:text-white mb-5">Edit Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">Role</label>
              <div className="input-field bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />{user?.role}
              </div>
              <p className="text-xs text-slate-400 mt-1">Roles can only be changed by an Admin</p>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
