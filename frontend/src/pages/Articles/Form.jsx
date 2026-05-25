import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://127.0.0.1:8000${path}`;
};

export default function ArticleForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [articleCode, setArticleCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [unite, setUnite] = useState("pcs");
  const [description, setDescription] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [stockMin, setStockMin] = useState("10");
  const [stockMax, setStockMax] = useState("");
  const [selectedFournisseurs, setSelectedFournisseurs] = useState([]);
  
  // Image
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Dropdown states
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [fournisseurSearch, setFournisseurSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch initial categories & suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, foursRes] = await Promise.all([
          api.get('/categories'),
          api.get('/fournisseurs?all=1')
        ]);
        setCategories(catsRes.data);
        setFournisseurs(foursRes.data);
      } catch (err) {
        console.error("Erreur de chargement des données de référence", err);
      }
    };
    fetchData();
  }, []);

  // Fetch existing article if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/articles/${id}`);
          const article = res.data;
          setArticleCode(article.code);
          setDesignation(article.designation);
          setCategorieId(article.categorie_id || "");
          setUnite(article.unite || "pcs");
          setDescription(article.description || "");
          setPrixUnitaire(article.prix_unitaire);
          setStockMin(article.stock_min);
          setStockMax(article.stock_max || "");
          setSelectedFournisseurs(article.fournisseurs || []);
          if (article.image) {
            setImagePreview(article.image);
          }
        } catch (err) {
          setError("Erreur lors du chargement de l'article.");
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [isEdit, id]);

  const handleAutoGenerate = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
    setArticleCode(`ART-${randomNum}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        code: articleCode,
        designation,
        categorie_id: categorieId ? parseInt(categorieId) : null,
        unite,
        description,
        prix_unitaire: parseFloat(prixUnitaire),
        stock_min: parseInt(stockMin),
        stock_max: stockMax ? parseInt(stockMax) : null,
        fournisseur_ids: selectedFournisseurs.map(f => f.id),
        image: imagePreview
      };

      if (isEdit) {
        await api.put(`/articles/${id}`, payload);
      } else {
        await api.post('/articles', payload);
      }

      setIsSaved(true);
      setTimeout(() => {
        navigate('/articles');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/articles" className="hover:text-primary transition-colors">Articles</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{isEdit ? 'Modifier' : 'Nouvel'} Article</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Modifier l\'article' : 'Créer un nouvel article'}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/articles" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <X className="w-4 h-4" />
            Annuler
          </Link>
          <button 
            type="submit"
            form="article-form"
            disabled={loading}
            className="px-4 py-2 bg-[#1A766E] text-white rounded-lg text-sm font-medium hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-55"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {isSaved && (
        <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium">L'article a été enregistré avec succès. Redirection...</p>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Form Content */}
      <form id="article-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Informations Générales</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Code Article *</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={articleCode}
                    onChange={(e) => setArticleCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 focus:border-[#1A766E] transition-all" 
                    placeholder="ART-XXX" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={handleAutoGenerate}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  >
                    Auto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Désignation *</label>
                <input 
                  type="text" 
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="Ex: Laptop Dell XPS 15" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie *</label>
                  <select 
                    value={categorieId}
                    onChange={(e) => setCategorieId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700" 
                    required
                  >
                    <option value="">Sélectionner</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unité de mesure</label>
                  <select 
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700"
                  >
                    <option value="pcs">Pièce(s)</option>
                    <option value="kg">Kilogramme (kg)</option>
                    <option value="l">Litre (l)</option>
                    <option value="m">Mètre (m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description détaillée</label>
                <textarea 
                  rows="4" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" 
                  placeholder="Caractéristiques, notes..."
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Stock & Tarification</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix unitaire (MAD) *</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    value={prixUnitaire}
                    onChange={(e) => setPrixUnitaire(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="0.00" 
                    required 
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 text-sm font-medium">MAD</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Minimum *</label>
                  <input 
                    type="number" 
                    value={stockMin}
                    onChange={(e) => setStockMin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="0" 
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">Seuil d'alerte</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Maximum</label>
                  <input 
                    type="number" 
                    value={stockMax}
                    onChange={(e) => setStockMax(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    placeholder="0" 
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fournisseurs (Multi-sélection)</label>
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1A766E]/20 focus-within:border-[#1A766E] transition-all min-h-[44px] flex flex-wrap gap-2 items-center cursor-text" onClick={() => setShowDropdown(true)}>
                  {selectedFournisseurs.map((fournisseur) => (
                    <span key={fournisseur.id} className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                      {fournisseur.nom}
                      <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-red-500" onClick={(e) => { e.stopPropagation(); setSelectedFournisseurs(prev => prev.filter(f => f.id !== fournisseur.id)); }} />
                    </span>
                  ))}
                  <input 
                    type="text" 
                    className="bg-transparent border-none outline-none text-sm flex-1 min-w-[100px] text-gray-700 placeholder:text-gray-400" 
                    placeholder={selectedFournisseurs.length === 0 ? "Rechercher un fournisseur..." : ""} 
                    value={fournisseurSearch}
                    onChange={(e) => { setFournisseurSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {fournisseurs.filter(f => f.nom.toLowerCase().includes(fournisseurSearch.toLowerCase()) && !selectedFournisseurs.some(sf => sf.id === f.id)).length > 0 ? (
                      fournisseurs.filter(f => f.nom.toLowerCase().includes(fournisseurSearch.toLowerCase()) && !selectedFournisseurs.some(sf => sf.id === f.id)).map((fournisseur) => (
                        <div 
                          key={fournisseur.id} 
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedFournisseurs([...selectedFournisseurs, fournisseur]);
                            setFournisseurSearch('');
                            setShowDropdown(false);
                          }}
                        >
                          {fournisseur.nom}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 text-center">Aucun fournisseur trouvé</div>
                    )}
                  </div>
                )}
              </div>

              {/* Photo Area */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo de l'article</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-[#1A766E] hover:bg-teal-50/50 transition-colors cursor-pointer group relative overflow-hidden"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  {imagePreview ? (
                     <div className="absolute inset-0 w-full h-full">
                       <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-contain bg-white" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-white font-medium text-sm flex items-center gap-2">
                           <ImageIcon className="w-5 h-5" />
                           Modifier l'image
                         </span>
                       </div>
                     </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-10 w-10 text-gray-400 group-hover:text-[#1A766E] transition-colors" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#1A766E] hover:text-[#0A5C53] focus-within:outline-none">
                          <span>Télécharger un fichier</span>
                        </span>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 2MB</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
