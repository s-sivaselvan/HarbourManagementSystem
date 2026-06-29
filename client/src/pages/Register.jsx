import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Anchor, Eye, EyeOff, Loader2 } from 'lucide-react';

const ROLES = ['Admin', 'Port Officer', 'Ship Operator'];

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Ship Operator' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome aboard 🚢');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-harbour-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-navy-500 to-ocean-400 flex items-center justify-center shadow-2xl shadow-navy-500/40 mb-4">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Harbour HMS</h1>
          <p className="text-ocean-300 mt-1">Create your account</p>
        </div>

        <div className="glass-card p-8 bg-slate-900/80 border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Full Name</label>
              <input id="reg-name" type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field dark:bg-slate-800" placeholder="John Rivera" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email</label>
              <input id="reg-email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field dark:bg-slate-800" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field dark:bg-slate-800 pr-10" placeholder="Min. 6 characters" required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Role</label>
              <select id="reg-role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="input-field dark:bg-slate-800">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button id="reg-submit" type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ocean-400 hover:text-ocean-300 font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
