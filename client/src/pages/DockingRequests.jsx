import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ClipboardList, Plus, CheckCircle, XCircle, Clock, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = { Pending: 'badge-warning', Approved: 'badge-success', Rejected: 'badge-danger' };

const RequestModal = ({ ships, onClose, onSave }) => {
  const [form, setForm] = useState({ shipId: '', requestedArrival: '', requestedDeparture: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/docking', form);
      toast.success('Docking request submitted!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Docking Request</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Select Ship</label>
            <select value={form.shipId} onChange={e => setForm(p => ({...p, shipId: e.target.value}))} className="input-field" required>
              <option value="">— Choose Ship —</option>
              {ships.map(s => <option key={s._id} value={s._id}>{s.shipName} ({s.shipNumber})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Requested Arrival</label>
            <input type="datetime-local" value={form.requestedArrival} onChange={e => setForm(p => ({...p, requestedArrival: e.target.value}))} className="input-field" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Requested Departure</label>
            <input type="datetime-local" value={form.requestedDeparture} onChange={e => setForm(p => ({...p, requestedDeparture: e.target.value}))} className="input-field" required />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReviewModal = ({ request, onClose, onSave }) => {
  const [status, setStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/docking/${request._id}`, { status, remarks });
      toast.success(`Request ${status}!`);
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Error processing request'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Review Docking Request</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" /></button>
        </div>
        <div className="glass-card p-4 mb-5 space-y-2 text-sm">
          <p><span className="text-slate-500 dark:text-slate-400">Ship:</span> <span className="font-semibold">{request.shipId?.shipName}</span></p>
          <p><span className="text-slate-500 dark:text-slate-400">Arrival:</span> {new Date(request.requestedArrival).toLocaleString()}</p>
          <p><span className="text-slate-500 dark:text-slate-400">Departure:</span> {new Date(request.requestedDeparture).toLocaleString()}</p>
          <p><span className="text-slate-500 dark:text-slate-400">Capacity:</span> {request.shipId?.capacity?.toLocaleString()} t</p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Decision</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStatus('Approved')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-all ${status === 'Approved' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button type="button" onClick={() => setStatus('Rejected')}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-all ${status === 'Rejected' ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">Remarks (optional)</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="input-field resize-none" placeholder="Add notes..." />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className={status === 'Approved' ? 'btn-success' : 'btn-danger'}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${status}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DockingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    const [rRes, sRes] = await Promise.all([api.get('/docking'), api.get('/ships')]);
    setRequests(rRes.data); setShips(sRes.data); setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const filtered = requests.filter(r => !filterStatus || r.status === filterStatus);

  return (
    <DashboardLayout>
      {modal && <RequestModal ships={ships} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchAll(); }} />}
      {reviewModal && <ReviewModal request={reviewModal} onClose={() => setReviewModal(null)} onSave={() => { setReviewModal(null); fetchAll(); }} />}

      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><ClipboardList className="w-7 h-7 text-navy-600 dark:text-ocean-400" /> Docking Requests</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{requests.filter(r => r.status === 'Pending').length} pending requests</p>
        </div>
        {['Admin', 'Ship Operator'].includes(user?.role) && (
          <button onClick={() => setModal('new')} className="btn-primary"><Plus className="w-4 h-4" /> New Request</button>
        )}
      </div>

      <div className="glass-card p-4 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field sm:w-48">
          <option value="">All Statuses</option>
          {['Pending', 'Approved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
            <p>No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Ship</th><th>Requested Arrival</th><th>Requested Departure</th><th>Assigned Berth</th><th>Status</th><th>Remarks</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req._id}>
                    <td className="font-semibold text-slate-800 dark:text-white">{req.shipId?.shipName || '—'}</td>
                    <td>{new Date(req.requestedArrival).toLocaleDateString()}</td>
                    <td>{new Date(req.requestedDeparture).toLocaleDateString()}</td>
                    <td>{req.assignedBerth ? <span className="badge badge-info">{req.assignedBerth.berthNumber}</span> : <span className="text-slate-400">—</span>}</td>
                    <td><span className={STATUS_BADGE[req.status]}>{req.status}</span></td>
                    <td className="text-slate-500 dark:text-slate-400 max-w-xs truncate">{req.remarks || '—'}</td>
                    <td>
                      {['Admin', 'Port Officer'].includes(user?.role) && req.status === 'Pending' && (
                        <button onClick={() => setReviewModal(req)} className="btn-primary text-xs py-1.5 px-3">
                          Review
                        </button>
                      )}
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

export default DockingRequests;
