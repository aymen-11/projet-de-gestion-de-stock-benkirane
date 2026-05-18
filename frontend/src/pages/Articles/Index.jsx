import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Package, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';

const StatusBadge = ({ status }) => {
  const styles = {
    'Normal': 'bg-green-100 text-green-700',
    'Attention': 'bg-amber-100 text-amber-700',
    'Critique': 'bg-orange-100 text-orange-700',
    'Rupture': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function ArticlesList() {
  const { user } = useAuthStore();
  const canEdit = ['admin', 'responsable'].includes(user?.role);
  
  const [activeTab, setActiveTab] = useState('Tous');
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeTab !== 'Tous') params.append('statut', activeTab);
      
      const response = await api.get(`/articles?${params.toString()}`);
      setArticles(response.data.data);
    } catch (err) {
      setError("Erreur lors du chargement des articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [activeTab, search]);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        await api.delete(`/articles/${id}`);
        fetchArticles();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleExportCSV = () => {
    if (!articles.length) return alert('Aucun article à exporter');
    const headers = ['Code', 'Designation', 'Categorie', 'Prix Unitaire', 'Stock Actuel', 'Stock Min', 'Statut'];
    const rows = articles.map(a => [
      a.code,
      `"${a.designation}"`,
      `"${a.categorie?.nom || 'Non catégorisé'}"`,
      a.prix_unitaire,
      a.stock_actuel,
      a.stock_min,
      a.statut_stock
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_articles_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue Articles</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez votre inventaire et suivez l'état des stocks.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Exporter
          </button>
          {canEdit && (
            <Link to="/articles/create" className="px-4 py-2 bg-[#1A766E] text-white rounded-lg text-sm font-medium hover:bg-[#0A5C53] transition-colors shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nouvel Article
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par code, désignation..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1">
             {['Tous', 'Normal', 'Attention', 'Critique', 'Rupture'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                   activeTab === tab 
                     ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' 
                     : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 {tab}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement des articles...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  {canEdit && <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" /></th>}
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4 text-right">Prix Unitaire</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                    {canEdit && <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" /></td>}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                          {article.image ? (
                            <img src={article.image} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer">{article.designation}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{article.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                        {article.categorie?.nom || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {Number(article.prix_unitaire).toFixed(2)} MAD
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-lg text-gray-900">{article.stock_actuel}</span>
                        <span className="text-xs text-gray-400">/ {article.stock_min} min</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={article.statut_stock} />
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/articles/edit/${article.id}`} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-blue-50 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(article.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Aucun article trouvé.
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
