import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Ship, Plus, Search, Edit, Trash2, Eye, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  Registered: 'badge-info', Docked: 'badge-success',
  Departed: 'badge-neutral', Maintenance: 'badge-warning'
};

const SHIP_TYPES = ['Container', 'Bulk Carrier', 'Tanker', 'General Cargo', 'Passenger', 'RoRo', 'LNG Carrier'];
const SHIP_STATUSES = ['Registered', 'Docked', 'Departed', 'Maintenance'];

const defaultForm = { shipName:'', shipNumber:'', captainName:'', shipType:'Container', capacity:'', registrationCountry:'', status:'Registered', arrivalDate:'', departureDate:'' };

const ShipModal = ({ ship, onClose, onSave }) => {
  const [form, setForm] = useState(ship || defaultForm);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (ship?._id) await api.put(`/ships/${ship._id}`, form);
      else await api.post('/ships', form);
      toast.success(ship?._id ? 'Ship updated!' : 'Ship created!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving ship'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{ship?._id ? 'Edit Ship' : 'Add New Ship'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          {[['shipName','Ship Name','text'],['shipNumber','Ship Number','text'],['captainName','Captain Name','text'],['registrationCountry','Registration Country','text']].map(([k,l,t]) => (
            <div key={k}>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">{l}</label>
              <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} className="input-field" required />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Ship Type</label>
            <select value={form.shipType} onChange={e => set('shipType', e.target.value)} className="input-field">
              {SHIP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Capacity (tons)</label>
            <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
              {SHIP_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Arrival Date</label>
            <input type="date" value={form.arrivalDate?.slice(0,10)} onChange={e => set('arrivalDate', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Departure Date</label>
            <input type="date" value={form.departureDate?.slice(0,10)} onChange={e => set('departureDate', e.target.value)} className="input-field" />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (ship?._id ? 'Save Changes' : 'Create Ship')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Ships = () => {
  const { user } = useAuth();
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | ship object

  const fetchShips = () => {
    setLoading(true);
    api.get('/ships').then(r => { setShips(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchShips(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this ship?')) return;
    try { await api.delete(`/ships/${id}`); toast.success('Ship deleted'); fetchShips(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const filtered = ships.filter(s => {
    const q = search.toLowerCase();
    return (!filterStatus || s.status === filterStatus) &&
      (!q || s.shipName.toLowerCase().includes(q) || s.shipNumber.toLowerCase().includes(q) || s.captainName.toLowerCase().includes(q));
  });

  return (
    <DashboardLayout>
      {modal !== null && (
        <ShipModal
          ship={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchShips(); }}
        />
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><Ship className="w-7 h-7 text-navy-600 dark:text-ocean-400" /> Ships</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{ships.length} ships registered</p>
        </div>
        {['Admin', 'Ship Operator', 'Port Officer'].includes(user?.role) && (
          <button id="add-ship-btn" onClick={() => setModal('add')} className="btn-primary"><Plus className="w-4 h-4" /> Add Ship</button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search ships..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field sm:w-48">
          <option value="">All Statuses</option>
          {SHIP_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Ship className="w-12 h-12 mb-3 opacity-30" />
            <p>No ships found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ship</th><th>Number</th><th>Captain</th><th>Type</th>
                  <th>Capacity</th><th>Country</th><th>Status</th><th>Arrival</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ship => (
                  <tr key={ship._id}>
                    <td className="font-semibold text-slate-800 dark:text-white">{ship.shipName}</td>
                    <td className="font-mono text-slate-600 dark:text-slate-400">{ship.shipNumber}</td>
                    <td>{ship.captainName}</td>
                    <td>{ship.shipType}</td>
                    <td>{ship.capacity?.toLocaleString()} t</td>
                    <td>{ship.registrationCountry}</td>
                    <td><span className={STATUS_BADGE[ship.status] || 'badge-neutral'}>{ship.status}</span></td>
                    <td>{ship.arrivalDate ? new Date(ship.arrivalDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {['Admin', 'Ship Operator', 'Port Officer'].includes(user?.role) && (
                          <button onClick={() => setModal(ship)} className="text-ocean-500 hover:text-ocean-400 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {user?.role === 'Admin' && (
                          <button onClick={() => handleDelete(ship._id)} className="text-rose-500 hover:text-rose-400 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

export default Ships;
