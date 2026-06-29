import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Anchor, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🚢');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-harbour-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-navy-500 to-ocean-400 flex items-center justify-center shadow-2xl shadow-navy-500/40 mb-4">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Harbour HMS</h1>
          <p className="text-ocean-300 mt-1">Port Management System</p>
        </div>

        {/* Card */}
        <div className="glass-card dark p-8 bg-slate-900/80 border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your credentials to access the port</p>

          {/* Quick login hint */}
          <div className="bg-ocean-900/40 border border-ocean-700/40 rounded-xl p-3 mb-6 text-xs text-ocean-300">
            <p className="font-semibold mb-1">Demo Accounts</p>
            <p>admin@harbour.com / password123</p>
            <p>officer@harbour.com / password123</p>
            <p>operator@harbour.com / password123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Email</label>
              <input id="login-email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field dark:bg-slate-800" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <input id="login-password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field dark:bg-slate-800 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="login-submit" type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-ocean-400 hover:text-ocean-300 font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
