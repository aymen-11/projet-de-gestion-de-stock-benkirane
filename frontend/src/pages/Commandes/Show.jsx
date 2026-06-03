import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Calendar, Clock, Truck, FileText, CheckCircle, Clock as ClockIcon, AlertCircle, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';

const statusConfig = {
  'Brouillon':   { color: 'bg-gray-100 text-gray-700',    icon: ClockIcon },
  'Envoyé':      { color: 'bg-blue-100 text-blue-700',    icon: Truck },
  'En attente':  { color: 'bg-amber-100 text-amber-700',  icon: ClockIcon },
  'Reçu':        { color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  'Annulé':      { color: 'bg-red-100 text-red-700',      icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.color}`}>
      <Icon className="w-4 h-4" />
      {status}
    </span>
  );
};

export default function CommandeShow() {
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommande = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/commandes/${id}`);
        setCommande(res.data);
      } catch (err) {
        setError("Erreur lors du chargement des détails de la commande.");
      } finally {
        setLoading(false);
      }
    };
    fetchCommande();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-500">Chargement...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
  if (!commande) return <div className="p-12 text-center text-gray-500">Commande introuvable.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/commandes" className="hover:text-primary transition-colors">Commandes</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Détail</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{commande.reference}</h1>
        </div>
        <div className="flex gap-3 items-center">
          <StatusBadge status={commande.statut} />
          <Link to="/commandes" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informations générales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400" /> Fournisseur
          </h3>
          <p className="font-semibold text-lg text-gray-900">{commande.fournisseur?.nom || 'Non défini'}</p>
          {commande.fournisseur?.email && <p className="text-sm text-gray-500 mt-1">{commande.fournisseur.email}</p>}
          {commande.fournisseur?.telephone && <p className="text-sm text-gray-500">{commande.fournisseur.telephone}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" /> Dates
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Date de commande</p>
              <p className="font-medium text-gray-900">{new Date(commande.date_commande).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Livraison prévue</p>
              <p className="font-medium text-gray-900">
                {commande.date_livraison_prevue ? new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Montant
          </h3>
          <p className="text-3xl font-bold text-[#1A766E]">{Number(commande.total).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">MAD</p>
        </div>
      </div>

      {/* Lignes de commande */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" /> Articles commandés
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4 text-center">Quantité</th>
                <th className="px-6 py-4 text-right">Prix Unitaire (MAD)</th>
                <th className="px-6 py-4 text-right">Total Ligne (MAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commande.lignes.map((ligne) => (
                <tr key={ligne.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{ligne.article?.designation || `Article #${ligne.article_id}`}</p>
                    {ligne.article?.code && <p className="text-xs text-gray-400">{ligne.article.code}</p>}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {ligne.quantite}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {Number(ligne.prix_unitaire).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {(ligne.quantite * ligne.prix_unitaire).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-900 uppercase text-xs">Total de la commande</td>
                <td className="px-6 py-4 text-right font-bold text-[#1A766E] text-lg">{Number(commande.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {commande.notes && (
        <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-100 p-6 text-amber-900">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notes & Remarques
          </h3>
          <p className="whitespace-pre-wrap text-sm">{commande.notes}</p>
        </div>
      )}
    </div>
  );
}
