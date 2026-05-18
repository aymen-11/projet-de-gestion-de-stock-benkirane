import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Info, CheckCheck, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const alerteConfig = {
  critique:  { bg: 'bg-red-50',    border: 'border-red-200',    icon: AlertTriangle, iconColor: 'text-red-500',    badge: 'bg-red-100 text-red-700'    },
  attention: { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: AlertTriangle, iconColor: 'text-amber-500',  badge: 'bg-amber-100 text-amber-700' },
  info:      { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Info,          iconColor: 'text-blue-500',   badge: 'bg-blue-100 text-blue-700'   },
};

export default function AlertesList() {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');

  const fetchAlertes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== 'Tous') params.append('type', activeFilter.toLowerCase());
      const response = await api.get(`/alertes?${params.toString()}`);
      setAlertes(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlertes(); }, [activeFilter]);

  const marquerLue = async (id) => {
    try {
      await api.put(`/alertes/${id}/marquer-lue`);
      fetchAlertes();
    } catch (err) {
      console.error(err);
    }
  };

  const marquerToutesLues = async () => {
    try {
      await api.put('/alertes/marquer-toutes-lues');
      fetchAlertes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centre d'Alertes</h1>
          <p className="text-sm text-gray-500 mt-1">Suivez les niveaux de stock critiques et les notifications système.</p>
        </div>
        <button
          onClick={marquerToutesLues}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Tous', 'Critique', 'Attention', 'Info'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              activeFilter === tab
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-12">Chargement des alertes...</div>
        ) : alertes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucune alerte active</p>
            <p className="text-gray-400 text-sm mt-1">Votre stock est en bonne santé.</p>
          </div>
        ) : (
          alertes.map((alerte) => {
            const cfg = alerteConfig[alerte.type] || alerteConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={alerte.id}
                className={`${cfg.bg} ${cfg.border} border rounded-2xl p-5 flex items-start justify-between gap-4 transition-opacity ${alerte.lue ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm`}>
                    <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {alerte.type}
                      </span>
                      {!alerte.lue && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{alerte.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-gray-500 font-mono">{alerte.article?.code}</p>
                      <p className="text-xs text-gray-400">{new Date(alerte.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {alerte.type === 'critique' && (
                    <Link to="/commandes/create" className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Commander
                    </Link>
                  )}
                  {!alerte.lue && (
                    <button
                      onClick={() => marquerLue(alerte.id)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-lg transition-colors"
                      title="Marquer comme lu"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
