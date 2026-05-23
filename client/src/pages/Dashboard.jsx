import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, ArrowUpRight, CalendarDays } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const priorityDot = { high: 'bg-rose-500', medium: 'bg-amber-400', low: 'bg-emerald-400' };
const statusLabel = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const statusCls = {
  todo: 'bg-slate-100 text-slate-500',
  in_progress: 'bg-blue-50 text-blue-600',
  done: 'bg-emerald-50 text-emerald-600',
};

function isOverdue(task) {
  return task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date(new Date().toDateString());
}

function formatDate(d) {
  const date = new Date(d);
  const today = new Date();
  const diff = Math.ceil((date - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const todayStr = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
});

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    api.get('/tasks/mine')
      .then(({ data }) => setTasks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const overdue = tasks.filter(isOverdue).length;
  const pending = tasks.filter((t) => t.status !== 'done');

  const statCards = [
    { label: 'Total Tasks', value: total, icon: ListTodo, iconCls: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'In Progress', value: inProgress, icon: Clock, iconCls: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Completed', value: done, icon: CheckCircle2, iconCls: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, iconCls: 'text-rose-500', bg: 'bg-rose-50', highlight: overdue > 0 },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar />
      <main className="ml-56 flex-1">

        {/* Hero */}
        <div className="relative bg-slate-950 px-8 pt-9 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 10% 50%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(139,92,246,0.12) 0%, transparent 50%)',
            }}
          />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative z-10">
            <p className="text-slate-500 text-[13px] font-medium mb-2 flex items-center gap-1.5">
              <CalendarDays size={13} />
              {todayStr}
            </p>
            <h1 className="text-[1.9rem] font-bold text-white tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              {overdue > 0
                ? `You have ${overdue} overdue task${overdue > 1 ? 's' : ''} — let's clear them up.`
                : pending.length === 0
                ? 'Everything done. Great work today.'
                : `${pending.length} task${pending.length > 1 ? 's' : ''} remaining for you.`}
            </p>
          </div>
        </div>

        {/* Stat cards — overlapping hero */}
        <div className="px-8 -mt-11 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`bg-white rounded-2xl px-5 py-4 shadow-lg shadow-black/5 border ${s.highlight ? 'border-rose-200' : 'border-gray-100'}`}
                >
                  <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={16} className={s.iconCls} strokeWidth={1.75} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task list */}
        <div className="px-8 mt-7 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Pending Tasks</h2>
            {pending.length > 0 && (
              <span className="text-xs font-medium text-gray-400 bg-white border border-gray-100 px-2.5 py-1 rounded-full shadow-sm">
                {pending.length} remaining
              </span>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded-lg w-48 animate-pulse" />
                    <div className="h-2.5 bg-gray-100 rounded-lg w-28 animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={22} className="text-emerald-500" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-semibold text-gray-700">All tasks done!</p>
              <p className="text-xs text-gray-400 mt-1">Nothing pending. You're on top of it.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {pending.map((task, i) => (
                <Link
                  to={`/projects/${task.project_id}`}
                  key={task.id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group ${
                    i !== 0 ? 'border-t border-gray-50' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isOverdue(task) ? 'text-rose-600' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{task.project_name}</p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {task.due_date && (
                      <span className={`hidden sm:flex items-center gap-1 text-xs ${isOverdue(task) ? 'text-rose-500 font-semibold' : 'text-gray-400'}`}>
                        <CalendarDays size={11} />
                        {formatDate(task.due_date)}
                      </span>
                    )}
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${statusCls[task.status]}`}>
                      {statusLabel[task.status]}
                    </span>
                    <ArrowUpRight size={13} className="text-gray-200 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
