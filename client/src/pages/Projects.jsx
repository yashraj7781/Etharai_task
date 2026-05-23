import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Users, CheckSquare, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CreateProjectModal from '../components/CreateProjectModal';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const cardAccents = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-pink-500',
  'bg-cyan-500',
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then(({ data }) => setProjects(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(project) {
    setProjects((prev) => [project, ...prev]);
    setShowCreate(false);
  }

  async function handleDelete(e, projectId) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-56 flex-1">
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Projects</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {projects.length} project{projects.length !== 1 ? 's' : ''} you're a part of
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={15} />
            New Project
          </button>
        </div>

        <div className="px-8 py-7">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white border border-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={24} className="text-indigo-400" strokeWidth={1.5} />
              </div>
              <p className="text-base font-semibold text-gray-700">No projects yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-6">Create your first project to get started.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus size={15} />
                Create a project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const accent = cardAccents[project.id % cardAccents.length];
                return (
                  <Link
                    to={`/projects/${project.id}`}
                    key={project.id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                  >
                    {/* Top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />

                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-9 h-9 ${accent} bg-opacity-10 rounded-xl flex items-center justify-center shrink-0`}
                        style={{ backgroundColor: `${accent.replace('bg-', '')}15` }}>
                        <FolderOpen size={16} className="text-gray-600" strokeWidth={1.75} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                            project.my_role === 'admin'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {project.my_role}
                        </span>
                        {project.owner_id === user.id && (
                          <button
                            onClick={(e) => handleDelete(e, project.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all"
                            title="Delete project"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </h3>

                    {project.description ? (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                    ) : (
                      <div className="mb-4" />
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <CheckSquare size={11} />
                        {project.task_count} task{project.task_count != 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {project.member_count}
                      </span>
                      <span className="ml-auto">{timeAgo(project.created_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
