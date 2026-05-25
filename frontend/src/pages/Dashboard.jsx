import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lightbulb, ArrowUpRight, X, BarChart3, Package, AlertTriangle, ShoppingCart, GripVertical } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/axios';
import useAuthStore from '../store/authStore';

const BAR_COLORS = ['#1A766E', '#0A5C53', '#0A3D39', '#6B7280', '#9CA3AF'];

// ── Widget registry ──────────────────────────────────────────────
const WIDGET_META = {
  movements:  { label: 'Stock Movements', icon: BarChart3,     desc: 'Graphique des mouvements', span: 2, route: '/mouvements' },
  categories: { label: 'Gross Volume',    icon: Package,       desc: 'Répartition par catégories', span: 1, route: '/articles' },
  critical:   { label: 'Critical Stock',  icon: AlertTriangle, desc: 'Articles en stock critique', span: 1, route: '/alertes' },
  mini_mvts:  { label: 'Movements',       icon: BarChart3,     desc: 'Mouvements de la semaine',  span: 1, route: '/mouvements' },
  mini_orders:{ label: 'Pending Orders',  icon: ShoppingCart,  desc: 'Commandes en attente',      span: 1, route: '/commandes' },
  insights:   { label: 'Insights',        icon: Lightbulb,     desc: 'Résumé du stock',           span: 1, route: '/rapports', hideHeader: true },
};
const DEFAULT_ORDER = ['movements', 'categories', 'critical', 'mini_mvts', 'mini_orders', 'insights'];

