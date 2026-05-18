import { useState } from 'react';
import { Search, Filter, Activity, User, Package, Clock, ShieldAlert, ArrowDownToLine, ArrowUpFromLine, RefreshCcw } from 'lucide-react';

const mockLogs = [
  { id: 1, action: 'Connexion', entity: 'Système', user: 'Admin System', role: 'admin', date: '18 Mai 2026 08:30', details: 'Connexion réussie', type: 'info' },
  { id: 2, action: 'Entrée Stock', entity: 'Article: ART-001', user: 'Sarah Connor', role: 'responsable', date: '18 Mai 2026 09:15', details: 'Ajout de 50 unités', type: 'success' },
  { id: 3, action: 'Alerte Critique', entity: 'Article: ART-042', user: 'Système', role: 'système', date: '18 Mai 2026 10:00', details: 'Stock à zéro', type: 'danger' },
  { id: 4, action: 'Sortie Stock', entity: 'Article: ART-015', user: 'John Doe', role: 'magasinier', date: '18 Mai 2026 11:45', details: 'Retrait de 5 unités', type: 'warning' },
  { id: 5, action: 'Modification Profil', entity: 'Utilisateur: Admin', user: 'Admin System', role: 'admin', date: '18 Mai 2026 14:20', details: 'Mise à jour email', type: 'info' },
];

const ActionIcon = ({ type }) => {
  if (type === 'info') return <Activity className="w-4 h-4 text-blue-500" />;
  if (type === 'success') return <ArrowDownToLine className="w-4 h-4 text-green-500" />;
  if (type === 'danger') return <ShieldAlert className="w-4 h-4 text-red-500" />;
  if (type === 'warning') return <ArrowUpFromLine className="w-4 h-4 text-amber-500" />;
  return <RefreshCcw className="w-4 h-4 text-gray-500" />;
};

export default function JournauxList() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journaux d'Audit (Logs)</h1>
          <p className="text-sm text-gray-500 mt-1">Tracez toutes les actions effectuées sur le système.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#1A766E] transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une action, un utilisateur..." 
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
                <th className="px-6 py-4">Date & Heure</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entité Concernée</th>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockLogs.filter(l => l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase())).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {log.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        log.type === 'success' ? 'bg-green-100' :
                        log.type === 'danger' ? 'bg-red-100' :
                        log.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        <ActionIcon type={log.type} />
                      </div>
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                      {log.entity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium text-gray-900">{log.user}</span>
                      <span className="text-xs text-gray-400 capitalize">({log.role})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
              {mockLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Aucun journal trouvé.
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
