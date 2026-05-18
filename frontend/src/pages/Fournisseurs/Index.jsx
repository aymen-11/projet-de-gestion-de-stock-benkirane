import { useState, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, MoreVertical, Edit2, Trash2, Mail, Phone, MapPin, Building, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const StatusBadge = ({ status }) => {
  const isActif = status === 'Actif';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    }`}>
      {isActif && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
      {status}
    </span>
  );
};

export default function FournisseursList() {
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await api.get(`/fournisseurs?${params.toString()}`);
      setFournisseurs(response.data.data);
    } catch (err) {
      setError("Erreur lors du chargement des fournisseurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      try {
        await api.delete(`/fournisseurs/${id}`);
        fetchFournisseurs();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annuaire Fournisseurs</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos partenaires commerciaux et contacts.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Exporter
          </button>
          <Link to="/fournisseurs/create" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-primary/30 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau Fournisseur
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher un fournisseur..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" /> Filtrer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Chargement des fournisseurs...</div>
      ) : error ? (
        <div className="p-12 text-center text-red-500">{error}</div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {fournisseurs.map((fournisseur) => (
                <div key={fournisseur.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
                      <Building className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={fournisseur.statut} />
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{fournisseur.nom}</h3>
                  
                  <div className="space-y-2.5 mt-4">
                    {fournisseur.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{fournisseur.email}</span>
                      </div>
                    )}
                    {fournisseur.telephone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{fournisseur.telephone}</span>
                      </div>
                    )}
                    {fournisseur.ville && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{fournisseur.ville}, {fournisseur.pays}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < fournisseur.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-500">{fournisseur.articles_count} articles</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Fournisseur</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Localisation</th>
                      <th className="px-6 py-4 text-center">Évaluation</th>
                      <th className="px-6 py-4 text-center">Articles liés</th>
                      <th className="px-6 py-4 text-center">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fournisseurs.map((fournisseur) => (
                      <tr key={fournisseur.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100 shrink-0">
                              <Building className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-gray-900">{fournisseur.nom}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {fournisseur.email && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5" /> {fournisseur.email}</div>}
                            {fournisseur.telephone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5" /> {fournisseur.telephone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {fournisseur.ville}, {fournisseur.pays}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center -space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < fournisseur.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-900">
                          {fournisseur.articles_count}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={fournisseur.statut} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/fournisseurs/edit/${fournisseur.id}`} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-blue-50 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(fournisseur.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
