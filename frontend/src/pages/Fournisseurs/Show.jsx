import { useState, useEffect } from 'react';
import { ArrowLeft, Building, Mail, Phone, MapPin, Star, Package, ShoppingCart, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/axios';

const StatusBadge = ({ status }) => {
  const isActif = status === 'Actif';
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
      isActif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    }`}>
      {isActif && <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>}
      {status}
    </span>
  );
};

export default function FournisseurShow() {
  const { id } = useParams();
  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFournisseur = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/fournisseurs/${id}`);
        setFournisseur(res.data);
      } catch (err) {
        setError("Erreur lors du chargement du fournisseur.");
      } finally {
        setLoading(false);
      }
    };
    fetchFournisseur();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-gray-500">Chargement...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
  if (!fournisseur) return <div className="p-12 text-center text-gray-500">Fournisseur introuvable.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/fournisseurs" className="hover:text-primary transition-colors">Fournisseurs</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Détail</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{fournisseur.nom}</h1>
        </div>
        <div className="flex gap-3 items-center">
          <StatusBadge status={fournisseur.statut} />
          <Link to="/fournisseurs" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-400" /> Informations
          </h3>
          <div className="space-y-3">
            {fournisseur.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900">{fournisseur.email}</p>
                </div>
              </div>
            )}
            {fournisseur.telephone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Téléphone</p>
                  <p className="text-sm font-medium text-gray-900">{fournisseur.telephone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" /> Localisation
          </h3>
          <div className="space-y-2">
            {fournisseur.adresse && (
              <div>
                <p className="text-xs text-gray-400">Adresse</p>
                <p className="text-sm font-medium text-gray-900">{fournisseur.adresse}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">Ville / Pays</p>
              <p className="text-sm font-medium text-gray-900">
                {fournisseur.ville || '—'}{fournisseur.pays ? `, ${fournisseur.pays}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Évaluation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-400" /> Évaluation
          </h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-6 h-6 ${i < fournisseur.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {fournisseur.rating ? `${fournisseur.rating} / 5 étoiles` : 'Non évalué'}
          </p>
        </div>
      </div>

      {/* Articles liés */}
      {fournisseur.articles && fournisseur.articles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" /> Articles liés ({fournisseur.articles.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Désignation</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4 text-right">Prix Unitaire (MAD)</th>
                  <th className="px-6 py-4 text-center">Stock Actuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fournisseur.articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{article.designation}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{article.code}</td>
                    <td className="px-6 py-4 text-right">{Number(article.prix_unitaire).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center font-bold">{article.stock_actuel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commandes liées */}
      {fournisseur.commandes && fournisseur.commandes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gray-400" /> Commandes ({fournisseur.commandes.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Référence</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Total (MAD)</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fournisseur.commandes.map((cmd) => (
                  <tr key={cmd.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{cmd.reference}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(cmd.date_commande).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-right font-medium">{Number(cmd.total).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        cmd.statut === 'Reçu' ? 'bg-green-100 text-green-700' :
                        cmd.statut === 'Envoyé' ? 'bg-blue-100 text-blue-700' :
                        cmd.statut === 'Annulé' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {cmd.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {fournisseur.notes && (
        <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-100 p-6 text-amber-900">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Notes & Remarques
          </h3>
          <p className="whitespace-pre-wrap text-sm">{fournisseur.notes}</p>
        </div>
      )}
    </div>
  );
}
