import { CalendarDays, AlertCircle } from 'lucide-react';

const priorityConfig = {
  high:   { label: 'High',   badge: 'bg-rose-50 text-rose-600 border-rose-200',   border: 'border-l-rose-500' },
  medium: { label: 'Med',    badge: 'bg-amber-50 text-amber-600 border-amber-200', border: 'border-l-amber-400' },
  low:    { label: 'Low',    badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', border: 'border-l-emerald-400' },
};

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, onClick }) {
  const p = priorityConfig[task.priority] || priorityConfig.medium;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div
      onClick={() => onClick(task)}
      className={`bg-white border border-gray-200 border-l-4 ${p.border} rounded-xl p-3.5 cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all group`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{task.title}</h4>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${p.badge}`}>
          {p.label}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-1 mb-2.5 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
        {task.due_date ? (
          <span className={`flex items-center gap-1 text-[11px] font-medium ${overdue ? 'text-rose-500' : 'text-gray-400'}`}>
            {overdue ? <AlertCircle size={11} /> : <CalendarDays size={11} />}
            {overdue ? 'Overdue' : formatDate(task.due_date)}
          </span>
        ) : (
          <span />
        )}

        {task.assignee_name ? (
          <div
            title={task.assignee_name}
            className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white shrink-0"
          >
            {initials(task.assignee_name)}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200 shrink-0" title="Unassigned" />
        )}
      </div>
    </div>
  );
}