function DotGrid({ data = [], color = '#1A766E', maxVal = 1 }) {
  const ROWS = 4;
  const max = Math.max(maxVal, ...data, 1);
  return (
    <div className="flex items-end gap-[3px]">
      {data.map((val, col) => {
        const filled = Math.round((val / max) * ROWS);
        return (
          <div key={col} className="flex flex-col-reverse gap-[3px]">
            {Array.from({ length: ROWS }).map((_, row) => (
              <div key={row} className="w-2 h-2 rounded-[3px]"
                style={{ backgroundColor: row < filled ? color : '#E5E7EB' }} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Individual Widget Components ─────────────────────────────────
function MovementsWidget({ graphique }) {
  const last5 = graphique.slice(-5);
  const maxBarVal = last5.length ? Math.max(...last5.map(d => (d.entrees||0)+(d.sorties||0)), 1) : 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-6 pt-2 pb-3 overflow-x-auto">
        {last5.map((day, i) => {
          const total = (day.entrees||0)+(day.sorties||0);
          return (
            <div key={i} className="shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                {new Date(day.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
              </p>
              <p className={`text-xl font-extrabold ${total===maxBarVal?'text-gray-900':'text-gray-400'}`}>
                {total >= 1000 ? `${(total/1000).toFixed(1)}k` : total}
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex-1" style={{ minHeight: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={last5.map(d=>({
              date: new Date(d.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}),
              Entrées: d.entrees||0,
              Sorties: d.sorties||0,
            }))}
            barCategoryGap="30%"
            margin={{ top:4, right:8, left:-24, bottom:0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{fontSize:10,fill:'#9CA3AF',fontWeight:600}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#D1D5DB',fontWeight:600}} axisLine={false} tickLine={false}/>
            <Tooltip
              cursor={{ fill:'rgba(26,118,110,0.05)', radius:8 }}
              contentStyle={{ borderRadius:'16px', border:'none', boxShadow:'0 10px 40px rgba(0,0,0,0.12)', padding:'12px 16px', fontSize:'12px' }}
              labelStyle={{ color:'#374151', fontWeight:700 }}
            />
            <Bar dataKey="Entrées" radius={[6,6,0,0]} fill="#1A766E" maxBarSize={36}/>
            <Bar dataKey="Sorties" radius={[6,6,0,0]} fill="#93C5C0" maxBarSize={36}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
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
    </div>
  );
}

function CategoriesWidget({ parCategorie, kpis }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-end gap-3 mb-5 mt-1">
        <span className="text-4xl font-extrabold text-gray-900">{kpis.total_articles ?? 0}</span>
        <span className="flex items-center gap-1 bg-green-50 text-green-600 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1">
          <ArrowUpRight className="w-3 h-3"/> Items
        </span>
      </div>
      <div className="space-y-4 flex-1">
        {parCategorie.slice(0,4).map((cat,i) => {
          const maxV = Math.max(...parCategorie.map(c=>c.value),1);
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] font-semibold text-gray-600">{cat.name}</span>
                <span className="text-[12px] font-bold text-gray-900">{cat.value} art.</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${(cat.value/maxV)*100}%`, backgroundColor:BAR_COLORS[i%BAR_COLORS.length] }}/>
              </div>
            </div>
          );
        })}
        {parCategorie.length === 0 && <p className="text-gray-400 text-sm text-center py-6">Aucune catégorie</p>}
      </div>
    </div>
  );
}

function CriticalWidget({ stockCritique }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-extrabold text-red-500">{stockCritique.length}</span>
        <span className="text-[11px] text-gray-400">articles critiques</span>
      </div>
      <div className="flex-1 -mx-6 -mb-6" style={{ minHeight: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stockCritique.length>0?stockCritique:[{stock_actuel:0},{stock_actuel:0}]}
            margin={{top:10,right:0,left:0,bottom:0}}>
            <defs>
              <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="stock_actuel" stroke="#EF4444" strokeWidth={2}
              fill="url(#critGrad)" dot={{fill:'#EF4444',r:3,strokeWidth:0}}/>
            <Tooltip contentStyle={{borderRadius:'12px',border:'none',fontSize:'11px'}}
              formatter={(v,n,p) => [v, p.payload?.designation??'Stock']}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MiniMvtsWidget({ graphique, kpis }) {
  const dotData = graphique.map(d=>(d.entrees||0)+(d.sorties||0));
  return (
    <div className="flex items-end justify-between gap-3 h-full">
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Total semaine</p>
        <p className="text-3xl font-extrabold text-gray-900">
          {graphique.reduce((s,d)=>s+(d.entrees||0)+(d.sorties||0),0)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-[9px] text-gray-400">Aujourd'hui</p>
        <p className="text-[12px] font-bold text-green-500">+{kpis.mouvements_aujourdhui??0}</p>
        <DotGrid data={dotData.slice(-7)} color="#1A766E" maxVal={Math.max(...dotData,1)}/>
      </div>
    </div>
  );
}

function MiniOrdersWidget({ kpis }) {
  return (
    <div className="flex items-end justify-between gap-3 h-full">
      <div>
        <p className="text-[10px] text-gray-400 mb-1">En attente</p>
        <p className="text-3xl font-extrabold text-gray-900">{kpis.commandes_en_attente??0}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className="text-[9px] text-gray-400">Active</p>
        <DotGrid data={[1,1,2,1,kpis.commandes_en_attente??1,1,kpis.commandes_en_attente??1]}
          color="#6B7280" maxVal={5}/>
      </div>
    </div>
  );
}

function InsightsWidget({ kpis }) {
  const hasAlerts = (kpis.alertes_actives ?? 0) > 0;
  return (
    <div className="flex flex-col h-full w-full text-white relative overflow-hidden rounded-3xl p-6"
      style={{ background: hasAlerts ? 'linear-gradient(145deg,#7F1D1D,#DC2626)' : 'linear-gradient(145deg,#0A3D39,#1A766E 60%,#2D9D94)' }}>
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"/>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"/>
      <div className="flex items-center gap-1.5 bg-white/20 w-max px-2.5 py-1 rounded-full border border-white/25 mb-4">
        <Lightbulb className="w-3 h-3 text-white"/>
        <span className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-white">Insights</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-6xl font-black mb-2 leading-none">{hasAlerts ? kpis.alertes_actives : '100%'}</p>
        <p className="text-[11px] font-bold text-white/85 leading-relaxed mb-1">
          {hasAlerts ? `${kpis.alertes_actives} alerte(s) active(s)` : 'Taux de conformité — Système opérationnel'}
        </p>
        <p className="text-[10px] text-white/50">{hasAlerts ? 'Vérifiez les niveaux critiques' : 'Aucune rupture détectée'}</p>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className={`w-2 h-2 rounded-full ${hasAlerts ? 'bg-red-300 animate-pulse' : 'bg-emerald-300'}`}/>
        <span className="text-[9px] font-semibold text-white/60 uppercase tracking-widest">{hasAlerts ? 'Action requise' : 'Tout est bon'}</span>
      </div>
    </div>
  );
}

// ── Widget wrapper (draggable card) ──────────────────────────────
function WidgetCard({ id, span, children, label, route, hideHeader,
  dragIdx, dragOverIdx, onDragStart, onDragOver, onDrop, onDragEnd, index }) {

  const navigate = useNavigate();
  const [draggable, setDraggable]         = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef(null);
  const didDrag = useRef(false);

  const isDragging = dragIdx === index;
  const isDropOver = dragOverIdx === index && !isDragging;

  const handleGripMouseDown = (e) => {
    e.stopPropagation();
    setDraggable(true);
    setLongPressActive(true);
  };

  const handleCardMouseDown = () => {
    didDrag.current = false;
    longPressTimer.current = setTimeout(() => {
      setDraggable(true);
      setLongPressActive(true);
    }, 400);
  };

  const handleCardMouseUp = () => {
    clearTimeout(longPressTimer.current);
    if (!isDragging) {
      setDraggable(false);
      setLongPressActive(false);
    }
  };

  const handleDragStartInternal = (e) => {
    if (!draggable) { e.preventDefault(); return; }
    didDrag.current = true;
    onDragStart(index);
  };

  const handleDragEndInternal = () => {
    setDraggable(false);
    setLongPressActive(false);
    clearTimeout(longPressTimer.current);
    onDragEnd();
  };

  const handleDoubleClick = (e) => {
    if (didDrag.current || longPressActive || isDragging) return;
    if (route) navigate(route);
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStartInternal}
      onDragOver={e => { e.preventDefault(); if (dragIdx !== null) onDragOver(index); }}
      onDrop={e => { e.preventDefault(); onDrop(index); }}
      onDragEnd={handleDragEndInternal}
      onMouseDown={handleCardMouseDown}
      onMouseUp={handleCardMouseUp}
      onMouseLeave={handleCardMouseUp}
      onDoubleClick={handleDoubleClick}
      className="bg-white rounded-3xl flex flex-col relative group transition-all duration-200"
      style={{
        gridColumn: span === 2 ? 'span 2' : 'span 1',
        minHeight: span === 2 ? 360 : 220,
        padding: hideHeader ? 0 : '1.5rem',
        overflow: hideHeader ? 'hidden' : 'visible',
        opacity: isDragging ? 0.35 : 1,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: isDropOver ? '#1A766E' : longPressActive ? '#93C5C0' : '#F3F4F6',
        boxShadow: isDropOver
          ? '0 0 0 2px #1A766E, 0 10px 30px rgba(26,118,110,0.15)'
          : longPressActive
            ? '0 8px 30px rgba(26,118,110,0.2)'
            : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: isDragging ? 'grabbing' : longPressActive ? 'grab' : 'default',
        transform: isDropOver ? 'scale(1.015)' : longPressActive && !isDragging ? 'scale(1.01)' : 'scale(1)',
        userSelect: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s, opacity 0.2s',
      }}
    >
      {/* Header — hidden for fullbleed widgets like Insights */}
      {!hideHeader && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-bold text-gray-900">{label}</h3>
          <div className="flex items-center gap-2">
            {/* Double-click hint - shown on hover */}
            {route && (
              <span className="text-[9px] font-semibold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
                double-clic
              </span>
            )}
            <div
              title="Glisser pour déplacer"
              onMouseDown={handleGripMouseDown}
              className={`p-1 rounded-lg transition-all ${
                longPressActive
                  ? 'text-[#1A766E] bg-[#E8F5F3]'
                  : 'text-gray-300 hover:text-[#1A766E] hover:bg-[#E8F5F3]'
              }`}
              style={{ cursor: longPressActive ? 'grabbing' : 'grab' }}
            >
              <GripVertical className="w-4 h-4"/>
            </div>
            <button onMouseDown={e => e.stopPropagation()}
              className="text-gray-300 hover:text-gray-400 text-lg font-bold leading-none">···</button>
          </div>
        </div>
      )}

      {/* Grip overlay for hideHeader widgets (Insights etc.) */}
      {hideHeader && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1"
          onMouseDown={e => e.stopPropagation()}>
          <div
            onMouseDown={handleGripMouseDown}
            className="p-1 rounded-lg bg-white/20 hover:bg-white/40 transition-all"
            style={{ cursor: 'grab' }}
          >
            <GripVertical className="w-4 h-4 text-white/70"/>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">{children}</div>

      {/* Long-press hint */}
      {longPressActive && !isDragging && (
        <div className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: '2px dashed #1A766E', opacity: 0.4 }}/>
      )}
    </div>
  );
}

// ── Add Widget Drawer ────────────────────────────────────────────
function WidgetDrawer({ activeWidgets, onToggle, onClose, userRole }) {
  const getAllowedWidgets = () => {
    if (userRole === 'magasinier') return ['movements', 'critical', 'mini_mvts'];
    if (userRole === 'fournisseur') return ['mini_orders', 'categories'];
    return Object.keys(WIDGET_META); // admin & responsable get all
  };
  const allowed = getAllowedWidgets();

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"/>
      <div className="relative w-80 h-full bg-white shadow-2xl flex flex-col overflow-y-auto"
        style={{ borderRadius:'1.5rem 0 0 1.5rem' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-lg font-extrabold text-gray-900">Add widget</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500"/>
          </button>
        </div>
        <p className="text-xs text-gray-400 font-medium px-6 pt-4 pb-2">Choisissez les widgets à afficher</p>
        <div className="flex-1 px-4 pb-6 space-y-2">
          {Object.entries(WIDGET_META)
            .filter(([id]) => allowed.includes(id))
            .map(([id, meta]) => {
            const Icon   = meta.icon;
            const active = activeWidgets.includes(id);
            return (
              <button key={id} onClick={() => onToggle(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  active ? 'bg-[#E8F5F3] border-[#1A766E]/30' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? 'bg-[#1A766E] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Icon className="w-5 h-5"/>
                </div>
                <div className="text-left flex-1">
                  <p className={`text-[13px] font-bold ${active?'text-[#0A3D39]':'text-gray-700'}`}>{meta.label}</p>
                  <p className="text-[10px] text-gray-400">{meta.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  active ? 'border-[#1A766E] bg-[#1A766E]' : 'border-gray-300'}`}>
                  {active && <div className="w-2 h-2 bg-white rounded-full"/>}
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-300 font-medium text-center pb-5 px-4">
          💡 Maintenez le clic sur un widget pour le déplacer
        </p>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [dragIdx, setDragIdx]       = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const getInitialOrder = () => {
    if (user?.role === 'magasinier') return ['movements', 'critical', 'mini_mvts'];
    if (user?.role === 'fournisseur') return ['mini_orders', 'categories'];
    return DEFAULT_ORDER;
  };
  const [widgetOrder, setWidgetOrder] = useState(getInitialOrder);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Erreur lors du chargement des données.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver  = (idx) => setDragOverIdx(idx);
  const handleDrop      = (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    const newOrder = [...widgetOrder];
    const [moved]  = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    setWidgetOrder(newOrder);
  };
  const handleDragEnd   = () => { setDragIdx(null); setDragOverIdx(null); };

  const toggleWidget = (id) => setWidgetOrder(prev =>
    prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-[#1A766E] border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (error || !data) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-red-500 font-medium">{error || 'Données non disponibles.'}</p>
    </div>
  );

  const graphique     = Array.isArray(data.graphiqueSemaine) ? data.graphiqueSemaine : [];
  const parCategorie  = Array.isArray(data.parCategorie)     ? data.parCategorie     : [];
  const stockCritique = Array.isArray(data.stockCritique)    ? data.stockCritique    : [];
  const kpis          = data.kpis || {};

  const renderContent = (id) => {
    switch(id) {
      case 'movements':   return <MovementsWidget graphique={graphique}/>;
      case 'categories':  return <CategoriesWidget parCategorie={parCategorie} kpis={kpis}/>;
      case 'critical':    return <CriticalWidget stockCritique={stockCritique}/>;
      case 'mini_mvts':   return <MiniMvtsWidget graphique={graphique} kpis={kpis}/>;
      case 'mini_orders': return <MiniOrdersWidget kpis={kpis}/>;
      case 'insights':    return <InsightsWidget kpis={kpis}/>;
      default: return null;
    }
  };

  return (
    <div className="space-y-5">
      {showDrawer && (
        <WidgetDrawer
          activeWidgets={widgetOrder}
          onToggle={toggleWidget}
          onClose={() => setShowDrawer(false)}
          userRole={user?.role}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Overview</h1>
          <p className="text-[11px] text-gray-400 mt-1">Double-clic pour naviguer · ⠿ ou maintien pour déplacer</p>
        </div>
        <button onClick={() => setShowDrawer(true)}
          className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-full text-[11px] font-bold shadow-sm hover:bg-gray-700 transition-colors">
          Add widget <Plus className="w-3 h-3"/>
        </button>
      </div>

      {/* Draggable Grid */}
      <div className="grid grid-cols-3 gap-4" style={{ gridAutoRows: 'auto' }}>
        {widgetOrder.map((id, index) => {
          const meta = WIDGET_META[id];
          if (!meta) return null;
          return (
            <WidgetCard
              key={id}
              id={id}
              index={index}
              span={meta.span}
              label={meta.label}
              route={meta.route}
              hideHeader={meta.hideHeader}
              dragIdx={dragIdx}
              dragOverIdx={dragOverIdx}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            >
              {renderContent(id)}
            </WidgetCard>
          );
        })}
      </div>
    </div>
  );
}
