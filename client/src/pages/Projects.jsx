import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Users, CheckSquare, Trash2, ArrowUpRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const cardGradients = [
  'from-indigo-500 to-violet-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-pink-500 to-rose-600',
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  function handleDeleteClick(e, projectId) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(projectId);
  }

  async function handleDeleteConfirm() {
    try {
      await api.delete(`/projects/${confirmDelete}`);
      setProjects((prev) => prev.filter((p) => p.id !== confirmDelete));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar />
      <main className="ml-56 flex-1">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Projects</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? '...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} you're a part of`}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="h-36 bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-200">
                <FolderOpen size={26} className="text-white" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-bold text-gray-800">No projects yet</p>
              <p className="text-sm text-gray-400 mt-1.5 mb-6 max-w-xs">
                Create your first project to start organizing tasks with your team.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                <Plus size={15} />
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => {
                const gradient = cardGradients[project.id % cardGradients.length];
                return (
                  <Link
                    to={`/projects/${project.id}`}
                    key={project.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-200 group flex flex-col"
                  >
                    {/* Gradient top section */}
                    <div className={`bg-gradient-to-br ${gradient} p-5 relative`}>
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <FolderOpen size={18} className="text-white" strokeWidth={1.75} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white/80 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {project.my_role}
                          </span>
                          {project.owner_id === user.id && (
                            <button
                              onClick={(e) => handleDeleteClick(e, project.id)}
                              className="opacity-0 group-hover:opacity-100 bg-white/15 hover:bg-white/30 rounded-lg p-1.5 transition-all"
                              title="Delete project"
                            >
                              <Trash2 size={12} className="text-white" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-white font-bold text-lg leading-tight capitalize">
                        {project.name}
                      </h3>
                      {project.description ? (
                        <p className="text-white/65 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-white/35 text-xs mt-1.5 italic">No description</p>
                      )}
                    </div>

                   
                    <div className="px-5 py-3.5 flex items-center gap-3 text-xs text-gray-400 mt-auto">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare size={12} className="text-gray-300" />
                        {project.task_count} task{project.task_count != 1 ? 's' : ''}
                      </span>
                      <span className="w-px h-3 bg-gray-100" />
                      <span className="flex items-center gap-1.5">
                        <Users size={12} className="text-gray-300" />
                        {project.member_count} member{project.member_count != 1 ? 's' : ''}
                      </span>
                      <span className="ml-auto text-gray-300">{timeAgo(project.created_at)}</span>
                      <ArrowUpRight size={13} className="text-gray-200 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}

              {/* Add new project card */}
              <button
                onClick={() => setShowCreate(true)}
                className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-500 group min-h-[180px]"
              >
                <div className="w-10 h-10 border-2 border-dashed border-gray-200 group-hover:border-indigo-300 rounded-xl flex items-center justify-center transition-colors">
                  <Plus size={18} className="group-hover:text-indigo-500 transition-colors" />
                </div>
                <span className="text-sm font-semibold">New project</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete project?"
          message="This will permanently delete the project and all its tasks. This action cannot be undone."
          confirmLabel="Delete project"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
