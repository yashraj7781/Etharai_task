import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900'
            : 'text-slate-400 hover:text-white hover:bg-white/6'
        }`
      }
    >
      <Icon size={17} strokeWidth={isActive => isActive ? 2.25 : 1.75} />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-56 bg-slate-950 flex flex-col h-screen fixed left-0 top-0 border-r border-white/5">
      <div className="px-4 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" strokeWidth={0} />
          </div>
          <span className="text-white font-bold text-base tracking-tight">Synq</span>
        </div>
      </div>

      <div className="px-2 mb-1">
        <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-2 mb-1.5">Menu</p>
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/projects" icon={FolderKanban} label="Projects" />
      </nav>

      <div className="px-2 pb-4 border-t border-white/5 pt-3 mx-1">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl">
          <div className="w-7 h-7 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-300 text-[10px] font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-slate-200 text-xs font-semibold truncate leading-tight">{user?.name}</p>
            <p className="text-slate-600 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl text-xs font-medium transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
