import { useState, useEffect } from 'react';
import { Package, Mail, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="black">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.82 3.59-.73 1.5.05 2.53.56 3.19 1.34-2.56 1.4-2.14 4.54.34 5.36-1.07 2.4-2.34 4.31-4.14 6.2M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.41-3.74 4.25" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="black">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@stock.ma');
  const [password, setPassword] = useState('password');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, loading, error, clearError, user } = useAuthStore();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await register(name, email, password, passwordConfirmation);
    }
    if (success) navigate('/dashboard');
  };

  return (
    <div className="h-screen w-screen bg-[#F3F4F6] flex items-center justify-center p-4 font-sans overflow-hidden">

      {/* Main Container - Large width but smaller inner contents */}
      <div className="flex w-[95vw] max-w-[1150px] h-[90vh] min-h-[550px] max-h-[750px] bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-200/60">

        {/* Left side - Form container */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-10 relative">

          {/* Header Logo */}
          <div className="flex items-center gap-2 text-[#0A5C53] font-bold text-lg tracking-tight mb-2">
            <div className="bg-[#1A766E] text-white p-1 rounded">
              <Package className="w-4 h-4" strokeWidth={2.5} />
            </div>
            StockPro
          </div>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center items-center w-full">
            <div className="w-full max-w-[340px]">

              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Welcome to StockPro</h1>
                <p className="text-gray-500 text-[12px] leading-relaxed">Start your experience with StockPro by signing {isLogin ? 'in' : 'up'}.</p>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-50/80 p-1 rounded-xl mb-6 border border-gray-100">
                <button
                  onClick={() => { setIsLogin(true); clearError(); }}
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${isLogin ? 'bg-white shadow-sm text-gray-900 border border-gray-100/50' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsLogin(false); clearError(); }}
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${!isLogin ? 'bg-white shadow-sm text-gray-900 border border-gray-100/50' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#1A766E] mb-1">
                      Full Name <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-gray-400" strokeWidth={2} />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-[#1A766E] focus:ring-1 focus:ring-[#1A766E] transition-all placeholder:text-gray-400"
                        placeholder="John Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#1A766E] mb-1">
                    Email Address <span className="text-blue-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" strokeWidth={2} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-[#1A766E] focus:ring-1 focus:ring-[#1A766E] transition-all placeholder:text-gray-400"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1A766E] mb-1">
                    Password <span className="text-blue-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" strokeWidth={2} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-[#1A766E] focus:ring-1 focus:ring-[#1A766E] transition-all placeholder:text-gray-400"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#1A766E] mb-1">
                      Confirm Password <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" strokeWidth={2} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-[#1A766E] focus:ring-1 focus:ring-[#1A766E] transition-all placeholder:text-gray-400"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-2 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 bg-[#1A766E] text-white rounded-xl text-[13px] font-bold hover:bg-[#155953] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#1A766E]/20"
                >
                  {loading ? (isLogin ? 'Signing in...' : 'Signing up...') : (isLogin ? 'Sign In' : 'Sign Up')}
                </button>
              </form>

              {/* Quick Login (Dev) */}
              <div className="relative flex items-center justify-center mt-6 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative bg-white px-3 text-[10px] font-bold text-[#1A766E] uppercase tracking-wider">
                  Accès Rapide (Tests)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setEmail('admin@stock.ma'); setPassword('password'); setIsLogin(true); }} className="py-1.5 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                  Administrateur
                </button>
                <button type="button" onClick={() => { setEmail('responsable@stock.ma'); setPassword('password'); setIsLogin(true); }} className="py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                  Responsable
                </button>
                <button type="button" onClick={() => { setEmail('magasinier@stock.ma'); setPassword('password'); setIsLogin(true); }} className="py-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
                  Magasinier
                </button>
                <button type="button" onClick={() => { setEmail('fournisseur@stock.ma'); setPassword('password'); setIsLogin(true); }} className="py-1.5 bg-gray-50 text-gray-700 text-[11px] font-bold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  Fournisseur
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-[9px] font-medium text-gray-400">
            Copyright © StockPro, All Right Reserved <a href="#" className="text-[#1A766E] ml-1">Term & Condition</a> <span className="mx-1 text-gray-200">|</span> <a href="#" className="text-[#1A766E]">Privacy & Policy</a>
          </div>
        </div>

        {/* Right side - Feature Carousel */}
        <div className="hidden lg:flex w-1/2 p-2.5">
          <div className="w-full h-full bg-[#0A3D39] rounded-[1.5rem] relative overflow-hidden flex flex-col">

            {/* Grid background */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}/>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A766E] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"/>

            <LoginCarousel />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Feature Carousel ─────────────────────────────────────────────
const SLIDES = [
  {
    title: 'Tableau de bord intelligent',
    desc: 'Vue d\'ensemble en temps réel de tout votre stock. KPIs, graphiques animés et alertes critiques sur une seule interface.',
    badge: 'Dashboard',
    badgeColor: '#1A766E',
    visual: (
      <div className="w-full bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-sm">
        <div className="flex gap-3 mb-3">
          {['#1A766E','#0A5C53','#93C5C0','#6B7280','#0A3D39'].map((c,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg" style={{height:`${[60,100,45,80,30][i]}px`, background: c, opacity: 0.9}}/>
              <div className="text-[8px] text-white/50">{['L','M','M','J','V'][i]}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          <div className="flex-1 bg-white/10 rounded-xl p-2 text-center">
            <p className="text-white text-[18px] font-black">247</p>
            <p className="text-white/50 text-[8px]">Articles</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-2 text-center">
            <p className="text-white text-[18px] font-black">12</p>
            <p className="text-white/50 text-[8px]">Alertes</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-2 text-center">
            <p className="text-white text-[18px] font-black">34</p>
            <p className="text-white/50 text-[8px]">Commandes</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Gestion des mouvements',
    desc: 'Enregistrez chaque entrée et sortie de stock avec traçabilité complète. Historique détaillé et rapports automatiques.',
    badge: 'Mouvements',
    badgeColor: '#0A5C53',
    visual: (
      <div className="w-full bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-sm space-y-2">
        {[
          { type: 'Entrée', art: 'Laptop Dell XPS 15', qty: '+40', color: '#10B981' },
          { type: 'Sortie', art: 'Chaise de bureau', qty: '-5', color: '#EF4444' },
          { type: 'Entrée', art: 'Écran 4K 27"', qty: '+20', color: '#10B981' },
          { type: 'Sortie', art: 'Câble HDMI 2m', qty: '-12', color: '#EF4444' },
        ].map((m,i) => (
          <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black"
              style={{background: m.color + '33', color: m.color}}>{m.type[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[10px] font-bold truncate">{m.art}</p>
              <p className="text-white/40 text-[8px]">{m.type}</p>
            </div>
            <span className="text-[11px] font-black" style={{color: m.color}}>{m.qty}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Alertes & Stock critique',
    desc: 'Soyez alerté automatiquement quand les niveaux de stock tombent sous le seuil. Réapprovisionnement simplifié.',
    badge: 'Alertes',
    badgeColor: '#DC2626',
    visual: (
      <div className="w-full bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"/>
          <p className="text-white/70 text-[9px] font-bold uppercase tracking-widest">3 articles critiques</p>
        </div>
        {[
          { name: 'Stylos Bic Bleu', stock: 3, min: 20, pct: 15 },
          { name: 'Rames papier A4', stock: 8, min: 50, pct: 16 },
          { name: 'Cartouche encre HP', stock: 1, min: 10, pct: 10 },
        ].map((a,i) => (
          <div key={i} className="bg-red-500/20 rounded-xl p-2.5 border border-red-400/20">
            <div className="flex justify-between mb-1">
              <p className="text-white text-[10px] font-bold">{a.name}</p>
              <p className="text-red-300 text-[9px] font-bold">{a.stock}/{a.min}</p>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-red-400 rounded-full" style={{width:`${a.pct}%`}}/>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Rapports & Analyses',
    desc: 'Analysez vos performances avec des rapports détaillés. Exportez vos données et prenez des décisions éclairées.',
    badge: 'Rapports',
    badgeColor: '#7C3AED',
    visual: (
      <div className="w-full bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Valeur stock', val: '45 200 MAD', up: true },
            { label: 'Mouvements', val: '1 247', up: true },
            { label: 'Rotation', val: '4.2x', up: false },
            { label: 'Fournisseurs', val: '18 actifs', up: true },
          ].map((k,i) => (
            <div key={i} className="bg-white/10 rounded-xl p-2.5">
              <p className="text-white/50 text-[8px] mb-1">{k.label}</p>
              <p className="text-white text-[11px] font-black">{k.val}</p>
              <p className={`text-[8px] font-bold ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>{k.up ? '↑' : '↓'} ce mois</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 h-12 items-end">
          {[40,65,45,80,55,90,70].map((h,i) => (
            <div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`, background:'rgba(255,255,255,0.25)'}}/>
          ))}
        </div>
        <p className="text-white/30 text-[8px] text-center mt-1">7 derniers jours</p>
      </div>
    ),
  },
];

function LoginCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % SLIDES.length);
        setTransitioning(false);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const goTo = (i) => {
    if (i === current) return;
    setTransitioning(true);
    setTimeout(() => { setCurrent(i); setTransitioning(false); }, 300);
  };

  const slide = SLIDES[current];

  return (
    <div className="flex flex-col h-full p-8 relative z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-auto">
        <div className="bg-[#1A766E] p-1.5 rounded-lg">
          <Package className="w-4 h-4 text-white" strokeWidth={2.5}/>
        </div>
        <span className="text-white font-extrabold text-sm">StockPro</span>
      </div>

      {/* Slide content */}
      <div className={`flex-1 flex flex-col justify-center transition-all duration-400 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        style={{ transition: 'opacity 0.35s ease, transform 0.35s ease' }}>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 w-max px-3 py-1 rounded-full mb-5 border border-white/20"
          style={{ background: slide.badgeColor + '40' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-white"/>
          <span className="text-white text-[10px] font-extrabold uppercase tracking-widest">{slide.badge}</span>
        </div>

        {/* Visual */}
        <div className="mb-6">{slide.visual}</div>

        {/* Text */}
        <h2 className="text-white text-[20px] font-extrabold leading-snug mb-3">{slide.title}</h2>
        <p className="text-white/60 text-[12px] leading-relaxed">{slide.desc}</p>
      </div>

      {/* Indicators */}
      <div className="flex gap-2 mt-6">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="h-1 rounded-full transition-all duration-300"
            style={{ width: i === current ? '2rem' : '0.75rem', background: i === current ? 'white' : 'rgba(255,255,255,0.25)' }}/>
        ))}
      </div>
    </div>
  );
}
