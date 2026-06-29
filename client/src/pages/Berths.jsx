import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Anchor, Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = { Available: 'badge-success', Occupied: 'badge-danger', Maintenance: 'badge-warning' };
const STATUSES = ['Available', 'Occupied', 'Maintenance'];
const defaultForm = { berthNumber:'', location:'', capacity:'', status:'Available' };

const BerthModal = ({ berth, onClose, onSave }) => {
  const [form, setForm] = useState(berth ? { berthNumber: berth.berthNumber, location: berth.location, capacity: berth.capacity, status: berth.status } : defaultForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (berth?._id) await api.put(`/berths/${berth._id}`, form);
      else await api.post('/berths', form);
      toast.success(berth?._id ? 'Berth updated!' : 'Berth created!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{berth?._id ? 'Edit Berth' : 'Add New Berth'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Berth Number</label>
            <input value={form.berthNumber} onChange={e => setForm(p => ({...p, berthNumber: e.target.value}))} className="input-field" placeholder="B-01" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Location</label>
            <input value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} className="input-field" placeholder="North Dock" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Capacity (tons)</label>
            <input type="number" value={form.capacity} onChange={e => setForm(p => ({...p, capacity: e.target.value}))} className="input-field" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="input-field">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (berth?._id ? 'Save Changes' : 'Create Berth')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Berths = () => {
  const { user } = useAuth();
  const [berths, setBerths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchBerths = () => {
    setLoading(true);
    api.get('/berths').then(r => { setBerths(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchBerths(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this berth?')) return;
    try { await api.delete(`/berths/${id}`); toast.success('Berth deleted'); fetchBerths(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const available = berths.filter(b => b.status === 'Available').length;
  const occupied = berths.filter(b => b.status === 'Occupied').length;

  return (
    <DashboardLayout>
      {modal !== null && (
        <BerthModal berth={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchBerths(); }} />
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Anchor className="w-7 h-7 text-navy-600 dark:text-ocean-400" /> Berths</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{available} available · {occupied} occupied · {berths.length} total</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => setModal('add')} className="btn-primary"><Plus className="w-4 h-4" /> Add Berth</button>
        )}
      </div>

      {/* Berth Grid Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-500" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {berths.map(berth => (
            <div key={berth._id} className="glass-card p-5 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-800 dark:text-white">{berth.berthNumber}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{berth.location}</p>
                </div>
                <span className={STATUS_BADGE[berth.status] || 'badge-neutral'}>{berth.status}</span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Capacity</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{berth.capacity?.toLocaleString()} t</span>
                </div>
                {berth.assignedShip && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Assigned Ship</span>
                    <span className="font-semibold text-ocean-600 dark:text-ocean-400">{berth.assignedShip.shipName}</span>
                  </div>
                )}
              </div>
              {['Admin', 'Port Officer'].includes(user?.role) && (
                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button onClick={() => setModal(berth)} className="btn-secondary flex-1 justify-center text-sm py-1.5">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  {user?.role === 'Admin' && (
                    <button onClick={() => handleDelete(berth._id)} className="btn-danger flex-1 justify-center text-sm py-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Berths;
