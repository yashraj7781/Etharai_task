import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%)'
            }}
          />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" fill="white" strokeWidth={0} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Synq</span>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-400 text-sm font-medium mb-3 tracking-wide uppercase">Team workspace</p>
          <h1 className="text-[2.6rem] font-bold text-white leading-[1.15] mb-5">
            Ship faster,<br />together.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Manage projects, assign tasks, and track your team's progress — all in one minimal workspace.
          </p>
        </div>

        <div className="relative z-10 space-y-2.5">
          {[
            { dot: 'bg-emerald-400', label: 'Redesign landing page', tag: 'Done', tagCls: 'text-emerald-400' },
            { dot: 'bg-blue-400', label: 'Integrate payment API', tag: 'In progress', tagCls: 'text-blue-400' },
            { dot: 'bg-slate-500', label: 'Write unit tests', tag: 'To do', tagCls: 'text-slate-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
              <span className="text-slate-300 text-sm flex-1">{item.label}</span>
              <span className={`text-xs ${item.tagCls}`}>{item.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" fill="white" strokeWidth={0} />
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">Synq</span>
          </div>

          <h2 className="text-[1.75rem] font-bold text-gray-900 mb-1 tracking-tight">Sign in</h2>
          <p className="text-gray-400 text-sm mb-8">Welcome back to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@company.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-sm shadow-indigo-200 mt-2"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            New to Synq?{' '}
            <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
