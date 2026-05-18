import { useState, useEffect } from 'react';
import { Plus, Filter, Search, ArrowUpDown, Clock, CheckCircle, Send, AlertCircle, XCircle, Eye, Edit2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';

const statusConfig = {
  'Brouillon':   { color: 'bg-gray-100 text-gray-700',    icon: Clock },
  'Envoyé':      { color: 'bg-blue-100 text-blue-700',    icon: Send },
  'En attente':  { color: 'bg-amber-100 text-amber-700',  icon: Clock },
  'Reçu':        { color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  'Annulé':      { color: 'bg-red-100 text-red-700',      icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const tabs = ['Tous', 'Brouillon', 'Envoyé', 'En attente', 'Reçu', 'Annulé'];

export default function CommandesList() {
  const { user } = useAuthStore();
  const isFournisseur = user?.role === 'fournisseur';
  const [activeTab, setActiveTab] = useState('Tous');
  const [search, setSearch] = useState('');
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeTab !== 'Tous') params.append('statut', activeTab);
      const response = await api.get(`/commandes?${params.toString()}`);
      setCommandes(response.data.data);
    } catch (err) {
      setError("Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommandes(); }, [activeTab, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bons de Commande</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos achats et suivez les livraisons fournisseurs.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Exporter
          </button>
          {!isFournisseur && (
            <Link to="/commandes/create" className="px-4 py-2 bg-[#1A766E] text-white rounded-lg text-sm font-medium hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nouveau Bon
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              activeTab === tab
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md group">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Rechercher une référence, un fournisseur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement des commandes...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">
                    <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                      Référence <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4">Fournisseur</th>
                  <th className="px-6 py-4">Date Commande</th>
                  <th className="px-6 py-4">Livraison Prévue</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commandes.map((commande) => (
                  <tr key={commande.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 font-mono">{commande.reference}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{commande.lignes_count} lignes</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {commande.fournisseur?.nom || <span className="text-gray-400 italic">Non défini</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {commande.date_livraison_prevue
                        ? new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR')
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {Number(commande.total).toFixed(2)} MAD
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={commande.statut} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-[#1A766E] rounded-lg hover:bg-[#1A766E]/10 transition-colors" title="Voir">
                          <Eye className="w-4 h-4" />
                        </button>
                        {isFournisseur ? (
                          <button onClick={() => alert("Réponse envoyée avec succès")} className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[#1A766E] hover:bg-[#1A766E]/10 rounded-lg transition-colors border border-[#1A766E]/20" title="Répondre">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Répondre
                          </button>
                        ) : (
                          <Link to={`/commandes/edit/${commande.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Modifier">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {commandes.length === 0 && (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">Aucune commande trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
