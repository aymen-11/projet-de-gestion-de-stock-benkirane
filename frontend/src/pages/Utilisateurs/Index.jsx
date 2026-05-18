import { useState } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Shield, User, UserCog, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockUsers = [
  { id: 1, name: 'Admin System', email: 'admin@stockpro.com', role: 'admin', status: 'Actif', lastLogin: 'Il y a 2h' },
  { id: 2, name: 'Sarah Connor', email: 'sarah@stockpro.com', role: 'responsable', status: 'Actif', lastLogin: 'Hier' },
  { id: 3, name: 'John Doe', email: 'john@stockpro.com', role: 'magasinier', status: 'Inactif', lastLogin: 'Il y a 1 semaine' },
  { id: 4, name: 'Global Logistix', email: 'contact@global.com', role: 'fournisseur', status: 'Actif', lastLogin: 'Aujourd\'hui' },
];

const RoleBadge = ({ role }) => {
  const styles = {
    'admin': 'bg-purple-100 text-purple-700',
    'responsable': 'bg-blue-100 text-blue-700',
    'magasinier': 'bg-amber-100 text-amber-700',
    'fournisseur': 'bg-gray-100 text-gray-700'
  };
  
  const labels = {
    'admin': 'Administrateur',
    'responsable': 'Responsable',
    'magasinier': 'Magasinier',
    'fournisseur': 'Fournisseur'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[role]}`}>
      {labels[role]}
    </span>
  );
};

export default function UtilisateursList() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les accès et les rôles de votre équipe.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#1A766E] text-white rounded-lg text-sm font-medium hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvel Utilisateur
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all"
          />
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors w-full md:w-auto">
          <Filter className="w-4 h-4" /> Filtrer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4 text-center">Dernière Connexion</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-[#1A766E] transition-colors">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex w-2 h-2 rounded-full ${user.status === 'Actif' ? 'bg-green-500' : 'bg-red-500'}`} title={user.status}></span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-[#1A766E] rounded-lg hover:bg-[#1A766E]/10 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {mockUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
