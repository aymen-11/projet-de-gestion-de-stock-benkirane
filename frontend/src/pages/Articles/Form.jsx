import { useState } from 'react';
import { ArrowLeft, Save, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ArticleForm({ isEdit = false }) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [articleCode, setArticleCode] = useState(isEdit ? "ART-001" : "");

  const handleAutoGenerate = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
    setArticleCode(`ART-${randomNum}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      navigate('/articles');
    }, 1500);
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
            className="px-4 py-2 bg-[#1A766E] text-white rounded-lg text-sm font-medium hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2"
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
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Ex: Laptop Dell XPS 15" defaultValue={isEdit ? "Laptop Dell XPS 15" : ""} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie *</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700" required>
                    <option value="">Sélectionner</option>
                    <option value="1" selected={isEdit}>Informatique</option>
                    <option value="2">Mobilier</option>
                    <option value="3">Fournitures</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unité de mesure</label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700">
                    <option value="pcs" selected>Pièce(s)</option>
                    <option value="kg">Kilogramme (kg)</option>
                    <option value="l">Litre (l)</option>
                    <option value="m">Mètre (m)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description détaillée</label>
                <textarea rows="4" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" placeholder="Caractéristiques, notes..." defaultValue={isEdit ? "PC Portable haute performance" : ""}></textarea>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">Stock & Tarification</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix unitaire (MAD) *</label>
                <div className="relative">
                  <input type="number" step="0.01" className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0.00" defaultValue={isEdit ? "14500.00" : ""} required />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 text-sm font-medium">MAD</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Minimum *</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" defaultValue={isEdit ? "10" : ""} required />
                  <p className="text-xs text-gray-500 mt-1">Seuil d'alerte</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Maximum</label>
                  <input type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fournisseurs (Multi-sélection)</label>
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all min-h-[44px] flex flex-wrap gap-2 items-center cursor-text">
                  {isEdit && (
                    <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                      Global Logistix
                      <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-red-500" />
                    </span>
                  )}
                  <input type="text" className="bg-transparent border-none outline-none text-sm flex-1 min-w-[100px] text-gray-700 placeholder:text-gray-400" placeholder={isEdit ? "" : "Rechercher un fournisseur..."} />
                </div>
              </div>

              {/* Photo Area */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo de l'article</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-2xl hover:border-primary hover:bg-blue-50/50 transition-colors cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-gray-400 group-hover:text-primary transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none">
                        <span>Télécharger un fichier</span>
                      </span>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 2MB</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
