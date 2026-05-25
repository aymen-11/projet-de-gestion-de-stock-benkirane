import { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';

export default function CommandeForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reference data
  const [articles, setArticles] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  // Form states
  const [fournisseurId, setFournisseurId] = useState("");
  const [dateCommande, setDateCommande] = useState(new Date().toISOString().split('T')[0]);
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState("");
  const [notes, setNotes] = useState("");
  const [lignes, setLignes] = useState([
    { id: 1, article_id: '', quantite: 1, prix_unitaire: 0 }
  ]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artsRes, foursRes] = await Promise.all([
          api.get('/articles?per_page=100'),
          api.get('/fournisseurs?all=1')
        ]);
        setArticles(artsRes.data.data || []);
        setFournisseurs(foursRes.data || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des données", err);
      }
    };
    fetchData();
  }, []);

  // Fetch existing commande if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchCommande = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/commandes/${id}`);
          const commande = res.data;
          setFournisseurId(commande.fournisseur_id || "");
          setDateCommande(commande.date_commande ? commande.date_commande.split('T')[0] : "");
          setDateLivraisonPrevue(commande.date_livraison_prevue ? commande.date_livraison_prevue.split('T')[0] : "");
          setNotes(commande.notes || "");
          setLignes(commande.lignes.map(l => ({
            id: l.id,
            article_id: l.article_id,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire
          })));
        } catch (err) {
          setError("Erreur lors du chargement de la commande.");
        } finally {
          setLoading(false);
        }
      };
      fetchCommande();
    }
  }, [isEdit, id]);

  const addLigne = () => {
    setLignes([...lignes, { id: Date.now(), article_id: '', quantite: 1, prix_unitaire: 0 }]);
  };

  const removeLigne = (id) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter(l => l.id !== id));
    }
  };

  const updateLigne = (ligneId, field, value) => {
    setLignes(lignes.map(l => {
      if (l.id === ligneId) {
        const updated = { ...l, [field]: value };
        if (field === 'article_id') {
          const art = articles.find(a => String(a.id) === String(value));
          if (art) {
            updated.prix_unitaire = parseFloat(art.prix_unitaire);
          }
        }
        return updated;
      }
      return l;
    }));
  };

  const calculateTotal = () => {
    return lignes.reduce((total, l) => total + (l.quantite * l.prix_unitaire), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        fournisseur_id: fournisseurId ? parseInt(fournisseurId) : null,
        date_commande: dateCommande,
        date_livraison_prevue: dateLivraisonPrevue || null,
        notes,
        lignes: lignes.map(l => ({
          article_id: parseInt(l.article_id),
          quantite: parseInt(l.quantite),
          prix_unitaire: parseFloat(l.prix_unitaire)
        }))
      };

      if (isEdit) {
        await api.put(`/commandes/${id}`, payload);
      } else {
        await api.post('/commandes', payload);
      }

      setIsSaved(true);
      setTimeout(() => {
        navigate('/commandes');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la sauvegarde.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/commandes" className="hover:text-primary transition-colors">Commandes</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{isEdit ? 'Modifier' : 'Nouvelle'} Commande</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Modifier la commande' : 'Créer un bon de commande'}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/commandes" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <X className="w-4 h-4" /> Annuler
          </Link>
          <button 
            type="submit"
            form="commande-form"
            disabled={loading}
            className="px-4 py-2 bg-[#1A766E] text-white rounded-lg text-sm font-medium hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium">La commande a été enregistrée avec succès. Redirection...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form id="commande-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Entête */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 mb-6">Détails de la commande</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fournisseur *</label>
              <select 
                required 
                value={fournisseurId}
                onChange={(e) => setFournisseurId(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700"
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>{f.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de commande *</label>
              <input 
                type="date" 
                required 
                value={dateCommande}
                onChange={(e) => setDateCommande(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de livraison prévue</label>
              <input 
                type="date" 
                value={dateLivraisonPrevue}
                onChange={(e) => setDateLivraisonPrevue(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Lignes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Lignes de commande</h3>
            <button type="button" onClick={addLigne} className="text-sm font-medium text-[#1A766E] hover:text-[#0A5C53] transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" /> Ajouter une ligne
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-1/2">Article</th>
                  <th className="px-6 py-4 w-32 text-center">Quantité</th>
                  <th className="px-6 py-4 w-40 text-right">Prix Unitaire (MAD)</th>
                  <th className="px-6 py-4 w-40 text-right">Total Ligne</th>
                  <th className="px-6 py-4 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lignes.map((ligne) => (
                  <tr key={ligne.id}>
                    <td className="px-6 py-4">
                      <select 
                        required 
                        value={ligne.article_id} 
                        onChange={(e) => updateLigne(ligne.id, 'article_id', e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700"
                      >
                        <option value="">Sélectionner un article</option>
                        {articles.map(a => (
                          <option key={a.id} value={a.id}>{a.code} - {a.designation}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        min="1" 
                        required 
                        value={ligne.quantite} 
                        onChange={(e) => updateLigne(ligne.id, 'quantite', parseInt(e.target.value) || 0)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        required 
                        value={ligne.prix_unitaire} 
                        onChange={(e) => updateLigne(ligne.id, 'prix_unitaire', parseFloat(e.target.value) || 0)} 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {(ligne.quantite * ligne.prix_unitaire).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => removeLigne(ligne.id)} disabled={lignes.length === 1} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-900 uppercase text-xs">Total Commande</td>
                  <td className="px-6 py-4 text-right font-bold text-[#1A766E] text-lg">{calculateTotal().toFixed(2)} MAD</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes ou Remarques internes</label>
          <textarea 
            rows="3" 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" 
            placeholder="Instructions pour la réception..."
          />
        </div>
      </form>
    </div>
  );
}
