import { useState, useEffect } from 'react';
import { Plus, Filter, Search, ArrowUpDown, Clock, CheckCircle, Send, AlertCircle, XCircle, Eye, Edit2, MessageSquare, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';
import ExportDropdown from '../../components/ExportDropdown';

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

  // Modal Supplier Reply
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('');

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

  const handleExportExcel = () => {
    if (!commandes.length) return alert('Aucune commande à exporter');
    const data = commandes.map(c => ({
      'Référence': c.reference,
      'Fournisseur': c.fournisseur?.nom || 'Non défini',
      'Date Commande': new Date(c.date_commande).toLocaleDateString('fr-FR'),
      'Livraison Prévue': c.date_livraison_prevue ? new Date(c.date_livraison_prevue).toLocaleDateString('fr-FR') : '',
      'Total (MAD)': Number(c.total).toFixed(2),
      'Statut': c.statut
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    const wscols = [
      {wch: 15}, {wch: 25}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commandes");
    XLSX.writeFile(wb, `commandes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!commandes.length) return alert('Aucune commande à exporter');
    const doc = new jsPDF();
    doc.text("Liste des Commandes", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['Référence', 'Fournisseur', 'Date', 'Livraison', 'Total (MAD)', 'Statut']],
      body: commandes.map(c => [
        c.reference,
        c.fournisseur?.nom || 'Non défini',
        new Date(c.date_commande).toLocaleDateString('fr-FR'),
        c.date_livraison_prevue ? new Date(c.date_livraison_prevue).toLocaleDateString('fr-FR') : '',
        Number(c.total).toFixed(2),
        c.statut
      ]),
      theme: 'grid',
      headStyles: { fillColor: [26, 118, 110] },
    });
    doc.save(`commandes_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const openReplyModal = (commande) => {
    setSelectedCommande(commande);
    setReplyStatus(commande.statut === 'Envoyé' ? 'En attente' : commande.statut);
    setReplyMessage(commande.notes || '');
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    try {
      await api.put(`/commandes/${selectedCommande.id}`, {
        statut: replyStatus,
        notes: replyMessage,
      });
      setReplyModalOpen(false);
      fetchCommandes();
    } catch (err) {
      alert("Erreur lors de l'envoi de la réponse");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bons de Commande</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos achats et suivez les livraisons fournisseurs.</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />
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
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/commandes/edit/${commande.id}`} className="p-1.5 text-gray-400 hover:text-[#1A766E] rounded-lg hover:bg-[#1A766E]/10 transition-colors" title="Voir">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isFournisseur ? (
                          <button onClick={() => openReplyModal(commande)} className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-[#1A766E] hover:bg-[#1A766E]/10 rounded-lg transition-colors border border-[#1A766E]/20" title="Répondre">
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

      {/* Modal Supplier Reply */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Répondre à la commande</h3>
              <button onClick={() => setReplyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mettre à jour le statut</label>
                <select 
                  value={replyStatus} 
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E]"
                >
                  <option value="En attente">En attente (Confirmation de réception)</option>
                  <option value="Envoyé">Envoyé (En cours d'expédition)</option>
                  <option value="Annulé">Annulé (Impossible à traiter)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message / Notes</label>
                <textarea 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Ex: Les articles seront expédiés demain..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] min-h-[100px]"
                ></textarea>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={() => setReplyModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSendReply} className="px-4 py-2 text-sm font-medium text-white bg-[#1A766E] rounded-xl hover:bg-[#0A5C53] flex items-center gap-2">
                <Send className="w-4 h-4" /> Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
