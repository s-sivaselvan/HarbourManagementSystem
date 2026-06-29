import { Link } from 'react-router-dom';
import { Anchor, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-harbour-hero flex flex-col items-center justify-center text-center p-4">
    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-navy-500 to-ocean-400 flex items-center justify-center shadow-2xl shadow-navy-500/40 mb-6">
      <Anchor className="w-12 h-12 text-white" />
    </div>
    <h1 className="text-8xl font-black text-white mb-2">404</h1>
    <h2 className="text-2xl font-bold text-ocean-300 mb-4">Lost at Sea</h2>
    <p className="text-slate-400 max-w-sm mb-8">The page you're looking for has sailed away. Let's get you back to port.</p>
    <Link to="/dashboard" className="btn-primary">
      <ArrowLeft className="w-4 h-4" /> Back to Dashboard
    </Link>
  </div>
);

export default NotFound;
