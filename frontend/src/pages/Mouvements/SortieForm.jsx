import { useState, useEffect } from 'react';
import { Package, ArrowUpFromLine, Check, ChevronRight, AlertCircle, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

const steps = ['Sélection Article', 'Détails Sortie', 'Confirmation'];

export default function SortieForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [form, setForm] = useState({
    article_id: '',
    article: null,
    quantite: 1,
    motif: 'Consommation interne',
    reference_document: '',
    destinataire: '',
    date_mouvement: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const params = searchQuery ? `?search=${searchQuery}` : '';
        const res = await api.get(`/articles${params}`);
        setArticles(res.data.data);
      } catch (_) {}
    };
    fetchArticles();
  }, [searchQuery]);

  const selectArticle = (article) => {
    setForm((prev) => ({ ...prev, article_id: article.id, article, quantite: 1 }));
    setStep(1);
  };

  const stockApres = (form.article?.stock_actuel || 0) - form.quantite;
  const isStockInsuffisant = form.article && form.quantite > (form.article.stock_actuel || 0);
  const isStockCritique = form.article && stockApres <= (form.article.stock_min || 0) && !isStockInsuffisant;

  const handleSubmit = async () => {
    if (isStockInsuffisant) return;
    setSaving(true);
    setServerError(null);
    try {
      await api.post('/mouvements', {
        article_id: form.article_id,
        type: 'sortie',
        quantite: form.quantite,
        motif: form.motif,
        reference_document: form.reference_document || null,
        destinataire: form.destinataire || null,
        date_mouvement: form.date_mouvement,
        notes: form.notes || null,
      });
      setSuccess(true);
      setTimeout(() => navigate('/mouvements'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Sortie enregistrée !</h2>
        <p className="text-gray-500 text-sm">Redirection vers l'historique des mouvements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle Sortie de Stock</h1>
        <p className="text-sm text-gray-500 mt-1">Enregistrez une consommation, vente ou transfert sortant.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 flex-1 last:flex-initial">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />}
          </div>
        ))}
      </div>

      {/* Step 0: Select Article */}
      {step === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Sélectionner un article</h3>
          <div className="relative group">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Rechercher par code ou désignation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {articles.map((article) => {
              const isRupture = article.stock_actuel <= 0;
              return (
                <button
                  key={article.id}
                  onClick={() => !isRupture && selectArticle(article)}
                  disabled={isRupture}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${
                    isRupture
                      ? 'border-red-100 bg-red-50 cursor-not-allowed opacity-60'
                      : 'border-gray-100 hover:border-red-400 hover:bg-red-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-red-600">{article.designation}</p>
                      <p className="text-xs text-gray-500 font-mono">{article.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${isRupture ? 'text-red-500' : 'text-gray-900'}`}>
                      {article.stock_actuel}
                    </p>
                    <p className="text-xs text-gray-500">{isRupture ? 'Rupture' : `unités (min: ${article.stock_min})`}</p>
                  </div>
                </button>
              );
            })}
            {articles.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">Aucun article trouvé.</p>}
          </div>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Résumé article */}
          <div className={`p-4 border rounded-xl ${isStockInsuffisant ? 'bg-red-50 border-red-300' : isStockCritique ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isStockInsuffisant ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <ArrowUpFromLine className={`w-5 h-5 ${isStockInsuffisant ? 'text-red-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{form.article?.designation}</p>
                  <p className="text-xs text-gray-500 font-mono">{form.article?.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Disponible</p>
                <p className="text-2xl font-bold text-gray-900">{form.article?.stock_actuel}</p>
              </div>
            </div>

            {/* Real-time stock preview */}
            {form.quantite > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center gap-3 text-sm">
                <span className="text-gray-500">Stock après :</span>
                <span className={`font-bold text-lg ${isStockInsuffisant ? 'text-red-600' : isStockCritique ? 'text-amber-600' : 'text-green-600'}`}>
                  {stockApres}
                </span>
                {isStockInsuffisant && (
                  <span className="flex items-center gap-1 text-red-600 font-medium text-xs">
                    <AlertCircle className="w-4 h-4" /> Stock insuffisant
                  </span>
                )}
                {isStockCritique && !isStockInsuffisant && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium text-xs">
                    <AlertTriangle className="w-4 h-4" /> Passera sous le seuil minimum
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantité *</label>
              <input
                type="number"
                min="1"
                max={form.article?.stock_actuel}
                value={form.quantite}
                onChange={(e) => setForm({ ...form, quantite: parseInt(e.target.value) || 1 })}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  isStockInsuffisant ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date du mouvement *</label>
              <input
                type="date"
                value={form.date_mouvement}
                onChange={(e) => setForm({ ...form, date_mouvement: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Motif *</label>
              <select
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option>Consommation interne</option>
                <option>Vente client</option>
                <option>Transfert sortant</option>
                <option>Retour fournisseur</option>
                <option>Perte / Casse</option>
                <option>Correction inventaire</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Destinataire / Service</label>
              <input
                type="text"
                placeholder="Ex: Département IT"
                value={form.destinataire}
                onChange={(e) => setForm({ ...form, destinataire: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Référence document</label>
              <input
                type="text"
                placeholder="BS-2026-001"
                value={form.reference_document}
                onChange={(e) => setForm({ ...form, reference_document: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                rows="2"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button onClick={() => setStep(0)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              Retour
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={isStockInsuffisant}
              className="px-6 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="font-bold text-gray-900">Récapitulatif du mouvement</h3>

          {serverError && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
            </div>
          )}

          {isStockCritique && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Le stock passera sous le seuil minimum ({form.article?.stock_min} unités). Une alerte sera générée.
            </div>
          )}

          <div className="space-y-3">
            {[
              { label: 'Article', value: `${form.article?.designation} (${form.article?.code})` },
              { label: 'Quantité sortie', value: `-${form.quantite} ${form.article?.unite || 'pcs'}` },
              { label: 'Stock après', value: `${stockApres} unités` },
              { label: 'Date', value: new Date(form.date_mouvement).toLocaleDateString('fr-FR') },
              { label: 'Motif', value: form.motif },
              { label: 'Destinataire', value: form.destinataire || '—' },
              { label: 'Référence', value: form.reference_document || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2.5 border-b border-gray-50 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              Modifier
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : (<><Check className="w-4 h-4" /> Valider la sortie</>)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
