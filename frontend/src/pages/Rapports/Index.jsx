import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Truck, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../lib/axios';

const COLORS = ['#0066FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const KpiCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default function Rapports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mois, setMois] = useState(6);

  const fetchRapports = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rapports?mois=${mois}`);
      setData(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des rapports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRapports(); }, [mois]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
          <p className="text-sm text-gray-500 mt-1">Tableau de bord analytique de votre inventaire.</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={mois}
            onChange={(e) => setMois(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
          >
            <option value={3}>3 derniers mois</option>
            <option value={6}>6 derniers mois</option>
            <option value={12}>12 derniers mois</option>
          </select>
          <button
            onClick={fetchRapports}
            className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Chargement des rapports...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Valeur Totale du Stock"
              value={`${Number(data.kpis.valeur_totale_stock).toLocaleString('fr-MA')} MAD`}
              icon={DollarSign}
              color="bg-blue-50 text-blue-600"
              sub="Stock valorisé au prix unitaire"
            />
            <KpiCard
              title="Articles en Rupture"
              value={data.kpis.articles_en_rupture}
              icon={AlertTriangle}
              color="bg-red-50 text-red-600"
              sub="Stock actuel = 0"
            />
            <KpiCard
              title="Fournisseurs Actifs"
              value={data.kpis.fournisseurs_actifs}
              icon={Truck}
              color="bg-green-50 text-green-600"
              sub="Partenaires commerciaux"
            />
            <KpiCard
              title="Rotation Stock (30j)"
              value={data.kpis.rotation_stock}
              icon={TrendingDown}
              color="bg-orange-50 text-orange-600"
              sub="Unités sorties ce mois"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Mouvements Mensuels</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary inline-block"></span> Entrées</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Sorties</span>
                </div>
              </div>
              <div className="h-72">
                {data.mouvements_mensuels.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.mouvements_mensuels} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="entrees" name="Entrées" fill="#0066FF" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="sorties" name="Sorties" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                      <p className="text-sm">Aucun mouvement sur cette période</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Fournisseurs */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top Fournisseurs</h3>
              {data.top_fournisseurs.length > 0 ? (
                <>
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.top_fournisseurs} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                          {data.top_fournisseurs.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {data.top_fournisseurs.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-gray-700 font-medium truncate">{f.name}</span>
                        </div>
                        <span className="text-gray-500 shrink-0 ml-2">{f.value} art.</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  Aucun fournisseur lié
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
