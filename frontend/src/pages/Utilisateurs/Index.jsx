import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Shield, User, UserCog, Mail, X, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

const RoleBadge = ({ role }) => {
  const styles = {
    'admin': 'bg-purple-100 text-purple-700 border border-purple-200/50',
    'responsable': 'bg-blue-100 text-blue-700 border border-blue-200/50',
    'magasinier': 'bg-amber-100 text-amber-700 border border-amber-200/50',
    'fournisseur': 'bg-gray-100 text-gray-700 border border-gray-200/50'
  };
  
  const labels = {
    'admin': 'Administrateur',
    'responsable': 'Responsable',
    'magasinier': 'Magasinier',
    'fournisseur': 'Fournisseur'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[role] || styles['magasinier']}`}>
      {labels[role] || role}
    </span>
  );
};

export default function UtilisateursList() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'magasinier',
    status: 'Actif'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'Tous') params.append('role', roleFilter);

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'magasinier',
      status: 'Actif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave empty unless changing
      role: user.role,
      status: user.status || 'Actif'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
        showToast("Utilisateur supprimé avec succès.");
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        // Edit mode
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password
        
        const res = await api.put(`/users/${editingUser.id}`, payload);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? res.data : u));
        showToast("Utilisateur mis à jour avec succès.");
      } else {
        // Create mode
        const res = await api.post('/users', formData);
        setUsers(prev => [res.data, ...prev]);
        showToast("Nouvel utilisateur créé avec succès.");
      }
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la sauvegarde.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les accès, les rôles et les profils de votre équipe.</p>
        </div>
        <button onClick={handleOpenCreate} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvel Utilisateur
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#1A766E] transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-x-auto">
             {['Tous', 'admin', 'responsable', 'magasinier', 'fournisseur'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setRoleFilter(tab)}
                 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                   roleFilter === tab 
                     ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' 
                     : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 {tab === 'Tous' ? tab : tab}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement des profils utilisateurs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Utilisateur / Profil</th>
                  <th className="px-6 py-4 text-center">Rôle</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-right">Dernière Connexion</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A766E] to-[#2D9D94] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name} {u.id === currentUser?.id && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1 font-semibold">VOUS</span>}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <Mail className="w-3 h-3" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">
                      {u.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(u)} className="p-1.5 text-gray-400 hover:text-[#1A766E] rounded-lg hover:bg-[#1A766E]/10 transition-colors" title="Modifier le profil">
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" disabled={u.id === currentUser?.id}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                      Aucun profil utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {editingUser ? <UserCog className="w-5 h-5 text-[#1A766E]" /> : <User className="w-5 h-5 text-[#1A766E]" />}
                {editingUser ? 'Modifier le profil' : 'Ajouter un utilisateur'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rôle d'accès</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all appearance-none cursor-pointer">
                    <option value="magasinier">Magasinier (Opérations stock)</option>
                    <option value="responsable">Responsable (Gestion & Rapports)</option>
                    <option value="admin">Administrateur (Accès total)</option>
                    <option value="fournisseur">Fournisseur (Extérieur)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mot de passe {editingUser && <span className="text-gray-400 font-normal text-xs">(Laissez vide pour conserver)</span>}
                </label>
                <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all" />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 text-white bg-[#1A766E] rounded-xl text-sm font-bold hover:bg-[#0A5C53] transition-colors shadow-sm disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : (editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#1A766E] text-white rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
