import { useState, useEffect } from 'react';
import { Search, Filter, Activity, User, Package, Clock, ShieldAlert, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, Download } from 'lucide-react';
import api from '../../lib/axios';

const ActionIcon = ({ type }) => {
  if (type === 'entree') return <ArrowDownToLine className="w-4 h-4 text-green-500" />;
  if (type === 'sortie') return <ArrowUpFromLine className="w-4 h-4 text-red-500" />;
  return <Activity className="w-4 h-4 text-blue-500" />;
};

export default function JournauxList() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // We fetch movements as the primary source of audit logs for now
        const res = await api.get('/mouvements?per_page=50');
        const data = res.data.data || res.data;
        
        // Transform movements into a generic "Log" format
        const formattedLogs = data.map(m => ({
          id: `mouv-${m.id}`,
          action: m.type === 'entree' ? 'Entrée Stock' : 'Sortie Stock',
          entity: `Article: ${m.article?.code || 'Inconnu'}`,
          user: m.user?.name || 'Système',
          role: m.user?.role || 'Utilisateur',
          date: new Date(m.date_mouvement).toLocaleString('fr-FR'),
          details: `${m.type === 'entree' ? 'Ajout' : 'Retrait'} de ${m.quantite} unités. Motif: ${m.motif}`,
          type: m.type,
          rawDate: new Date(m.date_mouvement).getTime()
        }));

        setLogs(formattedLogs.sort((a, b) => b.rawDate - a.rawDate));
      } catch (err) {
        console.error("Erreur lors du chargement des journaux", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    const filtered = logs.filter(l => 
      l.action.toLowerCase().includes(search.toLowerCase()) || 
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase())
    );

    if (!filtered.length) return alert('Aucun journal à exporter');
    
    const headers = ['Date', 'Action', 'Entité', 'Utilisateur', 'Détails'];
    const rows = filtered.map(l => [
      `"${l.date}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${l.user}"`,
      `"${l.details}"`
    ]);
    
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journaux d'Audit (Logs)</h1>
          <p className="text-sm text-gray-500 mt-1">Tracez toutes les actions effectuées sur le système.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Exporter CSV
        </button>
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
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement des journaux...</div>
        ) : (
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
                {filteredLogs.map((log) => (
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
                          log.type === 'entree' ? 'bg-green-100' : 'bg-red-100'
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
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Aucun journal trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
