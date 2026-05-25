import { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, DollarSign, AlertTriangle, Truck, RefreshCw, ArrowUpRight, Package } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../lib/axios';

const BRAND_COLORS = ['#1A766E', '#0A5C53', '#0A3D39', '#6B7280', '#9CA3AF'];

// ── KPI Card (same card style as dashboard widgets) ──────────────
function KpiCard({ title, value, icon: Icon, iconBg, iconColor, sub }) {
  return (
    <div className="bg-white rounded-3xl flex flex-col p-6 relative overflow-hidden"
      style={{ border: '2px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* Top: icon aligned right, title aligned left */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider leading-tight max-w-[70%]">{title}</p>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
      {/* Big value */}
      <p className="text-4xl font-black text-gray-900 leading-none mb-1">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}

// ── Section card wrapper (same as widget card) ───────────────────
function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl p-6 ${className}`}
      style={{ border: '2px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {title && (
        <h3 className="text-[15px] font-bold text-gray-900 mb-5">{title}</h3>
      )}
      {children}
    </div>
  );
}

// ── Custom Tooltip (same style as dashboard) ─────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      borderRadius: '16px', border: 'none',
      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      padding: '12px 16px', fontSize: '12px', background: '#fff'
    }}>
      <p style={{ color: '#374151', fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: <span style={{ color: '#111' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Mouvements Bar Chart ─────────────────────────────────────────
function MouvementsChart({ data }) {
  const last6 = data.slice(-6);
  const maxVal = last6.length ? Math.max(...last6.map(d => (d.entrees || 0) + (d.sorties || 0)), 1) : 1;

  return (
    <SectionCard title="Évolution des Mouvements de Stock">
      {/* Summary numbers like dashboard */}
      <div className="flex gap-6 mb-5 overflow-x-auto pb-1">
        {last6.map((item, i) => {
          const total = (item.entrees || 0) + (item.sorties || 0);
          return (
            <div key={i} className="shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                {item.mois}
              </p>
              <p className={`text-xl font-extrabold ${total === maxVal ? 'text-gray-900' : 'text-gray-400'}`}>
                {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
              </p>
            </div>
          );
        })}
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={last6.map(d => ({
              mois: d.mois,
              'Entrées': d.entrees || 0,
              'Sorties': d.sorties || 0,
            }))}
            barCategoryGap="30%"
            margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#D1D5DB', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26,118,110,0.05)', radius: 8 }} />
            <Bar dataKey="Entrées" radius={[6, 6, 0, 0]} fill="#1A766E" maxBarSize={36} />
            <Bar dataKey="Sorties" radius={[6, 6, 0, 0]} fill="#93C5C0" maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-5 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#1A766E]" />
          <span className="text-[11px] font-semibold text-gray-500">Entrées</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#93C5C0]" />
          <span className="text-[11px] font-semibold text-gray-500">Sorties</span>
        </div>
      </div>
    </SectionCard>
  );
}

// ── Top Fournisseurs Bar Chart ────────────────────────────────────
function TopFournisseursChart({ data }) {
  const max = data.length ? Math.max(...data.map(d => d.value), 1) : 1;
  return (
    <SectionCard title="Top Fournisseurs par Articles">
      <div className="space-y-5">
        {data.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">Aucun fournisseur</p>
        )}
        {data.map((f, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] font-semibold text-gray-700">{f.name}</span>
              <span className="text-[12px] font-bold text-gray-900">{f.value} art.</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(f.value / max) * 100}%`, backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Insight Card (gradient, same as dashboard InsightsWidget) ─────
function InsightCard({ kpis }) {
  const hasAlerts = (kpis.articles_en_rupture ?? 0) > 0;
  return (
    <div
      className="rounded-3xl flex flex-col relative overflow-hidden p-6"
      style={{
        background: hasAlerts
          ? 'linear-gradient(145deg,#7F1D1D,#DC2626)'
          : 'linear-gradient(145deg,#0A3D39,#1A766E 60%,#2D9D94)',
        minHeight: 220,
        border: '2px solid transparent',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-1.5 bg-white/20 w-max px-2.5 py-1 rounded-full border border-white/25 mb-4">
        <AlertTriangle className="w-3 h-3 text-white" />
        <span className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-white">Bilan Stock</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <p className="text-6xl font-black mb-2 leading-none text-white">
          {hasAlerts ? kpis.articles_en_rupture : '✓'}
        </p>
        <p className="text-[11px] font-bold text-white/85 leading-relaxed mb-1">
          {hasAlerts
            ? `${kpis.articles_en_rupture} article(s) en rupture de stock`
            : 'Aucune rupture de stock détectée'}
        </p>
        <p className="text-[10px] text-white/50">
          {hasAlerts ? 'Vérifiez les niveaux critiques' : 'Système opérationnel'}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className={`w-2 h-2 rounded-full ${hasAlerts ? 'bg-red-300 animate-pulse' : 'bg-emerald-300'}`} />
        <span className="text-[9px] font-semibold text-white/60 uppercase tracking-widest">
          {hasAlerts ? 'Action requise' : 'Tout est bon'}
        </span>
      </div>
    </div>
  );
}

// ── Rotation Stock Mini Card ──────────────────────────────────────
function RotationCard({ kpis }) {
  return (
    <div
      className="bg-white rounded-3xl p-6 flex flex-col justify-between"
      style={{ border: '2px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', minHeight: 140 }}
    >
      <div className="flex justify-between items-start">
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Rotation Stock</p>
        <TrendingDown className="w-5 h-5 text-[#1A766E]" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Sorties — 30 derniers jours</p>
        <p className="text-3xl font-extrabold text-gray-900">{kpis.rotation_stock ?? 0}</p>
        <span className="flex items-center gap-1 bg-green-50 text-green-600 text-[11px] font-bold px-2 py-0.5 rounded-full w-max mt-2">
          <ArrowUpRight className="w-3 h-3" /> unités sorties
        </span>
      </div>
    </div>
  );
}

// ── Main Rapports Page ────────────────────────────────────────────
export default function Rapports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mois, setMois] = useState(6);

  const fetchRapports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/rapports?mois=${mois}`);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des rapports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRapports(); }, [mois]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-[#1A766E] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-red-500 font-medium">{error}</p>
    </div>
  );

  const kpis = data?.kpis || {};
  const mouvements = Array.isArray(data?.mouvements_mensuels) ? data.mouvements_mensuels : [];
  const topFournisseurs = Array.isArray(data?.top_fournisseurs) ? data.top_fournisseurs : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Rapports & Analyses</h1>
          <p className="text-[11px] text-gray-400 mt-1">Tableau de bord analytique de votre inventaire</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={mois}
            onChange={(e) => setMois(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1A766E]/20 shadow-sm"
          >
            <option value={3}>3 derniers mois</option>
            <option value={6}>6 derniers mois</option>
            <option value={12}>12 derniers mois</option>
          </select>
          <button
            onClick={fetchRapports}
            className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Valeur Totale du Stock"
          value={`${Number(kpis.valeur_totale_stock ?? 0).toLocaleString('fr-MA')} MAD`}
          icon={DollarSign}
          iconBg="#E8F5F3"
          iconColor="#1A766E"
          sub="Stock valorisé au prix unitaire"
        />
        <KpiCard
          title="Articles en Rupture"
          value={kpis.articles_en_rupture ?? 0}
          icon={AlertTriangle}
          iconBg="#FEF2F2"
          iconColor="#EF4444"
          sub="Stock actuel = 0"
        />
        <KpiCard
          title="Fournisseurs Actifs"
          value={kpis.fournisseurs_actifs ?? 0}
          icon={Truck}
          iconBg="#ECFDF5"
          iconColor="#10B981"
          sub="Partenaires commerciaux"
        />
        <KpiCard
          title="Rotation Stock (30j)"
          value={kpis.rotation_stock ?? 0}
          icon={TrendingDown}
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
          sub="Unités sorties ce mois"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mouvements spans 2 cols */}
        <div className="lg:col-span-2">
          <MouvementsChart data={mouvements} />
        </div>

        {/* Insight + Rotation stacked */}
        <div className="flex flex-col gap-4">
          <InsightCard kpis={kpis} />
          <RotationCard kpis={kpis} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopFournisseursChart data={topFournisseurs} />

        {/* Summary insights */}
        <SectionCard title="Résumé du Rapport">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-2xl bg-[#1A766E]/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-[#1A766E]" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-gray-700">Valeur du Stock</p>
                <p className="text-[11px] text-gray-400">
                  {Number(kpis.valeur_totale_stock ?? 0).toLocaleString('fr-MA')} MAD en inventaire
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#1A766E]" />
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-gray-700">Articles Critiques</p>
                <p className="text-[11px] text-gray-400">
                  {kpis.articles_en_rupture ?? 0} article(s) en rupture totale
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${(kpis.articles_en_rupture ?? 0) > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {(kpis.articles_en_rupture ?? 0) > 0 ? 'Urgent' : 'OK'}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-gray-700">Réseau Fournisseurs</p>
                <p className="text-[11px] text-gray-400">
                  {kpis.fournisseurs_actifs ?? 0} partenaire(s) actif(s)
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-600">
                Actif
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'linear-gradient(135deg,#0A3D39,#1A766E)' }}>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-white">Mouvements ({mois} mois)</p>
                <p className="text-[11px] text-white/70">
                  {mouvements.reduce((s, d) => s + (d.entrees || 0) + (d.sorties || 0), 0)} opérations totales
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/70" />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
