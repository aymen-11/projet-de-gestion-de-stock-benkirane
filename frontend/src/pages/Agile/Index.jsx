import { useState, useEffect, useRef } from 'react';
import {
  Plus, X, CheckCircle2, Clock, AlertCircle, Zap,
  User, Calendar, ChevronRight, Trash2, Edit3,
  Kanban, GripVertical
} from 'lucide-react';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

const COLUMNS = [
  {
    id: 'todo',
    label: 'À faire',
    color: 'bg-slate-100 border-slate-300',
    headerColor: 'bg-slate-600',
    icon: Clock,
    badge: 'bg-slate-200 text-slate-700',
  },
  {
    id: 'in_progress',
    label: 'En cours',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-600',
    icon: Zap,
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'done',
    label: 'Terminé',
    color: 'bg-emerald-50 border-emerald-200',
    headerColor: 'bg-emerald-600',
    icon: CheckCircle2,
    badge: 'bg-emerald-100 text-emerald-700',
  },
];

const PRIORITIES = [
  { value: 'basse',   label: 'Basse',   color: 'bg-gray-100 text-gray-600' },
  { value: 'normale', label: 'Normale', color: 'bg-blue-100 text-blue-700' },
  { value: 'haute',   label: 'Haute',   color: 'bg-orange-100 text-orange-700' },
  { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-700' },
];

const CATEGORIES = ['general', 'inventaire', 'commande', 'fournisseur', 'livraison'];

function PriorityBadge({ priorite }) {
  const p = PRIORITIES.find(x => x.value === priorite) || PRIORITIES[1];
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.color}`}>
      {p.label}
    </span>
  );
}

function TaskCard({ task, onMove, onEdit, onDelete, columns }) {
  const [hovering, setHovering] = useState(false);
  const currentColIdx = columns.findIndex(c => c.id === task.statut);

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 group cursor-default select-none"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[13px] font-bold text-gray-900 leading-snug flex-1">{task.title}</p>
        {hovering && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <PriorityBadge priorite={task.priorite} />
        {task.categorie && (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
            {task.categorie}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#1A766E] text-white flex items-center justify-center text-[9px] font-bold">
            {task.assignee?.name?.charAt(0) || '?'}
          </div>
          <span className="text-[11px] text-gray-500 font-medium truncate max-w-[80px]">
            {task.assignee?.name || 'Non assigné'}
          </span>
        </div>
        {task.date_echeance && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar className="w-3 h-3" />
            {new Date(task.date_echeance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>

      {/* Move buttons */}
      <div className="flex gap-1.5 mt-3">
        {currentColIdx > 0 && (
          <button
            onClick={() => onMove(task.id, columns[currentColIdx - 1].id)}
            className="flex-1 text-[10px] font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1"
          >
            <ChevronRight className="w-3 h-3 rotate-180" />
            {columns[currentColIdx - 1].label}
          </button>
        )}
        {currentColIdx < columns.length - 1 && (
          <button
            onClick={() => onMove(task.id, columns[currentColIdx + 1].id)}
            className="flex-1 text-[10px] font-bold text-[#1A766E] bg-[#E8F5F3] hover:bg-[#d0ece9] rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1"
          >
            {columns[currentColIdx + 1].label}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function TaskModal({ task, users, onClose, onSave }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priorite: task?.priorite || 'normale',
    categorie: task?.categorie || '',
    assignee_id: task?.assignee_id || '',
    date_echeance: task?.date_echeance || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/tasks/${task.id}`, form);
      } else {
        await api.post('/tasks', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
              placeholder="Ex: Vérifier le stock du rayon A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all resize-none"
              placeholder="Détails de la tâche..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priorité</label>
              <select
                value={form.priorite}
                onChange={e => setForm({ ...form, priorite: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
              <select
                value={form.categorie}
                onChange={e => setForm({ ...form, categorie: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
              >
                <option value="">-- Général --</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigné à</label>
              <select
                value={form.assignee_id}
                onChange={e => setForm({ ...form, assignee_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
              >
                <option value="">Non assigné</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Échéance</label>
              <input
                type="date"
                value={form.date_echeance}
                onChange={e => setForm({ ...form, date_echeance: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#1A766E] text-white rounded-xl text-sm font-bold hover:bg-[#0A5C53] transition-colors disabled:opacity-60"
            >
              {loading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer la tâche')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AgileKanban() {
  const [kanban, setKanban] = useState({ todo: [], in_progress: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { user } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/users'),
      ]);
      setKanban(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMove = async (taskId, newStatut) => {
    try {
      await api.patch(`/tasks/${taskId}/move`, { statut: newStatut });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    setEditingTask(null);
    fetchData();
  };

  const totalTasks = Object.values(kanban).flat().length;
  const doneTasks = kanban.done?.length || 0;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 min-h-full">
      {showModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[#1A766E] rounded-xl flex items-center justify-center">
              <Kanban className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau Agile</h1>
          </div>
          <p className="text-sm text-gray-500">Gérez les tâches de l'équipe avec la méthode Kanban (M202 — Approche agile).</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A766E] text-white rounded-2xl text-sm font-bold hover:bg-[#0A5C53] transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nouvelle tâche
        </button>
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">Progression du sprint</span>
            <span className="text-sm font-bold text-[#1A766E]">{doneTasks}/{totalTasks} tâches terminées</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-[#1A766E] to-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{progress}% complété</p>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#1A766E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {COLUMNS.map((col) => {
            const tasks = kanban[col.id] || [];
            const Icon = col.icon;
            return (
              <div key={col.id} className={`${col.color} border-2 rounded-3xl flex flex-col min-h-[500px]`}>
                {/* Column header */}
                <div className={`${col.headerColor} rounded-t-2xl px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">{col.label}</span>
                  </div>
                  <span className="w-6 h-6 bg-white/20 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {tasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-3">
                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="w-10 h-10 bg-white/60 rounded-2xl flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">Aucune tâche</p>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        columns={COLUMNS}
                        onMove={handleMove}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>

                {/* Add task button */}
                <div className="p-3 pt-0">
                  <button
                    onClick={() => { setEditingTask(null); setShowModal(true); }}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 text-xs font-bold hover:border-[#1A766E] hover:text-[#1A766E] hover:bg-white/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une tâche
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
