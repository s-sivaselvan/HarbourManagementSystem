import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Package, Plus, Edit, Trash2, X, Loader2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = { Pending:'badge-warning', Loaded:'badge-info', Unloaded:'badge-success', Dispatched:'badge-neutral' };
const CARGO_STATUSES = ['Pending', 'Loaded', 'Unloaded', 'Dispatched'];
const defaultForm = { shipId:'', cargoType:'', weight:'', destination:'', status:'Pending' };

const CargoModal = ({ cargo, ships, onClose, onSave }) => {
  const [form, setForm] = useState(cargo ? { shipId: cargo.shipId?._id || cargo.shipId, cargoType: cargo.cargoType, weight: cargo.weight, destination: cargo.destination, status: cargo.status } : defaultForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (cargo?._id) await api.put(`/cargo/${cargo._id}`, form);
      else await api.post('/cargo', form);
      toast.success(cargo?._id ? 'Cargo updated!' : 'Cargo created!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{cargo?._id ? 'Edit Cargo' : 'Add Cargo'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Ship</label>
            <select value={form.shipId} onChange={e => setForm(p => ({...p, shipId: e.target.value}))} className="input-field" required>
              <option value="">— Select Ship —</option>
              {ships.map(s => <option key={s._id} value={s._id}>{s.shipName} ({s.shipNumber})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Cargo Type</label>
            <input value={form.cargoType} onChange={e => setForm(p => ({...p, cargoType: e.target.value}))} className="input-field" placeholder="e.g. Electronics, Coal..." required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Weight (tons)</label>
            <input type="number" value={form.weight} onChange={e => setForm(p => ({...p, weight: e.target.value}))} className="input-field" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Destination</label>
            <input value={form.destination} onChange={e => setForm(p => ({...p, destination: e.target.value}))} className="input-field" placeholder="Singapore" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="input-field">
              {CARGO_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (cargo?._id ? 'Save Changes' : 'Add Cargo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Cargo = () => {
  const { user } = useAuth();
  const [cargo, setCargo] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    const [cRes, sRes] = await Promise.all([api.get('/cargo'), api.get('/ships')]);
    setCargo(cRes.data); setShips(sRes.data); setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this cargo record?')) return;
    try { await api.delete(`/cargo/${id}`); toast.success('Cargo deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const totalWeight = cargo.reduce((a, c) => a + (c.weight || 0), 0);
  const filtered = cargo.filter(c => {
    const q = search.toLowerCase();
    return (!filterStatus || c.status === filterStatus) &&
      (!q || c.cargoType.toLowerCase().includes(q) || c.destination.toLowerCase().includes(q) || c.shipId?.shipName?.toLowerCase().includes(q));
  });

  return (
    <DashboardLayout>
      {modal !== null && (
        <CargoModal cargo={modal === 'add' ? null : modal} ships={ships} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchAll(); }} />
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Package className="w-7 h-7 text-navy-600 dark:text-ocean-400" /> Cargo</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{cargo.length} records · {totalWeight.toLocaleString()} total tons</p>
        </div>
        {['Admin', 'Port Officer', 'Ship Operator'].includes(user?.role) && (
          <button onClick={() => setModal('add')} className="btn-primary"><Plus className="w-4 h-4" /> Add Cargo</button>
        )}
      </div>

      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search cargo..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field sm:w-48">
          <option value="">All Statuses</option>
          {CARGO_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p>No cargo records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Ship</th><th>Cargo Type</th><th>Weight (t)</th><th>Destination</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td className="font-semibold text-slate-800 dark:text-white">{c.shipId?.shipName || '—'}</td>
                    <td>{c.cargoType}</td>
                    <td>{c.weight?.toLocaleString()}</td>
                    <td>{c.destination}</td>
                    <td><span className={STATUS_BADGE[c.status] || 'badge-neutral'}>{c.status}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        {['Admin', 'Port Officer'].includes(user?.role) && (
                          <>
                            <button onClick={() => setModal(c)} className="text-ocean-500 hover:text-ocean-400 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(c._id)} className="text-rose-500 hover:text-rose-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cargo;
