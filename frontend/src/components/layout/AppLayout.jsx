import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Package, Bell, BarChart3, Settings, Menu, X,
  LogOut, Search, ChevronDown, ArrowRight, FileText, Truck, ShoppingCart,
  ArrowDownToLine, ArrowUpFromLine, History, Users, Activity
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';

// ── Global Search Palette ────────────────────────────────────────
const QUICK_LINKS = [
  { label: 'Articles',     path: '/articles',    icon: Package,     desc: 'Liste des articles' },
  { label: 'Mouvements',   path: '/mouvements',  icon: BarChart3,   desc: 'Historique des mouvements' },
  { label: 'Commandes',    path: '/commandes',   icon: ShoppingCart,desc: 'Gestion des commandes' },
  { label: 'Fournisseurs', path: '/fournisseurs',icon: Truck,       desc: 'Liste des fournisseurs' },
  { label: 'Rapports',     path: '/rapports',    icon: FileText,    desc: 'Rapports & analyses' },
  { label: 'Mon Profil',   path: '/parametres',  icon: Settings,    desc: 'Configuration de mon compte' },
];

function SearchPalette({ onClose }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [arts, fours] = await Promise.all([
        api.get(`/articles?search=${encodeURIComponent(q)}&per_page=4`).catch(() => ({ data: { data: [] } })),
        api.get(`/fournisseurs?search=${encodeURIComponent(q)}&per_page=3`).catch(() => ({ data: { data: [] } })),
      ]);
      const items = [
        ...(arts.data?.data || []).map(a => ({
          label: a.designation, sub: `Article · ${a.categorie?.nom || '—'}`,
          path: `/articles`, icon: Package,
        })),
        ...(fours.data?.data || []).map(f => ({
          label: f.nom, sub: `Fournisseur · ${f.email || '—'}`,
          path: `/fournisseurs`, icon: Truck,
        })),
      ];
      setResults(items);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  const go = (path) => { navigate(path); onClose(); };

  const handleKey = (e) => {
    const list = query ? results : QUICK_LINKS;
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelected(s => Math.min(s + 1, list.length - 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter')      { if (list[selected]) go(list[selected].path); }
    if (e.key === 'Escape')     { onClose(); }
  };

  const displayList = query ? results : QUICK_LINKS;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0"/>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Rechercher un article, fournisseur..."
            className="flex-1 text-[15px] font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
          {loading && <div className="w-4 h-4 border-2 border-[#1A766E] border-t-transparent rounded-full animate-spin shrink-0"/>}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-lg">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {!query && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-2">Navigation rapide</p>
          )}
          {query && results.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30"/>
              <p className="text-sm font-medium">Aucun résultat pour «{query}»</p>
            </div>
          )}
          {displayList.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} onClick={() => go(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                  selected === i ? 'bg-[#E8F5F3]' : 'hover:bg-gray-50'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selected === i ? 'bg-[#1A766E] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="w-4 h-4"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{item.label}</p>
                  {item.desc && <p className="text-[11px] text-gray-400 truncate">{item.desc || item.sub}</p>}
                  {item.sub  && <p className="text-[11px] text-gray-400 truncate">{item.sub}</p>}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0"/>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-50 bg-gray-50/50">
          <span className="text-[10px] text-gray-400"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[9px] font-bold">↑↓</kbd> naviguer</span>
          <span className="text-[10px] text-gray-400"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[9px] font-bold">↵</kbd> ouvrir</span>
          <span className="text-[10px] text-gray-400 ml-auto">Ctrl+K pour ouvrir</span>
        </div>
      </div>
    </div>
  );
}

const allPrimaryNavItems = [
  { path: '/dashboard',   label: 'Home',         roles: ['admin', 'responsable', 'magasinier', 'fournisseur'] },
  { path: '/articles',    label: 'Articles',     roles: ['admin', 'responsable', 'magasinier', 'fournisseur'] },
  { path: '/mouvements',  label: 'Movements',    roles: ['admin', 'responsable', 'magasinier'] },
  { path: '/commandes',   label: 'Orders',       roles: ['admin', 'responsable', 'fournisseur'] },
  { path: '/fournisseurs',label: 'Suppliers',    roles: ['admin', 'responsable'] },
];

const allSecondaryNavItems = [
  { path: '/entrees',     label: 'Stock In',     roles: ['admin', 'responsable', 'magasinier'], icon: ArrowDownToLine },
  { path: '/sorties',     label: 'Stock Out',    roles: ['admin', 'responsable', 'magasinier'], icon: ArrowUpFromLine },
  { path: '/historique',  label: 'History',      roles: ['admin', 'responsable', 'magasinier'], icon: History },
  { path: '/rapports',    label: 'Reports',      roles: ['admin', 'responsable'],               icon: BarChart3 },
  { path: '/parametres',  label: 'Mon Profil',   roles: ['admin', 'responsable', 'magasinier', 'fournisseur'], icon: Settings },
  { path: '/utilisateurs',label: 'Users',        roles: ['admin'],                              icon: Users },
  { path: '/journaux',    label: 'Audit Logs',   roles: ['admin'],                              icon: Activity },
];

export default function AppLayout() {
  const [alertCount, setAlertCount]     = useState(0);
  const [showMoreMenu, setShowMoreMenu]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch]       = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const moreMenuRef = useRef(null);

  const userRole = user?.role || 'magasinier';
  const primaryNavItems = allPrimaryNavItems.filter(item => item.roles.includes(userRole));
  const secondaryNavItems = allSecondaryNavItems.filter(item => item.roles.includes(userRole));

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await api.get('/alertes/counts');
        setAlertCount(res.data.total_non_lues);
      } catch (_) {}
    };
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(s => !s);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowMoreMenu(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isMoreActive = secondaryNavItems.some(item => location.pathname.startsWith(item.path));

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans overflow-hidden">
      {showSearch && <SearchPalette onClose={() => setShowSearch(false)}/>}
      {/* Top Navigation Bar */}
      <header className="bg-[#F3F4F6] px-4 lg:px-8 py-4 flex items-center justify-between shrink-0 z-50">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 text-[#0A5C53] font-bold text-lg tracking-tight">
          <div className="bg-[#1A766E] text-white p-1 rounded">
            <Package className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="hidden sm:block">StockPro</span>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/50 backdrop-blur-md px-1.5 py-1.5 rounded-2xl border border-gray-200/60 shadow-sm">
          {primaryNavItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          
          {/* More Dropdown */}
          {secondaryNavItems.length > 0 && (
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-all duration-200 ${
                  isMoreActive || showMoreMenu
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                More <ChevronDown className="w-4 h-4" />
              </button>
              
              {showMoreMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {secondaryNavItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                          isActive ? 'bg-[#E8F5F3] text-[#1A766E]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            title="Rechercher (Ctrl+K)"
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1A766E] hover:bg-white rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <NavLink
            to="/alertes"
            className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#1A766E] hover:bg-white rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#F3F4F6]"></span>
            )}
          </NavLink>

          {/* User Profile / Logout */}
          <div className="relative group">
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#1A766E] text-white flex items-center justify-center text-sm font-bold shadow-inner">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#F3F4F6] pt-20 px-4 pb-4 overflow-y-auto">
          <nav className="flex flex-col gap-2 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            {[...primaryNavItems, ...secondaryNavItems].map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {Icon && <Icon className="w-5 h-5 opacity-70" />}
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-8 pb-8 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
