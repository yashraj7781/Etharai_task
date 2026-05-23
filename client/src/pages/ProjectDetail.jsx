import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ChevronLeft, UserPlus, Crown, Trash2, ClipboardList } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const columns = [
  {
    key: 'todo',
    label: 'To Do',
    dot: 'bg-slate-400',
    headerBg: 'bg-slate-100',
    headerText: 'text-slate-600',
    countCls: 'bg-white text-slate-500 border border-slate-200',
    colBg: 'bg-slate-50/60',
    emptyText: 'No tasks yet',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    dot: 'bg-blue-500',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-700',
    countCls: 'bg-blue-100 text-blue-600',
    colBg: 'bg-blue-50/40',
    emptyText: 'Nothing in progress',
  },
  {
    key: 'done',
    label: 'Done',
    dot: 'bg-emerald-500',
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-700',
    countCls: 'bg-emerald-100 text-emerald-600',
    colBg: 'bg-emerald-50/40',
    emptyText: 'Nothing completed yet',
  },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('board');
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [showInvite, setShowInvite] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [error, setError] = useState('');

  const isAdmin = project?.my_role === 'admin';

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/projects/${id}`), api.get(`/tasks/project/${id}`)])
      .then(([p, t]) => { setProject(p.data); setTasks(t.data); })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleTaskSaved(saved, isEdit) {
    setTasks((prev) => isEdit ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev]);
    setTaskModal({ open: false, task: null });
  }

  function handleTaskDeleted(taskId) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTaskModal({ open: false, task: null });
  }

  async function handleRemoveMember() {
    try {
      await api.delete(`/projects/${id}/members/${confirmRemove}`);
      setProject((prev) => ({ ...prev, members: prev.members.filter((m) => m.id !== confirmRemove) }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove');
    } finally {
      setConfirmRemove(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f5f7]">
        <Sidebar />
        <main className="ml-56 flex-1 p-8">
          <div className="animate-pulse space-y-5">
            <div className="h-4 w-20 bg-gray-200 rounded-lg" />
            <div className="h-7 w-48 bg-gray-200 rounded-lg" />
            <div className="flex gap-4 mt-8">
              {[1, 2, 3].map((i) => <div key={i} className="w-72 h-72 bg-white border border-gray-100 rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f5f5f7]">
        <Sidebar />
        <main className="ml-56 flex-1 p-8">
          <p className="text-rose-500 text-sm mb-2">{error}</p>
          <Link to="/projects" className="text-indigo-600 text-sm">← Back to projects</Link>
        </main>
      </div>
    );
  }

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const totalTasks = tasks.length;
  const doneTasks = tasksByStatus.done.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar />
      <main className="ml-56 flex-1 flex flex-col min-h-screen">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 pt-6 pb-0">
          <Link to="/projects" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors w-fit">
            <ChevronLeft size={13} />
            Projects
          </Link>

          <div className="flex items-start justify-between pb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight capitalize">{project.name}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                  isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {project.my_role}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-gray-400 max-w-lg leading-relaxed">{project.description}</p>
              )}

              {/* Progress bar */}
              {totalTasks > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-36 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{doneTasks}/{totalTasks} done</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setTaskModal({ open: true, task: null })}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 shrink-0 ml-6"
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5">
            {['board', 'members'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'board' ? 'Board' : `Members (${project.members?.length || 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Board */}
        {tab === 'board' ? (
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-5" style={{ minWidth: 'fit-content' }}>
              {columns.map((col) => {
                const colTasks = tasksByStatus[col.key];
                return (
                  <div key={col.key} className="w-72 shrink-0 flex flex-col">
                    {/* Column header */}
                    <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-3 ${col.headerBg}`}>
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${col.headerText}`}>
                        {col.label}
                      </span>
                      <span className={`ml-auto text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${col.countCls}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task list area */}
                    <div className={`flex-1 rounded-2xl p-2.5 min-h-[220px] ${col.colBg} border border-white`}>
                      {colTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-2">
                          <ClipboardList size={20} className="text-gray-200" />
                          <p className="text-xs text-gray-300 font-medium">{col.emptyText}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {colTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onClick={(t) => setTaskModal({ open: true, task: t })}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add task button */}
                    <button
                      onClick={() => setTaskModal({ open: true, task: null })}
                      className="mt-2 w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all flex items-center gap-1.5 group"
                    >
                      <Plus size={12} className="group-hover:text-indigo-500 transition-colors" />
                      Add a task
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8">
            <div className="max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Team Members</h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                  >
                    <UserPlus size={14} />
                    Add member
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {project.members?.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                        {member.role === 'admin' && <Crown size={11} className="text-amber-500 shrink-0" />}
                        {member.id === user.id && <span className="text-[10px] text-gray-400">(you)</span>}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{member.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      member.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {member.role}
                    </span>
                    {isAdmin && member.id !== user.id && project.owner_id !== member.id && (
                      <button onClick={() => setConfirmRemove(member.id)} className="text-gray-300 hover:text-rose-500 transition-colors ml-1">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {taskModal.open && (
        <TaskModal
          task={taskModal.task}
          projectId={id}
          members={project.members || []}
          isAdmin={isAdmin}
          onClose={() => setTaskModal({ open: false, task: null })}
          onSave={handleTaskSaved}
          onDelete={handleTaskDeleted}
        />
      )}

      {confirmRemove && (
        <ConfirmModal
          title="Remove member?"
          message="This person will lose access to the project and all its tasks."
          confirmLabel="Remove"
          onConfirm={handleRemoveMember}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {showInvite && (
        <InviteMemberModal
          projectId={id}
          onClose={() => setShowInvite(false)}
          onInvited={(member) => {
            setProject((prev) => ({ ...prev, members: [...(prev.members || []), member] }));
            setShowInvite(false);
          }}
        />
      )}
    </div>
  );
}
